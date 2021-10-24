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
        const pointsMap = this.graphRef.current?.state.generatedPoints;
        if(pointsMap) {
            return Array.from(pointsMap.values());
        }
        throw new Error("No graph found on the current screen");
    }

    generateSound = () => {
        const graphRef = this.graphRef.current;
        if(graphRef) {
            const oscillator = this.oscillator;
            const getX = graphRef.getXFromXCoord;
            const getY = graphRef.getYFromYCoord;
            const points = this.fetchPoints();
            
            for(let i = 0; i < points.length; i++) {
                const point = points[i];
                const x = getX(point.x);
                const y = getY(point.y);
                Tone.Transport.schedule((time) => {
                    oscillator.start(time);
                    if (i < points.length - 1) {
                        const nextX = getX(points[i+1].x);
                        const timeOffset = nextX - x;
                        oscillator.stop(time + timeOffset);
                    } else {
                        oscillator.stop(time + 0.3);
                    }

                oscillator.volume.value = y;
                }, x);
            }
        } 
        else {
            throw new Error("No graph found on the current screen");
        }
    }
}

export default SoundGenerator;