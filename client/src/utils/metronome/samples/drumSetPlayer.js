import { audioSamples } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const drumSetPlayer = ({
  bpm,
  subdivide,
  originalBpm,
  mainBeat,
  timeSignature,
  volumeRef,
  tempoPractice,
  sectionPractice,
  tempoInc,
  downBeat,
  numMeasures,
  repeat,
  setIsPlaying,
  setBpm,
  playingSources,
  audioCtx,
  stopCheck,
  stopSection,
}) => {
  const loadDrumSet = async () => {
    const bass = audioSamples["Bass Drum"].beats;
    const hiHat = audioSamples.Cymbal.mainBeats;
    const hiHatSubdivide = audioSamples.Cymbal.beats;
    const snare = audioSamples["Snare Drum"].mainBeats;
    const crash = audioSamples.Cymbal.downBeats;
    const clap = audioSamples.Clap.mainBeats;

    const instruments = [bass, hiHat, hiHatSubdivide, snare, crash, clap];
    return await Promise.all(
      instruments.map((instrument) => fetchAudio(instrument, audioCtx))
    );
  };

  const playDrumSet = async (start) => {
    const [bass, hiHat, hiHatSubdivide, snare, crash, clap] =
      await loadDrumSet();

    const main = [crash, clap];

    let beatCount = 0;
    let idx = 0;
    let sub = 0;

    const twoFour = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      bass,
      snare,
      undefined,
    ];

    const three = [bass, snare, snare, bass, snare, undefined];
    const five = [
      bass,
      undefined,
      snare,
      bass,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
    ];
    const six = [
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
      undefined,
    ];
    const seven = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
    ];

    const nine = [
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
    ];

    const rhythmMap = {
      2: twoFour,
      3: three,
      4: twoFour,
      5: five,
      6: six,
      7: seven,
      9: nine,
    };
    let current;
    let beat = 0;
    originalBpm.current = bpm;
    let curBpm = bpm;
    let addToStart = 60 / (bpm * subdivide);
    let interval = addToStart * 1000;
    let startTime = start;

    const gainNode = audioCtx.current.createGain();
    gainNode.connect(audioCtx.current.destination);
    const rhythm = rhythmMap[timeSignature];

    const play = (rhythm) => {
      if (stopCheck()) return;
      const playing = [];

      if (sub-- > 1) {
        if (mainBeat) {
          playing.push(hiHatSubdivide);
        } else {
          playing.push(hiHat);
        }
      } else {
        if (subdivide > 1) {
          sub = subdivide;
        }
        current = rhythm[idx++];

        if (current !== undefined) {
          playing.push(current);
        }
        playing.push(hiHat);
      }
      if (downBeat) {
        if (beatCount === 0) {
          playing.push(main[0]);
        } else if (beatCount === timeSignature * subdivide) {
          playing.push(main[1]);
        }
      }
      playing.forEach((drumBuffer) => {
        const source = audioCtx.current.createBufferSource();
        source.connect(gainNode);
        source.buffer = drumBuffer;
        gainNode.gain.value = volumeRef.current;
        source.connect(gainNode);
        source.start(startTime);
        playingSources.push([source, startTime, gainNode, drumBuffer.duration]);
      });

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
      if (beatCount === timeSignature * subdivide * 2) {
        beatCount = 0;
        idx = 0;
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
        setTimeout(() => play(rhythm), interval);
      }
    };
    play(rhythm);
    setIsPlaying(true);
  };

  return { playDrumSet };
};
export default drumSetPlayer;
