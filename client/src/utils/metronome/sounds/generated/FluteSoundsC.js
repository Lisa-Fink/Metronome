import MetronomeSounds from "../MetronomeSounds";

class FluteSounds extends MetronomeSounds {
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

  createFluteTone(frequency) {
    const newOsc = this.audioCtx.current.createOscillator();

    const rate = this.audioCtx.current.sampleRate;
    const length = rate * 0.05; // Shorten the length to 50ms
    const buffer = this.audioCtx.current.createBuffer(2, length, rate);
    const dataL = buffer.getChannelData(0);
    const dataR = buffer.getChannelData(1);

    // Generate a simple sine wave
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const x = Math.sin(2 * Math.PI * frequency * t);
      dataL[i] = dataR[i] = x;
    }
    // const gain = audioCtx.current.createGain();
    const con = this.audioCtx.current.createConvolver();

    con.connect(this.gainNode);
    // gain.connect(con);
    con.buffer = buffer;
    newOsc.connect(con);
    newOsc.frequency.value = frequency;

    return newOsc;
  }

  // Returns the current sound based on the beat
  getSound(beatCount) {
    const regularFreq = this.key;
    const downBeatFreq = this.key * 2;
    const mainBeatFreq = this.key * 1.5;
    if (this.downBeat && beatCount === 1) {
      return this.createFluteTone(downBeatFreq);
    } else if (
      this.subdivide > 1 &&
      this.mainBeat &&
      (beatCount - 1) % this.subdivide === 0
    ) {
      return this.createFluteTone(mainBeatFreq, this.gainNode, this.audioCtx);
    } else {
      if (beatCount === this.timeSignature * this.subdivide) {
        beatCount = 0;
      }
      return this.createFluteTone(regularFreq, this.gainNode, this.audioCtx);
    }
  }

  scheduleStart(startTime, beatCount, addToStart) {
    const sound = this.getSound(beatCount);
    this.start(sound, startTime);

    let noteLen = addToStart / 2;
    const endTime = startTime + noteLen;
    sound.stop(endTime);
  }
}

export default FluteSounds;
