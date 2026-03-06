"""
LiveKit Agent for Sainterview Dynamic Interviews.

Subscribes to NATS `interview.dynamic.start`, joins a LiveKit room as an AI interviewer
with Simli avatar (video), OpenAI LLM, Deepgram STT, and OpenAI TTS.
Publishes transcript + turn events back over NATS when the session ends.
"""

import asyncio
import json
import logging
import os
import signal
import sys
import threading
import time
from datetime import datetime, timezone
from typing import Optional

import aiohttp
import nats
from dotenv import load_dotenv
from livekit.agents import Agent, JobContext, WorkerOptions, cli
from livekit.agents.llm import ChatMessage
from livekit.agents.voice import AgentSession
from livekit.plugins import deepgram, openai, silero, simli

# Load backend/.env.local first (when running from backend/services/livekit-agent)
_script_dir = os.path.dirname(os.path.abspath(__file__))
_backend_env = os.path.abspath(os.path.join(_script_dir, "..", "..", ".env.local"))


def _log_simli_env(where: str) -> None:
    """Log that SIMLI env was loaded: path, key set or not, masked value (first 4 chars + ***)."""
    if os.path.isfile(_backend_env):
        loaded = "yes"
        path = _backend_env
    else:
        loaded = "no (file missing)"
        path = _backend_env
    key_val = os.getenv("SIMLI_API_KEY")
    face_val = os.getenv("SIMLI_FACE_ID", "")
    if key_val:
        key_hint = f"{key_val[:4]}*** len={len(key_val)}"
    else:
        key_hint = "<not set>"
    face_hint = f"{face_val[:8]}***" if len(face_val) > 8 else (face_val or "<not set>")
    logging.getLogger("sainterview-agent").info(
        f"[env {where}] backend env file: {loaded} path={path} | SIMLI_API_KEY: {key_hint} | SIMLI_FACE_ID: {face_hint}"
    )


if os.path.isfile(_backend_env):
    load_dotenv(_backend_env, override=False)
load_dotenv(override=True)

logger = logging.getLogger("sainterview-agent")
_log_simli_env("module load")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s: %(message)s")


class InterviewConfig:
    """Parsed configuration from NATS start event."""

    def __init__(self, data: dict):
        self.session_id: str = data["session_id"]
        self.interview_id: str = data["interview_id"]
        self.livekit_room: str = data["livekit_room"]
        self.face_id: str = data.get("face_id", os.getenv("SIMLI_FACE_ID", ""))
        self.system_prompt: str = data.get("system_prompt", "")
        self.first_message: str = data.get("first_message", "")
        self.max_session_length: int = data.get("max_session_length", 3600)
        self.max_idle_time: int = data.get("max_idle_time", 300)
        self.questions: list = json.loads(data["questions"]) if isinstance(data.get("questions"), str) else data.get("questions", [])
        self.total_questions: int = data.get("total_questions", 10)
        self.tts_provider: str = data.get("tts_provider", "OpenAI")
        self.llm_model: str = data.get("llm_model", "gpt-4o-mini")


# Pending sessions: NATS populates a file cache (main process); worker reads it (different process)
SESSION_CACHE_DIR = os.path.join(_script_dir, ".session_cache")
_nc: Optional[nats.aio.client.Client] = None


def _session_cache_path(room_name: str) -> str:
    return os.path.join(SESSION_CACHE_DIR, f"{room_name}.json")


def _read_session_config(room_name: str) -> Optional[InterviewConfig]:
    """Read config from file cache (used by worker process)."""
    path = _session_cache_path(room_name)
    try:
        if os.path.isfile(path):
            with open(path, "r") as f:
                data = json.load(f)
            os.remove(path)
            return InterviewConfig(data)
    except Exception as e:
        logger.warning(f"Failed to read session cache {path}: {e}")
    return None


async def _fetch_session_config_from_api(room_name: str) -> Optional[InterviewConfig]:
    """When cache is missing (e.g. agent restarted after session created), fetch session from Go API."""
    if not room_name.startswith("dynamic-interview-"):
        return None
    session_id = room_name[len("dynamic-interview-"):]
    base = os.getenv("DYNAMIC_INTERVIEW_API_URL", "http://localhost:3010")
    url = f"{base.rstrip('/')}/v1/dynamic-sessions/{session_id}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return None
                body = await resp.json()
    except Exception as e:
        logger.warning(f"Failed to fetch session from API {url}: {e}")
        return None
    if not body.get("success") or "data" not in body:
        return None
    data = body["data"]
    questions = data.get("mandatory_questions")
    if isinstance(questions, str):
        questions = json.loads(questions) if questions else []
    elif questions is None:
        questions = []
    config_data = {
        "session_id": data.get("id", session_id),
        "interview_id": data.get("interview_id", ""),
        "livekit_room": room_name,
        "face_id": (data.get("face_id") or "") or os.getenv("SIMLI_FACE_ID", ""),
        "system_prompt": data.get("system_prompt", ""),
        "first_message": data.get("first_message", ""),
        "max_session_length": data.get("max_session_length", 3600),
        "max_idle_time": data.get("max_idle_time", 300),
        "questions": questions,
        "total_questions": data.get("total_questions", 10),
        "tts_provider": data.get("tts_provider", "OpenAI"),
        "llm_model": data.get("llm_model", "gpt-4o-mini"),
    }
    logger.info(f"Fetched session config from API session_id={session_id}")
    return InterviewConfig(config_data)


def _write_session_config(room_name: str, data: dict) -> None:
    """Write config to file cache (used by main process when NATS message received)."""
    try:
        os.makedirs(SESSION_CACHE_DIR, exist_ok=True)
        path = _session_cache_path(room_name)
        with open(path, "w") as f:
            json.dump(data, f)
    except Exception as e:
        logger.error(f"Failed to write session cache: {e}")


def build_system_prompt(config: InterviewConfig) -> str:
    """Compose the LLM system prompt from interview config."""
    base = config.system_prompt or (
        "You are a professional AI interviewer conducting a structured interview. "
        "Be warm but focused. Ask one question at a time and listen carefully. "
        "When the candidate finishes answering, ask the next question."
    )

    if config.questions:
        q_list = "\n".join(f"  {i+1}. {q}" for i, q in enumerate(config.questions))
        base += f"\n\nMandatory questions to cover (ask in order):\n{q_list}"

    base += (
        f"\n\nTotal questions target: {config.total_questions}."
        "\nAfter all questions are covered, thank the candidate and end the interview."
        "\nKeep answers conversational and under 30 seconds each."
    )
    return base


class InterviewAgent(Agent):
    """A LiveKit agent that conducts a dynamic interview with Simli avatar."""

    def __init__(self, config: InterviewConfig) -> None:
        face_id = config.face_id or os.getenv("SIMLI_FACE_ID", "")
        tts = openai.tts.TTS(model="tts-1", voice="alloy")
        stt = deepgram.stt.STT()

        super().__init__(
            instructions=build_system_prompt(config),
            stt=stt,
            llm=openai.llm.LLM(model=config.llm_model),
            tts=tts,
            vad=silero.VAD.load(),
        )

        self.config = config
        self.turns: list[dict] = []
        self.started_at: float = time.time()

    async def on_enter(self) -> None:
        first = self.config.first_message or "Hello! I'm your interviewer today. Are you ready to begin?"
        self.session.say(first)

    async def on_user_turn_completed(
        self, turn_ctx: object, *, new_message: ChatMessage
    ) -> None:
        """Framework calls this with (turn_ctx, new_message=user_message)."""
        content = getattr(new_message, "text_content", None) or getattr(new_message, "content", None) or str(new_message)
        self.turns.append({
            "role": "user",
            "content": content,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "turn_number": len(self.turns) + 1,
        })

    async def on_agent_turn_completed(
        self, turn_ctx: object, *, new_message: ChatMessage
    ) -> None:
        """Record assistant turn; session time limit check."""
        content = getattr(new_message, "text_content", None) or getattr(new_message, "content", None) or str(new_message)
        self.turns.append({
            "role": "assistant",
            "content": content,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "turn_number": len(self.turns) + 1,
        })
        elapsed = time.time() - self.started_at
        if elapsed > self.config.max_session_length:
            logger.info(f"[{self.config.session_id}] Max session length reached ({elapsed:.0f}s)")
            self.session.say("We've reached the end of our allotted time. Thank you for the interview!")
            await asyncio.sleep(5)
            await self._end_session()

    async def _end_session(self):
        """Publish transcript and ended event to NATS, then disconnect."""
        global _nc
        if _nc is None or _nc.is_closed:
            logger.warning("NATS not connected, cannot publish end event")
            return

        duration = int(time.time() - self.started_at)
        transcript_text = "\n".join(
            f"[{t['role']}] {t['content']}" for t in self.turns
        )

        ended_event = {
            "session_id": self.config.session_id,
            "interview_id": self.config.interview_id,
            "duration_seconds": duration,
            "transcript_text": transcript_text,
            "turn_count": len(self.turns),
            "ended_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            await _nc.publish(
                "interview.dynamic.ended",
                json.dumps(ended_event).encode(),
            )
            logger.info(f"[{self.config.session_id}] Published interview.dynamic.ended (duration={duration}s, turns={len(self.turns)})")
        except Exception as e:
            logger.error(f"[{self.config.session_id}] Failed to publish ended event: {e}")


async def _nats_listener():
    """Connect to NATS and listen for interview.dynamic.start events."""
    global _nc
    nats_url = os.getenv("NATS_URL", "nats://localhost:4222")
    logger.info(f"Connecting to NATS at {nats_url}")

    _nc = await nats.connect(nats_url)
    logger.info("NATS connected, subscribing to interview.dynamic.start")

    async def on_start(msg):
        try:
            data = json.loads(msg.data.decode())
            room_name = data.get("livekit_room", "")
            if room_name:
                _write_session_config(room_name, data)
                logger.info(f"Received start event session={data.get('session_id')} room={room_name} (cached for worker)")
        except Exception as e:
            logger.error(f"Failed to parse start event: {e}")

    await _nc.subscribe("interview.dynamic.start", cb=on_start)
    logger.info("Subscribed to interview.dynamic.start")
    # Keep this loop running so callbacks are processed (used by NATS thread)
    await asyncio.Future()


def _run_nats_loop():
    """Run NATS listener in a dedicated event loop (for background thread)."""
    asyncio.run(_nats_listener())


async def entrypoint(ctx: JobContext) -> None:
    """LiveKit job entrypoint: connect to room, create interview agent, run session."""
    # Ensure worker process has env (e.g. SIMLI_*) from backend/.env.local
    if os.path.isfile(_backend_env):
        load_dotenv(_backend_env, override=True)
    _log_simli_env("worker entrypoint")
    await ctx.connect()
    room_name = ctx.room.name
    config = _read_session_config(room_name)
    if config is None:
        config = await _fetch_session_config_from_api(room_name)
    if config is None:
        logger.warning(f"No pending session and API fetch failed for room {room_name}, using default config")
        config = InterviewConfig({
            "session_id": "unknown",
            "interview_id": "unknown",
            "livekit_room": room_name,
            "face_id": os.getenv("SIMLI_FACE_ID", ""),
        })
    else:
        # Ensure face_id has fallback so avatar can show when session has none
        if not getattr(config, "face_id", None) or not config.face_id:
            config.face_id = os.getenv("SIMLI_FACE_ID", "")
    logger.info(f"Starting interview agent for session={config.session_id} room={room_name}")
    agent = InterviewAgent(config=config)
    session = AgentSession(
        stt=agent._stt,
        vad=agent._vad,
        llm=agent._llm,
        tts=agent._tts,
    )
    # Simli avatar: TTS audio is sent to Simli, which renders video and joins the room.
    # Plugin calls Simli's compose/token; on 401 INVALID_API_KEY it logs and returns without raising,
    # so we verify the avatar actually joined before claiming success.
    _AVATAR_IDENTITY = "simli-avatar-agent"
    simli_api_key = os.getenv("SIMLI_API_KEY")
    simli_face_id = config.face_id or os.getenv("SIMLI_FACE_ID", "")
    if simli_api_key and simli_face_id:
        simli_avatar = simli.AvatarSession(
            simli_config=simli.SimliConfig(
                api_key=simli_api_key,
                face_id=simli_face_id,
                max_session_length=config.max_session_length,
                max_idle_time=config.max_idle_time,
            ),
        )
        await simli_avatar.start(session, room=ctx.room)
        await asyncio.sleep(3)
        avatar_joined = any(
            p.identity == _AVATAR_IDENTITY for p in ctx.room.remote_participants.values()
        )
        if avatar_joined:
            logger.info(f"Simli avatar joined the room face_id={simli_face_id}")
        else:
            logger.warning(
                "Avatar did not join the room (no video tile). "
                "If logs above show 401 or INVALID_API_KEY, set a valid SIMLI_API_KEY in backend/.env.local — "
                "get a key from https://app.simli.com/apikey"
            )
    else:
        logger.warning("SIMLI_API_KEY or SIMLI_FACE_ID not set; avatar video will not be shown")
    await session.start(agent, room=ctx.room)


if __name__ == "__main__":
    # Run NATS listener in a background thread so it keeps receiving interview.dynamic.start
    # and writing session config to .session_cache for the worker to read
    nats_thread = threading.Thread(target=_run_nats_loop, daemon=True)
    nats_thread.start()
    time.sleep(0.5)  # allow NATS to connect before worker registers

    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
