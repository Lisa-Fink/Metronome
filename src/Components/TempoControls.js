import React, { useRef } from "react";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";

function TempoControls({
  bpm,
  setBpm,
  isPlaying,
  startStop,
  paused,
  playClick,
}) {
  const MAX_TEMPO = 240;
  const MIN_TEMPO = 40;

  const mouseDownIntervalId = useRef(null);

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
      startStop();
      playClick();
    }
  };

  return (
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
  );
}

export default TempoControls;
