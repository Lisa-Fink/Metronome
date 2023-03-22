import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import DrumMachine from "./DrumMachine";
import Metronome from "./Metronome";

function Load({ view, setView, isChanging }) {
  const curLocation = useLocation();
  const { loadFromQueryUrl } = useContext(AppContext);

  // data for url query params
  const [location, setLocation] = useState("");

  const savedMetState = useRef({ bpm: 120, timeSignature: 4 });
  const savedDMState = useRef({ bpm: 120, timeSignature: 4 });

  useEffect(() => {
    if (location !== "") return;
    const newLocation = curLocation.search;
    // no url params
    if (!newLocation) {
      setLocation("/");
      return;
    }
    if (newLocation) {
      const params = new URLSearchParams(newLocation);
      setLocation(newLocation);
      loadFromQueryUrl(params);
      if (params.get("view") == "dm") {
        setView("rhythm");
      }
    }
  }, []);

  return view === "metronome" ? (
    <Metronome savedState={savedMetState} isChanging={isChanging} />
  ) : (
    <DrumMachine savedState={savedDMState} isChanging={isChanging} />
  );
}

export default Load;
