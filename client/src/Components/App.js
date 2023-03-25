import React, { useState, useRef } from "react";
import Heading from "./Heading";
import "../styles/App.css";
import ViewHandler from "./ViewHandler";
import { AppProvider } from "../contexts/AppContext";
import { UserProvider } from "../contexts/UserContext";
import { BrowserRouter } from "react-router-dom";

function App() {
  const [view, setView] = useState("metronome");
  const isChanging = useRef(false);

  return (
    <div className="App">
      <AppProvider>
        <UserProvider>
          <Heading view={view} setView={setView} isChanging={isChanging} />
          <main>
            <BrowserRouter>
              <ViewHandler
                view={view}
                setView={setView}
                isChanging={isChanging}
              />
            </BrowserRouter>
          </main>
        </UserProvider>
      </AppProvider>
    </div>
  );
}

export default App;
