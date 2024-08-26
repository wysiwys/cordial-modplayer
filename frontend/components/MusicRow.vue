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
    props: {
        songInfo: SongInfo,
    },
    data() {
        return {
            player: useSharedPlayer(),
        };
    },
    computed: {
        rowId() {
            return this.songInfo.id;
        },
        name() {
            return this.songInfo.name;
        },
        fileName() {
            return this.songInfo.fileName;
        },
        fileType() {
            return this.songInfo.fileType;
        },
        isSelected() {
            return this.player.isSelected(this.songInfo.id);
        },
        isPlaying() {
            let playing = this.player.isPlaying(this.songInfo.id);

            if (playing) {
                // TODO: only scroll into view if not visible
                //this.$el.scrollIntoView();
            }
            return playing;
        },
        playOrPause() {
            return '\u{23f5}';
        },
    },
    methods: {
        selectSong() {
            this.player.setSelected(this.songInfo.id);
        },
        async play() {
            try {
                await this.player.playSong(this.songInfo.id);
            } catch (e) {
                console.error(e);
                return;
            }
        },
    },
};
</script>

<template>
    <div
        @click="selectSong"
        v-on:dblclick="play"
        v-bind:item="rowId"
        class="music-row-div"
        v-bind:class="{ 'playing-music-row': isPlaying }"
        onselectstart="return false;"
    >
        <div class="music-row-item song-name">{{ name }}</div>
        <div class="music-row-item song-file-name">`{{ fileName }}`</div>
        <div class="music-row-item song-file-type">{{ fileType }}</div>
    </div>
</template>
