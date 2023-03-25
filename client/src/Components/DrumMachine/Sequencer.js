import React, { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { IoAddCircleOutline } from "react-icons/io5";

function Sequencer({
  rhythm,
  isEditDelete,
  createRhythmGrid,
  setHoverGrid,
  hoverGrid,
  hoverGridRef,
  instrumentIdx,
  setIsChooseInstOpen,
}) {
  const {
    timeSignature,
    measures,
    rhythmGrid,
    setRhythmGrid,
    instruments,
    setInstruments,
    rhythmSequence,
    NUM_CELLS_PER_BEAT,
  } = useContext(AppContext);

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
    <>
      {rhythmGrid.map((row, rowIdx) => {
        if (
          instruments[rowIdx][0] === undefined ||
          instruments[rowIdx][0] === null
        ) {
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
    </>
  );

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

  return (
    <div className="drum-machine-container">
      {instrumentDiv}
      {countDiv}
      {rhythmGridDiv}
    </div>
  );
}

export default Sequencer;
