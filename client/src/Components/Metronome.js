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
    bpmRef,
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
  } = useContext(AppContext);

  const {
    saveNewMetronome,
    saveUpdateMetronome,
    userMetronomes,
    loadMetronome,
    deleteMetronome,
  } = useContext(UserContext);

  const isTyping = useRef(false);

  const restart = () => {
    if (isPlaying) {
      isStopping.current = true;
      clearInterval(timerId);

      setIsPlaying(false);
      setTimerId(null);
      if (tempoPractice) {
        setBpm(bpmRef.current);
      }
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
      if (event.keyCode === 32 && !isTyping.current) {
        // Space key
        startStop();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [startStop]);

  // updates to new selected time signature
  useEffect(() => {
    if (!isChanging.current && isPlaying) {
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
    bpm,
  ]);

  useEffect(() => {
    if (isChanging.current) {
      if (savedState.current.bpm !== undefined) {
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
        isTyping={isTyping}
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
