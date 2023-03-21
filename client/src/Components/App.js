import React, { useState, useRef } from "react";
import Metronome from "./Metronome";
import Heading from "./Heading";
import "../styles/App.css";
import DrumMachine from "./DrumMachine";
import { AppProvider } from "../contexts/AppContext";
import { UserProvider } from "../contexts/UserContext";
import { BrowserRouter } from "react-router-dom";

function App() {
  const [view, setView] = useState("metronome");

  const savedMetState = useRef({ bpm: undefined, timeSignature: undefined });
  const savedDMState = useRef({ bpm: undefined, timeSignature: undefined });
  const isChanging = useRef(false);

  return (
    <div className="App">
      <BrowserRouter>
        <AppProvider>
          <UserProvider>
            <Heading view={view} setView={setView} isChanging={isChanging} />
            <main>
              {view === "metronome" ? (
                <Metronome savedState={savedMetState} isChanging={isChanging} />
              ) : (
                <DrumMachine
                  savedState={savedDMState}
                  isChanging={isChanging}
                />
              )}
            </main>
          </UserProvider>
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
