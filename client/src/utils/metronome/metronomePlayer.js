import getBeepSounds, { beepStart } from "./generated/beepSounds";
import getFluteSounds, { fluteStart } from "./generated/fluteSounds";
import getAudioSounds from "./samples/audioSounds";
import getDrumSounds, { drumStart } from "./samples/drumSetSounds";
import getNumberSounds from "./samples/numberSounds";

const metronomePlayer = ({
  subdivide,
  timeSignature,
  volumeRef,
  tempoPractice,
  sectionPractice,
  tempoInc,
  numMeasures,
  repeat,
  setBpm,
  audioCtx,
  stopCheck,
  stopSection,
  bpm,
  setIsPlaying,
  downBeat,
  mainBeat,
  tone,
  toneCategory,
  key,
  timerId,
  gain,
}) => {
  let addToStart,
    beatCount,
    beat,
    curBpm,
    startTime,
    scheduleTime,
    lookAheadTime;

  // Advances startTime, beatCount, and beat to the next click time/beat
  // Makes adjustments for section practice (stops at end, or increases tempo)
  const advance = () => {
    beatCount++;
    beat++;
    startTime += addToStart;
    if (
      toneCategory === "Drum Sets" &&
      beatCount > timeSignature * subdivide * 2
    ) {
      beatCount = 1;
    }
    if (toneCategory !== "Drum Sets" && beatCount > timeSignature * subdivide) {
      beatCount = 1;
    }

    // handle section practice
    if (
      sectionPractice &&
      beat === numMeasures * timeSignature * subdivide * repeat
    ) {
      // section with all repeats have finished
      stopSection(startTime - addToStart);
      return false;
    } else if (
      sectionPractice &&
      tempoPractice &&
      beat > 0 &&
      beat % (timeSignature * subdivide * numMeasures) === 0
    ) {
      // adjust to new bpm
      curBpm = curBpm + tempoInc;
      addToStart = 60 / (curBpm * subdivide);
      setBpm((prev) => {
        return prev + tempoInc;
      });
    }
    return true;
  };

  // Schedules the next click to play
  const scheduleStart = (sound, gainNode) => {
    if (stopCheck()) return;
    if (tone === "audioContextTone") {
      beepStart(sound, startTime, addToStart);
      return;
    }
    // gainNode.gain.value = volumeRef.current;
    if (toneCategory === "Drum Sets") {
      drumStart(sound, startTime, gainNode);
      return;
    }
    if (tone === "audioContextFlute") {
      fluteStart(sound, startTime, addToStart);
      return;
    }
    // Regular audio samples
    sound.connect(gainNode);
    sound.start(startTime);
  };

  // Manages the scheduling of each metronome click sound
  // Uses the audio context's currentTime to precisely execute the playback.
  // Schedules each click that occurs between the current time and the lookAheadTime.
  // It ensures that enough clicks are scheduled in advance for accurate playback timing.
  // Sets a timeout to wait before scheduling again, based on the scheduleTime.
  const scheduler = (sounds, gainNode, getSound) => {
    let ended = false;
    while (
      audioCtx.current &&
      startTime < audioCtx.current.currentTime + lookAheadTime
    ) {
      // call getSound method to set currentSound to the correct tone (downbeat/main beat/subdivide)
      let currentSound;
      if (toneCategory === "Basic Tones") {
        currentSound = getSound(
          gainNode,
          subdivide,
          mainBeat,
          downBeat,
          beatCount,
          key,
          timeSignature,
          audioCtx
        );
      } else {
        currentSound = getSound(
          sounds,
          beatCount,
          audioCtx,
          downBeat,
          mainBeat,
          subdivide,
          timeSignature
        );
      }
      scheduleStart(currentSound, gainNode);
      // call advance to set startTime to the next schedule time, returning False if stopping
      if (!advance()) {
        ended = true;
        break;
      }
    }
    if (ended || !audioCtx.current) return;
    // Wait before scheduling again
    timerId.current = setTimeout(
      () => scheduler(sounds, gainNode, getSound),
      scheduleTime
    );
  };

  const getPlayerSettings = async () => {
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        const beepSounds = getBeepSounds();
        return { getSound: beepSounds.getOsc };
      } else if (tone === "audioContextFlute") {
        const fluteSounds = getFluteSounds();
        return { getSound: fluteSounds.getOsc };
      }
    } else {
      if (toneCategory === "Percussion") {
        return await getAudioSounds(tone, audioCtx);
      } else if (toneCategory === "Spoken Counts") {
        return await getNumberSounds(audioCtx, timeSignature, subdivide);
      } else if (toneCategory === "Drum Sets") {
        return await getDrumSounds(audioCtx);
      }
    }
  };

  const play = async (start) => {
    setIsPlaying(true);
    const gainNode = audioCtx.current.createGain();
    gain.current = gainNode;
    gainNode.connect(audioCtx.current.destination);
    gainNode.gain.value = volumeRef.current;
    const { sounds, getSound } = await getPlayerSettings();
    addToStart = 60 / (bpm * subdivide);
    beatCount = 1;
    beat = 0;
    curBpm = bpm;
    startTime = start;
    scheduleTime = (addToStart * 1000) / 3;
    lookAheadTime = 1;

    scheduler(sounds, gainNode, getSound);
  };
  return { play };
};

export default metronomePlayer;
