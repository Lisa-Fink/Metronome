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
    if (e.target.value === "") {
      setNumMeasures("");
      return;
    }
    setNumMeasures(parseInt(e.target.value));
  };

  const handleNumExit = (e) => {
    if (e.target.value === "") {
      setNumMeasures(1);
    }
  };

  const handleRepeatChange = (e) => {
    if (e.target.value === "") {
      setRepeat("");
      return;
    }
    setRepeat(parseInt(e.target.value));
  };

  const handleRepeatExit = (e) => {
    if (e.target.value === "") {
      setRepeat(1);
    }
  };

  const handleTempIncChange = (e) => {
    if (e.target.value === "") {
      setTempoInc("");
      return;
    }
    setTempoInc(parseInt(e.target.value));
  };

  const handleTempoExit = (e) => {
    if (e.target.value === "") {
      setTempoInc(1);
    }
  };

  const handleCountInChange = (e) => {
    setCountIn(parseInt(e.target.value));
  };

  return (
    <div className="practice-div">
      <div>
        <h3>
          {viewPractice ? (
            <GoChevronDown onClick={togglePracticeView} />
          ) : (
            <GoChevronRight onClick={togglePracticeView} />
          )}{" "}
          Practice Settings
        </h3>
      </div>
      <div className={viewPractice ? "" : "hidden"}>
        <div>
          <label htmlFor="count-in">
            Count In Measures:
            <select
              id="count-in"
              onChange={handleCountInChange}
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
                  onBlur={handleNumExit}
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
                  onBlur={handleRepeatExit}
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
                    onBlur={handleTempoExit}
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
