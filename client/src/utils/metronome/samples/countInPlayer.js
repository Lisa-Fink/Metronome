import { audioSamples } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const countInPlayer = ({
  bpm,
  setIsPlaying,
  timeSignature,
  subdivide,
  volumeRef,
  countIn,
  setTimerId,
  audioCtx,
  stopCheck,
}) => {
  const loadCountIn = async () => {
    return await fetchAudio(audioSamples.Triangle.downBeats, audioCtx);
  };

  const playCountIn = async (start) => {
    setIsPlaying(true);
    // use triangle down beat
    const clickBuffer = await loadCountIn(audioCtx.current);

    const addToStart = 60 / (bpm * subdivide);
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beat = 0;
    let startTime = start;
    return new Promise((resolve) => {
      const id = setInterval(() => {
        const source = audioCtx.current.createBufferSource();
        source.buffer = clickBuffer;
        const gainNode = audioCtx.current.createGain();
        gainNode.gain.value = volumeRef.current;
        gainNode.connect(audioCtx.current.destination);
        source.connect(gainNode);
        source.start(startTime);
        startTime += addToStart;
        beat++;
        if (beat == countIn * timeSignature * subdivide) {
          clearInterval(id);
          resolve(startTime);
        }
        if (stopCheck()) {
          clearInterval(id);
          resolve(-1);
        }
      }, interval);
      setTimerId(id);
    });
  };
  return { playCountIn };
};

export default countInPlayer;
