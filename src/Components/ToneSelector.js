import React from "react";

function ToneSelector({ setTone, setDownBeatTone }) {
  const changeTone = (e) => {
    setTone(e.target.value);
    setDownBeatTone(e.target.value);
  };
  return (
    <div id="tone-selector">
      <h3>Tone Selector</h3>
      <label htmlFor="tone-category">
        Type of Tone
        <select id="tone-category" onChange={changeTone}>
          <option value="tone-audio">Generic Tone</option>
          <option value="wood-block">Wood Block</option>
        </select>
      </label>
    </div>
  );
}

export default ToneSelector;
