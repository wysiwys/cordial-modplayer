<script lang="ts">
import { h, reactive, computed, toRaw, nextTick } from 'vue';

import SongInfo from '../typescript_src/songInfo.ts';
import {
    NextSongSelectionStyle,
    useSharedPlayer,
} from '../typescript_src/player.ts';
import PlayingSongDisplay from './PlayingSongDisplay.vue';
import SongDisplay from './SongDisplay.vue';
import MusicRow from './MusicRow.vue';
import MusicLibrary from './MusicLibrary.vue';

import imgUrl from '../images/wood92.jpg';

export default {
    data() {
        return {
            songs: [],
            volumeLevel: 1,
            player: useSharedPlayer(),
            hasBackground: false,
        };
    },
    async mounted() {
        await this.updateList();
        await nextTick();
    },
    computed: {
        backgroundImage() {
            if (this.hasBackground) {
                return `background-image: url('${imgUrl}');`;
            } else {
                return '';
            }
        },

        library() {
            return this.songs;
        },
        muteIcon() {
            let muted = this.player.muted;
            if (muted) {
                return '\u{1F507}';
            } else {
                return '\u{1F50a}';
            }
        },
        selectionStyleIcon() {
            let style = this.player.getSelectionStyle();
            let icon;
            switch (style) {
                case NextSongSelectionStyle.Repeat:
                    icon = '\u{1F502}';
                    break;
                case NextSongSelectionStyle.Next:
                    icon = '\u{1F501}';
                    break;
                default: // shuffle
                    icon = '\u{1F500}';
                    break;
            }

            return icon;
        },
        noSong() {
            return !this.player.hasSong();
        },
        hasSelected() {
            return this.player.hasSelected();
        },
        playingSong() {
            let songInfo = this.player.getPlaying();

            return h(PlayingSongDisplay, { songInfo: songInfo });
        },
        selectedSong() {
            let songInfo = this.player.getSelected();

            return h(SongDisplay, { songInfo: songInfo });
        },
    },
    methods: {
        setVolume() {
            this.player.setVolume(this.volumeLevel);
        },
        rewind() {
            this.player.rewind();
        },
        startPlayback() {
            this.player.play();
        },
        pausePlayback() {
            this.player.pause();
        },
        stopPlayback() {
            this.player.stop();
        },
        async nextSong() {
            await this.player.playNext();
        },
        changeSelectionStyle() {
            this.player.changeSelectionStyle();
        },
        toggleMute() {
            this.player.toggleMute();
        },
        async updateList() {
            await this.player.updateSongs();

            let id = 0;

            this.songs = this.player.getSongs().map((songInfo) => {
                let entry = { song: songInfo, index: id };

                id++;
                return entry;
            });
        },
        async toggleTheme() {
            if (this.hasBackground) {
                this.hasBackground = false;
            } else {
                this.hasBackground = true;
            }
        },
    },
};
</script>

<template>
    <div id="player" :style="backgroundImage">
        <div id="menu-bar">
            <button
                @click="toggleTheme"
                id="toggle-theme-button"
                class="control-bar-button"
            >
                &#x1f332;
            </button>
            <button
                @click="updateList"
                id="refresh-list-button"
                class="control-bar-button"
            >
                Refresh song list &#x1f504;
            </button>
            <button
                @click="rewind"
                :disabled="noSong"
                class="control-bar-button"
            >
                &#x27f3;
            </button>
            <button
                @click="stopPlayback"
                :disabled="noSong"
                class="control-bar-button"
            >
                &#x23f9;
            </button>
            <button
                @click="pausePlayback"
                :disabled="noSong"
                class="control-bar-button"
            >
                &#x23f8;
            </button>
            <button
                @click="startPlayback"
                :disabled="noSong"
                class="control-bar-button"
            >
                &#x23f5;
            </button>
            <button
                @click="nextSong"
                :disabled="noSong"
                class="control-bar-button"
            >
                &#x23ed;
            </button>
            <button @click="changeSelectionStyle" class="control-bar-button">
                {{ selectionStyleIcon }}
            </button>
            <button @click="toggleMute" class="control-bar-button">
                {{ muteIcon }}
            </button>
            <input
                v-on:change="setVolume()"
                v-model="volumeLevel"
                id="volume-slider"
                class="slider"
                type="range"
                step="0.01"
                min="0"
                max="1"
            />
            <component v-bind:is="playingSong"></component>
            <button @click="info" id="info-button" class="control-bar-button">
                &#x2139;
            </button>
        </div>
        <div id="gradient-bar-top" class="gradient-bar"></div>
    	<canvas id="draw-canvas-2" class="audio-visualizer"></canvas>
        <div id="library-container">
            <component v-bind:is="selectedSong"></component>
            <MusicLibrary :songs="library"></MusicLibrary>
        </div>
        <div id="gradient-bar-bottom" class="gradient-bar"></div>
    </div>
</template>
