import React, { useState, useRef } from "react";
import { BsVolumeUp, BsVolumeMute } from "react-icons/bs";

function Volume({ volume, setVolume, volumeRef }) {
  const [showVolume, setShowVolume] = useState(false);
  const oldVolume = useRef(0);

  const changeVolume = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    volumeRef.current = newVolume / 3;
  };

  const hoverVolume = (e) => {
    setShowVolume(true);
  };

  const exitVolume = (e) => {
    if (showVolume) {
      setShowVolume(false);
    }
  };

  const mute = (e) => {
    oldVolume.current = volume;
    setVolume(0);
    volumeRef.current = 0;
  };

  const unMute = (e) => {
    const old = oldVolume.current;
    if (old === 0) {
      old = 0.25;
    }
    setVolume(old);
    volumeRef.current = old;
  };

  return (
    <div id="volume">
      <div onMouseLeave={exitVolume} id="volume-container">
        <div className={showVolume ? "volume-control" : "hidden"}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={changeVolume}
            className="slider"
          />
        </div>
        <div>
          {volume > 0 ? (
            <BsVolumeUp onMouseOver={hoverVolume} onClick={mute} />
          ) : (
            <BsVolumeMute onMouseOver={hoverVolume} onClick={unMute} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Volume;
