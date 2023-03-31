import { numberAudioFiles } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

// Loads all of the sounds as buffers, and returns an array in the order they will be called
const loadNumberCounterAudio = async (audioCtx, timeSignature, subdivide) => {
  const buffers = {};
  const fetches = [];

  // get all buffers for main beats
  // put the fetch into fetches arr, which resolves into buffers object
  for (let i = 1; i <= timeSignature; i++) {
    fetches.push(
      fetchAudio(numberAudioFiles[i], audioCtx).then(
        (buffer) => (buffers[i] = buffer)
      )
    );
  }

  // add subdivision needed
  if (
    subdivide === 2 ||
    subdivide === 3 ||
    subdivide === 4 ||
    subdivide === 6 ||
    subdivide === 8
  ) {
    fetches.push(
      fetchAudio(numberAudioFiles["and"], audioCtx).then(
        (buffer) => (buffers["and"] = buffer)
      )
    );
  }
  if (subdivide === 3 || subdivide === 4 || subdivide === 8) {
    fetches.push(
      fetchAudio(numberAudioFiles["a"], audioCtx).then(
        (buffer) => (buffers["a"] = buffer)
      )
    );
  }
  if (subdivide === 4 || subdivide === 8) {
    fetches.push(
      fetchAudio(numberAudioFiles["e"], audioCtx).then(
        (buffer) => (buffers["e"] = buffer)
      )
    );
  }
  if (
    subdivide === 5 ||
    subdivide === 6 ||
    subdivide === 7 ||
    subdivide === 8
  ) {
    fetches.push(
      fetchAudio(numberAudioFiles["ta"], audioCtx).then(
        (buffer) => (buffers["ta"] = buffer)
      )
    );
  }

  await Promise.all(fetches);

  const bufferArr = [];
  // create in order array
  for (let i = 1; i <= timeSignature; i++) {
    bufferArr.push(buffers[i]);
    if (subdivide === 2) {
      bufferArr.push(buffers["and"]);
    } else if (subdivide === 3) {
      bufferArr.push(buffers["and"]);
      bufferArr.push(buffers["a"]);
    } else if (subdivide === 4) {
      bufferArr.push(buffers["e"]);
      bufferArr.push(buffers["and"]);
      bufferArr.push(buffers["a"]);
    } else if (subdivide === 5 || subdivide === 7) {
      for (let j = 0; j < subdivide; j++) {
        bufferArr.push(buffers["ta"]);
      }
    } else if (subdivide === 6) {
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["and"]);
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["ta"]);
    } else if (subdivide === 8) {
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["e"]);
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["and"]);
      bufferArr.push(buffers["ta"]);
      bufferArr.push(buffers["a"]);
      bufferArr.push(buffers["ta"]);
    }
  }
  return bufferArr;
};

const getBuffer = (buffers, beatCount, audioCtx) => {
  const source = audioCtx.current.createBufferSource();
  source.buffer = buffers[beatCount - 1];
  return source;
};

const getNumberSounds = async (audioCtx, timeSignature, subdivide) => {
  const buffers = await loadNumberCounterAudio(
    audioCtx,
    timeSignature,
    subdivide
  );

  return { sounds: buffers, getSound: getBuffer };
};

export default getNumberSounds;
