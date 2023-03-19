import React, { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../contexts/AppContext";
import { UserContext } from "../contexts/UserContext";
import "../styles/UserBar.css";
import LoadPopUp from "./LoadPopUp";
import SavePopUp from "./SavePopUp";

function UserBar({ view, saveNew, saveUpdate, loadFunc, data, isTyping }) {
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(UserContext);
  const { title, setTitle } = useContext(AppContext);

  const [userPopUp, setUserPopUp] = useState(false);

  const loggedOutBar = <nav></nav>;

  useEffect(() => {
    // Error message disappears after 5 seconds
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  }, [errorMessage]);

  const handleLoadClick = () => {
    if (user) {
      setUserPopUp("load");
    } else {
      handleNonUser();
    }
  };

  const handleSaveClick = () => {
    // already saved
    if (user && title) {
      saveUpdate(setErrorMessage);
    } else if (user) {
      handleSaveAsClick();
    } else {
      handleNonUser();
    }
  };

  const handleSaveAsClick = () => {
    if (user) {
      setUserPopUp("save");
    } else {
      handleNonUser();
    }
  };

  const handleNonUser = () => {
    setErrorMessage("Login/SignUp to Save");
  };

  const bar = (
    <nav className="user-nav">
      <div>{title ? title : ""}</div>
      <div className="error">{errorMessage}</div>
      <div>
        <button className="type" onClick={handleLoadClick}>
          Load
        </button>
        <button className="type" onClick={handleSaveClick}>
          Save
        </button>
        <button className="type" onClick={handleSaveAsClick}>
          Save As
        </button>
      </div>
      {userPopUp === "save" && (
        <SavePopUp
          title={title}
          setTitle={setTitle}
          setUserPopUp={setUserPopUp}
          setError={setErrorMessage}
          saveFunc={saveNew}
          isTyping={isTyping}
        />
      )}
      {userPopUp === "load" && (
        <LoadPopUp
          type={view}
          loadFunc={loadFunc}
          data={data}
          setUserPopUp={setUserPopUp}
        />
      )}
    </nav>
  );

  return bar;
}

export default UserBar;
