import { getInstrumentList } from "./audioFiles";
import createDrumMachineUtils from "./drumMachineUtils";
import createMetronomeUtils from "./metronomeUtils";

const createAudioUtils = (
  bpm,
  downBeat,
  setIsPlaying,
  key,
  mainBeat,
  setTimerId,
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
  audioCtx
) => {
  let playingSources = [];

  const stopCheck = () => {
    if (isStopping.current || !audioCtx.current) {
      playingSources.length = 0;
      if (audioCtx.current) {
        audioCtx.current.close();
        audioCtx.current = undefined;
      }
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
    setTimerId,
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
    playingSources,
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
      playingSources,
      audioCtx,
      stopCheck,
      timerId,
      setTimerId
    );

  const stopEverything = () => {
    stopClick();
    stopDrumMachine();
    setIsPlaying(false);
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
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.current.decodeAudioData(arrayBuffer);
};

export default createAudioUtils;
export { fetchAudio };
