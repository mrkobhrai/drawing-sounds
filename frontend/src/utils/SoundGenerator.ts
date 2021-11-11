class SoundGenerator {
    audioSource: AudioBufferSourceNode | undefined;
    started: boolean

    constructor () {
        this.started = false;
    }

    play = () => {
        // TODO: can't click start twice
        this.audioSource?.start();
        this.started = true;
    }

    resetSound = () => {
        this.audioSource?.disconnect();
        this.audioSource = undefined;
    }

    generateSound = (points: {x: number, y: number}[]) => {
        const sampleRate = 44100;
        const audioContext = new AudioContext({sampleRate});
        const sineWaveArray  = new Float32Array(points.map((point) => point.y));
        const audioBuffer = audioContext.createBuffer(1, sineWaveArray.length, sampleRate);
        audioBuffer.copyToChannel(sineWaveArray, 0);
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