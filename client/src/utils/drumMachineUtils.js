import { audioSamples, idxToBeat } from "./audioFiles";

const createDrumMachineUtils = (
  setIsPlaying,
  volumeRef,
  timerId,
  isStopping
) => {
  const playCustomRhythm = async (instrumentArr, rhythms, curBpm) => {
    isStopping.current = false;
    let cur;

    const intervalFunc = async () => {
      return new Promise(async (resolve) => {
        const beats = rhythms[0].length;
        for (let beat = 0; beat < beats; beat++) {
          instrumentArr.forEach((sound, key) => {
            if (isStopping.current) {
              return;
            }
            cur = rhythms[key][beat];
            if (cur > 0) {
              sound.currentTime = 0;
              sound.volume = volumeRef.current;
              sound.play();
            } else if (cur < 0) {
              if (!sound.currentTime === 0) {
                sound.stop();
              }
            }
          });
          if (isStopping.current) {
            isStopping.current = false;
            return;
          }
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              // (12 parts per beat)
            }, (60 / (curBpm * 12)) * 1000);
          });
        }
        resolve();
      });
    };
    setIsPlaying(true);
    while (!isStopping.current) {
      await intervalFunc();
    }
  };

  const playSample = (name, idx, volume) => {
    const sample = new Audio(audioSamples[name][idxToBeat[idx]]);
    sample.volume = volume;
    sample.play();
  };

  const startDrumMachine = (instruments, rhythms, curBpm) => {
    if (timerId) {
      clearInterval(timerId);
    }
    const instData = [];
    let loaded = 0;
    const instrumentsToPlay = instruments.filter((instrument) => instrument[0]);
    let numToLoad = instrumentsToPlay.length;

    instrumentsToPlay.forEach((instrument, i) => {
      const audio = new Audio(
        audioSamples[instrument[0]][idxToBeat[instrument[2]]]
      );
      audio.addEventListener("canplaythrough", () => {
        loaded++;
        if (numToLoad == loaded) {
          playCustomRhythm(instData, rhythms, curBpm);
        }
      });
      instData.push(audio);
    });
  };

  const stopDrumMachine = () => {
    isStopping.current = true;
    setIsPlaying(false);
  };
  return { startDrumMachine, stopDrumMachine, playSample };
};

export default createDrumMachineUtils;
