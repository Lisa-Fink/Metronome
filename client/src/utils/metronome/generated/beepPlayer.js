const beepPlayer = ({
  subdivide,
  mainBeat,
  bpm,
  originalBpm,
  sectionPractice,
  tempoPractice,
  tempoInc,
  timeSignature,
  repeat,
  setIsPlaying,
  setBpm,
  downBeat,
  volumeRef,
  setTimerId,
  key,
  numMeasures,
  playingSources,
  audioCtx,
}) => {
  const playBeep = (start) => {
    let interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;
    let noteLen = interval / 1.5 / 1000;

    let startTime = start ? start : audioCtx.current.currentTime;
    const gain = audioCtx.current.createGain();
    gain.connect(audioCtx.current.destination);

    const intervalFn = () => {
      const osc = createBeepTone(gain);
      if (downBeat && beatCount === 1) {
        osc.frequency.value = key * 4; // Set the frequency for high pitch
      } else if (
        subdivide > 1 &&
        mainBeat &&
        (beatCount - 1) % subdivide === 0
      ) {
        osc.frequency.value = key * 3; // Set the frequency for main beat
      } else {
        if (beatCount === timeSignature * subdivide) {
          beatCount = 0;
        }
        osc.frequency.value = key * 2;
      }
      gain.gain.setValueAtTime(volumeRef.current, startTime);
      osc.start(startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteLen); // remove click at end
      const endTime = startTime + noteLen;
      osc.stop(endTime);
      playingSources.push([osc, endTime, gain]);
      beatCount++;
      beat++;
      startTime += interval / 1000;

      // Disconnect finished sounds
      while (playingSources.length) {
        const [source, endTime, gainNode] = playingSources[0];
        if (endTime < audioCtx.current.currentTime) {
          source.disconnect(gainNode);
          playingSources.shift();
        } else {
          break;
        }
      }

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
        curBpm = curBpm + tempoInc;
        // adjust interval to new bpm
        const newInterval = (60 / (curBpm * subdivide)) * 1000;
        interval = newInterval;
        noteLen = newInterval / 1.5 / 1000;
        setBpm((prev) => {
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

  const createBeepTone = (gain) => {
    const newOsc = audioCtx.current.createOscillator();
    newOsc.connect(gain);
    return newOsc;
  };

  return { playBeep };
};

export default beepPlayer;
