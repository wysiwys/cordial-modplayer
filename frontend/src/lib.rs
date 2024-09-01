/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>.

*/

use wasm_bindgen::prelude::*;

use xmrs::amiga::amiga_module::AmigaModule;
use xmrs::prelude::*;
use xmrs::xm::xmmodule::XmModule;
use xmrsplayer::prelude::*;

#[wasm_bindgen]
#[derive(Clone)]
pub struct InnerMetadata {
    instrument_comment: String,
}

#[wasm_bindgen]
impl InnerMetadata {
    #[wasm_bindgen(js_name = instrumentComment)]
    pub fn instrument_comment(&self) -> String {
        self.instrument_comment.clone()
    }
}

#[wasm_bindgen(js_name = extractMetadata)]
pub fn extract_metadata(data: &[u8], file_type: &str) -> InnerMetadata {
    let module = match file_type {
        "Xm" => XmModule::load(data).unwrap().to_module(),
        "Amiga" => AmigaModule::load(data).unwrap().to_module(),
        _ => panic!("Unsupported module type"),
    };

    let instrument_comment = module
        .instrument
        .into_iter()
        .map(|instr| instr.name)
        .collect::<Vec<_>>()
        .join("\n");

    InnerMetadata { instrument_comment }
}

#[wasm_bindgen]
pub struct ExtractedSongInfo {
    name: String,
    inner_metadata: InnerMetadata,
}

#[wasm_bindgen]
impl ExtractedSongInfo {
    #[wasm_bindgen]
    pub fn name(&self) -> String {
        self.name.clone()
    }
    #[wasm_bindgen(js_name = innerMetadata)]
    pub fn inner_metadata(&self) -> InnerMetadata {
        self.inner_metadata.clone()
    }
}

#[wasm_bindgen(js_name = extractSongInfo)]
pub fn extract_song_info(data: &[u8], file_type: &str) -> ExtractedSongInfo {
    let module = match file_type {
        "Xm" => XmModule::load(data).unwrap().to_module(),
        "Amiga" => AmigaModule::load(data).unwrap().to_module(),
        _ => panic!("Unsupported module type"),
    };

    let instrument_comment = module
        .instrument
        .into_iter()
        .map(|instr| instr.name)
        .collect::<Vec<_>>()
        .join("\n");

    let inner_metadata = InnerMetadata { instrument_comment };

    let name = match module.name.find('\0') {
        Some(pos) => module.name[0..pos].to_string(),
        None => module.name,
    };
    ExtractedSongInfo {
        name,
        inner_metadata,
    }
}

#[wasm_bindgen]
pub enum PlayerError {
    SongOver,
}

#[wasm_bindgen]
pub struct Player {
    player: XmrsPlayer<'static>,
}

#[wasm_bindgen]
impl Player {
    fn new_player(sample_rate: f32, module: Module) -> Self {
        let module = Box::new(module);
        let module_ref: &'static Module = Box::leak(module);

        let is_ft2 = module_ref.comment == "FastTracker v2.00 (1.04)";
        let mut player = XmrsPlayer::new(module_ref, sample_rate, is_ft2);
        player.amplification = 1.00;
        player.goto(0, 0, 0);
        player.set_max_loop_count(1);

        Self { player }
    }
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, data: Vec<u8>, file_type: &str) -> Player {
        let module = match file_type {
            "Xm" => XmModule::load(&data).unwrap().to_module(),
            "Amiga" => AmigaModule::load(&data).unwrap().to_module(),
            _ => panic!("Unsupported module type"),
        };

        Self::new_player(sample_rate, module)
    }

    #[wasm_bindgen(js_name = nextSamples)]
    pub fn next_samples(
        &mut self,
        chan1: &mut [f32],
        chan2: &mut [f32],
    ) -> Result<(), PlayerError> {
        for i in 0..chan1.len() {
            chan1[i] = self.player.next().ok_or(PlayerError::SongOver)?;
            chan2[i] = self.player.next().ok_or(PlayerError::SongOver)?;
        }

        Ok(())
    }
}
