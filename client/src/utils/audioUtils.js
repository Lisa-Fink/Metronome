import { getInstrumentList } from "./audioFiles";
import createDrumMachineUtils from "./drumMachineUtils";
import createMetronomeUtils from "./metronomeUtils";

// Creates utility functions for audio playback using the state variables.
// Initializes a metronome and drum machine audio player with the given settings.
// Returns an object containing functions to manage audio playback (start and
// stop the metronome or drum machine, play samples, retrieve instrument lists).
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
  rhythmSequence,
  gain
) => {
  // Checks if audio context is stopping and cleans up resources if needed
  const stopCheck = () => {
    if (isStopping.current || !audioCtx.current) {
      if (audioCtx.current) {
        audioCtx.current.close();
        audioCtx.current = undefined;
        gain.current = undefined;
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
    gain,
  };

  // Create metronome utility functions
  const { startClick, stopClick } = createMetronomeUtils(metronomeSettings);

  // Create drum machine utility functions
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
      timerId,
      gain
    );

  return {
    startClick,
    stopClick,
    playSample,
    getInstrumentList,
    startDrumMachine,
    stopDrumMachine,
  };
};

// Fetches audio data from a source URL and decodes it using the audio context
const fetchAudio = async (src, audioCtx) => {
  if (!audioCtx.current) return;
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.current.decodeAudioData(arrayBuffer);
};

export default createAudioUtils;
export { fetchAudio };
