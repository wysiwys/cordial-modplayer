# About

`cordial-modplayer` is a simple browser-based player for tracker modules. Currently it supports Amiga and Xm modules.

# Purpose

To challenge myself to write a WASM module with Rust, learn the Web Audio API, and understand module tracker formats better.

# Architecture

- Audio synthesis using `xmrsplayer`, running in an Audio Worklet node for playing modules in the client
- Analyzer nodes for client-side audio visualizations
- Axum backend for simple web server and filesystem interactions
- GUI created with TypeScript and Vue.js

# Installation

See [Building from source](#building-from-source) below.

# Building from source

See the [building from source](https://github.com/wysiwys/cordial-modplayer/blob/main/docs/build-from-src.md) guide

# Screenshot 

<p align="center">
<img src="https://github.com/wysiwys/cordial-modplayer/blob/main/screenshot.png"/>
</p>
