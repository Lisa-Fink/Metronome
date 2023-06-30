import { getAudioFiles } from "../../../audioFiles";
import { fetchAudio } from "../../../audioUtils";
import MetronomeSounds from "../MetronomeSounds";

class PercussionSounds extends MetronomeSounds {
  constructor(audioCtx, subdivide, gainNode, downBeat, mainBeat, tone) {
    super(audioCtx, subdivide, gainNode, downBeat, mainBeat);
    this.tone = tone;
  }

  async loadAudio() {
    const { beats, mainBeats, downBeats } = getAudioFiles(this.tone);
    const [downBeatBuffer, regularBuffer, mainBeatBuffer] = await Promise.all([
      fetchAudio(downBeats, this.audioCtx),
      fetchAudio(beats, this.audioCtx),
      fetchAudio(mainBeats, this.audioCtx),
    ]);
    this.sounds = { downBeatBuffer, regularBuffer, mainBeatBuffer };
  }

  getSound = (beatCount) => {
    const { downBeatBuffer, regularBuffer, mainBeatBuffer } = this.sounds;
    const source = this.audioCtx.current.createBufferSource();
    if (this.downBeat && beatCount === 1) {
      source.buffer = downBeatBuffer;
    } else if (
      this.subdivide > 1 &&
      this.mainBeat &&
      (beatCount - 1) % this.subdivide === 0
    ) {
      source.buffer = mainBeatBuffer;
    } else {
      source.buffer = regularBuffer;
    }
    return source;
  };
}

export default PercussionSounds;
