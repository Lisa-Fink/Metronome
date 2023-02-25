import React from "react";

function ChangeMeter({ setTimeSignature, downBeat, setDownBeat }) {
  return (
    <div id="change-meter">
      <label htmlFor="time-signature">
        Time Signature
        <select
          id="time-signature"
          defaultValue="4"
          onChange={(e) => setTimeSignature(parseInt(e.target.value))}
        >
          <optgroup>
            <option value="2">2/4</option>
            <option value="3">3/4</option>
            <option value="4">4/4</option>
            <option value="5">5/4</option>
            <option value="6">6/4</option>
            <option value="7">7/4</option>
          </optgroup>
          <optgroup>
            <option value="3">3/8</option>
            <option value="6">6/8</option>
            <option value="9">9/8</option>
          </optgroup>
        </select>
      </label>
      <label htmlFor="down-beat">
        DownBeat
        <input
          type="checkbox"
          name="down-beat"
          defaultChecked={downBeat}
          onChange={(e) => setDownBeat(!downBeat)}
        />
      </label>
    </div>
  );
}

export default ChangeMeter;
