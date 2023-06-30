// Parent class for metronome sounds
class MetronomeSounds {
  constructor(audioCtx, subdivide, gainNode, downBeat, mainBeat) {
    this.audioCtx = audioCtx;
    this.sounds = null;
    this.downBeat = downBeat;
    this.mainBeat = mainBeat;
    this.subdivide = subdivide;
    this.gainNode = gainNode;
  }

  // Returns the current sound based on the beat
  getSound() {}

  scheduleStart(startTime, beatCount) {
    const sound = this.getSound(beatCount);
    this.connect(sound);
    this.start(sound, startTime);
  }

  connect(sound) {
    sound.connect(this.gainNode);
  }

  start(sound, startTime) {
    sound.start(startTime);
  }
}

export default MetronomeSounds;
