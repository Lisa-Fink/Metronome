import React, { useState, useEffect, useRef } from "react";
import { AudioContext } from "standardized-audio-context";
import "../styles/Metronome.css";
import TempoControls from "./TempoControls";

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

  const paused = useRef(false);

  const playClick = () => {
    const newAudioContext = new AudioContext();
    const newOsc = newAudioContext.createOscillator();
    const newGain = newAudioContext.createGain();
    newOsc.connect(newGain);
    newGain.connect(newAudioContext.destination);
    newOsc.frequency.value = 880; // Set the frequency to 880Hz (A5)
    newGain.gain.value = 0; // Set the initial gain to 0
    newOsc.start();
    const interval = (60 / bpm) * 1000;
    const id = setInterval(() => {
      setBeat((prevBeat) => {
        let newBeat = prevBeat + 1;
        if (downBeat && newBeat == 1) {
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
    setAudioContext(newAudioContext);
    setOsc(newOsc);
    setGain(newGain);
  };

  const startStop = () => {
    if (isPlaying) {
      // stopping
      clearInterval(timerId);
      setIsPlaying(false);
      setBeat(0);
      if (audioContext) {
        audioContext.close();
      }
    } else {
      playClick();
    }
  };

  return (
    <div id="metronome-body">
      <h1>Metronome</h1>

      <TempoControls
        bpm={bpm}
        setBpm={setBpm}
        isPlaying={isPlaying}
        startStop={startStop}
        paused={paused}
        playClick={playClick}
      />

      <button onClick={startStop}>
        {paused.current ? "Paused" : isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export default Metronome;
