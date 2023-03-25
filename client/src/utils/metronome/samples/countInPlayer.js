import { audioSamples } from "../../audioFiles";

const countInPlayer = ({
  bpm,
  setIsPlaying,
  timeSignature,
  subdivide,
  volumeRef,
  countIn,
  setTimerId,
}) => {
  const loadCountIn = () => {
    return new Promise((resolve) => {
      const click = new Audio(audioSamples.Triangle.downBeats);
      click.addEventListener("canplaythrough", () => resolve(click));
    });
  };

  const playCountIn = async () => {
    setIsPlaying(true);
    // use triangle down beat
    const click = await loadCountIn();

    const interval = (60 / (bpm * subdivide)) * 1000;
    let beat = 0;
    return new Promise((resolve) => {
      const id = setInterval(() => {
        click.volume = volumeRef.current;
        click.currentTime = 0;
        click.play();
        beat++;
        if (beat == countIn * timeSignature * subdivide) {
          clearInterval(id);
          setTimeout(() => {
            resolve();
          }, (60 / (bpm * subdivide)) * 1000);
        }
      }, interval);
      setTimerId(id);
    });
  };
  return { playCountIn };
};

export default countInPlayer;
