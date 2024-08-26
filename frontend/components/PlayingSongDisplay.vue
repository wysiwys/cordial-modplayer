<!--

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

-->

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
