import { getInstrumentList } from "./audioFiles";
import createDrumMachineUtils from "./drumMachineUtils";
import createMetronomeUtils from "./metronomeUtils";

const createAudioUtils = (
  bpm,
  downBeat,
  setIsPlaying,
  key,
  mainBeat,
  subdivide,
  timeSignature,
  tone,
  volumeRef,
  toneCategory,
  timerId,
  countIn,
  numMeasures,
  repeat,
  tempoInc,
  sectionPractice,
  tempoPractice,
  setBpm,
  originalBpm,
  isStopping,
  setIsStopped,
  audioCtx,
  instruments,
  rhythmSequence
) => {
  const stopCheck = () => {
    if (isStopping.current || !audioCtx.current) {
      if (audioCtx.current) {
        audioCtx.current.close();
        audioCtx.current = undefined;
      }
      clearTimeout(timerId.current);
      isStopping.current = false;
      setIsPlaying(false);
      setIsStopped(true);
      return true;
    }
    return false;
  };

  const metronomeSettings = {
    bpm,
    downBeat,
    setIsPlaying,
    key,
    mainBeat,
    subdivide,
    timeSignature,
    tone,
    volumeRef,
    toneCategory,
    timerId,
    countIn,
    numMeasures,
    repeat,
    tempoInc,
    sectionPractice,
    tempoPractice,
    setBpm,
    originalBpm,
    isStopping,
    audioCtx,
    setIsStopped,
    stopCheck,
  };
  const { startClick, stopClick } = createMetronomeUtils(metronomeSettings);

  const { startDrumMachine, stopDrumMachine, playSample } =
    createDrumMachineUtils(
      setIsPlaying,
      volumeRef,
      isStopping,
      audioCtx,
      stopCheck,
      bpm,
      instruments,
      rhythmSequence,
      timerId
    );

  const stopEverything = () => {
    stopCheck();
  };

  return {
    startClick,
    stopClick,
    playSample,
    getInstrumentList,
    startDrumMachine,
    stopDrumMachine,
    stopEverything,
  };
};

const fetchAudio = async (src, audioCtx) => {
  if (!audioCtx.current) return;
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.current.decodeAudioData(arrayBuffer);
};

export default createAudioUtils;
export { fetchAudio };
