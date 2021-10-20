import * as Tone from 'tone';

/**
 * @param {React.RefObject<InputGraph>} graphRef Reference to input graph
 */
class SoundGenerator {
    constructor(graphRef) {
        this.graphRef = graphRef;
        const pitchShifter = new Tone.PitchShift().toDestination();
        this.oscillator = new Tone.Oscillator().connect(pitchShifter);
        this.pitchShifter = pitchShifter;
    }

    playFromStart = () => {
        Tone.start();
        Tone.Transport.seconds = 0;
        Tone.Transport.start(Tone.now());
    }

    resetSound = () => {
        Tone.Transport.cancel(0);
    }

    fetchPoints = () => {
        const pointsMap = this.graphRef.current?.state.points;
        if(pointsMap) {
            return Array.from(pointsMap.values());
        }
        throw new Error("No graph found on the current screen");
    }

    generateSound = () => {
        this.resetSound();
  
        const oscillator = this.oscillator;
        const pitchShifter = this.pitchShifter;
        const points = this.fetchPoints();
        
        for(let i = 0; i < points.length; i++) {
            const point = points[i];
            const divider = 100;
            const x = point.x / divider;
            const y = point.y / divider;

            Tone.Transport.schedule((time) => {
                oscillator.start(time);

                if (i < points.length - 1) {
                    const timeOffset = (points[i+1].x/divider) - x;
                    oscillator.stop(time + timeOffset);
                } else {
                    oscillator.stop(time + 0.3);
                }

            pitchShifter.pitch = y;
            }, x);
        }
    }
}

export default SoundGenerator;