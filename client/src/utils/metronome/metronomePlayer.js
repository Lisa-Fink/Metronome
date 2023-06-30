import BeepSounds from "./sounds/generated/BeepSoundsC";
import FluteSounds from "./sounds/generated/FluteSoundsC";
import DrumSetSounds from "./sounds/samples/DrumSetSounds";
import NumberSounds from "./sounds/samples/NumberSounds";
import PercussionSounds from "./sounds/samples/PercussionSounds";

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
    lookAheadTime,
    metronomeSounds;

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

  // Manages the scheduling of each metronome click sound
  // Uses the audio context's currentTime to precisely execute the playback.
  // Schedules each click that occurs between the current time and the lookAheadTime.
  // It ensures that enough clicks are scheduled in advance for accurate playback timing.
  // Sets a timeout to wait before scheduling again, based on the scheduleTime.
  const scheduler = () => {
    let ended = false;
    while (
      audioCtx.current &&
      startTime < audioCtx.current.currentTime + lookAheadTime
    ) {
      if (stopCheck()) return;
      metronomeSounds.scheduleStart(startTime, beatCount, addToStart);

      // call advance to set startTime to the next schedule time, returning False if stopping
      if (!advance()) {
        ended = true;
        break;
      }
    }
    if (ended || !audioCtx.current) return;
    // Wait before scheduling again
    timerId.current = setTimeout(() => scheduler(), scheduleTime);
  };

  const getSoundPlayer = async () => {
    let sounds;
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        return new BeepSounds(
          audioCtx,
          subdivide,
          gain.current,
          downBeat,
          mainBeat,
          timeSignature,
          key
        );
      } else if (tone === "audioContextFlute") {
        return new FluteSounds(
          audioCtx,
          subdivide,
          gain.current,
          downBeat,
          mainBeat,
          timeSignature,
          key
        );
      }
    } else {
      if (toneCategory === "Percussion") {
        sounds = new PercussionSounds(
          audioCtx,
          subdivide,
          gain.current,
          downBeat,
          mainBeat,
          tone
        );
      } else if (toneCategory === "Spoken Counts") {
        sounds = new NumberSounds(
          audioCtx,
          subdivide,
          gain.current,
          timeSignature
        );
      } else if (toneCategory === "Drum Sets") {
        sounds = new DrumSetSounds(
          audioCtx,
          subdivide,
          gain.current,
          downBeat,
          mainBeat,
          timeSignature
        );
      }
    }
    await sounds.loadAudio();
    return sounds;
  };

  const play = async (start) => {
    setIsPlaying(true);
    const gainNode = audioCtx.current.createGain();
    gain.current = gainNode;
    gainNode.connect(audioCtx.current.destination);
    gainNode.gain.value = volumeRef.current;
    metronomeSounds = await getSoundPlayer();
    addToStart = 60 / (bpm * subdivide);
    beatCount = 1;
    beat = 0;
    curBpm = bpm;
    startTime = start;
    scheduleTime = (addToStart * 1000) / 3;
    lookAheadTime = 1;

    scheduler();
  };
  return { play };
};

export default metronomePlayer;
