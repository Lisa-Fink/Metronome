import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

function SavePopUp({ title, setTitle, setUserPopUp, saveFunc, setError }) {
  const [newTitle, setNewTitle] = useState("");

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
    const savedTitle = newTitle == "" ? `Untitled ${new Date()}` : newTitle;
    setTitle(savedTitle);
    try {
      await saveFunc(savedTitle);
    } catch (error) {
      console.log(error);

      setError("Error Saving Metronome");
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
