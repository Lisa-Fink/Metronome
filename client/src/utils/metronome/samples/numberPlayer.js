import { numberAudioFiles } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const numberPlayer = ({
  bpm,
  originalBpm,
  sectionPractice,
  numMeasures,
  timeSignature,
  subdivide,
  repeat,
  tempoInc,
  setIsPlaying,
  volumeRef,
  setTimerId,
  tempoPractice,
  setBpm,
  playingSources,
  audioCtx,
}) => {
  // Loads all of the sounds as buffers, and returns an array in the order they will be called
  const loadNumberCounterAudio = async () => {
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

  const playNumberCounter = async (start) => {
    const sounds = await loadNumberCounterAudio(audioCtx.current);

    let interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 0;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;
    let startTime = start ? start : audioCtx.current.currentTime;

    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);

    const intervalFn = () => {
      const source = audioCtx.current.createBufferSource();
      source.buffer = sounds[beatCount];
      gainNode.gain.value = volumeRef.current;
      source.connect(gainNode);
      source.start(startTime);
      playingSources.push([
        source,
        startTime,
        gainNode,
        sounds[beatCount].duration,
      ]);
      startTime += interval / 1000;

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
      if (beatCount === sounds.length) {
        beatCount = 0;
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
        curBpm = curBpm + tempoInc;
        // adjust interval to new bpm
        const newInterval = (60 / (curBpm * subdivide)) * 1000;
        interval = newInterval;
        setBpm((prev) => {
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
  return { playNumberCounter };
};
export default numberPlayer;
