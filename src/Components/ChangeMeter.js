import React, { useRef, useEffect, useState } from "react";

function ChangeMeter({
  setTimeSignature,
  downBeat,
  setDownBeat,
  subdivide,
  setSubdivide,
  mainBeat,
  setMainBeat,
  toneCategory,
}) {
  const [showSubdivideMenu, setShowSubdivideMenu] = useState(false);

  useEffect(() => {
    if (toneCategory !== "Spoken Counts" && subdivide > 1) {
      setShowSubdivideMenu(true);
    }
    if (toneCategory === "Spoken Counts") {
      setShowSubdivideMenu(false);
    }
  }, [toneCategory]);

  const toggleMenu = () => {
    if (showSubdivideMenu) {
      setSubdivide(1);
    }
    setShowSubdivideMenu(!showSubdivideMenu);
  };

  const toggleMainBeat = () => {
    setMainBeat(!mainBeat);
  };
  return (
    <div id="change-meter">
      <h3>Rhythm Settings:</h3>
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
      <div className={toneCategory === "Spoken Counts" ? "hidden" : ""}>
        <label htmlFor="down-beat" className="checkbox-div">
          DownBeat
          <input
            type="checkbox"
            name="down-beat"
            defaultChecked={downBeat}
            onChange={(e) => setDownBeat(!downBeat)}
          />
        </label>
        <label htmlFor="subdivide" className="checkbox-div">
          Subdivide
          <input
            type="checkbox"
            name="subdivide"
            checked={subdivide > 1 || showSubdivideMenu}
            onChange={toggleMenu}
          />
        </label>
      </div>
      <div className={showSubdivideMenu ? "" : "hidden"}>
        <label htmlFor="subdivision">
          Subdivide Rhythm:
          <select
            id="subdivision"
            value={subdivide}
            onChange={(e) => setSubdivide(parseInt(e.target.value))}
          >
            <option value="1">Select Rhythm</option>
            <option value="2">2: 8th Notes</option>
            <option value="3">3: Triplets</option>
            <option value="4">4: 16th Notes</option>
            <option value="5">5: Quintuples</option>
            <option value="6">6: Sextuples</option>
            <option value="7">7: Septuples</option>
            <option value="8">8: 32nd notes</option>
          </select>
        </label>
        <label htmlFor="main-beat" className="checkbox-div">
          Main beat
          <input
            type="checkbox"
            name="main-beat"
            defaultChecked={mainBeat}
            onChange={toggleMainBeat}
          />
        </label>
      </div>
    </div>
  );
}

export default ChangeMeter;
