import { audioSamples, idxToBeat } from "./audioFiles";
import { fetchAudio } from "./audioUtils";

const createDrumMachineUtils = (
  setIsPlaying,
  volumeRef,
  timerId,
  isStopping,
  setIsStopped,
  playingSources,
  audioCtx
) => {
  const playCustomRhythm = async (instruments, rhythms, curBpm) => {
    const buffers = await loadInstruments(instruments);
    isStopping.current = false;
    const interval = (60 / (curBpm * 12)) * 1000; // (12 parts per beat)
    let startTime = audioCtx.current.currentTime;
    let cur;

    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);

    const intervalFunc = async () => {
      return new Promise(async (resolve) => {
        const beats = rhythms[0].length;
        for (let beat = 0; beat < beats; beat++) {
          buffers.forEach((drumBuffer, key) => {
            if (isStopping.current) {
              return;
            }
            cur = rhythms[key][beat];
            if (cur > 0) {
              const source = audioCtx.current.createBufferSource();
              source.buffer = drumBuffer;

              source.connect(gainNode);
              source.start(startTime);
              playingSources.push([
                source,
                startTime,
                gainNode,
                drumBuffer.duration,
              ]);
            }
          });
          if (isStopping.current) {
            isStopping.current = false;
            setIsStopped(true);
            return;
          }
          gainNode.gain.value = volumeRef.current;
          startTime += interval / 1000;

          // Disconnect finished audio sources
          while (playingSources.length) {
            const [source, startTime, gainNode, dur] = playingSources[0];
            if (startTime + dur < audioCtx.current.currentTime) {
              source.disconnect(gainNode);
              // gainNode.disconnect(audioCtx.current.destination);
              playingSources.shift();
            } else {
              break;
            }
          }

          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, interval);
          });
        }
        resolve();
      });
    };
    setIsPlaying(true);
    while (!isStopping.current) {
      await intervalFunc();
    }
  };

  const playSample = (name, idx, volume) => {
    const sample = new Audio(audioSamples[name][idxToBeat[idx]]);
    sample.volume = volume;
    sample.play();
  };

  const startDrumMachine = async (instruments, rhythms, curBpm) => {
    if (timerId) {
      clearInterval(timerId);
    }
    // remove any instruments that don't have rhythms added
    const instrumentsToPlay = instruments.filter(
      (instrument) =>
        instrument[0] !== null &&
        instrument[0] !== undefined &&
        instrument[1] !== null &&
        instrument[1] !== undefined &&
        instrument[2] !== null &&
        instrument[2] !== undefined
    );
    if (instrumentsToPlay.length === 0) return;

    // check if there are rhythm's added
    let isRhythm = false;
    for (let i = 0; i < instruments.length; i++) {
      if (!instruments[i][0]) continue;
      const checkRhythms = rhythms[i].filter((x) => x === 1).length;
      if (checkRhythms > 0) {
        isRhythm = true;
        break;
      }
    }
    if (!isRhythm) return;
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    playCustomRhythm(instrumentsToPlay, rhythms, curBpm);
  };

  const loadInstruments = async (instruments) => {
    return await Promise.all(
      instruments.map((instrument) =>
        fetchAudio(
          audioSamples[instrument[0]][idxToBeat[instrument[2]]],
          audioCtx
        )
      )
    );
  };

  const stopDrumMachine = () => {
    isStopping.current = true;
    setIsPlaying(false);
  };
  return { startDrumMachine, stopDrumMachine, playSample };
};

export default createDrumMachineUtils;
