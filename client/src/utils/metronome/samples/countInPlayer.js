import { audioSamples } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const countInPlayer = ({
  bpm,
  setIsPlaying,
  timeSignature,
  subdivide,
  volumeRef,
  countIn,
  audioCtx,
  stopCheck,
}) => {
  let beat = 0;
  let startTime = 0;
  let isPlaying = false;
  let end = false;
  let schedulerId = null;
  let addToStart;

  const loadCountIn = async () => {
    return await fetchAudio(audioSamples.Triangle.downBeats, audioCtx);
  };

  const scheduleNextClick = (clickBuffer, gainNode) => {
    const now = audioCtx.current.currentTime;
    while (startTime < now + 0.5) {
      const source = audioCtx.current.createBufferSource();
      source.buffer = clickBuffer;
      gainNode.gain.value = volumeRef.current;
      source.connect(gainNode);
      source.start(startTime);
      startTime += addToStart;
      beat++;
      if (beat === countIn * timeSignature * subdivide) {
        end = startTime;
        break;
      }
      if (stopCheck()) {
        end = -1;
        break;
      }
    }
    if (end !== false) {
      clearTimeout(schedulerId);
      return Promise.resolve(end);
    }
    return new Promise((resolve) => {
      schedulerId = setTimeout(
        () => resolve(scheduleNextClick(clickBuffer, gainNode)),
        25
      );
    });
  };

  const playCountIn = async (start) => {
    if (isPlaying) {
      return;
    }

    setIsPlaying(true);
    isPlaying = true;

    const clickBuffer = await loadCountIn(audioCtx.current);
    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);

    addToStart = 60 / (bpm * subdivide);
    startTime = startTime = start;

    return await scheduleNextClick(clickBuffer, gainNode);
  };

  return { playCountIn };
};

export default countInPlayer;
