/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

*/

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { useSharedPlayer } from './typescript_src/player.js';

import App from './components/App.vue';
import MusicRow from './components/MusicRow.vue';
import MusicLibrary from './components/MusicLibrary.vue';

import initWasm from './pkg';

async function run() {
    await initWasm({ module_or_path: './assets/cordial_wasm_bg.wasm' });

    const pinia = createPinia();
    const app = createApp(App);

    app.use(pinia);

    app.component('MusicRow', MusicRow);
    app.component('MusicLibrary', MusicLibrary);

    app.mount('#app');

    let sharedPlayer = useSharedPlayer();

    await sharedPlayer.init();

    document.onkeyup = async function (e) {
        // Space play/pause
        if (
            e.key == ' ' ||
            e.code == 'Space' ||
            e.keyCode == 32 ||
            e.code == 'MediaPlayPause'
        ) {
            let active = document.activeElement;
            if (active instanceof HTMLElement) {
                active.blur();
            }
            await sharedPlayer.togglePause();
        } else if (e.code == 'MediaStop') {
            await sharedPlayer.stop();
        } else if (e.code == 'MediaTrackNext') {
            await sharedPlayer.playNext();
        }
        // TODO: MediaTrackPrevious
    };
}
run();

var timer;
let elem = document.getElementById('music-row-container');
if (elem !== null) {
    elem.onscroll = () => {
        if (!elem.classList.contains('disable-hover')) {
            elem.classList.add('disable-hover');
        }
        timer = setTimeout(() => elem.classList.remove('disable-hover'), 400);
    };
}
