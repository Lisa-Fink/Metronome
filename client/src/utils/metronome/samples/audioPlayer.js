import { getAudioFiles } from "../../audioFiles";

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
  setTimerId,
  setBpm,
  playingSources,
  setPlayingSources,
}) => {
  const loadAudioFiles = async (beats, mainBeats, downBeats, audioCtx) => {
    const fetchAudio = async (src) => {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      return audioCtx.decodeAudioData(arrayBuffer);
    };
    const [downBeatBuffer, regularBuffer, mainBeatBuffer] = await Promise.all([
      fetchAudio(downBeats),
      fetchAudio(beats),
      fetchAudio(mainBeats),
    ]);
    return { downBeatBuffer, regularBuffer, mainBeatBuffer };
  };

  const playAudio = async (tone, start, audioCtx) => {
    const { beats, mainBeats, downBeats } = getAudioFiles(tone);
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let beat = 0;
    originalBpm.current = bpm;

    let curBpm = bpm;

    let startTime = start ? start : audioCtx.currentTime;

    const { downBeatBuffer, regularBuffer, mainBeatBuffer } =
      await loadAudioFiles(beats, mainBeats, downBeats, audioCtx);

    const intervalFn = () => {
      const downBeatSource = audioCtx.createBufferSource();
      const regularSource = audioCtx.createBufferSource();
      const mainBeatSource = audioCtx.createBufferSource();
      downBeatSource.buffer = downBeatBuffer;
      regularSource.buffer = regularBuffer;
      mainBeatSource.buffer = mainBeatBuffer;
      const sound =
        downBeat && beatCount === 1
          ? downBeatSource
          : subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0
          ? mainBeatSource
          : regularSource;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volumeRef.current;
      gainNode.connect(audioCtx.destination);
      sound.connect(gainNode);
      sound.start(startTime);
      playingSources.push([sound, startTime, gainNode]);
      startTime += interval / 1000;

      // Disconnect finished audio sources
      while (playingSources.length) {
        const [source, startTime, gainNode] = playingSources[0];
        if (startTime + downBeatBuffer.duration < audioCtx.currentTime) {
          source.disconnect(gainNode);
          gainNode.disconnect(audioCtx.destination);
          playingSources.shift();
        } else {
          break;
        }
      }

      beatCount++;
      beat++;
      if (beatCount > timeSignature * subdivide) {
        beatCount = 1;
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
          const newInterval = 60 / (curBpm * subdivide);
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

  return { playAudio };
};

export default audioPlayer;
