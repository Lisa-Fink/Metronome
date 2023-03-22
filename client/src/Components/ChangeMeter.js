import React, { useEffect, useState, useContext } from "react";
import { GoChevronRight, GoChevronDown } from "react-icons/go";
import { AppContext } from "../contexts/AppContext";

function ChangeMeter() {
  const {
    timeSignature,
    setTimeSignature,
    downBeat,
    setDownBeat,
    subdivide,
    setSubdivide,
    mainBeat,
    setMainBeat,
    toneCategory,
  } = useContext(AppContext);

  const [viewRhythm, setViewRhythm] = useState(false);
  const [showSubdivideMenu, setShowSubdivideMenu] = useState(subdivide > 1);

  useEffect(() => {
    if ((!subdivide || subdivide < 2) && showSubdivideMenu) {
      setShowSubdivideMenu(false);
    }
    if (subdivide > 1 && !showSubdivideMenu) {
      setShowSubdivideMenu(true);
    }
  }, [subdivide]);

  // TODO: remove showSubDivide variable
  const toggleMenu = () => {
    setShowSubdivideMenu(!showSubdivideMenu);
  };

  const toggleMainBeat = () => {
    setMainBeat(!mainBeat);
  };

  const toggleRhythmView = () => {
    setViewRhythm(!viewRhythm);
  };
  return (
    <div id="change-meter">
      <h3>
        {viewRhythm ? (
          <GoChevronDown onClick={toggleRhythmView} />
        ) : (
          <GoChevronRight onClick={toggleRhythmView} />
        )}{" "}
        Rhythm Settings
      </h3>
      <div className={viewRhythm ? "indented-child" : "hidden"}>
        <label htmlFor="time-signature">
          Beats Per Measure
          <select
            id="time-signature"
            value={timeSignature}
            onChange={(e) => setTimeSignature(parseInt(e.target.value))}
          >
            <optgroup>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="9">9</option>
            </optgroup>
          </select>
        </label>
        <div>
          <label
            htmlFor="down-beat"
            className={
              toneCategory === "Spoken Counts" ? "hidden" : "checkbox-div"
            }
          >
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
              checked={showSubdivideMenu}
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
          <label
            htmlFor="main-beat"
            className={
              toneCategory === "Spoken Counts" ? "hidden" : "checkbox-div"
            }
          >
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
    </div>
  );
}

export default ChangeMeter;
