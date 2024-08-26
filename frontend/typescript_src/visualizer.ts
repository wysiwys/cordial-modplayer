/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 

*/
const FPS = 50;
const FPS_INTERVAL = 1000 / FPS;

export default class Visualizer {
    canvasDivId: string;
    canvasContext: CanvasRenderingContext2D | null;
    width: number;
    height: number;
    analyserNode: AnalyserNode;
    bufferLength: number;
    dataArray: Uint8Array;
    then: number = 0;
    startTime: number = 0;
    now: number = 0;
    elapsed: number = 0;
    drawRequest: number | null;
    constructor(divId: string, analyserNode: AnalyserNode) {
        this.canvasDivId = divId;
        this.analyserNode = analyserNode;
        this.analyserNode.fftSize = 512;
        this.bufferLength = analyserNode.fftSize;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.canvasContext = null;

        this.width = 0;
        this.height = 0;

        this.drawRequest = null;
    }
    protected init() {}
    initialize() {
        let gradient;
        let canvas = document.getElementById(this.canvasDivId);
        if (canvas === null) {
            throw new Error('Failed to initialize canvas');
        } else if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Wrong type for canvas');
        } else {
            let ctx = canvas.getContext('2d');
            if (ctx === null) {
                throw new Error('Failed to get canvas context');
            }
            this.canvasContext = ctx;

            this.width = canvas.width;
            this.height = canvas.height;
        }

        this.init();
    }
    setWidth(width: number) {
        if (this.canvasContext === null) {
            return;
        }

        this.canvasContext.canvas.width = width;
        this.width = width;
    }
    setHeight(height: number) {
        if (this.canvasContext === null) {
            return;
        }

        this.canvasContext.canvas.height = height;
        this.height = height;
    }
    async connectWith(audioWorkletNode: AudioWorkletNode) {
        await audioWorkletNode.connect(this.analyserNode);
    }
    stopAnimating() {
        if (this.canvasContext === null) {
            return;
        }
        // TODO: fade out

        if (this.drawRequest !== null) {
            window.cancelAnimationFrame(this.drawRequest);
            this.drawRequest = null;
        }
    }
    startAnimating() {
        this.then = Date.now();
        this.startTime = this.then;
        this.now = 0;
        this.elapsed = 0;

        // Clear any existing animation frame requests
        if (this.drawRequest !== null) {
            window.cancelAnimationFrame(this.drawRequest);
            this.drawRequest = null;
        }

        this.draw();
    }
    protected drawLogic() {
        if (this.canvasContext === null) {
            console.error!('Cannot draw on empty canvas');
            return;
        }
    }
    protected getDataFromNode() {
        this.analyserNode.getByteTimeDomainData(this.dataArray);
    }
    draw() {
        if (this.canvasContext === null) {
            console.error!('Cannot draw on empty canvas');
            return;
        }
        this.drawRequest = requestAnimationFrame(() => this.draw());
        this.getDataFromNode();

        this.now = Date.now();
        this.elapsed = this.now - this.then;
        if (this.elapsed <= FPS_INTERVAL) {
            return;
        }

        this.then = this.now - (this.elapsed % FPS_INTERVAL);

        this.drawLogic();
    }
}

export class BasicVisualizer extends Visualizer {
    drawLogic() {
        if (this.canvasContext === null) {
            console.error!('Cannot draw on empty canvas');
            return;
        }
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = 'white';
        this.canvasContext.beginPath();
        const sliceWidth = this.width / this.bufferLength;
        let x = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * (this.height / 2);
            if (i === 0) {
                this.canvasContext.moveTo(x, y);
            } else {
                this.canvasContext.lineTo(x, y);
            }
            x += sliceWidth;
        }

        this.canvasContext.lineTo(this.width, this.height / 2);
        this.canvasContext.stroke();
    }
}

export class FFTVisualizer extends Visualizer {
    gradient: CanvasGradient | null = null;
    constructor(divId: string, analyserNode: AnalyserNode) {
        super(divId, analyserNode);

        this.analyserNode.fftSize = 512;
        this.bufferLength = analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }
    protected init() {
        if (this.canvasContext === null) {
            throw new Error(
                'Could not create gradient; failed to initialize canvas context',
            );
        }
        this.canvasContext.fillStyle = '#000000';
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        let gradient = this.canvasContext.createLinearGradient(
            0,
            0,
            0,
            this.height,
        );
        //gradient.addColorStop(0.0, '#b2b2ff');
        gradient.addColorStop(0.141, '#3b88c3');
        gradient.addColorStop(0.859, '#5ccadb');
        gradient.addColorStop(1, '#deb887');

        this.gradient = gradient;
    }

    protected getDataFromNode() {
        this.analyserNode.getByteFrequencyData(this.dataArray);
    }
    protected drawLogic() {
        if (this.canvasContext === null) {
            console.error!('Cannot draw on empty canvas');
            return;
        }

        this.canvasContext.fillStyle = '#00000014';
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        this.canvasContext.strokeStyle = this.gradient ?? 'orange';
        this.canvasContext.lineWidth = 1;

        this.canvasContext.beginPath();
        const sliceWidth = this.width / this.dataArray.length;
        let x = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const v = this.dataArray[i] / 255;
            const y = this.height - v * this.height;
            if (i === 0) {
                this.canvasContext.moveTo(x, y);
            } else {
                this.canvasContext.lineTo(x, y);
            }
            x += sliceWidth;
        }
        this.canvasContext.stroke();
    }
}
