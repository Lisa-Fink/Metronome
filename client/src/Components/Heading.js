import React, { useState, useEffect, useContext } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMusicalNotesOutline } from "react-icons/io5";
import "../styles/Header.css";
import LoginPopUp from "./PopUps/LoginPopUp";
import SignUpPopup from "./PopUps/SignUpPopUp";
import { UserContext } from "../contexts/UserContext";
import { AppContext } from "../contexts/AppContext";

function Heading({ view, setView, isChanging }) {
  const { lightMode, setLightMode } = useContext(AppContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const { signOutUser, user } = useContext(UserContext);

  useEffect(() => {
    if (lightMode === true) {
      toggleColorScheme("light-mode");
    } else {
      toggleColorScheme("dark-mode");
    }
  }, [lightMode]);

  const toggleLightMode = () => {
    setLightMode(!lightMode);
  };

  const toggleColorScheme = (scheme) => {
    document.documentElement.classList.remove("dark-mode", "light-mode");
    document.documentElement.classList.add(scheme);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpOpen(true);
  };

  const handleSwitchSignUp = () => {
    setIsSignUpOpen(true);
    setIsLoginOpen(false);
  };

  const handleSwitchLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const handleRhythmClick = () => {
    isChanging.current = true;
    setView("rhythm");
  };

  const handleMetronomeClick = () => {
    isChanging.current = true;
    setView("metronome");
  };

  return (
    <div id="heading-container">
      <header>
        <h1>
          My Rhythm Player <IoMusicalNotesOutline />
        </h1>
      </header>
      <div id="heading-right">
        <nav>
          <div id="change-view">
            {view === "metronome" ? (
              <button className="type" onClick={handleRhythmClick}>
                Rhythm Machine
              </button>
            ) : (
              <button className="type" onClick={handleMetronomeClick}>
                Metronome
              </button>
            )}
          </div>
          {user ? (
            <div id="user-div">
              <div id="settings">
                <IoSettingsOutline />
              </div>
              <div id="sign-out">
                <button onClick={signOutUser}>Sign Out</button>
              </div>
            </div>
          ) : (
            <>
              <div id="login">
                <button onClick={handleLoginClick}>Login</button>
              </div>
              <div id="sign-up">
                <button onClick={handleSignUpClick}>Sign Up</button>
              </div>
            </>
          )}
        </nav>
        <div id="light-mode" onClick={toggleLightMode}>
          {lightMode ? (
            <MdOutlineDarkMode onClick={toggleLightMode} />
          ) : (
            <MdOutlineLightMode onClick={toggleLightMode} />
          )}
        </div>
      </div>
      {isLoginOpen && (
        <LoginPopUp
          setIsLoginOpen={setIsLoginOpen}
          handleSwitchSignUp={handleSwitchSignUp}
        />
      )}
      {isSignUpOpen && (
        <SignUpPopup
          setIsSignUpOpen={setIsSignUpOpen}
          handleSwitchLogin={handleSwitchLogin}
        />
      )}
    </div>
  );
}

export default Heading;
