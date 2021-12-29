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
        this.pause();
        this.audioBuffer = undefined
        this.audioSource?.disconnect();
        this.audioContext?.close();
        this.audioContext = undefined;
    }

    generateSound = (points: {x: number, y: number}[]) => {
        this.resetSound();
        const sampleRate = 44100;
        const audioContext = new AudioContext({sampleRate});
        const waveArray  = new Float32Array(points.map((point) => point.y));
        this.audioBuffer = audioContext.createBuffer(1, waveArray.length, sampleRate);
        this.audioBuffer.copyToChannel(waveArray, 0);
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

    sum(a: number[]){
        return a.reduce((a, b) => a + b, 0);
    }

    concatFloatArray(arrays: Float32Array[]){
        const lens = arrays.map(a => a.length)
        const resultArray = new Float32Array(this.sum(lens));
        for (let i=0; i<arrays.length; i++){
            const start = this.sum(lens.slice(0,i));
            resultArray.set(arrays[i],start);
        }
        return resultArray;
    }

    downloadSound = () => {
        if (this.audioBuffer) {
            // Replicate the stored buffer points into a Float array
            const list = []
            for (var i = 0; i < 100; i++) {
                list.push(this.audioBuffer.getChannelData(0))
            }
            const arr = this.concatFloatArray(list)

            // Create a buffer with all the replicated points
            const buffer = new AudioBuffer({
                numberOfChannels: this.audioBuffer.numberOfChannels,
                length: arr.length,
                sampleRate: this.audioBuffer.sampleRate,
            })
            buffer.copyToChannel(arr, 0)

            // Convert the buffer to a .wav format
            const toWav = require('audiobuffer-to-wav');
            const wav = toWav(buffer)

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