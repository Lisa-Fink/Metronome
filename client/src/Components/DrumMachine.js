import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import TempoControls from "./TempoControls";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";
import { IoAddCircleOutline } from "react-icons/io5";
import { CiEraser, CiEdit } from "react-icons/ci";
import "../styles/DrumMachine.css";
import ChooseInstPopUp from "./PopUps/ChooseInstPopUp";
import UserBar from "./UserBar";
import { UserContext } from "../contexts/UserContext";

// TODO snap to - the aligns the rhythms to a certain beat like eighth notes or quarter notes etc.

function DrumMachine({ savedState, isChanging }) {
  const {
    isPlaying,
    timeSignature,
    setTimeSignature,
    startDrumMachine,
    stopDrumMachine,
    bpm,
    setBpm,
    measures,
    setMeasures,
    dMTitle,
    setDMTitle,
    rhythmGrid,
    setRhythmGrid,
    instruments,
    setInstruments,
    rhythmSequence,
    createDMQueryUrl,
  } = useContext(AppContext);

  const isTyping = useRef(false);

  const { saveNewDM, saveUpdateDM, userDrumMachines, loadDM, deleteDM } =
    useContext(UserContext);

  const NUM_CELLS_PER_BEAT = 12;
  const MAX_INSTRUMENTS = 4;

  const createRhythmGrid = (num_measures = measures) =>
    Array.from({ length: MAX_INSTRUMENTS }, () =>
      Array(NUM_CELLS_PER_BEAT * timeSignature * num_measures).fill(false)
    );

  const [isChooseInstOpen, setIsChooseInstOpen] = useState(false);
  const instrumentIdx = useRef(0);
  const [rhythm, setRhythm] = useState(1);
  const [isEditDelete, setIsEditDelete] = useState(true);

  const [hoverGrid, setHoverGrid] = useState(createRhythmGrid());
  const hoverGridRef = useRef(createRhythmGrid());

  // Stops the metronome on load if it was playing
  useEffect(() => {
    // initialize instruments, rhythm grid, rhythm sequence if not set
    if (!instruments.length) {
      setInstruments(
        Array.from({ length: MAX_INSTRUMENTS }, () => Array(3).fill(undefined))
      );
    }
    if (!rhythmGrid.length) {
      setRhythmGrid(
        Array.from({ length: MAX_INSTRUMENTS }, () =>
          Array(NUM_CELLS_PER_BEAT * timeSignature * measures).fill(false)
        )
      );
    }
    if (!rhythmSequence.current.length) {
      rhythmSequence.current = Array.from({ length: MAX_INSTRUMENTS }, () =>
        Array(NUM_CELLS_PER_BEAT * timeSignature * measures).fill(0)
      );
    }
  }, []);
  const stopRef = useRef("false");

  // Resets the drum machine if settings are changed and playing
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [dMTitle]);

  useEffect(() => {
    // Finish reset after stop completes
    if (!isPlaying && stopRef.current == true) {
      stopRef.current = false;
      startDrumMachine(instruments, rhythmSequence.current, bpm);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [bpm]);

  useEffect(() => {
    if (isPlaying) {
      if (rhythmGrid.flat().every((instRhythm) => instRhythm === false)) {
        // Stop if all rhythms are false
        // Note: could move this to any function that could remove rhythms
        stopDrumMachine();
        return;
      }
      restart();
    }
  }, [timeSignature, measures, rhythmGrid, instruments]);

  // Saves and loads bpm and time signature settings when changing/loading view
  useEffect(() => {
    if (isChanging.current) {
      if (savedState.current.bpm !== undefined) {
        setBpm(savedState.current.bpm);
        setTimeSignature(savedState.current.timeSignature);
      }
      isChanging.current = false;
    }
    return () => {
      if (isChanging.current) {
        savedState.current = Object.assign({}, savedState.current, {
          bpm,
          timeSignature,
        });
      }
    };
  }, [bpm, timeSignature]);

  const restart = () => {
    if (isPlaying) {
      stopRef.current = true;
      stopDrumMachine();
    }
  };

  const startStop = useCallback(() => {
    if (isPlaying) {
      stopDrumMachine();
    } else {
      startDrumMachine(instruments, rhythmSequence.current, bpm);
    }
  }, [isPlaying, instruments, rhythmSequence, bpm]);
  // Adds start/stop with space bar press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isTyping && event.keyCode === 32) {
        // Space key
        startStop();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [startStop, isPlaying]);

  const handleRhythmClick = (num) => {
    setRhythm(num);
  };

  const handleMeasureChange = (e) => {
    const newMeasures = parseInt(e.target.value);
    if (newMeasures === measures) {
      return;
    }
    // change rhythmGrid, hoverGrid, rhythmSequence
    // Increasing measures
    let newRhythmGrid, newRhythmSequence;
    if (newMeasures > measures) {
      // Note: This should change if allowed measures > 2 in the future.
      const adding = newMeasures - measures;
      newRhythmGrid = rhythmGrid.map((row) => [
        ...row,
        ...Array(NUM_CELLS_PER_BEAT * timeSignature * adding).fill(false),
      ]);
      newRhythmSequence = rhythmSequence.current.map((row) => [
        ...row,
        ...Array(NUM_CELLS_PER_BEAT * timeSignature * adding).fill(0),
      ]);
    } else {
      // Removing
      const removing = measures - newMeasures;
      const newEnd =
        rhythmGrid[0].length - timeSignature * NUM_CELLS_PER_BEAT * removing;
      newRhythmSequence = rhythmSequence.current.map((row) => [
        ...row.slice(0, newEnd),
      ]);
      newRhythmGrid = rhythmGrid.map((row) => [...row.slice(0, newEnd)]);
    }
    rhythmSequence.current = newRhythmSequence;
    setRhythmGrid(newRhythmGrid);
    setHoverGrid(createRhythmGrid());
    hoverGridRef.current = createRhythmGrid();
    setMeasures(newMeasures);
  };

  const handleTimeSignatureChange = (e) => {
    // Time Signature Changes maintain the beat number associated with the rhythm.
    // If that beat is larger than the new time signature it is deleted.
    const newTimeSignature = parseInt(e.target.value);
    if (newTimeSignature === timeSignature) {
      return;
    }
    if (newTimeSignature > timeSignature) {
      // add to the arrays
      const adding = (newTimeSignature - timeSignature) * NUM_CELLS_PER_BEAT;
      let newRhythmGrid, newRhythmSequence;
      if (measures === 1) {
        newRhythmGrid = rhythmGrid.map((row) => [
          ...row,
          ...Array(adding).fill(false),
        ]);

        newRhythmSequence = rhythmSequence.current.map((row) => [
          ...row,
          ...Array(adding).fill(0),
        ]);
      } else {
        // 2 Measures
        // NOTE: Change this is allowing > 2 measures. Convert to
        // multidimensional arrays (an array for each measure)

        // get last index of 1st measure
        let lastIdx = timeSignature * NUM_CELLS_PER_BEAT; // this is lastIdx + 1
        newRhythmGrid = rhythmGrid.map((row) => [
          ...row.slice(0, lastIdx),
          ...Array(adding).fill(false),
          ...row.slice(lastIdx),
          ...Array(adding).fill(false),
        ]);

        newRhythmSequence = rhythmSequence.current.map((row) => [
          ...row.slice(0, lastIdx),
          ...Array(adding).fill(0),
          ...row.slice(lastIdx),
          ...Array(adding).fill(0),
        ]);
      }
      setRhythmGrid(newRhythmGrid);
      rhythmSequence.current = newRhythmSequence;
    } else {
      let newRhythmGrid, newRhythmSequence;
      // remove cells from the arrays
      const removing = (timeSignature - newTimeSignature) * NUM_CELLS_PER_BEAT;

      if (measures === 1) {
        newRhythmGrid = rhythmGrid.map((row) => row.slice(0, -removing));
        newRhythmSequence = rhythmSequence.current.map((row) =>
          row.slice(0, -removing)
        );
      } else {
        // Measures === 2. Note: Change this if allowing more measures.
        let lastIdx = timeSignature * NUM_CELLS_PER_BEAT; // this is lastIdx + 1
        let newLastIdx = lastIdx - removing;
        newRhythmGrid = rhythmGrid.map((row) => [
          ...row.slice(0, newLastIdx),
          ...row.slice(lastIdx, -removing),
        ]);
        newRhythmSequence = rhythmGrid.map((row) => [
          ...row.slice(0, newLastIdx),
          ...row.slice(lastIdx, -removing),
        ]);
      }
      setRhythmGrid(newRhythmGrid);
      rhythmSequence.current = newRhythmSequence;
    }

    setHoverGrid(createRhythmGrid());
    hoverGridRef.current = createRhythmGrid();
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

  const handleExitCellHover = (instrumentIdx, cellIdx) => {
    if (
      !instruments[instrumentIdx] ||
      (!isEditDelete && !rhythmGrid[instrumentIdx][cellIdx])
    ) {
      return;
    }
    const blank = createRhythmGrid();
    setHoverGrid(blank);
    hoverGridRef.current = blank;
  };

  const handleCellHover = (instrumentIdx, startOfNote) => {
    if (!instruments[instrumentIdx] || !isEditDelete) {
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
    const newInstruments = [...instruments];
    newInstruments[idx] = [undefined, undefined, undefined];
    const newSequence = [...rhythmSequence.current];
    newSequence[idx] = Array(
      NUM_CELLS_PER_BEAT * timeSignature * measures
    ).fill(0);
    const newRhythmGrid = [...rhythmGrid];
    newRhythmGrid[idx] = Array(
      NUM_CELLS_PER_BEAT * timeSignature * measures
    ).fill(false);
    setRhythmGrid(newRhythmGrid);
    rhythmSequence.current = newSequence;
    setInstruments(newInstruments);
  };

  const handleEditDelete = (e) => {
    const val = e.currentTarget.value;
    if (val === "edit" && !isEditDelete) setIsEditDelete(true);
    if (val === "delete" && isEditDelete) setIsEditDelete(false);
  };

  const handleCellDeleteHover = (instIdx, rhythmIdx) => {
    const newHoverGrid = [...hoverGridRef.current];

    // find all cells for note and add to hover grid
    let first = rhythmIdx;
    let last = rhythmIdx;
    while (first >= 0 && rhythmGrid[instIdx][first] !== "first") {
      newHoverGrid[instIdx][first] = true;
      first--;
    }
    newHoverGrid[instIdx][first] = true; // Note: don't need to change bounds
    while (
      last < rhythmGrid[instIdx].length &&
      rhythmGrid[instIdx][last] !== "last"
    ) {
      newHoverGrid[instIdx][last] = true;
      last++;
    }
    newHoverGrid[instIdx][last] = true;
    setHoverGrid(newHoverGrid);
    hoverGridRef.current = newHoverGrid;
  };

  const handleCellDeleteClick = (instIdx, rhythmIdx) => {
    const newRhythmGrid = [...rhythmGrid];
    const newRhythmSequence = [...rhythmSequence.current];

    // find all cells for note and add to hover grid
    let first = rhythmIdx;
    let last = rhythmIdx;

    while (first >= 0 && rhythmGrid[instIdx][first] !== "first") {
      if (newRhythmGrid[instIdx][first] !== "last") {
        newRhythmGrid[instIdx][first] = false;
      }
      first--;
    }
    newRhythmGrid[instIdx][first] = false; // Note: don't need to change bounds
    newRhythmSequence[instIdx][first] = 0;

    while (
      last < rhythmGrid[instIdx].length &&
      rhythmGrid[instIdx][last] !== "last"
    ) {
      newRhythmGrid[instIdx][last] = false;
      last++;
    }
    newRhythmGrid[instIdx][last] = false;

    setRhythmGrid(newRhythmGrid);
    rhythmSequence.current = newRhythmSequence;
    // reset hover grid
    setHoverGrid(createRhythmGrid());
    hoverGridRef.current = createRhythmGrid();
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
    <div
      id="counts"
      className={`${timeSigMap[timeSignature]} ${measures > 1 ? "m2" : ""}`}
    >
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
      {measures === 2
        ? Array.from(Array(timeSignature).keys()).map((count, index) => (
            <React.Fragment key={index}>
              <div key={`m2-${index}`} className={`count-${timeSignature}`}>
                {count + 1}
              </div>
              <div key={index + "-a"} className={`count-${timeSignature}`}>
                {"+"}
              </div>
            </React.Fragment>
          ))
        : ""}
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
                className={`rhythm-grid ${timeSigMap[timeSignature]} ${
                  measures === 2 ? "m2" : ""
                }`}
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
                className={`rhythm-grid ${timeSigMap[timeSignature]} ${
                  measures === 2 ? "m2" : ""
                }`}
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
                    if (isEditDelete) {
                      cellClasses.push("hover");
                    } else {
                      cellClasses.push("hover-delete");
                    }
                  }

                  if (value) {
                    cellClasses.push(`has-${value}-value`);
                  }
                  return (
                    <div
                      key={`${rowIdx}-${i}`}
                      className={cellClasses.join(" ")}
                      onClick={
                        isEditDelete ? () => handleCellClick(rowIdx, i) : null
                      }
                      onMouseEnter={() => handleCellHover(rowIdx, i)}
                      onMouseLeave={() => handleExitCellHover(rowIdx, i)}
                    >
                      {value !== false && (
                        <div
                          className={`cell ${value}`}
                          onMouseOver={
                            !isEditDelete
                              ? () => handleCellDeleteHover(rowIdx, i)
                              : null
                          }
                          onClick={
                            !isEditDelete
                              ? () => handleCellDeleteClick(rowIdx, i)
                              : null
                          }
                          onMouseLeave={
                            !isEditDelete
                              ? () => handleExitCellHover(rowIdx, i)
                              : null
                          }
                        ></div>
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
      <UserBar
        view={"Drum Machine"}
        saveNew={saveNewDM}
        saveUpdate={saveUpdateDM}
        loadFunc={loadDM}
        data={userDrumMachines}
        isTyping={isTyping}
        title={dMTitle}
        setTitle={setDMTitle}
        createUrlFunc={createDMQueryUrl}
        deleteFunc={deleteDM}
      />
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
      <div>
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
        <div>
          {/* edit - delete selection */}
          <button
            className={isEditDelete ? "selected" : ""}
            onClick={handleEditDelete}
            value={"edit"}
          >
            Add <CiEdit />
          </button>
          <button
            className={!isEditDelete ? "selected" : ""}
            onClick={handleEditDelete}
            value={"delete"}
          >
            Delete <CiEraser />
          </button>
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
