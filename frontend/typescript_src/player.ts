import { defineStore } from 'pinia';
import SongInfo from './songInfo.ts';
import { BasicVisualizer, FFTVisualizer } from './visualizer.ts';

export enum NextSongSelectionStyle {
    Repeat = 0,
    Next,
    Shuffle,
    __LENGTH,
}

function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function randInt(max: number, min: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const useSharedPlayer = defineStore('main', {
    state: () => {
        let audioCtx = new AudioContext();

        let gainNode = audioCtx.createGain();

        return {
            // Audio info
            audioContext: audioCtx,
            gainNode: gainNode,
            xmrsNode: null as AudioWorkletNode | null,
            isReady: false,

            // Visualizer
            visualizer_1: new BasicVisualizer(
                'draw-canvas-1',
                audioCtx.createAnalyser(),
            ),
            visualizer_2: new FFTVisualizer(
                'draw-canvas-2',
                audioCtx.createAnalyser(),
            ),

            // Data info
            selectedSong: null as number | null,
            playingSong: null as number | null,
            songs: [],

            // State
            nextSongSelectionStyle: NextSongSelectionStyle.Shuffle,
            queueNextSong: true,
            paused: true,
            muted: false,
        };
    },
    actions: {
        async init() {
            await this.audioContext.audioWorklet.addModule(
                'assets/processor.js',
            );

            this.visualizer_1.initialize();
            this.visualizer_2.initialize();
            this.visualizer_2.setWidth(window.innerWidth);
        },
        async updateSongs() {
            let rawData = await fetch('/info');
            let json = await rawData.json();
            this.songs = json.map((data: any) => new SongInfo(data));
        },
        getSongs() {
            return this.songs;
        },
        setSelected(index: number | null) {
            this.selectedSong = index;
        },
        isSelected(index: number) {
            if (this.selectedSong === null) {
                return false;
            }
            return this.selectedSong == index;
        },
        hasSelected(): boolean {
            return this.selectedSong !== null;
        },
        getSong(idx: number): SongInfo | null {
            if (idx >= this.songs.length) {
                return null;
            }
            return this.songs[idx];
        },
        getSelected(): SongInfo | null {
            if (this.selectedSong === null) {
                return null;
            }
            return this.getSong(this.selectedSong);
        },
        getPlaying(): SongInfo | null {
            if (this.playingSong === null) {
                return null;
            }
            return this.getSong(this.playingSong);
        },
        isPlaying(index: number): boolean {
            if (this.playingSong === null) {
                return false;
            }
            return this.playingSong == index;
        },
        async playSong(idx: number) {
            this.playingSong = idx;

            let song = this.getSong(idx);
            if (song === null) {
                console.error('Song not available');
                return;
            }

            await this.workletInit(song.url, song.fileType);
        },
        async workletInit(url: string, fileType: string) {
            // must clear worklet beforehand
            await this.workletClear();

            this.isReady = false;

            let options = {
                processorOptions: {},
            };

            const xmrsNode = new AudioWorkletNode(
                this.audioContext,
                'xmrs-processor',
                options,
            );
            this.xmrsNode = xmrsNode;
            xmrsNode.port.onmessage = async (e) => {
                if (e.data.type == 'FETCH_WASM') {
                    let response = await fetch('./assets/cordial_wasm_bg.wasm');
                    let bytes = await response.arrayBuffer();
                    await xmrsNode.port.postMessage({
                        type: 'SEND_WASM',
                        bytes: bytes,
                    });
                } else if (e.data.type == 'FETCH_MUSIC') {
                    let response = await fetch(url);
                    let blob = await response.blob();
                    let bytes = new Uint8Array(await blob.arrayBuffer());
                    await xmrsNode.port.postMessage({
                        type: 'SEND_MUSIC',
                        fileType: fileType,
                        bytes: bytes,
                    });
                } else if (e.data.type == 'READY') {
                    await xmrsNode.connect(this.gainNode);
                    await this.gainNode.connect(this.audioContext.destination);
                    await this.visualizer_1.connectWith(xmrsNode);
                    await this.visualizer_2.connectWith(xmrsNode);
                    this.isReady = true;

                    await this.play();
                } else if (e.data.type == 'DONE') {
                    // TODO: need to ensure that this message is actually received.
                    let song = this.getSong(
                        this.playingSong as number,
                    ) as SongInfo;

                    await this.playNext();
                }
            };
        },
        async workletClear() {
            if (this.xmrsNode !== null) {
                await this.audioContext.suspend();
                // clear onMessage to avoid any late messages
                this.xmrsNode.port.postMessage({ type: 'DESTRUCT' });
                this.xmrsNode.port.onmessage = () => {};
                this.xmrsNode.disconnect();
                this.xmrsNode = null;
                this.isReady = false;
            }
        },
        hasSong() {
            // XXX: not necessarily sufficient
            return this.isReady;
        },
        async playNext() {
            if (this.playingSong === null) {
                await this.workletClear();
                return;
            }
            if (!this.queueNextSong) {
                this.playingSong = null;
                await this.workletClear();
                return;
            }

            var playingSong = this.playingSong;
            switch (this.nextSongSelectionStyle) {
                case NextSongSelectionStyle.Repeat:
                    break;
                case NextSongSelectionStyle.Next:
                    playingSong += 1;
                    if (playingSong >= this.songs.length) {
                        playingSong = 0;
                    }
                    break;
                default: //Shuffle
                    playingSong = randInt(0, this.songs.length - 1);
            }

            await this.playSong(playingSong);
        },
        async play() {
            if (!this.isReady) {
                return;
            }
            this.paused = false;
            await this.audioContext.resume();

            this.visualizer_1.startAnimating();
            this.visualizer_2.startAnimating();
        },
        setVolume(vol: number) {
            if (vol > 1 || vol < 0) {
                console.error(`Invalid volume: ${vol}`);
                return;
            }

            if (vol == 0) {
                this.muted = true;
            } else {
                this.muted = false;
            }

            this.gainNode.gain.setValueAtTime(
                vol,
                this.audioContext.currentTime,
            );
        },
        toggleMute() {
            if (this.muted) {
                this.unMute();
            } else {
                this.mute();
            }
        },
        mute() {
            this.muted = true;
            this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        },
        unMute() {
            this.muted = false;
            this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        },
        async togglePause() {
            if (this.paused) {
                await this.play();
            } else {
                await this.pause();
            }
        },
        async pause() {
            this.paused = true;
            await this.audioContext.suspend();
            this.visualizer_1.stopAnimating();
            this.visualizer_2.stopAnimating();
        },
        async stop() {
            await this.audioContext.suspend();
            await this.workletClear();

            this.visualizer_1.stopAnimating();
            this.visualizer_2.stopAnimating();
            this.playingSong = null;
        },
        async rewind() {
            await this.audioContext.suspend();

            if (this.playingSong === null) {
                console.error('No song to rewind');
                return;
            }
            await this.playSong(this.playingSong);
        },
        getSelectionStyle() {
            return this.nextSongSelectionStyle;
        },
        changeSelectionStyle() {
            let i = this.nextSongSelectionStyle as number;
            i += 1;
            if (i == NextSongSelectionStyle.__LENGTH) {
                i = 0;
            }
            this.nextSongSelectionStyle = i as NextSongSelectionStyle;
        },
    },
});
