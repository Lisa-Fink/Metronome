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

  const [lightMode, setLightMode] = useState(false);

  const [title, setTitle] = useState("");

  // Drum Machine Settings
  const NUM_CELLS_PER_BEAT = 12;
  const MAX_INSTRUMENTS = 4;

  const [measures, setMeasures] = useState(1);
  const [dMTitle, setDMTitle] = useState("");
  // ui data about note lengths "first" "middle" "last"
  const [rhythmGrid, setRhythmGrid] = useState(
    Array.from({ length: MAX_INSTRUMENTS }, () =>
      Array(NUM_CELLS_PER_BEAT * timeSignature * measures).fill(false)
    )
  );
  // Instrument [name, descriptive name, index]
  const [instruments, setInstruments] = useState(
    Array.from({ length: MAX_INSTRUMENTS }, () => Array(3).fill(undefined))
  );
  // audio data about when to start notes 1=start 0=not start
  const rhythmSequence = useRef(
    Array.from({ length: MAX_INSTRUMENTS }, () =>
      Array(NUM_CELLS_PER_BEAT * timeSignature * measures).fill(0)
    )
  );

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

  const loadMetronomeData = (data) => {
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
      title,
      _id,
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
    setTitle(title);
  };

  const loadDMData = (data) => {
    const {
      bpm,
      timeSignature,
      measures,
      instruments,
      rhythmSequence,
      rhythmGrid,
      title,
    } = data;
    setBpm(bpm);
    setTimeSignature(timeSignature);
    setMeasures(measures);
    setInstruments(instruments);
    updateRS(rhythmSequence);
    setRhythmGrid(rhythmGrid);
    setDMTitle(title);
  };

  const updateRS = (newRS) => {
    rhythmSequence.current = newRS;
  };

  const createQueryUrl = (type) => {
    if (type === "m") {
      return createMetQueryUrl();
    }
    return createDMQueryUrl();
  };

  const createDMQueryUrl = () => {
    const query = new URLSearchParams();
    query.append("view", "dm");
    if (bpm !== 120) {
      query.append("bpm", bpm);
    }

    if (timeSignature !== 4) {
      query.append("timeSignature", timeSignature);
    }

    if (measures !== 1) {
      query.append("numMeasures", measures);
    }

    for (let i = 0; i < instruments.length; i++) {
      if (instruments[i][0]) {
        if (instruments[i][2] != null) {
          query.append(`instrument${i}`, instruments[i][2]);
          if (rhythmSequence[i] && rhythmSequence[i].length > 0) {
            query.append(`rhythmSequence${i}`, rhythmSequence[i].join(""));
          }
        }
      }
      return query;
    }
  };

  const createMetQueryUrl = () => {
    const query = new URLSearchParams();
    query.append("view", "met");

    if (bpm !== 120) {
      query.append("bpm", bpm);
    }

    if (timeSignature !== 4) {
      query.append("timeSignature", timeSignature);
    }

    if (downBeat !== false) {
      query.append("downBeat", downBeat);
    }

    if (subdivide > 1) {
      query.append("subdivide", subdivide);
      if (mainBeat !== false) {
        query.append("mainBeat", mainBeat);
      }
    }

    if (tone !== "Wood Block") {
      query.append("tone", tone);
    }

    if (tone === "Generic Beep" || tone === "Synth Flute") {
      if (key !== 261.63) {
        query.append("key", key);
      }
    }

    if (countIn !== 0) {
      query.append("countIn", countIn);
    }

    if (sectionPractice) {
      query.append("sectionPractice", sectionPractice);
      if (numMeasures !== 4) {
        query.append("numMeasures", numMeasures);
      }

      if (repeat !== 5) {
        query.append("repeat", repeat);
      }
      if (tempoPractice) {
        query.append("tempoPractice", tempoPractice);

        if (tempoInc !== 5) {
          query.append("tempoInc", tempoInc);
        }
      }
    }
    return "/?" + query.toString();
  };

  const loadFromQueryUrl = (queryParams) => {
    if (queryParams.get("view") === "met") {
      loadMetFromQueryUrl(queryParams);
    } else if (queryParams.get("view" === "dm")) {
      loadDMFromQueryUrl(queryParams);
    }
  };

  const loadDMFromQueryUrl = (searchParams) => {
    for (const [param, value] of searchParams.entries()) {
      if (param === "bpm") {
        setBpm(parseInt(value));
      } else if (param === "timeSignature") {
        setTimeSignature(parseInt(value));
      } else if (param === "downBeat") {
        setDownBeat(value);
      } else if (param === "subdivide") {
        setSubdivide(value);
      } else if (param === "mainBeat") {
        setMainBeat(value);
      }
    }

    const newInstruments = [...instruments];
    // check for instruments
    const instParams = [
      searchParams.instrument0,
      searchParams.instrument1,
      searchParams.instrument2,
      searchParams.instrument3,
    ];

    if (instParams[0]) {
    }
  };

  const loadMetFromQueryUrl = (searchParams) => {
    for (const [param, value] of searchParams.entries()) {
      if (param === "bpm") {
        const converted = parseInt(value);
        if (converted >= 40 && converted < 240) {
          setBpm(parseInt(converted));
        }
      } else if (param === "timeSignature") {
        const converted = parseInt(value);
        if (converted >= 2 && converted !== 8 && converted < 9) {
          setTimeSignature(parseInt(converted));
        }
      } else if (param === "subdivide") {
        const converted = parseInt(value);
        if (converted >= 2 && converted <= 8) {
          setSubdivide(converted);
        }
      } else if (param === "mainBeat") {
        if (typeof value === Boolean) {
          setMainBeat(value);
        }
      } else if (param === "key") {
        // TODO: check if exact match
        setKey(parseFloat(value));
      } else if (param === "tone") {
        setTone(value);
        // TODO: refactor map function
        // map to toneCategory
        if (value === "femaleNumbers") {
          setToneCategory("Spoken Counts");
        } else if (value === "Drum Set") {
          setToneCategory("Drum Sets");
        } else if (value === "Generic Beep" || value === "Synth Flute") {
          setToneCategory("Basic Tones");
        }
        // TODO finish validation
      } else if (param === "countIn") {
        setCountIn(parseInt(value));
      } else if (param === "numMeasures") {
        setNumMeasures(parseInt(value));
      } else if (param === "repeat") {
        setRepeat(parseInt(value));
      } else if (param === "tempoInc") {
        setTempoInc(parseInt(value));
      } else if (param === "sectionPractice") {
        setSectionPractice(value);
      } else if (param === "tempoPractice") {
        setTempoPractice(value);
      }
    }
  };

  const contextValue = {
    metronomeLoad: loadMetronomeData,
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
    lightMode,
    setLightMode,
    title,
    setTitle,
    loadMetronomeData,
    loadDMData,
    measures,
    setMeasures,
    dMTitle,
    setDMTitle,
    rhythmGrid,
    setRhythmGrid,
    instruments,
    setInstruments,
    rhythmSequence,
    loadFromQueryUrl,
    createMetQueryUrl,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
