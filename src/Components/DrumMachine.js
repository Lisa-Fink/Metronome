import React, { useContext, useEffect, useState } from "react";
import TempoControls from "./TempoControls";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";
import "../styles/DrumMachine.css";

function DrumMachine() {
  const {
    setBpm,
    bpmRef,
    isPlaying,
    setIsPlaying,
    isStopping,
    timerId,
    setTimerId,
    startClick,
    stopClick,
  } = useContext(AppContext);

  //   When a state change needs to make the drum machine restart if it's playing
  //   useEffect(() => {
  //     if (isPlaying) {
  //       restart();
  //     }
  //   }, []);

  const [rhythm, setRhythm] = useState(1);
  const [measures, setMeasures] = useState(1);
  const [timeSig, setTimeSig] = useState(4);

  const restart = () => {
    if (isPlaying) {
      isStopping.current = true;
      clearInterval(timerId);

      setIsPlaying(false);
      setTimerId(null);
      setBpm(bpmRef.current);
    }
    startClick();
  };

  const startStop = () => {
    if (isPlaying) {
      // stopping
      stopClick();
    } else {
      startClick("drum machine");
    }
  };

  const handleRhythmClick = (num) => {
    setRhythm(num);
  };

  const handleMeasureChange = (e) => {
    setMeasures(parseInt(e.target.value));
  };

  const handleTimeSigChange = (e) => {
    setTimeSig(parseInt(e.target.value));
  };

  const rhythms = [
    ["𝅗", 4],
    ["𝅗𝅥.", 3],
    ["𝅗𝅥", 2],
    ["𝅘𝅥.", 1.5],
    ["𝅘𝅥", 1],
    ["𝅘𝅥𝅮.", 0.75],
    ["𝅘𝅥𝅮", 0.5],
    ["𝅘𝅥𝅯", 0.25],
  ];

  return (
    <div className="metronome-body">
      <h2>Drum Machine</h2>
      <div className="top">
        <div className="left">
          <TempoControls startStop={startStop} />
        </div>

        <div className="right">
          <div className="dm-settings">
            <label>
              Beats Per Measure:
              <div className="dm-input-div">
                <input
                  type="range"
                  min="2"
                  max="9"
                  value={timeSig}
                  onChange={handleTimeSigChange}
                />
                {timeSig}
              </div>
            </label>
          </div>
          <div className="dm-settings">
            <label>
              Measures:
              <div className="dm-input-div">
                <span
                  className={
                    measures === 1 ? "input-selected" : "input-unselected"
                  }
                >
                  1
                </span>
                <input
                  id="measure-range"
                  type="range"
                  min="1"
                  max="2"
                  value={measures}
                  onChange={handleMeasureChange}
                />
                <span
                  className={
                    measures === 2 ? "input-selected" : "input-unselected"
                  }
                >
                  2
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div className="rhythm-div">
        <h4>Rhythms</h4>
        <div>
          {rhythms.map(([note, num]) => (
            <button
              className={rhythm === num ? "selected" : ""}
              onClick={() => handleRhythmClick(num)}
            >
              <div className="music-note">{note}</div>
              {num}
            </button>
          ))}
        </div>
      </div>
      <div id="drum-machine"></div>

      <BottomControls startStop={startStop} />
    </div>
  );
}

export default DrumMachine;
