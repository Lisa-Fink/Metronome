import { getAudioFiles } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

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
  setBpm,
  playingSources,
  audioCtx,
  stopCheck,
  stopSection,
}) => {
  const loadAudioFiles = async (beats, mainBeats, downBeats) => {
    const [downBeatBuffer, regularBuffer, mainBeatBuffer] = await Promise.all([
      fetchAudio(downBeats, audioCtx),
      fetchAudio(beats, audioCtx),
      fetchAudio(mainBeats, audioCtx),
    ]);
    return { downBeatBuffer, regularBuffer, mainBeatBuffer };
  };

  const playAudio = async (tone, start) => {
    const { beats, mainBeats, downBeats } = getAudioFiles(tone);
    let addToStart = 60 / (bpm * subdivide);
    let interval = addToStart * 1000;
    let beatCount = 1;
    let beat = 0;
    originalBpm.current = bpm;

    let curBpm = bpm;

    let startTime = start ? start : audioCtx.current.currentTime + 0.3;

    const { downBeatBuffer, regularBuffer, mainBeatBuffer } =
      await loadAudioFiles(beats, mainBeats, downBeats, audioCtx.current);

    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);

    const play = (curTone) => {
      if (stopCheck()) return;
      const downBeatSource = audioCtx.current.createBufferSource();
      const regularSource = audioCtx.current.createBufferSource();
      const mainBeatSource = audioCtx.current.createBufferSource();
      downBeatSource.buffer = downBeatBuffer;
      regularSource.buffer = regularBuffer;
      mainBeatSource.buffer = mainBeatBuffer;
      const sound =
        downBeat && beatCount === 1
          ? downBeatSource
          : subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0
          ? mainBeatSource
          : regularSource;

      gainNode.gain.value = volumeRef.current;
      sound.connect(gainNode);
      sound.start(startTime);
      playingSources.push([
        sound,
        startTime,
        gainNode,
        downBeatBuffer.duration,
      ]);

      // Disconnect finished audio sources
      while (playingSources.length) {
        const [source, startTime, gainNode, dur] = playingSources[0];
        if (startTime + dur < audioCtx.current.currentTime) {
          source.disconnect(gainNode);
          playingSources.shift();
        } else {
          break;
        }
      }

      beatCount++;
      beat++;
      startTime += addToStart;
      if (beatCount > timeSignature * subdivide) {
        beatCount = 1;
      }
      // handle section practice
      if (
        sectionPractice &&
        beat === numMeasures * timeSignature * subdivide * repeat
      ) {
        // section with all repeats have finished
        stopSection();
        return;
      } else if (
        sectionPractice &&
        tempoPractice &&
        beat > 0 &&
        beat % (timeSignature * subdivide * numMeasures) === 0
      ) {
        // adjust interval to new bpm
        curBpm = curBpm + tempoInc;
        addToStart = 60 / (curBpm * subdivide);
        const newInterval = addToStart * 1000;
        interval = newInterval;
        setBpm((prev) => {
          return prev + tempoInc;
        });
      }
      if (!stopCheck()) {
        setTimeout(() => play(curTone), interval);
      }
    };
    play(tone);
    setIsPlaying(true);
  };

  return { playAudio };
};

export default audioPlayer;
