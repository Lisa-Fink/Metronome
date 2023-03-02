import React, { useState } from "react";
import { GoChevronRight, GoChevronDown } from "react-icons/go";

function ToneSelector({
  setTone,
  toneCategory,
  setToneCategory,
  setKey,
  tone,
}) {
  const [viewTone, setViewTone] = useState(false);

  const changeTone = (e) => {
    setTone(e.target.value);
    const optgroup = e.target.selectedOptions[0].parentNode.label;
    setToneCategory(optgroup);
  };

  const toggleToneView = () => {
    setViewTone(!viewTone);
  };

  const changeKey = (e) => {
    const frequencies = {
      C: 261.63,
      Db: 277.18,
      D: 293.66,
      Eb: 311.13,
      E: 329.63,
      F: 349.23,
      Gb: 369.99,
      G: 392,
      Ab: 415.3,
      A: 440,
      Bb: 466.16,
      B: 493.88,
    };
    const newKey = frequencies[e.target.value];
    setKey(newKey);
  };

  return (
    <div id="tone-selector">
      <h3>
        {viewTone ? (
          <GoChevronDown onClick={toggleToneView} />
        ) : (
          <GoChevronRight onClick={toggleToneView} />
        )}
        Tone Selection
      </h3>
      <div
        id="tone-container"
        className={viewTone ? "indented-child" : "hidden"}
      >
        <label htmlFor="tone-category">
          Type of Tone
          <select id="tone-category" onChange={changeTone} value={tone}>
            <optgroup label="Basic Tones">
              <option value="audioContextTone">Generic Beep</option>
              <option value="audioContextFlute">Synth Flute</option>
            </optgroup>
            <optgroup label="Percussion">
              <option value="woodBlock">Wood Block</option>
              <option value="marimba">Marimba</option>
              <option value="snare">Snare Drum</option>
              <option value="clap">Claps</option>
              <option value="triangle">Triangle</option>
              <option value="cowbell">Cowbell</option>
              <option value="hiHat">Hi Hats</option>
            </optgroup>
            <optgroup label="Spoken Counts">
              <option value="femaleNumbers">Female Numbers</option>
            </optgroup>
            <optgroup label="Drum Sets">
              <option value="drumSet">Drum Set</option>
            </optgroup>
          </select>
        </label>
        <div
          className={toneCategory == "Basic Tones" ? "" : "hidden"}
          id="key-div"
        >
          <label htmlFor="key">
            Key
            <select id="key" onChange={changeKey}>
              <option value="C">C</option>
              <option value="Db">C#/Db</option>
              <option value="D">D</option>
              <option value="Eb">Eb</option>
              <option value="F">F</option>
              <option value="Gb">F#/Gb</option>
              <option value="G">G</option>
              <option value="Ab">Ab</option>
              <option value="A">A</option>
              <option value="Bb">Bb</option>
              <option value="B">B</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ToneSelector;
