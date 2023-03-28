import { AudioContext } from "standardized-audio-context";

import drumSetPlayer from "./metronome/samples/drumSetPlayer";
import numberPlayer from "./metronome/samples/numberPlayer";
import audioPlayer from "./metronome/samples/audioPlayer";
import flutePlayer from "./metronome/generated/flutePlayer";
import beepPlayer from "./metronome/generated/beepPlayer";
import countInPlayer from "./metronome/samples/countInPlayer";

const createMetronomeUtils = (metronomeSettings) => {
  const { playNumberCounter } = numberPlayer(metronomeSettings);

  const { playDrumSet } = drumSetPlayer(metronomeSettings);

  const { playAudio } = audioPlayer(metronomeSettings);

  const { playFlute } = flutePlayer(metronomeSettings);

  const { playBeep } = beepPlayer(metronomeSettings);
  const { playCountIn } = countInPlayer(metronomeSettings);

  const {
    timerId,
    setIsPlaying,
    isStopping,
    sectionPractice,
    tempoPractice,
    setBpm,
    originalBpm,
    countIn,
    toneCategory,
    tone,
    key,
    setTimerId,
    playingSources,
    audioCtx,
  } = metronomeSettings;

  const stopClick = () => {
    playingSources.length = 0;

    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = undefined;
    }
    clearInterval(timerId);
    setIsPlaying(false);
    setTimerId(null);

    isStopping.current = true;

    if (sectionPractice && tempoPractice) {
      setBpm(originalBpm.current);
    }
  };

  const startClick = async () => {
    let start = undefined;

    audioCtx.current = new AudioContext();

    if (countIn > 0) {
      start = await playCountIn();
    }
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
