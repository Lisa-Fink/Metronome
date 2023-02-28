import React, { useState, useEffect, useRef } from "react";
import { AudioContext } from "standardized-audio-context";
import "../styles/Metronome.css";
import ChangeMeter from "./ChangeMeter";
import TempoControls from "./TempoControls";
import ToneSelector from "./ToneSelector";

import { IoPlayOutline, IoPauseOutline, IoStopOutline } from "react-icons/io5";
import Volume from "./Volume";
import Practice from "./Practice";
import createAudioUtils from "../utils/audioUtils";

function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.16);
  const volumeRef = useRef(volume);
  const [timerId, setTimerId] = useState(null);

  const [timeSignature, setTimeSignature] = useState(4);
  const [downBeat, setDownBeat] = useState(false);
  const [subdivide, setSubdivide] = useState(1);
  const [mainBeat, setMainBeat] = useState(false);

  const [key, setKey] = useState(261.63);
  const [tone, setTone] = useState("woodBlock");
  const [downBeatTone, setDownBeatTone] = useState("woodBlock");

  const paused = useRef(false);
  const [toneCategory, setToneCategory] = useState("Percussion");

  // Practice settings
  const [countIn, setCountIn] = useState(0);
  const [numMeasures, setNumMeasures] = useState(4);
  const [repeat, setRepeat] = useState(5);
  const [tempoInc, setTempoInc] = useState(5);
  const [sectionPractice, setSectionPractice] = useState(false);
  const [tempoPractice, setTempoPractice] = useState(false);

  const { startClick, stopClick } = createAudioUtils(
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
    volume,
    toneCategory,
    timerId
  );

  // updates to new selected time signature
  useEffect(() => {
    if (isPlaying) {
      restart();
    }
  }, [timeSignature, downBeat, tone, downBeatTone, key, subdivide, mainBeat]);

  const restart = () => {
    if (isPlaying) {
      clearInterval(timerId);
      setIsPlaying(false);
      setTimerId(null);
    }
    startClick();
  };

  const startStop = () => {
    if (isPlaying) {
      // stopping
      stopClick();
    } else {
      startClick();
    }
  };

  return (
    <div id="metronome-body">
      <h2>Metronome</h2>
      <div id="sections">
        <div id="left-col">
          <TempoControls
            bpm={bpm}
            setBpm={setBpm}
            isPlaying={isPlaying}
            startStop={startStop}
            paused={paused}
          />
          <ToneSelector
            setTone={setTone}
            setDownBeatTone={setDownBeatTone}
            toneCategory={toneCategory}
            setToneCategory={setToneCategory}
            setKey={setKey}
            tone={tone}
          />
        </div>

        <ChangeMeter
          setTimeSignature={setTimeSignature}
          downBeat={downBeat}
          setDownBeat={setDownBeat}
          subdivide={subdivide}
          setSubdivide={setSubdivide}
          mainBeat={mainBeat}
          setMainBeat={setMainBeat}
          toneCategory={toneCategory}
          timeSignature={timeSignature}
        />
      </div>
      <Practice
        countIn={countIn}
        setCountIn={setCountIn}
        numMeasures={numMeasures}
        setNumMeasures={setNumMeasures}
        repeat={repeat}
        setRepeat={setRepeat}
        tempoInc={tempoInc}
        setTempoInc={setTempoInc}
        sectionPractice={sectionPractice}
        setSectionPractice={setSectionPractice}
        tempoPractice={tempoPractice}
        setTempoPractice={setTempoPractice}
      />
      <div id="bottom">
        <button id="metronome-btn" onClick={startStop}>
          {paused.current ? "Paused " : isPlaying ? "Stop " : "Play "}

          {paused.current ? (
            <IoPauseOutline />
          ) : isPlaying ? (
            <IoStopOutline />
          ) : (
            <IoPlayOutline />
          )}
        </button>
        <Volume volume={volume} setVolume={setVolume} volumeRef={volumeRef} />
      </div>
    </div>
  );
}

export default Metronome;
