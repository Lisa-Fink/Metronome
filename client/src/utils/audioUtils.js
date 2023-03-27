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
  playingSources,
  setPlayingSources,
  audioCtx,
  setAudioCtx
) => {
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
    setPlayingSources,
    audioCtx,
    setAudioCtx,
  };
  const { startClick, stopClick } = createMetronomeUtils(metronomeSettings);

  const { startDrumMachine, stopDrumMachine, playSample } =
    createDrumMachineUtils(
      setIsPlaying,
      volumeRef,
      timerId,
      isStopping,
      setIsStopped
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

export default createAudioUtils;
