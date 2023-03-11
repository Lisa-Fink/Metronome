import React, { useState, useEffect } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMusicalNotesOutline } from "react-icons/io5";
import "../styles/Header.css";
import LoginPopUp from "./LoginPopUp";
import SignUpPopup from "./SignUpPopUp";
import { getAuth, signOut } from "firebase/auth";

function Heading({ user, setUser, view, setView, isChanging }) {
  const [lightMode, setLightMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

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

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setUser(undefined);
      })
      .catch((error) => {
        // An error happened.
        console.error(error);
      });
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
                <button onClick={handleSignOut}>Sign Out</button>
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
          user={user}
          setUser={setUser}
        />
      )}
      {isSignUpOpen && (
        <SignUpPopup
          setIsSignUpOpen={setIsSignUpOpen}
          handleSwitchLogin={handleSwitchLogin}
          user={user}
          setUser={setUser}
        />
      )}
    </div>
  );
}

export default Heading;
