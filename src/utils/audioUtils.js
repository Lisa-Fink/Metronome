import { AudioContext } from "standardized-audio-context";

const createAudioUtils = (
  bpm,
  downBeat,
  setIsPlaying,
  key,
  mainBeat,
  setTimerId,
  subdivide,
  timeSignature,
  tone,
  volumeRef,
  toneCategory,
  timerId,
  countIn,
  numMeasures,
  repeat,
  tempoInc,
  sectionPractice,
  tempoPractice,
  setBpm,
  originalBpm
) => {
  // store audioContext objects to disable/disconnect later
  let audioContext,
    osc,
    gain,
    downBeatGain,
    downBeatOsc,
    mainBeatGain,
    mainBeatOsc;

  const playCountIn = async () => {
    setIsPlaying(true);
    // use triangle down beat
    const click = new Audio(audioSamples.triangle.downBeats);
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beat = 0;
    const countInPromise = new Promise((resolve) => {
      const id = setInterval(() => {
        click.currentTime = 0;
        click.play();
        beat++;
        if (beat == countIn * timeSignature * subdivide) {
          clearInterval(id);
          resolve();
        }
      }, interval);
      setTimerId(id);
    });

    await countInPromise;
  };

  const playDrumSet = () => {
    const bass = new Audio("./audio/bassDrum/solid-kick-bassdrum.wav");
    const hiHat = new Audio(audioSamples.hiHat.mainBeats);
    const hiHatSubdivide = new Audio(audioSamples.hiHat.beats);
    const snare = new Audio(audioSamples.snare.mainBeats);
    const crash = new Audio(audioSamples.hiHat.downBeats);
    const clap = new Audio(audioSamples.clap.mainBeats);
    let interval = (60 / (bpm * subdivide)) * 1000;

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

    const intervalFn = () => {
      // even number of beats
      const rhythm = rhythmMap[timeSignature];
      if (sub-- > 1) {
        if (mainBeat) {
          hiHatSubdivide.currentTime = 0;
          hiHatSubdivide.volume = volumeRef.current;
          hiHatSubdivide.play();
        } else {
          hiHat.currentTime = 0;
          hiHat.volume = volumeRef.current;
          hiHat.play();
        }
      } else {
        if (subdivide > 1) {
          sub = subdivide;
        }
        current = rhythm[idx++];
        if (current === bass) {
          bass.currentTime = 0;
        }
        if (current !== undefined) {
          current.currentTime = 0;
          current.volume = volumeRef.current;
          current.play();
        }
        hiHat.currentTime = 0;
        hiHat.volume = volumeRef.current;
        hiHat.play();
      }
      if (downBeat) {
        if (beatCount === 0) {
          main[0].currentTime = 0;
          main[0].volume = volumeRef.current;
          main[0].play();
        } else if (beatCount === timeSignature * subdivide) {
          main[1].currentTime = 0;
          main[1].volume = volumeRef.current;
          main[1].play();
        }
      }
      beatCount++;
      beat++;
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
        setBpm((prev) => {
          curBpm = curBpm + tempoInc;
          // adjust interval to new bpm
          const newInterval = (60 / (curBpm * subdivide)) * 1000;
          clearInterval(id);
          id = setInterval(intervalFn, newInterval);
          setTimerId(id);
          return prev + tempoInc;
        });
      }
    };

    let id = setInterval(intervalFn, interval);

    setTimerId(id);
    setIsPlaying(true);
  };

  const playNumberCounter = () => {
    const numberAudioFiles = {
      1: "./audio/numbers/female-vox-number-one.wav",
      2: "./audio/numbers/female-vox-number-two.wav",
      3: "./audio/numbers/female-vox-number-three.wav",
      4: "./audio/numbers/female-vox-number-four.wav",
      5: "./audio/numbers/female-vox-number-five.wav",
      6: "./audio/numbers/female-vox-number-six.wav",
      7: "./audio/numbers/female-vox-number-seven.wav",
      8: "./audio/numbers/female-vox-number-eight.wav",
      9: "./audio/numbers/female-vox-number-nine.wav",
    };
    const sounds = [];
    for (let i = 1; i <= timeSignature; i++) {
      sounds.push(new Audio(numberAudioFiles[i]));
    }
    const interval = (60 / bpm) * 1000;
    let beatCount = 1;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
      const sound = sounds[beatCount - 1];
      sound.volume = 0.25 * volumeRef.current;
      sound.currentTime = 0;
      sound.play();
      beatCount++;
      beat++;
      if (beatCount > timeSignature) {
        beatCount = 1;
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
        setBpm((prev) => {
          curBpm = curBpm + tempoInc;
          // adjust interval to new bpm
          const newInterval = (60 / (curBpm * subdivide)) * 1000;
          clearInterval(id);
          id = setInterval(intervalFn, newInterval);
          setTimerId(id);
          return prev + tempoInc;
        });
      }
    };
    let id = setInterval(intervalFn, interval);

    setTimerId(id);
    setIsPlaying(true);
  };

  const audioSamples = {
    woodBlock: {
      beats: "./audio/woodBlocks/wood-block-drum-hit.wav",
      mainBeats: "./audio/woodBlocks/wood-block-light.wav",
      downBeats: "./audio/woodBlocks/thin-wood-block.wav",
    },
    marimba: {
      beats: "./audio/marimba/marimba-hit-c3_C_major.wav",
      mainBeats: "./audio/marimba/marimba-hit-c4.wav",
      downBeats: "./audio/marimba/marimba-hit-c5.wav",
    },
    snare: {
      beats: "./audio/snare/clean-snare.wav",
      mainBeats: "./audio/snare/drum-dry-hit-snare.wav",
      downBeats: "./audio/snare/drum-percussion-rim-4_F_major.wav",
    },
    clap: {
      beats: "./audio/clap/mellow-clap.wav",
      mainBeats: "./audio/clap/808-clap-1.wav",
      downBeats: "./audio/clap/snap-fat.wav",
    },
    triangle: {
      beats: "./audio/triangle/bright-clean-triangle.wav",
      mainBeats: "./audio/triangle/percussive-hit-triangle-quick.wav",
      downBeats: "./audio/triangle/simple-thin-bell-ding.wav",
    },
    cowbell: {
      beats: "./audio/cowbell/cowbell.wav",
      mainBeats: "./audio/cowbell/cowbell-hit-dry.wav",
      downBeats: "./audio/cowbell/cowbell-hit-dry-7.wav",
    },
    hiHat: {
      beats: "./audio/cymbal/hihat/dry-open-hi-hat-fluffy.wav",
      mainBeats: "./audio/cymbal/hihat/boomin-hat-high.wav",
      downBeats: "./audio/cymbal/metro-high-crash_109bpm_F_major.wav",
    },
  };

  const getAudioFiles = () => {
    return audioSamples[tone];
  };

  const playAudio = ({ beats, mainBeats, downBeats }) => {
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let beat = 0;
    originalBpm.current = bpm;

    let curBpm = bpm;
    console.log(originalBpm.current, bpm, curBpm);

    const downBeatSound = new Audio(downBeats);
    const regularSound = new Audio(beats);
    const mainBeatSound = new Audio(mainBeats);

    const intervalFn = () => {
      const sound =
        downBeat && beatCount === 1
          ? downBeatSound
          : subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0
          ? mainBeatSound
          : regularSound;

      sound.volume = volumeRef.current;

      sound.currentTime = 0;
      sound.play();

      beatCount++;
      beat++;
      if (beatCount > timeSignature * subdivide) {
        beatCount = 1;
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
        setBpm((prev) => {
          curBpm = curBpm + tempoInc;
          // adjust interval to new bpm
          const newInterval = (60 / (curBpm * subdivide)) * 1000;
          clearInterval(id);
          id = setInterval(intervalFn, newInterval);
          setTimerId(id);
          return prev + tempoInc;
        });
      }
    };

    let id = setInterval(intervalFn, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  /**********************************************************************************/
  // Basic Tones (Beep and Flute) w/ AudioContext

  // Returns the audio context or creates a new one if it doesn't exist
  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext();
      return audioContext;
    }
    return audioContext;
  };

  const playBeep = (newOsc, newGain) => {
    newOsc.start();
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    const id = setInterval(() => {
      if (downBeat && beatCount === 1) {
        newOsc.frequency.value = key * 4; // Set the frequency for high pitch
      } else if (
        subdivide > 1 &&
        mainBeat &&
        (beatCount - 1) % subdivide === 0
      ) {
        newOsc.frequency.value = key * 3; // Set the frequency for main beat
      } else {
        if (beatCount === timeSignature * subdivide) {
          beatCount = 0;
        }
        newOsc.frequency.value = key * 2;
      }
      newGain.gain.value = volumeRef.current;
      beatCount++;

      setTimeout(() => {
        newGain.gain.value = 0;
      }, interval / 2);
    }, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  const playFlute = () => {
    osc.start();
    downBeatOsc.start();
    if (mainBeat && mainBeatOsc) {
      mainBeatOsc.start();
    }
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let current;
    const id = setInterval(() => {
      if (downBeat && beatCount === 1) {
        current = downBeatGain;
      } else if (
        subdivide > 1 &&
        mainBeat &&
        (beatCount - 1) % subdivide === 0
      ) {
        current = mainBeatGain;
      } else {
        if (beatCount === timeSignature * subdivide) {
          beatCount = 0;
        }
        current = gain;
      }
      current.gain.value = volumeRef.current;
      beatCount++;

      setTimeout(() => {
        current.gain.value = 0;
      }, 100);
    }, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  const createBeepTone = (audioContext) => {
    const newOsc = audioContext.createOscillator();
    const newGain = audioContext.createGain();
    newOsc.connect(newGain);
    newGain.connect(audioContext.destination);
    newGain.gain.value = 0; // Set the initial gain to 0

    return { newOsc, newGain };
  };

  const createFluteTone = (audioContext, frequency) => {
    const newOsc = audioContext.createOscillator();
    const newGain = audioContext.createGain();
    const convolver = audioContext.createConvolver();
    const rate = audioContext.sampleRate;
    const length = rate * 0.05; // Shorten the length to 50ms
    const buffer = audioContext.createBuffer(2, length, rate);
    const dataL = buffer.getChannelData(0);
    const dataR = buffer.getChannelData(1);

    // Generate a simple sine wave
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const x = Math.sin(2 * Math.PI * frequency * t);
      dataL[i] = dataR[i] = x;
    }

    convolver.buffer = buffer;
    newOsc.connect(newGain);
    newGain.connect(convolver);
    convolver.connect(audioContext.destination);

    newOsc.frequency.value = frequency;
    newGain.gain.value = 0; // Set the initial gain to 0

    return {
      newOsc,
      newGain,
    };
  };

  const getTone = () => {
    const audioContext = getAudioContext();
    if (tone === "audioContextFlute") {
      return [
        createFluteTone(audioContext, key),
        createFluteTone(audioContext, key * 2),
        createFluteTone(audioContext, key * 1.5),
      ];
    }
    return createBeepTone(audioContext);
  };

  /**********************************************************************************/

  const startClick = async () => {
    if (countIn > 0) {
      await playCountIn();
    }
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        const { newOsc, newGain } = getTone();
        osc = newOsc;
        gain = newGain;
        playBeep(newOsc, newGain);
      } else if (tone === "audioContextFlute") {
        const [regular, downBeat, mainBeat] = getTone();
        const { newOsc, newGain } = regular;
        downBeatOsc = downBeat.newOsc;
        downBeatGain = downBeat.newGain;
        mainBeatOsc = mainBeat.newOsc;
        mainBeatGain = mainBeat.newGain;
        osc = newOsc;
        gain = newGain;
        playFlute();
      }
    } else {
      if (audioContext) {
        audioContext.close().then(() => (audioContext = null));
      }
      if (toneCategory === "Percussion") {
        const files = getAudioFiles();
        playAudio(files);
      } else if (toneCategory === "Spoken Counts") {
        playNumberCounter();
      } else if (toneCategory === "Drum Sets") {
        playDrumSet();
      }
    }
  };

  const stopClick = () => {
    clearInterval(timerId);
    setIsPlaying(false);
    setTimerId(null);
    if (sectionPractice && tempoPractice) {
      setBpm(originalBpm.current);
    }
    if (osc) {
      osc = null;
    }
    if (gain) {
      gain.disconnect();
      gain = null;
    }
    if (downBeatOsc) {
      // downBeatOsc.stop();
      downBeatOsc = null;
    }
    if (downBeatGain) {
      downBeatGain.disconnect();
      downBeatGain = null;
    }
    if (mainBeatOsc) {
      // mainBeatOsc.stop();
      mainBeatOsc = null;
    }
    if (mainBeatGain) {
      mainBeatGain.disconnect();
      mainBeatGain = null;
    }
  };
  return { startClick, stopClick };
};

export default createAudioUtils;
