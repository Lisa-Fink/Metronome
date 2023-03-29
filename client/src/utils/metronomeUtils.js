import { AudioContext } from "standardized-audio-context";

import drumSetPlayer from "./metronome/samples/drumSetPlayer";
import numberPlayer from "./metronome/samples/numberPlayer";
import audioPlayer from "./metronome/samples/audioPlayer";
import flutePlayer from "./metronome/generated/flutePlayer";
import beepPlayer from "./metronome/generated/beepPlayer";
import countInPlayer from "./metronome/samples/countInPlayer";

const createMetronomeUtils = (metronomeSettings) => {
  const {
    isStopping,
    tempoPractice,
    setBpm,
    originalBpm,
    countIn,
    toneCategory,
    tone,
    playingSources,
    audioCtx,
    stopCheck,
    tempoInc,
  } = metronomeSettings;

  const stopSection = () => {
    if (playingSources.length > 0) {
      const interval = setInterval(() => {
        const [source, startTime, gainNode, dur] = playingSources[0];
        if (startTime + dur < audioCtx.current.currentTime) {
          playingSources.shift();
          if (playingSources.length === 0) {
            stopClick();
            stopCheck();
            clearInterval(interval);
          }
        }
      }, 100);
    } else {
      stopClick();
      stopCheck();
    }
  };

  metronomeSettings.stopSection = stopSection;

  const { playNumberCounter } = numberPlayer(metronomeSettings);

  const { playDrumSet } = drumSetPlayer(metronomeSettings);

  const { playAudio } = audioPlayer(metronomeSettings);

  const { playFlute } = flutePlayer(metronomeSettings);

  const { playBeep } = beepPlayer(metronomeSettings);
  const { playCountIn } = countInPlayer(metronomeSettings);

  const stopClick = () => {
    if (tempoPractice && tempoInc > 0) {
      setBpm(originalBpm.current);
    }
    isStopping.current = true;
  };

  const startClick = async () => {
    let start = undefined;

    audioCtx.current = new AudioContext();

    if (countIn > 0) {
      start = await playCountIn();
    }
    if (start < 0) return;
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        playBeep(start);
      } else if (tone === "audioContextFlute") {
        playFlute(start);
      }
    } else {
      if (toneCategory === "Percussion") {
        playAudio(tone, start);
      } else if (toneCategory === "Spoken Counts") {
        playNumberCounter(start);
      } else if (toneCategory === "Drum Sets") {
        playDrumSet(start);
      }
    }
  };

  return { startClick, stopClick };
};

export default createMetronomeUtils;
