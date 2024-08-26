import { initSync, Player, PlayerError } from './pkg';

export default class XmrsProcessor extends AudioWorkletProcessor {
    init: boolean = false;
    player: Player | null = null;
    constructor(options: any) {
        super();
        this.port.onmessage = async (e) => {
            if (e.data.type == 'SEND_WASM') {
                let data = e.data;

                initSync({ module: e.data.bytes });
                this.init = true;

                await this.port.postMessage({ type: 'FETCH_MUSIC' });
            } else if (e.data.type == 'SEND_MUSIC') {
                if (!this.init) {
                    console.error('Wasm not initiated!');
                    return;
                }
                try {
                    // XXX: why need to divide sample rate by 2?
                    this.player = new Player(
                        sampleRate / 2,
                        e.data.bytes,
                        e.data.fileType,
                    );
                } catch (e) {
                    // Could not initialize player
                    console.error(e);
                    return;
                }
                await this.port.postMessage({ type: 'READY' });
            } else if (e.data.type == 'DESTRUCT') {
                try {
                    if (this.player !== null) {
                        this.player.free();
                        this.player = null;
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };

        this.port.postMessage({ type: 'FETCH_WASM' });
    }
    process(inputs: any, outputs: any, parameters: any) {
        try {
            if (this.player === null) {
                return false;
            }
            const output = outputs[0];
            let player = this.player as Player;

            output.forEach((channel: any) => {
                try {
                    player.nextSamples(channel);
                } catch (e) {
                    if (e === PlayerError.SongOver) {
                        throw new Error('Song over');
                    } else if (e instanceof Error) {
                        throw e;
                    } else {
                        throw new Error(`${e}`);
                    }
                }
            });
        } catch (e) {
            if (this.player !== null) {
                this.player.free();
            }
            if (e instanceof Error) {
                this.port.postMessage({ type: 'DONE' });
            }

            return false;
        }

        return true;
    }
}

registerProcessor('xmrs-processor', XmrsProcessor);
