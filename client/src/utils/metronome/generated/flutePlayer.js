const flutePlayer = ({
  bpm,
  subdivide,
  timeSignature,
  numMeasures,
  repeat,
  setIsPlaying,
  sectionPractice,
  tempoPractice,
  tempoInc,
  setBpm,
  mainBeat,
  originalBpm,
  downBeat,
  volumeRef,
  setTimerId,
}) => {
  const createFluteTone = (audioContext, frequency) => {
    const newOsc = audioContext.createOscillator();
    const newGain = audioContext.createGain();
    const convolver = audioContext.createConvolver();
    const rate = audioContext.sampleRate;
    const length = rate * 0.05; // Shorten the length to 50ms
    const buffer = audioContext.createBuffer(2, length, rate);
    const dataL = buffer.getChannelData(0);
    const dataR = buffer.getChannelData(1);

    // Generate a simple sine wave
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const x = Math.sin(2 * Math.PI * frequency * t);
      dataL[i] = dataR[i] = x;
    }

    convolver.buffer = buffer;
    newOsc.connect(newGain);
    newGain.connect(convolver);
    convolver.connect(audioContext.destination);

    newOsc.frequency.value = frequency;
    newGain.gain.value = 0; // Set the initial gain to 0

    return {
      newOsc,
      newGain,
    };
  };

  const playFlute = (
    osc,
    downBeatOsc,
    mainBeatOsc,
    gain,
    mainBeatGain,
    downBeatGain
  ) => {
    osc.start();
    downBeatOsc.start();
    if (mainBeat && mainBeatOsc) {
      mainBeatOsc.start();
    }
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let current;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
      if (downBeat && beatCount === 1) {
        current = downBeatGain;
      } else if (
        subdivide > 1 &&
        mainBeat &&
        (beatCount - 1) % subdivide === 0
      ) {
        current = mainBeatGain;
      } else {
        if (beatCount === timeSignature * subdivide) {
          beatCount = 0;
        }
        current = gain;
      }
      current.gain.value = volumeRef.current;
      beatCount++;
      beat++;
      setTimeout(() => {
        current.gain.value = 0;
      }, interval / 2);
      // handle section practice
      if (
        sectionPractice &&
        beat === numMeasures * timeSignature * subdivide * repeat
      ) {
        // section with all repeats have finished
        clearInterval(id);
        setIsPlaying(false);
        setTimerId(null);
        // clean up tempo change
        if (tempoPractice && tempoInc > 0) {
          setBpm(originalBpm.current);
        }
      } else if (
        sectionPractice &&
        tempoPractice &&
        beat > 0 &&
        beat % (timeSignature * subdivide * numMeasures) === 0
      ) {
        setBpm((prev) => {
          curBpm = curBpm + tempoInc;
          // adjust interval to new bpm
          const newInterval = (60 / (curBpm * subdivide)) * 1000;
          clearInterval(id);
          id = setInterval(intervalFn, newInterval);
          setTimerId(id);
          return prev + tempoInc;
        });
      }
    };
    intervalFn();
    let id = setInterval(intervalFn, interval);
    setTimerId(id);
    setIsPlaying(true);
  };
  return { createFluteTone, playFlute };
};

export default flutePlayer;
