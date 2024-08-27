/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

*/

import { openDB, deleteDB, wrap, unwrap } from 'idb';

export class DBHandler {
    constructor() {
        deleteDB('songs');
    }

    private open(params: any) {
        return openDB('songs', 11, params);
    }

    async init() {
        await deleteDB('songs');

        let req = await this.open({
            upgrade(
                db: any,
                oldVersion: number,
                newVersion: number,
                transaction: any,
                event: any,
            ) {
                const objectStore = db.createObjectStore('songs', {
                    keyPath: 'id',
                });
                objectStore.createIndex('bytes', 'bytes', { unique: false });
            },
        });
    }

    async getSong(idx: number): Promise<Uint8Array | null> {
        let db = await this.open({});

        const tx = db.transaction('songs');
        const store = tx.objectStore('songs');

        if (store === undefined) {
            console.error('Could not add song; could not access objectStore');
            return null;
        }
        let r = await store.get(idx);
        let bytes = r.bytes;

        await tx.done;

        return bytes;
    }

    async addSong(obj: any) {
        let event = await this.open({});
        let db = event;

        const tx = db.transaction('songs', 'readwrite');
        let store = tx.objectStore('songs');

        if (store === undefined) {
            console.error('Could not add song; could not access objectStore');
        } else {
            await store.add(obj);
        }
        await tx.done;
    }
}
