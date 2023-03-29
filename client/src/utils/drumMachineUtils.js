import { audioSamples, idxToBeat } from "./audioFiles";
import { fetchAudio } from "./audioUtils";

const createDrumMachineUtils = (
  setIsPlaying,
  volumeRef,
  isStopping,
  playingSources,
  audioCtx,
  stopCheck,
  timerId,
  setTimerId
) => {
  const playCustomRhythm = async (instruments, rhythms, curBpm) => {
    if (stopCheck()) return;
    const buffers = await loadInstruments(instruments);
    isStopping.current = false;
    const addToStart = 60 / (curBpm * 12); // (12 parts per beat)
    const timeSig = rhythms[0].length / 12;
    const interval = (60 / curBpm) * timeSig * 1000;
    let startTime = audioCtx.current.currentTime + 0.5;
    let cur;

    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);

    const intervalFunc = async () => {
      const beats = rhythms[0].length;
      for (let beat = 0; beat < beats; beat++) {
        for (let key = 0; key < buffers.length; key++) {
          const drumBuffer = buffers[key];
          cur = rhythms[key][beat];
          if (cur > 0) {
            if (!audioCtx.current || isStopping.current) {
              break;
            }
            const source = audioCtx.current.createBufferSource();
            source.buffer = drumBuffer;

            source.connect(gainNode);
            source.start(startTime);
            playingSources.push([
              source,
              startTime,
              gainNode,
              drumBuffer.duration,
            ]);
          }
        }
        if (!audioCtx.current || isStopping.current) {
          break;
        }
        gainNode.gain.value = volumeRef.current;
        startTime += addToStart;
      }
      if (!audioCtx.current || isStopping.current) return;
      // Disconnect finished audio sources
      while (playingSources.length) {
        const [source, startTime, gainNode, dur] = playingSources[0];
        if (startTime + dur < audioCtx.current.currentTime) {
          source.disconnect(gainNode);
          // gainNode.disconnect(audioCtx.current.destination);
          playingSources.shift();
        } else {
          break;
        }
      }
      if (!audioCtx.current || isStopping.current) return;
      const id = setTimeout(() => intervalFunc(), interval);
      setTimerId(id);
    };

    intervalFunc(1);
    setIsPlaying(true);
  };

  const playSample = (name, idx, volume) => {
    const sample = new Audio(audioSamples[name][idxToBeat[idx]]);
    sample.volume = volume;
    sample.play();
  };

  const startDrumMachine = async (instruments, rhythms, curBpm) => {
    // remove any instruments that don't have rhythms added
    const instrumentsToPlay = instruments.filter(
      (instrument) =>
        instrument[0] !== null &&
        instrument[0] !== undefined &&
        instrument[1] !== null &&
        instrument[1] !== undefined &&
        instrument[2] !== null &&
        instrument[2] !== undefined
    );
    if (instrumentsToPlay.length === 0) return;

    // check if there are rhythm's added
    let isRhythm = false;
    for (let i = 0; i < instruments.length; i++) {
      if (!instruments[i][0]) continue;
      const checkRhythms = rhythms[i].filter((x) => x === 1).length;
      if (checkRhythms > 0) {
        isRhythm = true;
        break;
      }
    }
    if (!isRhythm) return;
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    playCustomRhythm(instrumentsToPlay, rhythms, curBpm);
  };

  const loadInstruments = async (instruments) => {
    return await Promise.all(
      instruments.map((instrument) =>
        fetchAudio(
          audioSamples[instrument[0]][idxToBeat[instrument[2]]],
          audioCtx
        )
      )
    );
  };

  const stopDrumMachine = () => {
    isStopping.current = true;
    stopCheck();
    clearTimeout(timerId);
    setTimerId(null);
  };
  return { startDrumMachine, stopDrumMachine, playSample };
};

export default createDrumMachineUtils;
