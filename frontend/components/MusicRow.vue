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
