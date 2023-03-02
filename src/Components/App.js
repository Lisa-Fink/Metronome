import React from "react";
import Metronome from "./Metronome";
import Heading from "./Heading";
import "../styles/App.css";
import DrumMachine from "./DrumMachine";
import { AppProvider } from "../contexts/AppContext";

function App() {
  return (
    <div className="App">
      <Heading />
      <main>
        <AppProvider>
          <Metronome />
          {/* <DrumMachine /> */}
        </AppProvider>
      </main>
    </div>
  );
}

export default App;
