import React, { useState } from "react";
import { GoChevronRight, GoChevronDown } from "react-icons/go";
import "../styles/Practice.css";

function Practice({
  countIn,
  setCountIn,
  numMeasures,
  setNumMeasures,
  repeat,
  setRepeat,
  tempoInc,
  setTempoInc,
  sectionPractice,
  setSectionPractice,
  tempoPractice,
  setTempoPractice,
}) {
  const [viewPractice, setViewPractice] = useState(false);

  const togglePracticeView = () => {
    setViewPractice(!viewPractice);
  };

  const toggleSectionPractice = () => {
    setSectionPractice(!sectionPractice);
  };

  const toggleTempoPractice = () => {
    setTempoPractice(!tempoPractice);
  };

  const handleNumMeasuresChange = (e) => {
    setNumMeasures(parseInt(e.target.value));
  };

  const handleRepeatChange = (e) => {
    setRepeat(parseInt(e.target.value));
  };

  const handleTempIncChange = (e) => {
    setTempoInc(parseInt(e.target.value));
  };

  const handleCountInChange = (e) => {
    setCountIn(parseInt(e.target.value));
  };

  return (
    <div className="practice-div">
      <div onClick={togglePracticeView}>
        <h3>
          {viewPractice ? <GoChevronDown /> : <GoChevronRight />} Practice
          Settings:
        </h3>
      </div>
      <div className={viewPractice ? "" : "hidden"}>
        <div>
          <label htmlFor="count-in">
            Count In Measures:
            <select
              id="count-in"
              onSelect={handleCountInChange}
              defaultValue={countIn}
            >
              <option value="0">None</option>
              <option value="1">1 Measure</option>
              <option value="2">2 Measures</option>
            </select>
          </label>
        </div>
        <div id="practice-section">
          <div>
            <label htmlFor="section" className="checkbox-div">
              Practice a section:
              <input
                type="checkbox"
                id="section-number"
                value={sectionPractice}
                onClick={toggleSectionPractice}
              />
            </label>
          </div>
          <div
            id="practice-section-options"
            className={sectionPractice ? "" : "hidden"}
          >
            <div>
              <label htmlFor="section-length">
                Number of measures:
                <input
                  id="section-length"
                  name="section-length"
                  type="number"
                  value={numMeasures}
                  onChange={handleNumMeasuresChange}
                  min="1"
                  max="99"
                />
              </label>
            </div>
            <div>
              <label
                htmlFor="repeats"
                className={sectionPractice ? "" : "hidden"}
              >
                Repeat:
                <input
                  id="repeats"
                  name="repeats"
                  type="number"
                  value={repeat}
                  onChange={handleRepeatChange}
                  min="1"
                  max="99"
                />{" "}
                times
              </label>
            </div>

            <div id="tempo-increase">
              <div>
                <label htmlFor="section" className="checkbox-div">
                  Increase the Tempo:
                  <input
                    type="checkbox"
                    id="section-number"
                    value={tempoPractice}
                    onClick={toggleTempoPractice}
                  />
                </label>
              </div>
              <div>
                <label
                  htmlFor="increase-amount"
                  className={tempoPractice ? "" : "hidden"}
                >
                  Increase the tempo by
                  <input
                    type="number"
                    name="increase-amount"
                    id="increase-amount"
                    value={tempoInc}
                    onChange={handleTempIncChange}
                    min="1"
                    max="99"
                  />
                  BPM on each repeat.
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Practice;
