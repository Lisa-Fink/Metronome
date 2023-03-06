import React, { useContext, useEffect, useState, useRef } from "react";
import TempoControls from "./TempoControls";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";
import { IoAddCircleOutline } from "react-icons/io5";
import "../styles/DrumMachine.css";
import ChooseInstPopUp from "./ChooseInstPopUp";

function DrumMachine() {
  const {
    setBpm,
    bpmRef,
    isPlaying,
    setIsPlaying,
    isStopping,
    timerId,
    setTimerId,
    timeSignature,
    setTimeSignature,
    stopClick,
    startDrumMachine,
    stopDrumMachine,
  } = useContext(AppContext);

  const NUM_CELLS_PER_BEAT = 12;
  const MAX_INSTRUMENTS = 4;
  const createRhythmGrid = () =>
    Array.from({ length: MAX_INSTRUMENTS }, () =>
      Array(NUM_CELLS_PER_BEAT * timeSignature).fill(false)
    );

  const [isChooseInstOpen, setIsChooseInstOpen] = useState(false);
  const instrumentIdx = useRef(0);

  const [rhythm, setRhythm] = useState(1);
  const [measures, setMeasures] = useState(1);
  const [rhythmGrid, setRhythmGrid] = useState(createRhythmGrid());
  const [hoverGrid, setHoverGrid] = useState(createRhythmGrid());
  // Instrument [name, descriptive name, index]
  const [instruments, setInstruments] = useState(
    Array.from({ length: MAX_INSTRUMENTS }, () => Array(3).fill(undefined))
  );
  const hoverGridRef = useRef(createRhythmGrid());
  const rhythmSequence = useRef(
    Array.from({ length: MAX_INSTRUMENTS }, () =>
      Array(NUM_CELLS_PER_BEAT * timeSignature).fill(0)
    )
  );

  // Stops the metronome on load if it was playing
  useEffect(() => {
    if (isPlaying) {
      stopClick();
    }
  }, []);
  // Resets the drum machine if settings are changed and playing
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [timeSignature, measures, bpmRef, rhythmGrid]);

  // TODO snap to - the aligns the rhythms to a certain beat like eighth notes or quarter notes etc.
  // TODO light-mode colors
  // TODO condense color variables
  // TODO delete - click anywhere on a note and delete it, hover is different /write mode

  const restart = async () => {
    if (isPlaying) {
      await stopDrumMachine();
      startDrumMachine(instruments, rhythmSequence.current);
    }
  };

  const startStop = async () => {
    if (isPlaying) {
      await stopDrumMachine();
    } else {
      startDrumMachine(instruments, rhythmSequence.current);
    }
  };

  const handleRhythmClick = (num) => {
    setRhythm(num);
  };

  const handleMeasureChange = (e) => {
    setMeasures(parseInt(e.target.value));
  };

  const handleTimeSignatureChange = (e) => {
    const newTimeSignature = parseInt(e.target.value);
    if (newTimeSignature === timeSignature) {
      return;
    }
    if (newTimeSignature > timeSignature) {
      // add to the arrays
      const adding = (newTimeSignature - timeSignature) * 12;
      const newRhythmGrid = rhythmGrid.map((row) => [
        ...row,
        ...Array(adding).fill(false),
      ]);

      const newHoverGrid = hoverGrid.map((row) => [
        ...row,
        ...Array(adding).fill(false),
      ]);
      const newRhythmSequence = rhythmSequence.current.map((row) => [
        ...row,
        ...Array(adding).fill(0),
      ]);
      setRhythmGrid(newRhythmGrid);
      setHoverGrid(newHoverGrid);
      hoverGridRef.current = newHoverGrid;
      rhythmSequence.current = newRhythmSequence;
    } else {
      // remove cells from the arrays
      const removing = (timeSignature - newTimeSignature) * 12;
      const newRhythmGrid = rhythmGrid.map((row) => row.slice(0, -removing));
      const newHoverGrid = hoverGrid.map((row) => row.slice(0, -removing));
      const newHoverGridRef = hoverGridRef.current.map((row) =>
        row.slice(0, -removing)
      );
      const newRhythmSequence = rhythmSequence.current.map((row) =>
        row.slice(0, -removing)
      );
      setRhythmGrid(newRhythmGrid);
      setHoverGrid(newHoverGrid);
      hoverGridRef.current = newHoverGridRef;
      rhythmSequence.current = newRhythmSequence;
    }

    setTimeSignature(newTimeSignature);
  };

  const handleCellClick = (instrumentIdx, startOfNote) => {
    if (!instruments[instrumentIdx]) {
      return;
    }
    const newRhythmGrid = [...rhythmGrid];
    const cellsPerNote = rhythmMap[rhythm];
    const endOfNote = Math.min(
      startOfNote + cellsPerNote - 1,
      rhythmGrid[instrumentIdx].length - 1
    );
    // check collision
    // if colliding remove all cells before and after the new ones
    if (newRhythmGrid[instrumentIdx][startOfNote]) {
      let cur = startOfNote;

      // set all cells before to false until first is reached
      while (cur > 0 && newRhythmGrid[instrumentIdx][cur] != "first") {
        newRhythmGrid[instrumentIdx][cur--] = false;
      }
      newRhythmGrid[instrumentIdx][Math.max(cur, 0)] = false;
    }
    if (newRhythmGrid[instrumentIdx][endOfNote]) {
      let cur = endOfNote;

      // set all cells after to false until last is reached
      while (
        cur < rhythmGrid[instrumentIdx].length &&
        newRhythmGrid[instrumentIdx][cur] != "last"
      ) {
        newRhythmGrid[instrumentIdx][cur++] = false;
      }
      newRhythmGrid[instrumentIdx][
        Math.min(cur, rhythmGrid[instrumentIdx].length - 1)
      ] = false;
    }

    newRhythmGrid[instrumentIdx][startOfNote] = "first";
    newRhythmGrid[instrumentIdx][endOfNote] = "last";
    for (let i = startOfNote + 1; i < endOfNote; i++) {
      newRhythmGrid[instrumentIdx][i] = "middle";
    }
    setRhythmGrid(newRhythmGrid);
    const newRhythmSequence = [...rhythmSequence.current];
    newRhythmSequence[instrumentIdx] = newRhythmGrid[instrumentIdx].map(
      (cell) => (cell === "first" ? 1 : 0)
    );
    rhythmSequence.current = newRhythmSequence;
  };

  const handleExitCellHover = (instrumentIdx) => {
    if (!instruments[instrumentIdx]) {
      return;
    }
    const blank = Array.from({ length: 4 }, () =>
      Array(rhythmGrid.length).fill(false)
    );
    setHoverGrid(blank);
    hoverGridRef.current = blank;
  };

  const handleCellHover = (instrumentIdx, startOfNote) => {
    if (!instruments[instrumentIdx]) {
      return;
    }
    const newHoverGrid = [...hoverGridRef.current];
    const cellsPerNote = rhythmMap[rhythm];
    const endOfNote = Math.min(
      startOfNote + cellsPerNote - 1,
      rhythmGrid[instrumentIdx].length - 1
    );

    for (let i = startOfNote; i <= endOfNote; i++) {
      newHoverGrid[instrumentIdx][i] = true;
    }

    setHoverGrid(newHoverGrid);
    hoverGridRef.current = newHoverGrid;
  };

  const addInstrument = (idx) => {
    instrumentIdx.current = idx;
    setIsChooseInstOpen(true);
  };

  const deleteInstrument = (idx) => {
    // TODO clear rhythmsequence
    const newInstruments = [...instruments];
    newInstruments[idx] = [undefined, undefined, undefined];
    setInstruments(newInstruments);
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

  const rhythmMap = {
    4: 48,
    3: 36,
    2: 24,
    1.5: 18,
    1: 12,
    0.75: 9,
    0.5: 6,
    0.25: 3,
  };

  const timeSigMap = {
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
  };

  const countDiv = (
    <div id="counts" className={timeSigMap[timeSignature]}>
      {Array.from(Array(timeSignature).keys()).map((count, index) => (
        <React.Fragment key={index}>
          <div key={index} className={`count-${timeSignature}`}>
            {count + 1}
          </div>
          <div key={index + "-a"} className={`count-${timeSignature}`}>
            {"+"}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  const instrumentDiv = (
    // <div className="instrument-name">
    <>
      {instruments.map((inst, i) => {
        if (inst[0]) {
          return (
            <div
              className={`row${i + 2} col1 inst-detail`}
              key={`instrument-${i}`}
            >
              <h4>{inst[0]}</h4>
              <p>{inst[1]}</p>
              <div className="inst-edit">
                <button onClick={() => addInstrument(i)}>Change</button>
                <button onClick={() => deleteInstrument(i)}>Delete</button>
              </div>
            </div>
          );
        } else {
          return (
            <div
              className={`row${i + 2} col1 add-inst inst-detail`}
              key={`instrument-${i}`}
            >
              <IoAddCircleOutline
                className="instrument-icon"
                key={`instrument-${i}-icon`}
                onClick={() => addInstrument(i)}
              />
            </div>
          );
        }
      })}
      {/* </div> */}
    </>
  );

  const rhythmGridDiv = (
    // <div className="rhythm-grid-container">
    <>
      {rhythmGrid.map((row, rowIdx) => {
        if (instruments[rowIdx][0] === undefined) {
          return (
            <div
              className={`rhythm-grid-no-inst-row row${rowIdx + 2} col2`}
              key={rowIdx}
            >
              <div
                className={"rhythm-grid " + timeSigMap[timeSignature]}
                key={`${rowIdx}-${timeSignature}`}
              ></div>
            </div>
          );
        } else {
          return (
            <div
              className={`rhythm-grid-row row${rowIdx + 2} col2`}
              key={rowIdx}
            >
              <div
                className={"rhythm-grid " + timeSigMap[timeSignature]}
                key={`${rowIdx}-${timeSignature}`}
              >
                {row.map((value, i) => {
                  let cellClasses = ["cell"];
                  if (i % 12 === 0) {
                    cellClasses.push("beat-cell");
                  } else if (i % 6 === 0) {
                    cellClasses.push("half-beat-cell");
                  } else if (i % 3 === 0) {
                    cellClasses.push("quarter-beat-cell");
                  }

                  if (hoverGrid[rowIdx][i]) {
                    cellClasses.push("hover");
                  }

                  if (value) {
                    cellClasses.push(`has-${value}-value`);
                  }
                  return (
                    <div
                      key={`${rowIdx}-${i}`}
                      className={cellClasses.join(" ")}
                      onClick={() => handleCellClick(rowIdx, i)}
                      onMouseEnter={() => handleCellHover(rowIdx, i)}
                      onMouseLeave={() => handleExitCellHover(rowIdx)}
                    >
                      {value !== false && (
                        <div className={`cell ${value}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      })}
      {/* </div> */}
    </>
  );

  const drumMachineDiv = (
    <div className="drum-machine-container">
      {instrumentDiv}
      {countDiv}
      {rhythmGridDiv}
    </div>
  );

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
                  value={timeSignature}
                  onChange={handleTimeSignatureChange}
                />
                {timeSignature}
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
              key={num}
              className={rhythm === num ? "selected" : ""}
              onClick={() => handleRhythmClick(num)}
            >
              <div key={`note-${num}`} className="music-note">
                {note}
              </div>
              {num}
            </button>
          ))}
        </div>
      </div>
      {drumMachineDiv}

      <BottomControls startStop={startStop} />

      {isChooseInstOpen && (
        <ChooseInstPopUp
          instArr={instruments}
          setInstArr={setInstruments}
          instrumentIdx={instrumentIdx.current}
          setIsChooseInstOpen={setIsChooseInstOpen}
        />
      )}
    </div>
  );
}

export default DrumMachine;
