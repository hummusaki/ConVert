import { loadScript } from '../core/utils.js';

// STATE
let synthLoaded = false;

// INITIALIZATION
async function loadSynth() {
    if (!synthLoaded) {
        await loadScript('https://cdn.jsdelivr.net/npm/webaudio-tinysynth');
        synthLoaded = true;
    }
}

// CORE FUNCTIONS

// convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferWav = new ArrayBuffer(length),
        view = new DataView(bufferWav),
        channels = [],
        sampleRate = buffer.sampleRate;
    let offset = 0,
        pos = 0;

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    // convert raw audio 32bit floats into .wav 16bit ints
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([bufferWav], { type: "audio/wav" });
}

export async function convertMidiFile(fileContent) {
    await loadSynth();

    return new Promise(async (resolve, reject) => {
        try {
            // webaudio-tinysynth relies on WebAudio API
            // to render offline, use OfflineAudioContext

            // assume max length of 5 minutes (5 * 60 = 300 seconds) for rendering
            const sampleRate = 44100;
            const duration = 300;
            const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

            const synth = new window.WebAudioTinySynth({ voices: 64, useReverb: 0 });
            synth.setAudioContext(offlineCtx);

            const midiData = new Uint8Array(fileContent);
            synth.loadMIDI(midiData);
            synth.playMIDI();

            // synth will schedule events on the offlineCtx
            // now we can render the context.
            const renderedBuffer = await offlineCtx.startRendering();

            // convert the AudioBuffer to a WAV Blob
            const wavBlob = audioBufferToWav(renderedBuffer);
            resolve(wavBlob);
        } catch (e) {
            reject(e);
        }
    });
}
