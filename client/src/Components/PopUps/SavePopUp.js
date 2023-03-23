import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

function SavePopUp({
  title,
  setTitle,
  setUserPopUp,
  saveFunc,
  setError,
  isTyping,
}) {
  const [newTitle, setNewTitle] = useState("");

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

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const old = title;
    // Note: toLocaleString() can vary in formatting, but works for the purpose of a default title.
    const dateString = new Date().toLocaleString();
    const savedTitle = newTitle == "" ? `Untitled ${dateString}` : newTitle;
    setTitle(savedTitle);
    try {
      await saveFunc(savedTitle);
    } catch (error) {
      setError(error.message);
      setTitle(old);
    }
    setUserPopUp(false);
  };

  return (
    <div className="pop-up-container">
      <div className="pop-up">
        <div id="x-container">
          <AiOutlineClose id="x-icon" onClick={handleClose} />
        </div>
        <h2>Save</h2>
        <form onSubmit={handleSave}>
          <label>
            Title
            <div className="input-div">
              <input
                value={newTitle}
                onChange={handleTitleChange}
                placeholder="Title"
                onFocus={() => (isTyping.current = true)}
                onBlur={() => (isTyping.current = false)}
              />
            </div>
          </label>
          <div className="button-div">
            <button type="submit">Save</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SavePopUp;
