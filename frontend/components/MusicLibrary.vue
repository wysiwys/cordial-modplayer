<script setup lang="ts">
import SongInfo from '../typescript_src/songInfo.ts';
import MusicRow from './MusicRow.vue';
import { useSharedPlayer } from '../typescript_src/player.ts';
import { useVirtualList } from '@vueuse/core';
import { h, computed, defineProps } from 'vue';

interface SongEntry {
    song: SongInfo;
    index: number;
}

const props = defineProps({
    songs: {
        type: Array<SongEntry>,
        required: true,
    },
});

// XXX: hacky way to get the max-height of `music-row-div`
// Creates a temporary element, gets the style, then deletes it
var tempElement = document.createElement('div');
tempElement.className = 'music-row-div';
tempElement.style.visibility = 'hidden';
tempElement.style.position = 'absolute';
document.body.appendChild(tempElement);
var height = window
    .getComputedStyle(tempElement)
    .getPropertyValue('max-height');
var height = parseInt(height, 10);

document.body.removeChild(tempElement);

const { list, containerProps, wrapperProps } = useVirtualList(
    computed(() => props.songs),
    { itemHeight: height },
);
</script>

<template>
    <div id="music-row-container" v-bind="containerProps">
        <div id="wrapper-props" v-bind="wrapperProps">
            <MusicRow
                v-for="item in list"
                :key="item.index"
                :songInfo="item.data.song"
            ></MusicRow>
        </div>
    </div>
</template>
