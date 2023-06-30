import { audioSamples } from "../../../audioFiles";
import { fetchAudio } from "../../../audioUtils";
import MetronomeSounds from "../MetronomeSounds";

class DrumSetSounds extends MetronomeSounds {
  constructor(
    audioCtx,
    subdivide,
    gainNode,
    downBeat,
    mainBeat,
    timeSignature
  ) {
    super(audioCtx, subdivide, gainNode, downBeat, mainBeat);

    this.timeSignature = timeSignature;
  }

  async loadAudio() {
    const bass = audioSamples["Bass Drum"].beats;
    const hiHat = audioSamples.Cymbal.mainBeats;
    const hiHatSubdivide = audioSamples.Cymbal.beats;
    const snare = audioSamples["Snare Drum"].mainBeats;
    const crash = audioSamples.Cymbal.downBeats;
    const clap = audioSamples.Clap.mainBeats;

    const instruments = [bass, hiHat, hiHatSubdivide, snare, crash, clap];
    this.sounds = await Promise.all(
      instruments.map((instrument) => fetchAudio(instrument, this.audioCtx))
    );
  }

  scheduleStart(startTime, beatCount) {
    const sound = this.getSound(beatCount);
    sound.forEach((s) => {
      this.connect(s);
      this.start(s, startTime);
    });
  }

  getSound(beatCount) {
    // return a list of buffers to play at same time
    const playing = this.getPlaying(beatCount);

    return playing.map((drumBuffer) => {
      const source = this.audioCtx.current.createBufferSource();
      source.buffer = drumBuffer;
      return source;
    });
  }

  getPlaying(beatCount) {
    const [bass, hiHat, hiHatSubdivide, snare, crash, clap] = this.sounds;
    const playing = [];
    const twoFour = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      bass,
      snare,
      undefined,
    ];

    const three = [bass, snare, snare, bass, snare, undefined];
    const five = [
      bass,
      undefined,
      snare,
      bass,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
    ];
    const six = [
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      undefined,
      snare,
      bass,
      snare,
      undefined,
    ];
    const seven = [
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
      bass,
      undefined,
      snare,
      undefined,
      bass,
      snare,
      snare,
    ];

    const nine = [
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
      bass,
      snare,
      snare,
      bass,
      snare,
      snare,
      bass,
      snare,
      bass,
    ];

    const rhythmMap = {
      2: twoFour,
      3: three,
      4: twoFour,
      5: five,
      6: six,
      7: seven,
      9: nine,
    };
    const rhythm = rhythmMap[this.timeSignature];
    const main = [crash, clap];
    const sub =
      this.subdivide !== false && this.subdivide > 1 ? this.subdivide : 1;
    if (sub > 1 && beatCount % sub !== 1) {
      // subdivide
      playing.push(hiHatSubdivide);
    } else {
      // beats
      const current = rhythm[(beatCount - 1) / sub];

      if (current !== undefined) {
        playing.push(current);
      }

      if (
        this.downBeat &&
        (beatCount === 1 || beatCount - 1 === this.timeSignature * sub)
      ) {
        if (beatCount === 1) {
          playing.push(main[0]);
        } else if (beatCount - 1 === this.timeSignature * sub) {
          playing.push(main[1]);
        }
      } else {
        if (this.mainBeat && sub > 1) {
          playing.push(hiHat);
        } else {
          playing.push(hiHatSubdivide);
        }
      }
    }
    return playing;
  }
}

export default DrumSetSounds;
