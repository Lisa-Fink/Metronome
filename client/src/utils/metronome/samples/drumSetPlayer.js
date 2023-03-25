import { audioSamples } from "../../audioFiles";

const drumSetPlayer = ({
  bpm,
  subdivide,
  originalBpm,
  mainBeat,
  timeSignature,
  volumeRef,
  tempoPractice,
  sectionPractice,
  tempoInc,
  downBeat,
  numMeasures,
  repeat,
  setIsPlaying,
  setTimerId,
  setBpm,
}) => {
  const loadDrumSet = () => {
    return new Promise((resolve) => {
      let loaded = 0;
      const loadFn = () => {
        loaded++;
        if (loaded === 6) {
          resolve({ bass, hiHat, hiHatSubdivide, snare, crash, clap });
        }
      };

      const bass = new Audio(audioSamples["Bass Drum"].beats);
      bass.addEventListener("canplaythrough", loadFn);
      const hiHat = new Audio(audioSamples.Cymbal.mainBeats);
      hiHat.addEventListener("canplaythrough", loadFn);
      const hiHatSubdivide = new Audio(audioSamples.Cymbal.beats);
      hiHatSubdivide.addEventListener("canplaythrough", loadFn);
      const snare = new Audio(audioSamples["Snare Drum"].mainBeats);
      snare.addEventListener("canplaythrough", loadFn);
      const crash = new Audio(audioSamples.Cymbal.downBeats);
      crash.addEventListener("canplaythrough", loadFn);
      const clap = new Audio(audioSamples.Clap.mainBeats);
      clap.addEventListener("canplaythrough", loadFn);
    });
  };

  const playDrumSet = async () => {
    const { bass, hiHat, hiHatSubdivide, snare, crash, clap } =
      await loadDrumSet();

    let interval = (60 / (bpm * subdivide)) * 1000;

    const main = [crash, clap];

    let beatCount = 0;
    let idx = 0;
    let sub = 0;

    const twoFour = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      bass,
      snare,
      undefined,
    ];

    const three = [bass, snare, snare, bass, snare, undefined];
    const five = [
      bass,
      undefined,
      snare,
      bass,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
    ];
    const six = [
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
      undefined,
    ];
    const seven = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
    ];

    const nine = [
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
    ];

    const rhythmMap = {
      2: twoFour,
      3: three,
      4: twoFour,
      5: five,
      6: six,
      7: seven,
      9: nine,
    };
    let current;
    let beat = 0;
    originalBpm.current = bpm;
    let curBpm = bpm;

    const intervalFn = () => {
      // even number of beats
      const rhythm = rhythmMap[timeSignature];
      if (sub-- > 1) {
        if (mainBeat) {
          hiHatSubdivide.currentTime = 0;
          hiHatSubdivide.volume = volumeRef.current;
          hiHatSubdivide.play();
        } else {
          hiHat.currentTime = 0;
          hiHat.volume = volumeRef.current;
          hiHat.play();
        }
      } else {
        if (subdivide > 1) {
          sub = subdivide;
        }
        current = rhythm[idx++];
        if (current === bass) {
          bass.currentTime = 0;
        }
        if (current !== undefined) {
          current.currentTime = 0;
          current.volume = volumeRef.current;
          current.play();
        }
        hiHat.currentTime = 0;
        hiHat.volume = volumeRef.current;
        hiHat.play();
      }
      if (downBeat) {
        if (beatCount === 0) {
          main[0].currentTime = 0;
          main[0].volume = volumeRef.current;
          main[0].play();
        } else if (beatCount === timeSignature * subdivide) {
          main[1].currentTime = 0;
          main[1].volume = volumeRef.current;
          main[1].play();
        }
      }
      beatCount++;
      beat++;
      if (beatCount === timeSignature * subdivide * 2) {
        beatCount = 0;
        idx = 0;
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
  return { playDrumSet };
};
export default drumSetPlayer;
