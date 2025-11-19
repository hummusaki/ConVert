import { fetchFile } from '../ffmpeg/util/dist/esm/index.js';

function getMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const map = {
        // Video
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        webm: 'video/webm',
        avi: 'video/x-msvideo',
        mkv: 'video/x-matroska',
        wmv: 'video/x-ms-wmv',
        
        // Audio
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        flac: 'audio/flac',
        ogg: 'audio/ogg',
        aac: 'audio/aac',
        m4a: 'audio/mp4',
        wma: 'audio/x-ms-wma'
    };
    return map[extension] || 'application/octet-stream';
}

export async function transcode( ffmpeg, file, args, outputName, outputElement ) {
    const { name: inputName } = file;

    // write to virtual fs
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // run ffmpeg
    await ffmpeg.exec(args);

    // main script reads data through ffmpeg.readFile
}