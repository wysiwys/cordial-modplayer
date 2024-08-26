#!/bin/bash

set -e

# Requirements: npm, cargo, cargo-about, wasm-bindgen

# Build the frontend and backend
cargo build --release --manifest-path backend/Cargo.toml
npm --prefix frontend ci # needs package-lock.json
# This also generates the js licenses
npm --prefix frontend run build


# Create the new out/ directory
rm -rf out
mkdir out
cp target/release/cordial_modplayer out/
cp -r frontend/dist out/

# Generate and copy licenses
cargo about init
cargo about generate about.hbs > out/dist/rust_license.html
