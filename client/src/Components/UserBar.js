import React, { useContext, useRef, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import "../styles/UserBar.css";
import LoadPopUp from "./LoadPopUp";
import SavePopUp from "./SavePopUp";
import { AiOutlineShareAlt } from "react-icons/ai";

function UserBar({
  view,
  saveNew,
  saveUpdate,
  loadFunc,
  data,
  isTyping,
  title,
  setTitle,
  createUrlFunc,
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(UserContext);

  const [userPopUp, setUserPopUp] = useState(false);

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
    setErrorMessage("Login/SignUp Required");
  };

  const bar = (
    <nav className="user-nav">
      <div>{title ? title : ""}</div>
      <div className="error">{errorMessage}</div>
      <div className="user-buttons">
        <button className="type" onClick={handleLoadClick}>
          Load
        </button>
        <button className="type" onClick={handleSaveClick}>
          Save
        </button>
        <button className="type" onClick={handleSaveAsClick}>
          Save As
        </button>
        <AiOutlineShareAlt
          onClick={() => {
            console.log(createUrlFunc());
          }}
        />
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
