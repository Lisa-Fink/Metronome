import React, { useContext } from "react";
import { AppContext } from "../../contexts/AppContext";

function CountSelector({ hoverGridRef, setHoverGrid, createRhythmGrid }) {
  const {
    timeSignature,
    setTimeSignature,
    measures,
    setMeasures,
    rhythmGrid,
    setRhythmGrid,
    rhythmSequence,
    NUM_CELLS_PER_BEAT,
  } = useContext(AppContext);

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
  return (
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
              className={measures === 1 ? "input-selected" : "input-unselected"}
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
              className={measures === 2 ? "input-selected" : "input-unselected"}
            >
              2
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}

export default CountSelector;
