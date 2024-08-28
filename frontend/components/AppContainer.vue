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
    dataTypes: ['audio/x-xm', 'audio/x-mod'],
});
</script>
<template>
    <App ref="dropZoneRef" id="app"></App>
</template>
