/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

*/
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
