import React, { useState, useEffect, useRef } from "react";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import { AudioContext } from "standardized-audio-context";
import "../styles/Metronome.css";

function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [osc, setOsc] = useState(null);
  const [gain, setGain] = useState(null);

  const paused = useRef(false);
  const mouseDownIntervalId = useRef(null);
  const MAX_TEMPO = 240;
  const MIN_TEMPO = 40;

  const startStop = () => {
    if (isPlaying) {
      clearInterval(timerId);
      setIsPlaying(false);
      if (audioContext) {
        audioContext.close();
      }
    } else {
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
    }
  };

  const incrementBPM = () => {
    setBpm((prevBpm) => {
      if (prevBpm === MAX_TEMPO) {
        clearInterval(mouseDownIntervalId.current);
        return prevBpm;
      } else {
        const newBpm = prevBpm + 1;
        return newBpm;
      }
    });
  };

  const decrementBPM = () => {
    setBpm((prevBpm) => {
      if (prevBpm === MIN_TEMPO) {
        clearInterval(mouseDownIntervalId.current);
        return prevBpm;
      } else {
        return prevBpm - 1;
      }
    });
  };

  const handleMouseDownUpArrow = () => {
    if (bpm < MAX_TEMPO) {
      // Stop the audio when the mouse button is held down
      if (isPlaying) {
        startStop();
        paused.current = true;
      }
      const interval = setInterval(() => {
        incrementBPM();
      }, 100);
      mouseDownIntervalId.current = interval;
    }
  };

  const handleMouseDownDownArrow = () => {
    if (bpm > MIN_TEMPO) {
      // Stop the audio when the mouse button is held down
      if (isPlaying) {
        startStop();
        paused.current = true;
      }
      const interval = setInterval(() => {
        decrementBPM();
      }, 100);
      mouseDownIntervalId.current = interval;
    }
  };

  const stopBpmChange = () => {
    if (paused.current) {
      startStop();
      paused.current = false;
    }
    clearInterval(mouseDownIntervalId.current);
  };

  const handleBpmSliderChange = (event) => {
    const newBpm = event.target.value;
    setBpm(parseInt(newBpm));
    if (isPlaying) {
      clearInterval(timerId);
      const interval = (60 / newBpm) * 1000;
      const id = setInterval(() => {
        gain.gain.value = 0.5;
        setTimeout(() => {
          gain.gain.value = 0;
        }, 100);
      }, interval);
      setTimerId(id);
    }
  };

  return (
    <div id="metronome-body">
      <h1>Metronome</h1>

      <div id="tempo">
        <label>Tempo (BPM):</label>
        <div className="flex-row">
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
          />
          <div id="tempo-arrows">
            <BiUpArrow
              onMouseDown={handleMouseDownUpArrow}
              onMouseUp={stopBpmChange}
              onMouseLeave={stopBpmChange}
            />
            <BiDownArrow
              onMouseDown={handleMouseDownDownArrow}
              onMouseUp={stopBpmChange}
              onMouseLeave={stopBpmChange}
            />
          </div>
        </div>
        <input
          type="range"
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          value={bpm}
          onChange={handleBpmSliderChange}
        />
      </div>

      <button onClick={startStop}>
        {paused.current ? "Paused" : isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}

export default Metronome;
