class SoundGenerator {
    audioSource: AudioBufferSourceNode | undefined;
    started: boolean

    constructor () {
        this.started = false;
    }

    play = () => {
        if (typeof this.audioSource !== 'undefined') {
            // TODO should not call start if already running
            this.audioSource?.start();
            this.started = true;
        }
    }

    pause = () => {
        if (this.started) {
            this.audioSource?.stop();
            this.started = false;
        }
    }

    resetSound = () => {
        this.audioSource?.disconnect();
        this.audioSource = undefined;
    }

    generateSound = (points: {x: number, y: number}[]) => {
        const sampleRate = 44100;
        const audioContext = new AudioContext({sampleRate});
        const waveArray  = new Float32Array(points.map((point) => point.y));
        const audioBuffer = audioContext.createBuffer(1, waveArray.length, sampleRate);
        audioBuffer.copyToChannel(waveArray, 0);
        this.resetSound();
        const source = audioContext.createBufferSource();
        source.loop = true;
        source.connect(audioContext.destination);
        source.buffer = audioBuffer;
        this.audioSource = source;
        if(this.started) {
            this.play();
        }
    }
}

export default SoundGenerator;