#!/bin/bash

#  Copyright 2024 wysiwys
#
#  This file is part of cordial-modplayer.
#  
#  cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
#
#   cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>. 


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
