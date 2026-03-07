/**
 * AudioWorklet processor for HireLens mic capture.
 * Replaces deprecated ScriptProcessorNode. Posts Float32 samples to main thread.
 */
class CaptureProcessor extends AudioWorkletProcessor {
  process(inputs, _outputs, _parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    const channel = input[0];
    if (!channel || channel.length === 0) return true;
    this.port.postMessage({ samples: channel.slice(0) });
    return true;
  }
}

registerProcessor("capture-processor", CaptureProcessor);
