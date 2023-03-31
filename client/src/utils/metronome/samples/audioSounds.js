import { getAudioFiles } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const loadAudioFiles = async (audioCtx, tone) => {
  const { beats, mainBeats, downBeats } = getAudioFiles(tone);
  const [downBeatBuffer, regularBuffer, mainBeatBuffer] = await Promise.all([
    fetchAudio(downBeats, audioCtx),
    fetchAudio(beats, audioCtx),
    fetchAudio(mainBeats, audioCtx),
  ]);
  return { downBeatBuffer, regularBuffer, mainBeatBuffer };
};

const getSound = (
  { downBeatBuffer, regularBuffer, mainBeatBuffer },
  beatCount,
  audioCtx,
  downBeat,
  mainBeat,
  subdivide
) => {
  const source = audioCtx.current.createBufferSource();
  if (downBeat && beatCount === 1) {
    source.buffer = downBeatBuffer;
  } else if (subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0) {
    source.buffer = mainBeatBuffer;
  } else {
    source.buffer = regularBuffer;
  }
  return source;
};

const getAudioSounds = async (tone, audioCtx) => {
  const sounds = await loadAudioFiles(audioCtx, tone);
  return { sounds, getSound };
};

export default getAudioSounds;
