import MetronomeSounds from "../MetronomeSounds";

class BeepSounds extends MetronomeSounds {
  constructor(
    audioCtx,
    subdivide,
    gainNode,
    downBeat,
    mainBeat,
    timeSignature,
    key
  ) {
    super(audioCtx, subdivide, gainNode, downBeat, mainBeat);
    this.timeSignature = timeSignature;
    this.key = key;
  }

  createBeepTone() {
    const newOsc = this.audioCtx.current.createOscillator();
    newOsc.connect(this.gainNode);
    return newOsc;
  }

  // Returns the current sound based on the beat
  getSound(beatCount) {
    const osc = this.createBeepTone();
    if (this.downBeat && beatCount === 1) {
      osc.frequency.value = this.key * 4;
    } else if (
      this.subdivide > 1 &&
      this.mainBeat &&
      (beatCount - 1) % this.subdivide === 0
    ) {
      osc.frequency.value = this.key * 3;
    } else {
      if (beatCount === this.timeSignature * this.subdivide) {
        beatCount = 0;
      }
      osc.frequency.value = this.key * 2;
      osc.connect(this.gainNode);
    }
    return osc;
  }

  scheduleStart(startTime, beatCount, addToStart) {
    const sound = this.getSound(beatCount);
    this.start(sound, startTime);

    let noteLen = addToStart / 2;
    const endTime = startTime + noteLen;
    sound.stop(endTime);
  }
}

export default BeepSounds;
