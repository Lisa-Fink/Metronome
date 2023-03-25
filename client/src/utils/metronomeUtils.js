import { AudioContext } from "standardized-audio-context";

import drumSetPlayer from "./metronome/samples/drumSetPlayer";
import numberPlayer from "./metronome/samples/numberPlayer";
import audioPlayer from "./metronome/samples/audioPlayer";
import flutePlayer from "./metronome/generated/flutePlayer";
import beepPlayer from "./metronome/generated/beepPlayer";
import countInPlayer from "./metronome/samples/countInPlayer";

const createMetronomeUtils = (metronomeSettings) => {
  // store audioContext objects to disable/disconnect later
  let audioContext,
    osc,
    gain,
    downBeatGain,
    downBeatOsc,
    mainBeatGain,
    mainBeatOsc;

  const { playNumberCounter } = numberPlayer(metronomeSettings);

  const { playDrumSet } = drumSetPlayer(metronomeSettings);

  const { playAudio } = audioPlayer(metronomeSettings);

  const { createFluteTone, playFlute } = flutePlayer(metronomeSettings);

  const { createBeepTone, playBeep } = beepPlayer(metronomeSettings);
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
  } = metronomeSettings;

  const stopClick = () => {
    clearInterval(timerId);
    setIsPlaying(false);
    setTimerId(null);

    isStopping.current = true;

    if (sectionPractice && tempoPractice) {
      setBpm(originalBpm.current);
    }
    if (osc) {
      osc.stop();
      osc = null;
    }
    if (gain) {
      gain.disconnect();
      gain = null;
    }
    if (downBeatOsc) {
      downBeatOsc.stop();
      downBeatOsc = null;
    }
    if (downBeatGain) {
      downBeatGain.disconnect();
      downBeatGain = null;
    }
    if (mainBeatOsc) {
      mainBeatOsc.stop();
      mainBeatOsc = null;
    }
    if (mainBeatGain) {
      mainBeatGain.disconnect();
      mainBeatGain = null;
    }
  };

  const startClick = async () => {
    if (countIn > 0) {
      await playCountIn();
    }
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        const { newOsc, newGain } = getTone();
        osc = newOsc;
        gain = newGain;
        playBeep(newOsc, newGain);
      } else if (tone === "audioContextFlute") {
        const [regular, downBeat, mainBeat] = getTone();
        const { newOsc, newGain } = regular;
        downBeatOsc = downBeat.newOsc;
        downBeatGain = downBeat.newGain;
        mainBeatOsc = mainBeat.newOsc;
        mainBeatGain = mainBeat.newGain;
        osc = newOsc;
        gain = newGain;
        playFlute(
          osc,
          downBeatOsc,
          mainBeatOsc,
          gain,
          mainBeatGain,
          downBeatGain
        );
      }
    } else {
      if (audioContext) {
        audioContext.close().then(() => (audioContext = null));
      }
      if (toneCategory === "Percussion") {
        playAudio(tone);
      } else if (toneCategory === "Spoken Counts") {
        playNumberCounter();
      } else if (toneCategory === "Drum Sets") {
        playDrumSet();
      }
    }
  };

  /**********************************************************************************/

  /**********************************************************************************/
  // Basic Tones (Beep and Flute) w/ AudioContext

  // Returns the audio context or creates a new one if it doesn't exist
  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext();
      return audioContext;
    }
    return audioContext;
  };

  const getTone = () => {
    const audioContext = getAudioContext();
    if (tone === "audioContextFlute") {
      return [
        createFluteTone(audioContext, key),
        createFluteTone(audioContext, key * 2),
        createFluteTone(audioContext, key * 1.5),
      ];
    }
    return createBeepTone(audioContext);
  };
  return { startClick, stopClick };
};

export default createMetronomeUtils;
