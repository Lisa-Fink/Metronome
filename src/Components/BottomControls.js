import React from "react";
import Volume from "./Volume";
import { IoPlayOutline, IoPauseOutline, IoStopOutline } from "react-icons/io5";

function BottomControls({
  startStop,
  paused,
  isPlaying,
  volume,
  setVolume,
  volumeRef,
}) {
  return (
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
  );
}

export default BottomControls;
