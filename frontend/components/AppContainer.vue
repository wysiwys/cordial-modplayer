<!--

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

-->

<script setup lang="ts">
import { ref } from 'vue';
import { useSharedPlayer } from '../typescript_src/player.ts';
import { useVirtualList, useDropZone } from '@vueuse/core';

let player = useSharedPlayer();

const dropZoneRef = ref<HTMLElement>();

async function onDrop(files: File[] | null) {
    files.forEach(async (file) => {
        console.log(file);
        await player.addSong(file);
    });
}
const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    //dataTypes: ['audio/x-xm', 'audio/x-mod'],
});
</script>
<template>
    <App ref="dropZoneRef" id="app"></App>
</template>
