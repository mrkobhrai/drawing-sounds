class SoundGenerator {
    audioSource: AudioBufferSourceNode | undefined;
    audioContext: AudioContext | undefined;
    audioBuffer: AudioBuffer | undefined;
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
        this.audioContext?.suspend();
        this.audioSource?.disconnect();
        this.audioContext?.close();
        this.audioContext = undefined;
    }

    generateSound = (points: {x: number, y: number}[]) => {
        const sampleRate = 44100;
        const audioContext = new AudioContext({sampleRate});
        const waveArray  = new Float32Array(points.map((point) => point.y));
        this.audioBuffer = audioContext.createBuffer(1, waveArray.length, sampleRate);
        this.audioBuffer.copyToChannel(waveArray, 0);
        this.resetSound();
        const source = audioContext.createBufferSource();
        source.loop = true;
        source.connect(audioContext.destination);
        source.buffer = this.audioBuffer;
        this.audioSource = source;
        this.audioContext = audioContext;
        this.audioSource.start();
        if(this.started) {
            this.play();
        } else {
            this.pause();
        }
    }

    downloadSound = () => {
        if (this.audioBuffer) {
            // Convert the buffer to a .wav format
            const toWav = require('audiobuffer-to-wav');
            const wav = toWav(this.audioBuffer)

            // Create the download URL
            const blob = new window.Blob([ new DataView(wav) ], {
                type: 'audio/wav'
            })
            const url = window.URL.createObjectURL(blob)

            // Create a dummy link object to download the file
            const link = document.createElement('a')
            link.setAttribute('style', 'display: none')
            link.href = url
            link.download = 'audio.wav'
            link.click()
            window.URL.revokeObjectURL(url)
        }
    }
}

export default SoundGenerator;