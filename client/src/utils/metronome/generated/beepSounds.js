const createBeepTone = (gain, audioCtx) => {
  const newOsc = audioCtx.current.createOscillator();
  newOsc.connect(gain);
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
  const osc = createBeepTone(gain, audioCtx);
  if (downBeat && beatCount === 1) {
    osc.frequency.value = key * 4; // Set the frequency for high pitch
  } else if (subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0) {
    osc.frequency.value = key * 3; // Set the frequency for main beat
  } else {
    if (beatCount === timeSignature * subdivide) {
      beatCount = 0;
    }
    osc.frequency.value = key * 2;
  }
  return osc;
};

const beepStart = (osc, startTime, gain, addToStart) => {
  const noteLen = addToStart / 1.5;
  osc.start(startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteLen); // remove click at end
  const endTime = startTime + noteLen;
  osc.stop(endTime);
};

const getBeepSounds = () => {
  return { getOsc };
};

export default getBeepSounds;
export { beepStart };
