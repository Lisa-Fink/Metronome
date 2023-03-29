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
  playingSources,
  audioCtx,
  key,
  stopCheck,
  stopSection,
}) => {
  const createFluteTone = (frequency, gain, convolver) => {
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

    convolver.buffer = buffer;
    newOsc.connect(gain);

    newOsc.frequency.value = frequency;

    return newOsc;
  };

  const playFlute = (start) => {
    let addToStart = 60 / (bpm * subdivide);
    let interval = addToStart * 1000;
    let beatCount = 1;
    let current;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const regularFreq = key;
    const downBeatFreq = key * 2;
    const mainBeatFreq = key * 1.5;

    let noteLen = interval / 2 / 1000;
    let startTime = start ? start : audioCtx.current.currentTime + 0.3;

    const play = () => {
      if (stopCheck()) return;
      const gain = audioCtx.current.createGain();
      const con = audioCtx.current.createConvolver();
      con.connect(audioCtx.current.destination);
      gain.connect(con);
      if (downBeat && beatCount === 1) {
        current = createFluteTone(downBeatFreq, gain, con);
      } else if (
        subdivide > 1 &&
        mainBeat &&
        (beatCount - 1) % subdivide === 0
      ) {
        current = createFluteTone(mainBeatFreq, gain, con);
      } else {
        if (beatCount === timeSignature * subdivide) {
          beatCount = 0;
        }
        current = createFluteTone(regularFreq, gain, con);
      }

      gain.gain.setValueAtTime(volumeRef.current, startTime);
      current.start(startTime);

      const endTime = startTime + noteLen;
      current.stop(endTime);

      playingSources.push([gain, startTime, current, noteLen, endTime]);
      beatCount++;
      beat++;
      startTime += interval / 1000;

      // Disconnect finished sounds
      while (playingSources.length > 1) {
        const [gainNode, startTime, osc, noteLen, endTime] = playingSources[0];
        if (endTime < audioCtx.current.currentTime) {
          osc.disconnect(gainNode);
          playingSources.shift();
        }
      }

      // handle section practice
      if (
        sectionPractice &&
        beat === numMeasures * timeSignature * subdivide * repeat
      ) {
        // section with all repeats have finished
        stopSection();
        return;
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
        // adjust interval to new bpm
        curBpm = curBpm + tempoInc;
        addToStart = 60 / (curBpm * subdivide);
        const newInterval = addToStart * 1000;
        interval = newInterval;
        noteLen = newInterval / 2 / 1000;
        setBpm((prev) => {
          return prev + tempoInc;
        });
      }
      if (!stopCheck()) {
        setTimeout(() => play(), interval);
      }
    };
    play();
    setIsPlaying(true);
  };

  return { playFlute };
};

export default flutePlayer;
