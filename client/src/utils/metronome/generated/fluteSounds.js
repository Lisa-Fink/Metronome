const createFluteTone = (frequency, mainGain, audioCtx) => {
  const newOsc = audioCtx.current.createOscillator();

  const rate = audioCtx.current.sampleRate;
  const length = rate * 0.05; // Shorten the length to 50ms
  const buffer = audioCtx.current.createBuffer(2, length, rate);
  const dataL = buffer.getChannelData(0);
  const dataR = buffer.getChannelData(1);

  // Generate a simple sine wave
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    const x = Math.sin(2 * Math.PI * frequency * t);
    dataL[i] = dataR[i] = x;
  }
  // const gain = audioCtx.current.createGain();
  const con = audioCtx.current.createConvolver();
  con.connect(mainGain);
  // gain.connect(con);
  con.buffer = buffer;
  newOsc.connect(con);
  newOsc.frequency.value = frequency;

  return newOsc;
};

const getOsc = (
  gain,
  subdivide,
  mainBeat,
  downBeat,
  beatCount,
  key,
  timeSignature,
  audioCtx
) => {
  const regularFreq = key;
  const downBeatFreq = key * 2;
  const mainBeatFreq = key * 1.5;
  if (downBeat && beatCount === 1) {
    return createFluteTone(downBeatFreq, gain, audioCtx);
  } else if (subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0) {
    return createFluteTone(mainBeatFreq, gain, audioCtx);
  } else {
    if (beatCount === timeSignature * subdivide) {
      beatCount = 0;
    }
    return createFluteTone(regularFreq, gain, audioCtx);
  }
};

const fluteStart = (osc, startTime, addToStart) => {
  let noteLen = addToStart / 2;
  osc.start(startTime);
  const endTime = startTime + noteLen;
  osc.stop(endTime);
};

const getFluteSounds = () => {
  return { getOsc };
};

export default getFluteSounds;
export { fluteStart };
