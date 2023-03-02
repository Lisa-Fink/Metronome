import React, { useEffect, useContext } from "react";
import "../styles/Metronome.css";
import ChangeMeter from "./ChangeMeter";
import TempoControls from "./TempoControls";
import ToneSelector from "./ToneSelector";

import Practice from "./Practice";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";

function Metronome() {
  const {
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
  ]);

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

  const startStop = () => {
    if (isPlaying) {
      // stopping
      stopClick();
    } else {
      startClick();
    }
  };

  return (
    <div className="metronome-body">
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
      <BottomControls
        startStop={startStop}
        paused={paused}
        isPlaying={isPlaying}
        volume={volume}
        setVolume={setVolume}
        volumeRef={volumeRef}
      />
    </div>
  );
}

export default Metronome;
