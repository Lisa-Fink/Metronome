import React, { useState, useEffect } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { IoMusicalNotesOutline } from "react-icons/io5";
import "../styles/Header.css";

function Heading() {
  const [lightMode, setLightMode] = useState(false);

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
  return (
    <header>
      <div className="heading-div">
        <h1>
          My Custom Metronome <IoMusicalNotesOutline />
        </h1>
        <div id="light-mode">
          {lightMode ? (
            <MdOutlineDarkMode onClick={toggleLightMode} />
          ) : (
            <MdOutlineLightMode onClick={toggleLightMode} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Heading;
