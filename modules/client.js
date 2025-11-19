import { FFmpeg } from '../ffmpeg/esm/index.js';
import { toBlobURL } from '../ffmpeg/util/dist/esm/index.js';

export async function loadFFmpeg(statusElement) {
    const ffmpeg = new FFmpeg();
    
    const baseURL = new URL('../ffmpeg/esm', import.meta.url).href;

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/worker.js`, 'text/javascript'),
    });

    return ffmpeg;
}