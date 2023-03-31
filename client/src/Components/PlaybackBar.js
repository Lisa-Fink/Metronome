import React, { useContext } from "react";
import Volume from "./Volume";
import { IoPlayOutline, IoPauseOutline, IoStopOutline } from "react-icons/io5";
import { AppContext } from "../contexts/AppContext";

function PlaybackBar({ startStop }) {
  const { isPlaying, volume, setVolume, volumeRef, paused } =
    useContext(AppContext);

  return (
    <div id="bottom">
      <button id="metronome-btn" onClick={startStop}>
        {paused ? "Paused " : isPlaying ? "Stop " : "Play "}

        {paused ? (
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

export default PlaybackBar;
