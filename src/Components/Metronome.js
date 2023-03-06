import React, { useEffect, useContext, useCallback } from "react";
import "../styles/Metronome.css";
import ChangeMeter from "./ChangeMeter";
import TempoControls from "./TempoControls";
import ToneSelector from "./ToneSelector";

import Practice from "./Practice";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";

function Metronome() {
  const {
    setBpm,
    bpmRef,
    isPlaying,
    setIsPlaying,
    isStopping,
    timerId,
    setTimerId,
    timeSignature,
    downBeat,
    subdivide,
    mainBeat,
    key,
    tone,
    countIn,
    numMeasures,
    repeat,
    tempoInc,
    tempoPractice,
    sectionPractice,
    startClick,
    stopClick,
  } = useContext(AppContext);

  // updates to new selected time signature
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [
    timeSignature,
    downBeat,
    tone,
    key,
    subdivide,
    mainBeat,
    countIn,
    sectionPractice,
    numMeasures,
    repeat,
    tempoInc,
    tempoPractice,
  ]);

  // TODO when changing view to drum machine or back to metronome, store current state that may get
  // changed as a ref, and restore it on rerender. (timeSignature)

  const restart = () => {
    if (isPlaying) {
      isStopping.current = true;
      clearInterval(timerId);

      setIsPlaying(false);
      setTimerId(null);
      setBpm(bpmRef.current);
    }

    startClick();
  };

  // Memoize the startStop function with useCallback
  const startStop = useCallback(() => {
    if (isPlaying) {
      // stopping
      stopClick();
    } else {
      // Stops playing incase there is an interval running
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      startClick();
    }
  }, [isPlaying, timerId]);

  // Adds start/stop with space bar press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 32) {
        // Space key
        startStop();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [startStop]);

  return (
    <div className="metronome-body">
      <h2>Metronome</h2>
      <div id="sections">
        <div id="left-col">
          <TempoControls startStop={startStop} />
          <ToneSelector />
        </div>
        <ChangeMeter />
      </div>
      <Practice />
      <BottomControls startStop={startStop} />
    </div>
  );
}

export default Metronome;
