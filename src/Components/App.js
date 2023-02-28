import React from "react";
import Metronome from "./Metronome";
import Heading from "./Heading";
import "../styles/App.css";

function App() {
  return (
    <div className="App">
      <Heading />
      <main>
        <Metronome />
      </main>
    </div>
  );
}

export default App;
