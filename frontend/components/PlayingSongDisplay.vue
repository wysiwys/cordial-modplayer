<script>
import SongInfo from '../typescript_src/songInfo.ts';
import { useSharedPlayer } from '../typescript_src/player.ts';

export default {
    data() {
        return {
            player: useSharedPlayer(),
        };
    },
    props: {
        songInfo: SongInfo | null,
    },
    computed: {
        name() {
            if (this.songInfo === null) {
                return '-';
            } else {
                return this.songInfo.name;
            }
        },
    },
    methods: {
        selectSong() {
            if (this.songInfo === null) {
                this.player.setSelected(null);
            } else {
                this.player.setSelected(this.songInfo.id);
            }
        },
    },
};
</script>

<template>
    <div id="playing-song-bar">
        <marquee @click="selectSong" id="playing-song-now-playing">
            Now playing: {{ name }}
        </marquee>
        <canvas
            id="draw-canvas-1"
            width="146"
            height="20"
            class="audio-visualizer"
        ></canvas>
    </div>
</template>
