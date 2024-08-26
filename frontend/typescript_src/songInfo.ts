import { InnerMetadata, extractMetadata } from '../pkg';

export default class SongInfo {
    id: number;
    name: string;
    url: string;
    fileName: string;
    fileType: string;
    innerMetadata: InnerMetadata | null = null;

    constructor(obj: any) {
        try {
            const {
                id: id,
                name: name,
                url: url,
                file_name: fileName,
                file_type: fileType,
            } = obj;

            this.id = id;
            this.name = name;
            this.url = url;
            this.fileName = fileName;
            this.fileType = fileType;
        } catch (e) {
            throw new Error('Failed to destructure object into SongInfo');
        }
    }
    instrumentComment(): String | null {
        if (this.innerMetadata === null) {
            return null;
        }

        return this.innerMetadata.instrumentComment();
    }
    async updateMetadata() {
        if (this.innerMetadata !== null) {
            return;
        }

        let blob = await fetch(this.url);
        let buf = new Uint8Array(await blob.arrayBuffer());

        this.innerMetadata = extractMetadata(buf, this.fileType);
    }
}
