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
  const [audioContext, setAudioContext] = useState(null);
  const [osc, setOsc] = useState(null);
  const [gain, setGain] = useState(null);
  const [beat, setBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(4);
  const [downBeat, setDownBeat] = useState(true);

  const [tone, setTone] = useState("click");
  const [downBeatTone, setDownBeatTone] = useState("click");

  const paused = useRef(false);

  // updates to new selected time signature
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [timeSignature, downBeat, tone, downBeatTone]);

  const restart = () => {
    if (isPlaying) {
      stopClick();
    }
    startClick();
  };

  const playClickAudio = () => {
    const interval = (60 / bpm) * 1000;
    let beatCount = 1;
    const id = setInterval(() => {
      if (downBeat && beatCount === 1) {
        const sound = new Audio("./audio/woodBlocks/thin-wood-block.wav");
        sound.play();
      } else {
        const sound = new Audio("./audio/woodBlocks/wood-block-drum-hit.wav");
        sound.play();
        if (beatCount === timeSignature) {
          beatCount = 0;
        }
      }
      beatCount++;
    }, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  const playClickTone = (newAudioContext, newOsc, newGain) => {
    newOsc.start();
    const interval = (60 / bpm) * 1000;
    const id = setInterval(() => {
      setBeat((prevBeat) => {
        let newBeat = prevBeat + 1;
        if (downBeat && newBeat === 1) {
          newOsc.frequency.value = 880 * 1.5; // Set the frequency for high pitch
        } else {
          if (newBeat === timeSignature) {
            newBeat = 0;
          }
          newOsc.frequency.value = 880;
        }
        return newBeat;
      });
      newGain.gain.value = 0.5;
      setTimeout(() => {
        newGain.gain.value = 0;
      }, 100);
    }, interval);
    setTimerId(id);
    setIsPlaying(true);
  };

  const startClick = () => {
    if (
      (tone === "tone-audio" && !audioContext) ||
      (tone === "tone-audio" && !osc)
    ) {
      const newAudioContext = new AudioContext();
      const newOsc = newAudioContext.createOscillator();
      const newGain = newAudioContext.createGain();
      newOsc.connect(newGain);
      newGain.connect(newAudioContext.destination);
      newOsc.frequency.value = 880; // Set the frequency to 880Hz (A5)
      newGain.gain.value = 0; // Set the initial gain to 0
      setAudioContext(newAudioContext);
      setOsc(newOsc);
      setGain(newGain);
      playClickTone(newAudioContext, newOsc, newGain);
    } else if (tone === "tone-audio") {
      playClickTone(audioContext, osc, gain);
    } else {
      playClickAudio();
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
    // setOsc(null);
    // audioContext.close().then(() => setAudioContext(null));
    // gain.disconnect();
    // setGain(null);
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
          playClick={playClickTone}
        />
        <ChangeMeter
          setTimeSignature={setTimeSignature}
          downBeat={downBeat}
          setDownBeat={setDownBeat}
        />

        <ToneSelector setTone={setTone} setDownBeatTone={setDownBeatTone} />
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
