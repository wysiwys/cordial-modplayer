<!--

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

-->

<script lang="ts">
import SongInfo from '../typescript_src/songInfo.ts';

export default {
    props: {
        songInfo: SongInfo | null,
    },
    watch: {
        songInfo: async function (val, oldVal) {
            if (this.songInfo !== null) {
                await this.songInfo.updateMetadata();
            }
        },
    },
    computed: {
        name() {
            if (this.songInfo === null) {
                return '';
            } else {
                return this.songInfo.name;
            }
        },
        fileName() {
            if (this.songInfo === null) {
                return '';
            } else {
                return this.songInfo.fileName;
            }
        },
        fileType() {
            if (this.songInfo === null) {
                return '';
            } else {
                return this.songInfo.fileType;
            }
        },
        instrumentComment() {
            if (this.songInfo === null) {
                return '';
            } else {
                return this.songInfo.instrumentComment();
            }
        },
    },
};
</script>

<template>
    <div class="info-box">
        <div class="info-label">SONG NAME</div>
        <div id="info-box-name-info" class="info-content">
            {{ name }}
        </div>
        <div class="info-label">FILENAME</div>
        <div id="info-box-filename" class="info-content">
            {{ fileName }}
        </div>
        <div class="info-label">FORMAT</div>
        <div id="info-box-format" class="info-content">
            {{ fileType }}
        </div>
        <div class="info-label">INSTRUMENT COMMENT</div>
        <div id="info-box-instrument-comment" class="info-content">
            {{ instrumentComment }}
        </div>
    </div>
</template>
