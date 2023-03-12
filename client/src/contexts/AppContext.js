import React, { createContext, useState, useRef } from "react";
import createAudioUtils from "../utils/audioUtils.js";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [bpm, setBpm] = useState(120);
  const bpmRef = useRef(bpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const isStopping = useRef(false);
  const [volume, setVolume] = useState(0.16);
  const volumeRef = useRef(volume); // updates in realtime during playback
  const [timerId, setTimerId] = useState(null);

  const [timeSignature, setTimeSignature] = useState(4);
  const [downBeat, setDownBeat] = useState(false);
  const [subdivide, setSubdivide] = useState(1);
  const [mainBeat, setMainBeat] = useState(false);

  const [key, setKey] = useState(261.63);
  const [tone, setTone] = useState("Wood Block");

  const paused = useRef(false);
  const [toneCategory, setToneCategory] = useState("Percussion");

  // Practice settings
  const [countIn, setCountIn] = useState(0);
  const [numMeasures, setNumMeasures] = useState(4);
  const [repeat, setRepeat] = useState(5);
  const [tempoInc, setTempoInc] = useState(5);
  const [sectionPractice, setSectionPractice] = useState(false);
  const [tempoPractice, setTempoPractice] = useState(false);

  const {
    startClick,
    stopClick,
    getInstrumentList,
    playSample,
    startDrumMachine,
    stopDrumMachine,
  } = createAudioUtils(
    bpm,
    downBeat,
    setIsPlaying,
    key,
    mainBeat,
    setTimerId,
    subdivide,
    timeSignature,
    tone,
    volumeRef,
    toneCategory,
    timerId,
    countIn,
    numMeasures,
    repeat,
    tempoInc,
    sectionPractice,
    tempoPractice,
    setBpm,
    bpmRef,
    isStopping
  );

  const metronomeLoad = (data) => {
    const {
      bpm,
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
      sectionPractice,
      tempoPractice,
    } = data;
    setBpm(bpm);
    setTimeSignature(timeSignature);
    setDownBeat(downBeat);
    setSubdivide(subdivide);
    setMainBeat(mainBeat);
    setKey(key);
    setTone(tone);
    setCountIn(countIn);
    setNumMeasures(numMeasures);
    setRepeat(repeat);
    setTempoInc(tempoInc);
    setSectionPractice(sectionPractice);
    setTempoPractice(tempoPractice);
  };

  const contextValue = {
    metronomeLoad,
    bpm,
    setBpm,
    bpmRef,
    isPlaying,
    setIsPlaying,
    isStopping,
    volume,
    setVolume,
    volumeRef,
    timerId,
    setTimerId,
    timeSignature,
    setTimeSignature,
    downBeat,
    setDownBeat,
    subdivide,
    setSubdivide,
    mainBeat,
    setMainBeat,
    key,
    setKey,
    tone,
    setTone,
    paused,
    toneCategory,
    setToneCategory,
    countIn,
    setCountIn,
    numMeasures,
    setNumMeasures,
    repeat,
    setRepeat,
    tempoInc,
    setTempoInc,
    sectionPractice,
    setSectionPractice,
    tempoPractice,
    setTempoPractice,
    startClick,
    stopClick,
    getInstrumentList,
    playSample,
    startDrumMachine,
    stopDrumMachine,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
