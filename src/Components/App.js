import React, { useState, useEffect } from "react";
import Metronome from "./Metronome";
import "../styles/App.css";
import { MdOutlineLightMode } from "react-icons/md";

function App() {
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
    <div className="App">
      <header>
        <MdOutlineLightMode onClick={toggleLightMode} />
      </header>
      <main>
        <Metronome />
      </main>
    </div>
  );
}

export default App;
