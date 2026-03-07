/**
 * AudioWorklet processor for HireLens.
 * Supports both mic (mono) and tab capture (often stereo). Downmixes stereo to mono
 * so Deepgram STT gets a single channel; tab capture was breaking STT when only
 * left channel was sent.
 */
class CaptureProcessor extends AudioWorkletProcessor {
  process(inputs, _outputs, _parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    const left = input[0];
    if (!left || left.length === 0) return true;
    const right = input.length > 1 ? input[1] : null;
    let samples;
    if (right && right.length === left.length) {
      samples = new Float32Array(left.length);
      for (let i = 0; i < left.length; i++) {
        samples[i] = (left[i] + right[i]) * 0.5;
      }
    } else {
      samples = left.slice(0);
    }
    this.port.postMessage({ samples });
    return true;
  }
}

registerProcessor("capture-processor", CaptureProcessor);
