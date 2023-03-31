import React, { useRef, useContext } from "react";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import { AppContext } from "../contexts/AppContext";

function TempoControls({ start }) {
  const { bpm, setBpm, isPlaying, paused, setPaused, audioCtx } =
    useContext(AppContext);

  const MAX_BPM = 240;
  const MIN_BPM = 40;

  const mouseDownIntervalId = useRef(null);

  const quickStop = () => {
    audioCtx.current.close();
    audioCtx.current = undefined;
    setPaused(true);
  };

  const incrementBPM = () => {
    setBpm((prevBpm) => {
      if (prevBpm === MAX_BPM) {
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
      if (prevBpm === MIN_BPM) {
        clearInterval(mouseDownIntervalId.current);
        return prevBpm;
      } else {
        return prevBpm - 1;
      }
    });
  };

  const handleMouseDownUpArrow = () => {
    if (bpm < MAX_BPM) {
      // Stop the audio when the mouse button is held down
      if (isPlaying && !paused) {
        quickStop();
      }
      const interval = setInterval(() => {
        incrementBPM();
      }, 100);
      mouseDownIntervalId.current = interval;
    }
  };

  const handleMouseDownDownArrow = () => {
    if (bpm > MIN_BPM) {
      // Stop the audio when the mouse button is held down
      if (isPlaying && !paused) {
        quickStop();
      }
      const interval = setInterval(() => {
        decrementBPM();
      }, 100);
      mouseDownIntervalId.current = interval;
    }
  };

  const stopBpmChange = () => {
    if (paused) {
      start();
      setPaused(false);
    }
    clearInterval(mouseDownIntervalId.current);
  };

  const handleBpmSliderChange = (event) => {
    const newBpm = event.target.value;
    setBpm(parseInt(newBpm));
    if (isPlaying && !paused) {
      quickStop();
    }
  };

  const handleBpmChange = (e) => {
    setBpm(e.target.value);
  };
  return (
    <div id="tempo">
      <label>
        <h3>Tempo (BPM):</h3>

        <div className="flex-row">
          <input
            disabled
            id="tempo-input"
            type="number"
            value={bpm}
            onChange={handleBpmChange}
            onBlur={(e) => {
              if (e.target.value < MIN_BPM) {
                setBpm(MIN_BPM);
              } else if (e.target.value > MAX_BPM) {
                setBpm(MAX_BPM);
              }
            }}
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
          id="tempo-slider"
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={handleBpmSliderChange}
          onMouseUp={() => {
            if (paused) {
              start();
              setPaused(false);
            }
          }}
        />
      </label>
    </div>
  );
}

export default TempoControls;
