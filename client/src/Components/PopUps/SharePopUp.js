import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

function SharePopUp({ url, setSharePopUp }) {
  const [copied, setCopied] = useState(false);

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
  }, [setSharePopUp]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }

    setSharePopUp(false);
  };

  const handleCopy = () => {
    copyToClipboard(url);
    setCopied(true);
  };

  const copyToClipboard = (text) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Share</h2>
        <div className="share-div">
          <div id="share-url">{url}</div>
          <button onClick={handleCopy}>Copy</button>
        </div>
        <div className={copied ? "success" : "hidden"}>Copied to clipboard</div>
        <div className="button-div">
          <button className="type" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharePopUp;
