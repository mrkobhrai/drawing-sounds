class SoundGenerator {
    audioSource: AudioBufferSourceNode | undefined;
    audioContext: AudioContext | undefined;
    started: boolean

    constructor () {
        this.started = false;
    }

    play = () => {
        if (typeof this.audioContext !== 'undefined') {
            // TODO should not call start if already running
            this.audioContext?.resume();
            this.started = true;
        }
    }

    pause = () => {
        this.audioContext?.suspend();
        this.started = false;
    }

    resetSound = () => {
        this.audioSource?.disconnect();
        this.audioContext?.close();
        this.audioContext = undefined;
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
        this.audioContext = audioContext;
        this.audioSource.start();
        if(this.started) {
            this.play();
        } else {
            this.pause();
        }
    }
}

export default SoundGenerator;