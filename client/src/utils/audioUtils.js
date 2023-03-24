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
  originalBpm,
  isStopping
) => {
  // store audioContext objects to disable/disconnect later
  let audioContext,
    osc,
    gain,
    downBeatGain,
    downBeatOsc,
    mainBeatGain,
    mainBeatOsc;

  const loadCountIn = () => {
    return new Promise((resolve) => {
      const click = new Audio(audioSamples.Triangle.downBeats);
      click.addEventListener("canplaythrough", () => resolve(click));
    });
  };

  const playCountIn = async () => {
    setIsPlaying(true);
    // use triangle down beat
    const click = await loadCountIn();

    const interval = (60 / (bpm * subdivide)) * 1000;
    let beat = 0;
    return new Promise((resolve) => {
      const id = setInterval(() => {
        click.volume = volumeRef.current;
        click.currentTime = 0;
        click.play();
        beat++;
        if (beat == countIn * timeSignature * subdivide) {
          clearInterval(id);
          setTimeout(() => {
            resolve();
          }, (60 / (bpm * subdivide)) * 1000);
        }
      }, interval);
      setTimerId(id);
    });
  };

  const playCustomRhythm = async (instrumentArr, rhythms) => {
    isStopping.current = false;
    let cur;

    const intervalFunc = async () => {
      return new Promise(async (resolve) => {
        const beats = rhythms[0].length;
        for (let beat = 0; beat < beats; beat++) {
          instrumentArr.forEach((sound, key) => {
            if (isStopping.current) {
              return;
            }
            cur = rhythms[key][beat];
            if (cur > 0) {
              sound.currentTime = 0;
              sound.volume = volumeRef.current;
              sound.play();
            } else if (cur < 0) {
              if (!sound.currentTime === 0) {
                sound.stop();
              }
            }
          });
          if (isStopping.current) {
            isStopping.current = false;
            return;
          }
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              // (12 parts per beat)
            }, (60 / (bpm * 12)) * 1000);
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

  const loadDrumSet = () => {
    return new Promise((resolve) => {
      let loaded = 0;
      const loadFn = () => {
        loaded++;
        if (loaded === 6) {
          resolve({ bass, hiHat, hiHatSubdivide, snare, crash, clap });
        }
      };

      const bass = new Audio(audioSamples["Bass Drum"].beats);
      bass.addEventListener("canplaythrough", loadFn);
      const hiHat = new Audio(audioSamples.Cymbal.mainBeats);
      hiHat.addEventListener("canplaythrough", loadFn);
      const hiHatSubdivide = new Audio(audioSamples.Cymbal.beats);
      hiHatSubdivide.addEventListener("canplaythrough", loadFn);
      const snare = new Audio(audioSamples["Snare Drum"].mainBeats);
      snare.addEventListener("canplaythrough", loadFn);
      const crash = new Audio(audioSamples.Cymbal.downBeats);
      crash.addEventListener("canplaythrough", loadFn);
      const clap = new Audio(audioSamples.Clap.mainBeats);
      clap.addEventListener("canplaythrough", loadFn);
    });
  };

  const playDrumSet = async () => {
    const { bass, hiHat, hiHatSubdivide, snare, crash, clap } =
      await loadDrumSet();

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
    intervalFn();
    let id = setInterval(intervalFn, interval);

    setTimerId(id);
    setIsPlaying(true);
  };

  const loadNumberCounterAudio = () => {
    return new Promise((resolve) => {
      // old doesn't subdivide
      // const numberAudioFiles2 = {
      //   1: "./audio/numbers/female-vox-number-one.wav",
      //   2: "./audio/numbers/female-vox-number-two.wav",
      //   3: "./audio/numbers/female-vox-number-three.wav",
      //   4: "./audio/numbers/female-vox-number-four.wav",
      //   5: "./audio/numbers/female-vox-number-five.wav",
      //   6: "./audio/numbers/female-vox-number-six.wav",
      //   7: "./audio/numbers/female-vox-number-seven.wav",
      //   8: "./audio/numbers/female-vox-number-eight.wav",
      //   9: "./audio/numbers/female-vox-number-nine.wav",
      // };
      const sounds = [];
      let loaded = 0;
      let totalToLoad = timeSignature;
      if (subdivide > 1) {
        if (subdivide === 2) {
          totalToLoad += 1;
        } else if (subdivide === 3) {
          totalToLoad += 2;
        } else if (subdivide === 4) {
          totalToLoad += 3;
        } else if (subdivide === 5) {
          totalToLoad += 1;
        } else if (subdivide === 6) {
          totalToLoad += 2;
        } else if (subdivide === 7) {
          totalToLoad += 1;
        } else if (subdivide === 8) {
          totalToLoad += 4;
        }
      }
      const audioLoad = () => {
        loaded++;
        if (loaded == totalToLoad) resolve(sounds);
      };

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
      };

      // creates subdivide audio objects if needed
      if (
        subdivide === 2 ||
        subdivide === 3 ||
        subdivide === 4 ||
        subdivide === 6 ||
        subdivide === 8
      ) {
        const audio = new Audio("./audio/numbers/spoken/and.mp3");
        audio.addEventListener("canplaythrough", audioLoad);
        numberAudioFiles.and = audio;
      }
      if (subdivide === 3 || subdivide === 4 || subdivide === 8) {
        numberAudioFiles.a = new Audio("./audio/numbers/spoken/a.mp3");
        numberAudioFiles.a.addEventListener("canplaythrough", audioLoad);
      }
      if (subdivide === 4 || subdivide === 8) {
        numberAudioFiles.e = new Audio("./audio/numbers/spoken/e.mp3");
        numberAudioFiles.e.addEventListener("canplaythrough", audioLoad);
      }
      if (
        subdivide === 5 ||
        subdivide === 6 ||
        subdivide === 7 ||
        subdivide === 8
      ) {
        numberAudioFiles.ta = new Audio("./audio/numbers/spoken/ta.mp3");
        numberAudioFiles.ta.addEventListener("canplaythrough", audioLoad);
      }

      // adds the main beat counts followed by subdivide if needed

      for (let i = 1; i <= timeSignature; i++) {
        const audio = new Audio(numberAudioFiles[i]);
        sounds.push(audio);
        audio.addEventListener("canplaythrough", audioLoad);
        if (subdivide === 2) {
          sounds.push(numberAudioFiles.and);
        } else if (subdivide === 3) {
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.a);
        } else if (subdivide === 4) {
          sounds.push(numberAudioFiles.e);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.a);
        } else if (subdivide === 5) {
          for (let i = 0; i < 4; i++) {
            sounds.push(numberAudioFiles.ta);
          }
        } else if (subdivide === 6) {
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.ta);
        } else if (subdivide === 7) {
          for (let i = 0; i < 6; i++) {
            sounds.push(numberAudioFiles.ta);
          }
        } else if (subdivide === 8) {
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.e);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.and);
          sounds.push(numberAudioFiles.ta);
          sounds.push(numberAudioFiles.a);
          sounds.push(numberAudioFiles.ta);
        }
      }
    });
  };

  const playNumberCounter = async () => {
    const sounds = await loadNumberCounterAudio();

    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 0;
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
      const sound = sounds[beatCount];
      sound.volume = volumeRef.current;
      sound.currentTime = 0;
      sound.play();
      beatCount++;
      beat++;
      if (beatCount === timeSignature * subdivide) {
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
    intervalFn();
    let id = setInterval(intervalFn, interval);

    setTimerId(id);
    setIsPlaying(true);
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

  const playSample = (name, idx, volume) => {
    const sample = new Audio(audioSamples[name][idxToBeat[idx]]);
    sample.volume = volume;
    sample.play();
  };

  const getAudioFiles = () => {
    return audioSamples[tone];
  };

  const loadAudioFiles = (beats, mainBeats, downBeats) => {
    return new Promise((resolve) => {
      let loaded = 0;
      const onAudioLoad = () => {
        loaded++;
        if (loaded === 3)
          resolve({ downBeatSound, regularSound, mainBeatSound });
      };
      const downBeatSound = new Audio(downBeats);
      downBeatSound.addEventListener("canplaythrough", onAudioLoad);
      const regularSound = new Audio(beats);
      regularSound.addEventListener("canplaythrough", onAudioLoad);
      const mainBeatSound = new Audio(mainBeats);
      mainBeatSound.addEventListener("canplaythrough", onAudioLoad);
    });
  };

  const playAudio = async ({ beats, mainBeats, downBeats }) => {
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;
    let beat = 0;
    originalBpm.current = bpm;

    let curBpm = bpm;

    const { downBeatSound, regularSound, mainBeatSound } = await loadAudioFiles(
      beats,
      mainBeats,
      downBeats
    );

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
    intervalFn();
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
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
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
      beat++;
      setTimeout(() => {
        newGain.gain.value = 0;
      }, interval / 2);

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
    intervalFn();
    let id = setInterval(intervalFn, interval);
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
    let beat = 0;
    let curBpm = bpm;
    originalBpm.current = bpm;

    const intervalFn = () => {
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
      beat++;
      setTimeout(() => {
        current.gain.value = 0;
      }, 100);
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
    intervalFn();
    let id = setInterval(intervalFn, interval);
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

  const startDrumMachine = (instruments, rhythms) => {
    if (timerId) {
      clearInterval(timerId);
    }
    const instData = [];
    let loaded = 0;
    const instrumentsToPlay = instruments.filter((instrument) => instrument[0]);
    let numToLoad = instrumentsToPlay.length;

    instrumentsToPlay.forEach((instrument, i) => {
      const audio = new Audio(
        audioSamples[instrument[0]][idxToBeat[instrument[2]]]
      );
      audio.addEventListener("canplaythrough", () => {
        loaded++;
        if (numToLoad == loaded) {
          playCustomRhythm(instData, rhythms);
        }
      });
      instData.push(audio);
    });
  };

  const stopDrumMachine = () => {
    isStopping.current = true;
    setIsPlaying(false);
    return new Promise((resolve) => {
      const checkIsStopping = () => {
        if (!isStopping.current) {
          resolve();
        } else {
          setTimeout(checkIsStopping, 10); // check again in 10 milliseconds
        }
      };
      checkIsStopping();
    });
  };

  const stopClick = () => {
    clearInterval(timerId);
    setIsPlaying(false);
    setTimerId(null);

    isStopping.current = true;

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
  return {
    startClick,
    stopClick,
    playSample,
    getInstrumentList,
    startDrumMachine,
    stopDrumMachine,
  };
};

export default createAudioUtils;
