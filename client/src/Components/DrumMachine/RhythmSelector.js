import React from "react";

function RhythmSelector({ rhythm, setRhythm }) {
  const rhythms = [
    ["𝅗", 4],
    ["𝅗𝅥.", 3],
    ["𝅗𝅥", 2],
    ["𝅘𝅥.", 1.5],
    ["𝅘𝅥", 1],
    ["𝅘𝅥𝅮.", 0.75],
    ["𝅘𝅥𝅮", 0.5],
    ["𝅘𝅥𝅯", 0.25],
  ];

  const handleRhythmClick = (num) => {
    setRhythm(num);
  };

  return (
    <div className="rhythm-div">
      <h4>Rhythms</h4>
      <div>
        {rhythms.map(([note, num]) => (
          <button
            key={num}
            className={rhythm === num ? "selected" : ""}
            onClick={() => handleRhythmClick(num)}
          >
            <div key={`note-${num}`} className="music-note">
              {note}
            </div>
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RhythmSelector;
