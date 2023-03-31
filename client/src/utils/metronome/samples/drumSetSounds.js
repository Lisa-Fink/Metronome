import { audioSamples } from "../../audioFiles";
import { fetchAudio } from "../../audioUtils";

const loadDrumSet = async (audioCtx) => {
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

const getBuffer = (
  buffers,
  beatCount,
  audioCtx,
  downBeat,
  mainBeat,
  subdivide,
  timeSignature
) => {
  // return a list of buffers to play at same time
  const playing = getPlaying(
    buffers,
    beatCount,
    mainBeat,
    downBeat,
    subdivide,
    timeSignature
  );

  return playing.map((drumBuffer) => {
    const source = audioCtx.current.createBufferSource();
    source.buffer = drumBuffer;
    return source;
  });
};

const getPlaying = (
  buffers,
  beatCount,
  mainBeat,
  downBeat,
  subdivide,
  timeSignature
) => {
  const [bass, hiHat, hiHatSubdivide, snare, crash, clap] = buffers;
  const playing = [];
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
  const rhythm = rhythmMap[timeSignature];
  const main = [crash, clap];
  const sub = subdivide !== false && subdivide > 1 ? subdivide : 1;
  if (sub > 1 && beatCount % sub !== 1) {
    // subdivide
    playing.push(hiHatSubdivide);
  } else {
    // beats
    const current = rhythm[(beatCount - 1) / sub];

    if (current !== undefined) {
      playing.push(current);
    }

    if (
      downBeat &&
      (beatCount === 1 || beatCount - 1 === timeSignature * sub)
    ) {
      if (beatCount === 1) {
        playing.push(main[0]);
      } else if (beatCount - 1 === timeSignature * sub) {
        playing.push(main[1]);
      }
    } else {
      if (mainBeat && sub > 1) {
        playing.push(hiHat);
      } else {
        playing.push(hiHatSubdivide);
      }
    }
  }
  return playing;
};

const drumStart = (sound, startTime, gainNode) => {
  sound.forEach((s) => {
    s.connect(gainNode);
    s.start(startTime);
  });
};

const getDrumSounds = async (audioCtx) => {
  const buffers = await loadDrumSet(audioCtx);

  return { sounds: buffers, getSound: getBuffer };
};

export default getDrumSounds;
export { drumStart };
