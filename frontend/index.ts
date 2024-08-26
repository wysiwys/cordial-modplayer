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
