import React, { useState, useEffect, useRef } from "react";
import { AudioContext } from "standardized-audio-context";
import "../styles/Metronome.css";
import ChangeMeter from "./ChangeMeter";
import TempoControls from "./TempoControls";
import ToneSelector from "./ToneSelector";

import { IoPlayOutline, IoPauseOutline, IoStopOutline } from "react-icons/io5";

function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerId, setTimerId] = useState(null);

  // store audioContext objects to disable/disconnect later
  const [audioContext, setAudioContext] = useState(null);
  const [osc, setOsc] = useState(null);
  const [gain, setGain] = useState(null);
  const [downBeatOsc, setDownBeatOsc] = useState(null);
  const [downBeatGain, setDownBeatGain] = useState(null);
  const [mainBeatOsc, setMainBeatOsc] = useState(null);
  const [mainBeatGain, setMainBeatGain] = useState(null);

  const [timeSignature, setTimeSignature] = useState(4);
  const [downBeat, setDownBeat] = useState(true);
  const [subdivide, setSubdivide] = useState(1);
  const [mainBeat, setMainBeat] = useState(false);

  const [key, setKey] = useState(261.63);
  const [tone, setTone] = useState("audioContextTone");
  const [downBeatTone, setDownBeatTone] = useState("audioContextTone");

  const paused = useRef(false);
  const [toneCategory, setToneCategory] = useState("Basic Tones");

  // updates to new selected time signature
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [timeSignature, downBeat, tone, downBeatTone, key, subdivide, mainBeat]);

  const restart = () => {
    if (isPlaying) {
      clearInterval(timerId);
      setIsPlaying(false);
      setTimerId(null);
    }
    startClick();
  };

  const playNumberCounter = () => {
    console.log("numbers");
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
    const id = setInterval(() => {
      const sound = sounds[beatCount - 1];
      sound.currentTime = 0;
      sound.play();
      beatCount++;
      if (beatCount > timeSignature) {
        beatCount = 1;
      }
    }, interval);

    setTimerId(id);
    setIsPlaying(true);
  };

  const playAudio = () => {
    const interval = (60 / (bpm * subdivide)) * 1000;
    let beatCount = 1;

    const downBeatSound = new Audio("./audio/woodBlocks/thin-wood-block.wav");
    const regularSound = new Audio(
      "./audio/woodBlocks/wood-block-drum-hit.wav"
    );
    const mainBeatSound = new Audio("./audio/woodBlocks/wood-block-light.wav");

    const id = setInterval(() => {
      const sound =
        downBeat && beatCount === 1
          ? downBeatSound
          : subdivide > 1 && mainBeat && (beatCount - 1) % subdivide === 0
          ? mainBeatSound
          : regularSound;
      sound.currentTime = 0;
      sound.play();

      beatCount++;
      if (beatCount > timeSignature * subdivide) {
        beatCount = 1;
      }
    }, interval);

    setTimerId(id);
    setIsPlaying(true);
  };

  /**********************************************************************************/
  // Basic Tones (Beep and Flute) w/ AudioContext

  // Returns the audio context or creates a new one if it doesn't exist
  const getAudioContext = () => {
    if (!audioContext) {
      const newAudioContext = new AudioContext();
      setAudioContext(newAudioContext);
      return newAudioContext;
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
      newGain.gain.value = 0.5;
      beatCount++;

      setTimeout(() => {
        newGain.gain.value = 0;
      }, interval / 2);
    }, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  const playFlute = (
    newOsc,
    newGain,
    downBeatOsc,
    downBeatGain,
    mainBeatOsc,
    mainBeatGain
  ) => {
    newOsc.start();
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
        current = newGain;
      }
      current.gain.value = 0.5;
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

  const startClick = () => {
    if (toneCategory === "Basic Tones") {
      if (tone === "audioContextTone") {
        const { newOsc, newGain } = getTone();
        setOsc(newOsc);
        setGain(newGain);
        playBeep(newOsc, newGain);
      } else if (tone === "audioContextFlute") {
        const [regular, downBeat, mainBeat] = getTone();
        const { newOsc, newGain } = regular;
        const downBeatOsc = downBeat.newOsc;
        const downBeatGain = downBeat.newGain;
        const mainBeatOsc = mainBeat.newOsc;
        const mainBeatGain = mainBeat.newGain;
        setOsc(newOsc);
        setGain(newGain);
        setDownBeatOsc(downBeatOsc);
        setDownBeatGain(downBeatGain);
        setMainBeatOsc(mainBeatOsc);
        setMainBeatGain(mainBeatGain);
        playFlute(
          newOsc,
          newGain,
          downBeatOsc,
          downBeatGain,
          mainBeatOsc,
          mainBeatGain
        );
      }
    } else {
      if (audioContext) {
        audioContext.close().then(() => setAudioContext(null));
      }
      if (toneCategory === "Percussion") {
        playAudio();
      } else if (toneCategory === "Spoken Counts") {
        playNumberCounter();
      }
    }
  };

  const startStop = () => {
    if (isPlaying) {
      // stopping
      stopClick();
    } else {
      startClick();
    }
  };

  const stopClick = () => {
    clearInterval(timerId);
    setIsPlaying(false);
    setTimerId(null);
    if (osc) {
      // osc.stop();
      setOsc(null);
    }
    if (gain) {
      gain.disconnect();
      setGain(null);
    }
    if (downBeatOsc) {
      // downBeatOsc.stop();
      setDownBeatOsc(null);
    }
    if (downBeatGain) {
      downBeatGain.disconnect();
      setDownBeatGain(null);
    }
    if (mainBeatOsc) {
      // mainBeatOsc.stop();
      setMainBeatOsc(null);
    }
    if (mainBeatGain) {
      mainBeatGain.disconnect();
      setMainBeatGain(null);
    }
  };

  return (
    <div id="metronome-body">
      <h1>Metronome</h1>
      <div>
        <TempoControls
          bpm={bpm}
          setBpm={setBpm}
          isPlaying={isPlaying}
          startStop={startStop}
          paused={paused}
          playClick={playBeep}
        />
        <ChangeMeter
          setTimeSignature={setTimeSignature}
          downBeat={downBeat}
          setDownBeat={setDownBeat}
          subdivide={subdivide}
          setSubdivide={setSubdivide}
          mainBeat={mainBeat}
          setMainBeat={setMainBeat}
          toneCategory={toneCategory}
        />

        <ToneSelector
          setTone={setTone}
          setDownBeatTone={setDownBeatTone}
          toneCategory={toneCategory}
          setToneCategory={setToneCategory}
          setKey={setKey}
        />
      </div>

      <button id="metronome-btn" onClick={startStop}>
        {paused.current ? "Paused " : isPlaying ? "Stop " : "Play "}

        {paused.current ? (
          <IoPauseOutline />
        ) : isPlaying ? (
          <IoStopOutline />
        ) : (
          <IoPlayOutline />
        )}
      </button>
    </div>
  );
}

export default Metronome;
