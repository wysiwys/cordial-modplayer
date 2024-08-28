# About

`cordial-modplayer` is a simple browser-based player for music tracker modules. Currently it supports Amiga and Xm modules.

# Web player

Try it out at https://wysiwys.github.io/cordial-modplayer/

Drag and drop XM or MOD files into the page, and double click to play

# Purpose

To challenge myself to write a WASM module with Rust, learn the Web Audio API, and understand tracker module formats better.

# Architecture

- Audio synthesis using `xmrsplayer`, running in an Audio Worklet node for playing modules in the client
- Analyzer nodes for client-side audio visualizations
- Axum backend for simple web server and filesystem interactions
- GUI created with TypeScript and Vue.js
- Bundling with Vite

# License

The code is licensed under GPL-3.0. However, some assets have different licenses, and are specified here. The background image is credit to ambientcg.com and is licensed under CC0. The font is licensed under OFL and included with its license.

# Installation

See [Building from source](#building-from-source) below.

# Building from source

See the [building from source](https://github.com/wysiwys/cordial-modplayer/blob/main/docs/build-from-src.md) guide

# Screenshot 

<p align="center">
<img src="https://github.com/wysiwys/cordial-modplayer/blob/main/screenshot.png"/>
</p>
