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
  key,
  numMeasures,
  playingSources,
  audioCtx,
  stopCheck,
  stopSection,
}) => {
  const playBeep = (start) => {
    let addToStart = 60 / (bpm * subdivide);
    let interval = addToStart * 1000;
    let beatCount = 1;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;
    let noteLen = interval / 1.5 / 1000;

    let startTime = start ? start : audioCtx.current.currentTime + 0.3;
    const gain = audioCtx.current.createGain();
    gain.connect(audioCtx.current.destination);

    const play = () => {
      if (stopCheck()) return;
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
      playingSources.push([osc, startTime, gain, noteLen, endTime]);
      beatCount++;
      beat++;
      startTime += addToStart;

      // Disconnect finished sounds
      while (playingSources.length) {
        const [source, startTime, gainNode, noteLen, endTime] =
          playingSources[0];
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
        stopSection();
        return;
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
        noteLen = newInterval / 1.5 / 1000;
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

  const createBeepTone = (gain) => {
    const newOsc = audioCtx.current.createOscillator();
    newOsc.connect(gain);
    return newOsc;
  };

  return { playBeep };
};

export default beepPlayer;
