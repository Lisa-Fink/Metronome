import { audioSamples } from "../../audioFiles";

const countInPlayer = ({
  bpm,
  setIsPlaying,
  timeSignature,
  subdivide,
  volumeRef,
  countIn,
  setTimerId,
}) => {
  const loadCountIn = async (audioContext) => {
    const src = audioSamples.Triangle.downBeats;
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  };

  const playCountIn = async (audioCtx) => {
    setIsPlaying(true);
    // use triangle down beat
    const clickBuffer = await loadCountIn(audioCtx);

    const interval = (60 / (bpm * subdivide)) * 1000;
    let beat = 0;
    let startTime = audioCtx.currentTime;
    return new Promise((resolve) => {
      const id = setInterval(() => {
        const source = audioCtx.createBufferSource();
        source.buffer = clickBuffer;
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volumeRef.current;
        gainNode.connect(audioCtx.destination);
        source.connect(gainNode);
        source.start(startTime);
        startTime += interval / 1000;
        beat++;
        if (beat == countIn * timeSignature * subdivide) {
          clearInterval(id);
          resolve(startTime + interval / 1000);
        }
      }, interval);
      setTimerId(id);
    });
  };
  return { playCountIn };
};

export default countInPlayer;
