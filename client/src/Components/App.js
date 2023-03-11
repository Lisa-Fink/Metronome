import React, { useState, useRef } from "react";
import Metronome from "./Metronome";
import Heading from "./Heading";
import "../styles/App.css";
import DrumMachine from "./DrumMachine";
import { AppProvider } from "../contexts/AppContext";

function App() {
  const [user, setUser] = useState(undefined);
  const [view, setView] = useState("metronome");

  const savedMetState = useRef({ bpm: undefined, timeSignature: undefined });
  const savedDMState = useRef({ bpm: undefined, timeSignature: undefined });
  const isChanging = useRef(false);

  return (
    <div className="App">
      <Heading
        user={user}
        setUser={setUser}
        view={view}
        setView={setView}
        isChanging={isChanging}
      />
      <main>
        <AppProvider>
          {view === "metronome" ? (
            <Metronome savedState={savedMetState} isChanging={isChanging} />
          ) : (
            <DrumMachine savedState={savedDMState} isChanging={isChanging} />
          )}
        </AppProvider>
      </main>
    </div>
  );
}

export default App;
