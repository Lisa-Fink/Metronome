import { getAudioFiles } from "../../audioFiles";

const audioPlayer = ({
  bpm,
  subdivide,
  originalBpm,
  mainBeat,
  timeSignature,
  volumeRef,
  tempoPractice,
  sectionPractice,
  tempoInc,
  setIsPlaying,
  downBeat,
  numMeasures,
  repeat,
  setTimerId,
  setBpm,
}) => {
  const loadAudioFiles = (beats, mainBeats, downBeats) => {
    return new Promise((resolve) => {
      let loaded = 0;
      const onAudioLoad = () => {
        loaded++;
        if (loaded === 3)
          resolve({ downBeatSound, regularSound, mainBeatSound });
      };
      const downBeatSound = new Audio(downBeats);
      downBeatSound.addEventListener("canplaythrough", onAudioLoad);
      const regularSound = new Audio(beats);
      regularSound.addEventListener("canplaythrough", onAudioLoad);
      const mainBeatSound = new Audio(mainBeats);
      mainBeatSound.addEventListener("canplaythrough", onAudioLoad);
    });
  };

  const playAudio = async (tone) => {
    const { beats, mainBeats, downBeats } = getAudioFiles(tone);
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let beat = 0;
    originalBpm.current = bpm;

    let curBpm = bpm;

    const { downBeatSound, regularSound, mainBeatSound } = await loadAudioFiles(
      beats,
      mainBeats,
      downBeats
    );

    const intervalFn = () => {
      const sound =
        downBeat && beatCount === 1
          ? downBeatSound
          : subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0
          ? mainBeatSound
          : regularSound;

      sound.volume = volumeRef.current;

      sound.currentTime = 0;
      sound.play();

      beatCount++;
      beat++;
      if (beatCount > timeSignature * subdivide) {
        beatCount = 1;
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
  return { playAudio };
};

export default audioPlayer;
