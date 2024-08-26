use wasm_bindgen::prelude::*;

use xmrs::amiga::amiga_module::AmigaModule;
use xmrs::prelude::*;
use xmrs::xm::xmmodule::XmModule;
use xmrsplayer::prelude::*;

#[wasm_bindgen]
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
pub fn extract_metadata(data: Vec<u8>, file_type: &str) -> InnerMetadata {
    let module = match file_type {
        "Xm" => XmModule::load(&data).unwrap().to_module(),
        "Amiga" => AmigaModule::load(&data).unwrap().to_module(),
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
    pub fn next_samples(&mut self, output: &mut [f32]) -> Result<(), PlayerError> {
        // Check if playing has completed
        // This is the same check that would be done in `player.next()`
        if self.player.max_loop_count > 0 && self.player.loop_count >= self.player.max_loop_count {
            return Err(PlayerError::SongOver);
        }

        self.player.generate_samples(output);

        Ok(())
    }
}
