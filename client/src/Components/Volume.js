import React, { useState, useRef, useEffect, useContext } from "react";
import { BsVolumeUp, BsVolumeMute } from "react-icons/bs";
import { AppContext } from "../contexts/AppContext";

function Volume({ volume, setVolume, volumeRef }) {
  const { gain } = useContext(AppContext);
  const [showVolume, setShowVolume] = useState(false);
  const oldVolume = useRef(0);

  useEffect(() => {
    if (gain.current) {
      gain.current.gain.value = volumeRef.current;
    }
  }, [volume, volumeRef]);

  const changeVolume = (e) => {
    const newVolume = e.target.value;
    volumeRef.current = newVolume / 3;
    setVolume(newVolume);
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
    volumeRef.current = 0;
    setVolume(0);
  };

  const unMute = (e) => {
    let old = oldVolume.current;
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
        <div id="volume-icons">
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
