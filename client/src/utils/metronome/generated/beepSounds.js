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
    osc.frequency.value = key * 4;
  } else if (subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0) {
    osc.frequency.value = key * 3;
  } else {
    if (beatCount === timeSignature * subdivide) {
      beatCount = 0;
    }
    osc.frequency.value = key * 2;
    osc.connect(gain);
  }
  return osc;
};

const beepStart = (osc, startTime, addToStart) => {
  const noteLen = addToStart / 2;
  const endTime = startTime + noteLen;
  osc.start(startTime);
  osc.stop(endTime);
};

const getBeepSounds = () => {
  return { getOsc };
};

export default getBeepSounds;
export { beepStart };
