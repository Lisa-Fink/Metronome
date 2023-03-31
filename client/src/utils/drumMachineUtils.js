import { audioSamples, idxToBeat } from "./audioFiles";
import { fetchAudio } from "./audioUtils";

const createDrumMachineUtils = (
  setIsPlaying,
  volumeRef,
  isStopping,
  audioCtx,
  stopCheck,
  bpm,
  instruments,
  rhythmSequence,
  timerId
) => {
  let addToStart,
    timeSig,
    startTime,
    scheduleTime,
    lookAheadTime,
    curBpm,
    rhythms,
    isScheduling;

  const scheduleSeqStart = async (buffers, gainNode) => {
    // set isScheduling to avoid entering a loop on consecutive start/stop calls
    if (isScheduling) return;
    isScheduling = true;
    // Schedules every start for 1 drum machine sequence
    const beats = rhythms[0].length;
    for (let beat = 0; beat < beats; beat++) {
      for (let instIdx = 0; instIdx < buffers.length; instIdx++) {
        const drumBuffer = buffers[instIdx];
        const cur = rhythms[instIdx][beat];
        if (cur > 0) {
          if (!audioCtx.current || isStopping.current) {
            break;
          }
          const source = audioCtx.current.createBufferSource();
          source.buffer = drumBuffer;

          source.connect(gainNode);
          source.start(startTime);
        }
      }
      if (!audioCtx.current || isStopping.current) {
        break;
      }
      gainNode.gain.value = volumeRef.current;
      startTime += addToStart;
    }
    if (!audioCtx.current || isStopping.current) {
      stopCheck();
      isScheduling = false;
      return;
    }
    isScheduling = false;
  };

  const scheduler = (buffers, gainNode) => {
    if (stopCheck() || !audioCtx.current) return;
    while (
      audioCtx.current &&
      startTime < audioCtx.current.currentTime + lookAheadTime
    ) {
      scheduleSeqStart(buffers, gainNode);
    }
    if (stopCheck() || !audioCtx.current) return;

    timerId.current = setTimeout(
      () => scheduler(buffers, gainNode),
      scheduleTime
    );
  };

  const playSample = (name, idx, volume) => {
    const sample = new Audio(audioSamples[name][idxToBeat[idx]]);
    sample.volume = volume;
    sample.play();
  };

  const startDrumMachine = async () => {
    clearTimeout(timerId.current);
    // verify and get instruments that have rhythms
    const instrumentsToPlay = [];
    rhythms = rhythmSequence.current;
    if (!isPlayable(instrumentsToPlay)) return;
    // set up variables
    audioCtx.current = new AudioContext();
    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);
    const buffers = await loadInstruments(instrumentsToPlay);

    curBpm = bpm;
    addToStart = 60 / (curBpm * 12); // (12 parts per beat)
    timeSig = rhythms[0].length / 12;
    scheduleTime = ((60 / curBpm) * timeSig * 1000) / 3.5;
    lookAheadTime = (60 / curBpm) * timeSig * 2;
    startTime = audioCtx.current.currentTime + 0.2;

    setIsPlaying(true);

    scheduler(buffers, gainNode);
  };

  const isPlayable = (instrumentsToPlay) => {
    // Validate the drum machine has at least 1 instrument with rhythms added,
    // adding the valid instruments into instrumentsToPlay.
    const playable = instruments.filter(
      (instrument) =>
        instrument[0] !== null &&
        instrument[0] !== undefined &&
        instrument[1] !== null &&
        instrument[1] !== undefined &&
        instrument[2] !== null &&
        instrument[2] !== undefined
    );
    if (playable.length === 0) return false;

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
    if (!isRhythm) return false;
    playable.forEach((inst) => instrumentsToPlay.push(inst));
    return true;
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
    stopCheck(timerId);
  };

  return { startDrumMachine, stopDrumMachine, playSample };
};

export default createDrumMachineUtils;
