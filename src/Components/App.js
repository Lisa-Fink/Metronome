import React, { useState } from "react";
import Metronome from "./Metronome";
import Heading from "./Heading";
import "../styles/App.css";
import DrumMachine from "./DrumMachine";
import { AppProvider } from "../contexts/AppContext";

function App() {
  const [user, setUser] = useState(undefined);
  const [view, setView] = useState("metronome");

  return (
    <div className="App">
      <Heading user={user} setUser={setUser} view={view} setView={setView} />
      <main>
        <AppProvider>
          {view === "metronome" ? <Metronome /> : <DrumMachine />}
        </AppProvider>
      </main>
    </div>
  );
}

export default App;
