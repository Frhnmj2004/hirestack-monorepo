import { connect, StringCodec } from 'nats';

async function run() {
  const nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
  const sc = StringCodec();

  const payload = {
    session_id: "test-session-123",
    interview_id: "int-uuid-abc",
    duration_seconds: 450,
    transcript_text: "AI: What is Python?\nCandidate: Python is a high-level programming language used for backend development.\nAI: Can you explain Django vs FastAPI?\nCandidate: Django is batteries-included, FastAPI is micro and faster.",
    turn_count: 4,
    ended_at: new Date().toISOString()
  };

  console.log("Publishing interview.dynamic.ended event...");
  nc.publish('interview.dynamic.ended', sc.encode(JSON.stringify(payload)));
  await nc.flush();
  await nc.close();
  console.log("Done publishing!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
