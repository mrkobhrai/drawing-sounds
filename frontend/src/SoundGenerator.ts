import * as Tone from 'tone';
import {Oscillator, PitchShift} from "tone";

class SoundGenerator {
    oscillator: Oscillator;
    pitchShifter: PitchShift;

    constructor() {
        const pitchShifter = new Tone.PitchShift().toDestination();
        this.oscillator = new Tone.Oscillator().connect(pitchShifter);
        this.pitchShifter = pitchShifter;
    }

    playFromStart = () => {
        Tone.start();
        Tone.Transport.seconds = 0;
        Tone.Transport.start();
        this.oscillator.start();
    }

    resetSound = () => {
        Tone.Transport.cancel(0);
    }

    generateSound = (points: {x: number, y: number}[]) => {
        this.resetSound();
        const oscillator = this.oscillator;
        for(let i = 0; i < points.length; i++) {
            const point = points[i];
            const x = point.x;
            const y = point.y;
            Tone.Transport.schedule((time) => {
                oscillator.volume.value = y + 10;
                if(i >= points.length - 1) {
                    this.oscillator.stop(time + 0.3);
                }
            }, x);
        }
    }
}

export default SoundGenerator;