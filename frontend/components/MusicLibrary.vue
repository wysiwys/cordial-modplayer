<!--

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

-->

<script setup lang="ts">
import SongInfo from '../typescript_src/songInfo.ts';
import MusicRow from './MusicRow.vue';
import { useSharedPlayer } from '../typescript_src/player.ts';
import { useVirtualList } from '@vueuse/core';
import { h, ref, computed, defineProps } from 'vue';

interface SongEntry {
    song: SongInfo;
    index: number;
}

let player = useSharedPlayer();

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
