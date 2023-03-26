import React, { useEffect, useContext, useCallback, useRef } from "react";

import "../styles/Metronome.css";

import UserBar from "./UserBar";
import TempoControls from "./TempoControls";

import RhythmSettings from "./Metronome/RhythmSettings";
import ToneSelector from "./Metronome/ToneSelector";
import PracticeSettings from "./Metronome/PracticeSettings";
import PlaybackBar from "./PlaybackBar";

import { AppContext } from "../contexts/AppContext";
import { UserContext } from "../contexts/UserContext";

function Metronome({ savedState, isChanging }) {
  const {
    bpm,
    setBpm,
    isPlaying,
    setIsPlaying,
    isStopping,
    timerId,
    setTimerId,
    timeSignature,
    setTimeSignature,
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
    title,
    setTitle,
    createMetQueryUrl,
    loaded,
    setLoaded,
  } = useContext(AppContext);

  const {
    saveNewMetronome,
    saveUpdateMetronome,
    userMetronomes,
    loadMetronome,
    deleteMetronome,
  } = useContext(UserContext);

  const restart = () => {
    if (isPlaying) {
      isStopping.current = true;
      clearInterval(timerId);

      setIsPlaying(false);
      setTimerId(null);
    }
    startClick();
  };

  // Memoize the startStop function with useCallback
  const startStop = useCallback(() => {
    if (isChanging.current) return;
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
  }, [
    isPlaying,
    timerId,
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
    bpm,
    isChanging,
  ]);

  // Adds start/stop with space bar press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 32 && document.activeElement.nodeName !== "INPUT") {
        // Space key
        startStop();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [startStop]);

  // restarts on change if playing
  useEffect(() => {
    if (!isChanging.current && isPlaying && !loaded) {
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

  // restarts on load if playing
  useEffect(() => {
    if (isPlaying && loaded) {
      restart();
    }
    if (loaded) {
      setLoaded(false);
    }
  }, [loaded]);

  // saves the shared bpm and time signature when changing to dm
  useEffect(() => {
    if (isChanging.current) {
      if (
        savedState.current.bpm !== undefined ||
        savedState.current.bpm !== null
      ) {
        setBpm(savedState.current.bpm);
        setTimeSignature(savedState.current.timeSignature);
      }
      isChanging.current = false;
    }
    return () => {
      if (isChanging.current) {
        savedState.current = Object.assign({}, savedState.current, {
          bpm,
          timeSignature,
        });
      }
    };
  }, [bpm, timeSignature]);

  return (
    <div className="metronome-body">
      <UserBar
        view={"Metronome"}
        saveNew={saveNewMetronome}
        saveUpdate={saveUpdateMetronome}
        data={userMetronomes}
        loadFunc={loadMetronome}
        title={title}
        setTitle={setTitle}
        createUrlFunc={createMetQueryUrl}
        deleteFunc={deleteMetronome}
      />
      <h2>Metronome</h2>
      <div id="sections">
        <div id="left-col">
          <TempoControls startStop={startStop} />
          <ToneSelector />
        </div>
        <RhythmSettings />
      </div>
      <PracticeSettings />
      <PlaybackBar startStop={startStop} />
    </div>
  );
}

export default Metronome;
