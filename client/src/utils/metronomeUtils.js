import { AudioContext } from "standardized-audio-context";

import countInPlayer from "./metronome/samples/countInPlayer";
import metronomePlayer from "./metronome/metronomePlayer";

const createMetronomeUtils = (metronomeSettings) => {
  const {
    isStopping,
    tempoPractice,
    setBpm,
    originalBpm,
    countIn,
    audioCtx,
    stopCheck,
    tempoInc,
  } = metronomeSettings;

  const stopSection = (startTime) => {
    if (startTime > audioCtx.current.currentTime) {
      const interval = setInterval(() => {
        if (audioCtx.current.currentTime > startTime + 0.2) {
          stopClick();
          stopCheck();
          clearInterval(interval);
        }
      }, 100);
    } else {
      stopClick();
      stopCheck();
    }
  };

  metronomeSettings.stopSection = stopSection;

  const { playCountIn } = countInPlayer(metronomeSettings);
  const { play } = metronomePlayer(metronomeSettings);

  const stopClick = () => {
    if (tempoPractice && tempoInc > 0) {
      setBpm(originalBpm.current);
    }
    isStopping.current = true;
  };

  const startClick = async () => {
    audioCtx.current = new AudioContext();

    let start = audioCtx.current.currentTime + 0.3;

    if (countIn > 0) {
      start = await playCountIn(start);
    }
    if (start < 0) return;

    play(start);
  };
  return { startClick, stopClick };
};

export default createMetronomeUtils;
