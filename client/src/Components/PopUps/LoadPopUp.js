import React, { useEffect, useState } from "react";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { MdOutlineDeleteForever } from "react-icons/md";

function LoadPopUp({ data, loadFunc, deleteFunc, type, setUserPopUp }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleConfirmDel = async (i) => {
    try {
      await deleteFunc(i);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setShowConfirm(false);
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Load {type}</h2>
        <div className={errorMessage ? "error-div" : "hidden"}>
          {errorMessage}
        </div>
        <div className="load-container">
          {data.length === 0 && "0 items saved."}
          {data.map((obj, i) => (
            <div key={i} className="load-items-container">
              <div className="load-items">
                {obj.title}
                <div className="input-div">
                  <button onClick={() => handleLoad(i)}>Load</button>
                  <MdOutlineDeleteForever onClick={() => setShowConfirm(i)} />
                </div>
              </div>
              <div className={showConfirm === i ? "confirm-delete" : "hidden"}>
                Confirm Delete{" "}
                <AiOutlineCheckCircle onClick={() => handleConfirmDel(i)} />
                <AiOutlineCloseCircle onClick={() => setShowConfirm(false)} />
              </div>
            </div>
          ))}
        </div>
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
