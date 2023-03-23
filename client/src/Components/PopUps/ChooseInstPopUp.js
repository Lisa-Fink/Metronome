import React, { useContext, useState, useEffect } from "react";
import "../../styles/PopUp.css";

import { AiOutlineClose } from "react-icons/ai";
import { GoChevronRight, GoChevronDown } from "react-icons/go";
import { AppContext } from "../../contexts/AppContext";

function ChooseInstPopUp({
  instArr,
  setInstArr,
  instrumentIdx,
  setIsChooseInstOpen,
}) {
  const { getInstrumentList, playSample, volumeRef } = useContext(AppContext);
  const instrumentData = getInstrumentList(true);
  const [viewInstrument, setViewInstrument] = useState(
    Array.from({ length: instrumentData.length }, () => false)
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        // Escape key
        setIsChooseInstOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsChooseInstOpen]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }

    setIsChooseInstOpen(false);
  };

  const handleListen = (instrument, idx) => {
    // replace with playSample(instrument, idx) from context->audioUtils
    playSample(instrument, idx, volumeRef.current);
  };

  const chooseInstrument = (name, description, beatIdx) => {
    const newInstArr = [...instArr];
    newInstArr[instrumentIdx] = [name, description, beatIdx];
    setInstArr(newInstArr);
    setIsChooseInstOpen(false);
  };

  const toggleInstView = (idx) => {
    const newView = [...viewInstrument];
    newView[idx] = !newView[idx];
    setViewInstrument(newView);
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up-inst">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Choose an Instrument</h2>
        <div className="inst-list">
          {instrumentData.map((inst, instIdx) => (
            <div key={inst}>
              <h3>
                {!viewInstrument[instIdx] ? (
                  <GoChevronRight onClick={() => toggleInstView(instIdx)} />
                ) : (
                  <GoChevronDown onClick={() => toggleInstView(instIdx)} />
                )}
                {inst[0]}
              </h3>
              <div
                id="instrument-data"
                className={!viewInstrument[instIdx] ? "hidden" : ""}
              >
                {inst[1].map((desc, i) => (
                  <ul className="instrument-descriptions" key={`${desc}-${i}`}>
                    <li>
                      <div>{desc}</div>
                      <button onClick={() => handleListen(inst[0], i)}>
                        Listen
                      </button>
                      <button
                        onClick={() => chooseInstrument(inst[0], desc, i)}
                      >
                        Choose
                      </button>
                    </li>
                  </ul>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChooseInstPopUp;
