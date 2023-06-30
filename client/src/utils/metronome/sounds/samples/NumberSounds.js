import { fetchAudio } from "../../../audioUtils";
import { numberAudioFiles } from "../../../audioFiles";
import MetronomeSounds from "../MetronomeSounds";

class NumberSounds extends MetronomeSounds {
  constructor(audioCtx, subdivide, gainNode, timeSignature) {
    super(audioCtx, subdivide, gainNode);
    this.timeSignature = timeSignature;
  }

  // Returns the current sound based on the beat
  getSound(beatCount) {
    const source = this.audioCtx.current.createBufferSource();
    source.buffer = this.sounds[beatCount - 1];
    return source;
  }

  // Loads all of the sounds as buffers, and returns an array in the order they will be called
  async loadAudio() {
    const buffers = {};
    const fetches = [];

    // get all buffers for main beats
    // put the fetch into fetches arr, which resolves into buffers object
    for (let i = 1; i <= this.timeSignature; i++) {
      fetches.push(
        fetchAudio(numberAudioFiles[i], this.audioCtx).then(
          (buffer) => (buffers[i] = buffer)
        )
      );
    }

    // add subdivision needed
    if (
      this.subdivide === 2 ||
      this.subdivide === 3 ||
      this.subdivide === 4 ||
      this.subdivide === 6 ||
      this.subdivide === 8
    ) {
      fetches.push(
        fetchAudio(numberAudioFiles["and"], this.audioCtx).then(
          (buffer) => (buffers["and"] = buffer)
        )
      );
    }
    if (this.subdivide === 3 || this.subdivide === 4 || this.subdivide === 8) {
      fetches.push(
        fetchAudio(numberAudioFiles["a"], this.audioCtx).then(
          (buffer) => (buffers["a"] = buffer)
        )
      );
    }
    if (this.subdivide === 4 || this.subdivide === 8) {
      fetches.push(
        fetchAudio(numberAudioFiles["e"], this.audioCtx).then(
          (buffer) => (buffers["e"] = buffer)
        )
      );
    }
    if (
      this.subdivide === 5 ||
      this.subdivide === 6 ||
      this.subdivide === 7 ||
      this.subdivide === 8
    ) {
      fetches.push(
        fetchAudio(numberAudioFiles["ta"], this.audioCtx).then(
          (buffer) => (buffers["ta"] = buffer)
        )
      );
    }

    await Promise.all(fetches);

    const bufferArr = [];
    // create in order array
    for (let i = 1; i <= this.timeSignature; i++) {
      bufferArr.push(buffers[i]);
      if (this.subdivide === 2) {
        bufferArr.push(buffers["and"]);
      } else if (this.subdivide === 3) {
        bufferArr.push(buffers["and"]);
        bufferArr.push(buffers["a"]);
      } else if (this.subdivide === 4) {
        bufferArr.push(buffers["e"]);
        bufferArr.push(buffers["and"]);
        bufferArr.push(buffers["a"]);
      } else if (this.subdivide === 5 || this.subdivide === 7) {
        for (let j = 0; j < this.subdivide; j++) {
          bufferArr.push(buffers["ta"]);
        }
      } else if (this.subdivide === 6) {
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["and"]);
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["ta"]);
      } else if (this.subdivide === 8) {
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["e"]);
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["and"]);
        bufferArr.push(buffers["ta"]);
        bufferArr.push(buffers["a"]);
        bufferArr.push(buffers["ta"]);
      }
    }
    this.sounds = bufferArr;
  }
}

export default NumberSounds;
