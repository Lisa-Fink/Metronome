import React, { useState, useEffect, useContext } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMusicalNotesOutline } from "react-icons/io5";
import "../styles/Header.css";
import LoginPopUp from "./PopUps/LoginPopUp";
import SignUpPopup from "./PopUps/SignUpPopUp";
import UserAccountPopup from "./PopUps/UserAccountPopUp";
import { UserContext } from "../contexts/UserContext";
import { AppContext } from "../contexts/AppContext";

function Heading({ view, setView, isChanging }) {
  const { lightMode, setLightMode } = useContext(AppContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const { signOutUser, isLoggedIn, saveLightModeSetting } =
    useContext(UserContext);

  useEffect(() => {
    if (lightMode === true) {
      toggleColorScheme("light-mode");
    } else {
      toggleColorScheme("dark-mode");
    }
  }, [lightMode]);

  const toggleLightMode = () => {
    if (isLoggedIn) {
      saveLightModeSetting(!lightMode);
    }
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

  const handleSettingsClick = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(false);
    setIsAccountOpen(true);
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
                Drum Machine
              </button>
            ) : (
              <button className="type" onClick={handleMetronomeClick}>
                Metronome
              </button>
            )}
          </div>
          {isLoggedIn ? (
            <div id="user-div">
              <div id="settings" onClick={handleSettingsClick}>
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
      {isAccountOpen && (
        <UserAccountPopup setIsAccountOpen={setIsAccountOpen} />
      )}
    </div>
  );
}

export default Heading;
