import React, { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

function LoadPopUp({ data, loadFunc, type, setUserPopUp }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        // Escape key
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setUserPopUp]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }

    setUserPopUp(false);
  };

  const handleLoad = (index) => {
    loadFunc(index);
    handleClose();
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Load {type}</h2>
        {data.length === 0 && "0 items saved."}
        {data.map((obj, i) => (
          <div key={i} className="load-items">
            {obj.title}
            <button onClick={() => handleLoad(i)}>Load</button>
          </div>
        ))}
        <div className="button-div center">
          <button className="type" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoadPopUp;
