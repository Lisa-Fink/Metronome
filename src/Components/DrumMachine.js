import React, { useContext, useEffect } from "react";
import TempoControls from "./TempoControls";
import BottomControls from "./BottomControls";
import { AppContext } from "../contexts/AppContext";

function DrumMachine() {
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

  //   When a state change needs to make the drum machine restart if it's playing
  //   useEffect(() => {
  //     if (isPlaying) {
  //       restart();
  //     }
  //   }, []);

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
      startClick("drum machine");
    }
  };

  return (
    <div className="metronome-body">
      <h2>Drum Machine</h2>
      <TempoControls
        bpm={bpm}
        setBpm={setBpm}
        isPlaying={isPlaying}
        startStop={startStop}
        paused={paused}
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

export default DrumMachine;
