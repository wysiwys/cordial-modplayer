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
