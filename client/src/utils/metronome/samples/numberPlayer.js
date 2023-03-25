import { numberAudioFiles } from "../../audioFiles";

const numberPlayer = ({
  bpm,
  originalBpm,
  sectionPractice,
  numMeasures,
  timeSignature,
  subdivide,
  repeat,
  tempoInc,
  setIsPlaying,
  volumeRef,
  setTimerId,
  tempoPractice,
  setBpm,
}) => {
  const loadNumberCounterAudio = () => {
    return new Promise((resolve) => {
      const sounds = [];
      let loaded = 0;
      let totalToLoad = timeSignature;
      if (subdivide > 1) {
        if (subdivide === 2) {
          totalToLoad += 1;
        } else if (subdivide === 3) {
          totalToLoad += 2;
        } else if (subdivide === 4) {
          totalToLoad += 3;
        } else if (subdivide === 5) {
          totalToLoad += 1;
        } else if (subdivide === 6) {
          totalToLoad += 2;
        } else if (subdivide === 7) {
          totalToLoad += 1;
        } else if (subdivide === 8) {
          totalToLoad += 4;
        }
      }
      const audioLoad = () => {
        loaded++;
        if (loaded == totalToLoad) resolve(sounds);
      };

      // creates subdivide audio objects if needed
      if (
        subdivide === 2 ||
        subdivide === 3 ||
        subdivide === 4 ||
        subdivide === 6 ||
        subdivide === 8
      ) {
        const audio = new Audio("./audio/numbers/spoken/and.mp3");
        audio.addEventListener("canplaythrough", audioLoad);
        numberAudioFiles.and = audio;
      }
      if (subdivide === 3 || subdivide === 4 || subdivide === 8) {
        numberAudioFiles.a = new Audio("./audio/numbers/spoken/a.mp3");
        numberAudioFiles.a.addEventListener("canplaythrough", audioLoad);
      }
      if (subdivide === 4 || subdivide === 8) {
        numberAudioFiles.e = new Audio("./audio/numbers/spoken/e.mp3");
        numberAudioFiles.e.addEventListener("canplaythrough", audioLoad);
      }
      if (
        subdivide === 5 ||
        subdivide === 6 ||
        subdivide === 7 ||
        subdivide === 8
      ) {
        numberAudioFiles.ta = new Audio("./audio/numbers/spoken/ta.mp3");
        numberAudioFiles.ta.addEventListener("canplaythrough", audioLoad);
      }

      // adds the main beat counts followed by subdivide if needed

      for (let i = 1; i <= timeSignature; i++) {
        const audio = new Audio(numberAudioFiles[i]);
        sounds.push(audio);
        audio.addEventListener("canplaythrough", audioLoad);
        if (subdivide === 2) {
          sounds.push(numberAudioFiles.and);
        } else if (subdivide === 3) {
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.a);
        } else if (subdivide === 4) {
          sounds.push(numberAudioFiles.e);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.a);
        } else if (subdivide === 5) {
          for (let i = 0; i < 4; i++) {
            sounds.push(numberAudioFiles.ta);
          }
        } else if (subdivide === 6) {
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.ta);
        } else if (subdivide === 7) {
          for (let i = 0; i < 6; i++) {
            sounds.push(numberAudioFiles.ta);
          }
        } else if (subdivide === 8) {
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.e);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.a);
          sounds.push(numberAudioFiles.ta);
        }
      }
    });
  };

  const playNumberCounter = async () => {
    const sounds = await loadNumberCounterAudio();

    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 0;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
      const sound = sounds[beatCount];
      sound.volume = volumeRef.current;
      sound.currentTime = 0;
      sound.play();
      beatCount++;
      beat++;
      if (beatCount === timeSignature * subdivide) {
        beatCount = 0;
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
  return { playNumberCounter };
};
export default numberPlayer;
