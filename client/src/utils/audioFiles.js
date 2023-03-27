const numberAudioFiles = {
  1: "./audio/numbers/spoken/1.mp3",
  2: "./audio/numbers/spoken/2.mp3",
  3: "./audio/numbers/spoken/3.mp3",
  4: "./audio/numbers/spoken/4.mp3",
  5: "./audio/numbers/spoken/5.mp3",
  6: "./audio/numbers/spoken/6.mp3",
  7: "./audio/numbers/spoken/7.mp3",
  8: "./audio/numbers/spoken/8.mp3",
  9: "./audio/numbers/spoken/9.mp3",
  e: "./audio/numbers/spoken/e.mp3",
  and: "./audio/numbers/spoken/and.mp3",
  a: "./audio/numbers/spoken/a.mp3",
  ta: "./audio/numbers/spoken/ta.mp3",
};

const audioSamples = {
  "Wood Block": {
    beats: "./audio/woodBlocks/wood-block-drum-hit.wav",
    mainBeats: "./audio/woodBlocks/wood-block-light.wav",
    downBeats: "./audio/woodBlocks/thin-wood-block.wav",
    descriptions: ["Drum Hit", "Light", "Thin"],
  },
  Marimba: {
    beats: "./audio/marimba/marimba-hit-c3_C_major.wav",
    mainBeats: "./audio/marimba/marimba-hit-c4.wav",
    downBeats: "./audio/marimba/marimba-hit-c5.wav",
    descriptions: ["Lowest C3", "Middle C4", "Highest C5"],
  },
  "Snare Drum": {
    beats: "./audio/snare/clean-snare.wav",
    mainBeats: "./audio/snare/drum-dry-hit-snare.wav",
    downBeats: "./audio/snare/drum-percussion-rim-4_F_major.wav",
    descriptions: ["Clean", "Dry Hit", "Rim"],
  },
  Clap: {
    beats: "./audio/clap/mellow-clap.wav",
    mainBeats: "./audio/clap/808-clap-1.wav",
    downBeats: "./audio/clap/snap-fat.wav",
    descriptions: ["Mellow", "Mid", "Fat"],
  },
  Triangle: {
    beats: "./audio/triangle/bright-clean-triangle.wav",
    mainBeats: "./audio/triangle/percussive-hit-triangle-quick.wav",
    downBeats: "./audio/triangle/simple-thin-bell-ding.wav",
    descriptions: ["Bright Clean", "Percussive", "Thin Ding"],
  },
  Cowbell: {
    beats: "./audio/cowbell/cowbell.wav",
    mainBeats: "./audio/cowbell/cowbell-hit-dry.wav",
    downBeats: "./audio/cowbell/cowbell-hit-dry-7.wav",
    descriptions: ["Plain", "Hit Dry", "Hit Dry 2"],
  },
  Cymbal: {
    beats: "./audio/cymbal/hihat/dry-open-hi-hat-fluffy.wav",
    mainBeats: "./audio/cymbal/hihat/boomin-hat-high.wav",
    downBeats: "./audio/cymbal/metro-high-crash_109bpm_F_major.wav",
    descriptions: ["Open Hi Hat", "Closed Hi Hat", "Crash"],
  },
  "Bass Drum": {
    beats: "./audio/bassDrum/solid-kick-bassdrum.wav",
    mainBeats: "./audio/bassDrum/solid-kick-bassdrum.wav",
    downBeats: "./audio/bassDrum/solid-kick-bassdrum.wav",
    descriptions: ["Solid Kick"],
  },
};

const getDescriptiveInstrumentList = () => {
  // create new object
  const audio = [];
  for (const inst in audioSamples) {
    const instArr = [];
    instArr.push(inst);
    instArr.push([...audioSamples[inst].descriptions]);
    audio.push(instArr);
  }
  return audio;
};

const getInstrumentList = (description) => {
  if (description) {
    return getDescriptiveInstrumentList();
  }
  const instArr = [];
  for (const inst in audioSamples) {
    instArr.push(inst);
  }
  return instArr;
};

const idxToBeat = { 0: "beats", 1: "mainBeats", 2: "downBeats" };

const getAudioFiles = (tone) => {
  return audioSamples[tone];
};

export {
  idxToBeat,
  getInstrumentList,
  getDescriptiveInstrumentList,
  audioSamples,
  numberAudioFiles,
  getAudioFiles,
};
