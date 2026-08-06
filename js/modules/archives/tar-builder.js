// SIMPLE TAR BUILDER
export class SimpleTarBuilder {
    constructor() {
        this.buffers = [];
    }
    
    addFile(name, uint8array) {
        const header = new Uint8Array(512);
        const nameBytes = new TextEncoder().encode(name);
        header.set(nameBytes.slice(0, 100), 0); // name
        
        header.set(new TextEncoder().encode("0000644\0"), 100); // mode
        header.set(new TextEncoder().encode("0000000\0"), 108); // uid
        header.set(new TextEncoder().encode("0000000\0"), 116); // gid
        
        const sizeStr = uint8array.length.toString(8).padStart(11, '0') + " ";
        header.set(new TextEncoder().encode(sizeStr), 124); // size
        
        const mtimeStr = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + " ";
        header.set(new TextEncoder().encode(mtimeStr), 136); // mtime
        
        header.set(new TextEncoder().encode("        "), 148); // placeholder checksum
        header[156] = 48; // '0' for normal file
        
        header.set(new TextEncoder().encode("ustar\0"), 257); // magic
        header.set(new TextEncoder().encode("00"), 263); // version
        
        let checksum = 0;
        for (let i = 0; i < 512; i++) checksum += header[i];
        const chkStr = checksum.toString(8).padStart(6, '0') + "\0 ";
        header.set(new TextEncoder().encode(chkStr), 148);
        
        this.buffers.push(header);
        this.buffers.push(uint8array);
        
        const paddingSize = (512 - (uint8array.length % 512)) % 512;
        if (paddingSize > 0) {
            this.buffers.push(new Uint8Array(paddingSize));
        }
    }
    
    addDirectory(name) {
        if (!name.endsWith('/')) name += '/';
        const header = new Uint8Array(512);
        const nameBytes = new TextEncoder().encode(name);
        header.set(nameBytes.slice(0, 100), 0);
        
        header.set(new TextEncoder().encode("0000755\0"), 100);
        header.set(new TextEncoder().encode("0000000\0"), 108);
        header.set(new TextEncoder().encode("0000000\0"), 116);
        header.set(new TextEncoder().encode("0".padStart(11, '0') + " "), 124);
        const mtimeStr = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + " ";
        header.set(new TextEncoder().encode(mtimeStr), 136);
        header.set(new TextEncoder().encode("        "), 148);
        header[156] = 53; // '5' for directory
        header.set(new TextEncoder().encode("ustar\0"), 257);
        header.set(new TextEncoder().encode("00"), 263);
        
        let checksum = 0;
        for (let i = 0; i < 512; i++) checksum += header[i];
        const chkStr = checksum.toString(8).padStart(6, '0') + "\0 ";
        header.set(new TextEncoder().encode(chkStr), 148);
        
        this.buffers.push(header);
    }
    
    generateBlob() {
        this.buffers.push(new Uint8Array(1024)); // end marker
        return new Blob(this.buffers, { type: 'application/x-tar' });
    }
}
