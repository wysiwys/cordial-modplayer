/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>.

*/

struct Launcher {
    addr: String,
    music_path: String,
}
/*
 */
pub(crate) fn launcher(config: &crate::Config) -> eframe::Result {
    let addr = format!("http://localhost:{}", config.port);
    let music_path = format!(
        "file://{}",
        std::fs::canonicalize(&config.music_dir).unwrap().display()
    );
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([400.0, 200.0])
            .with_resizable(false)
            .with_maximize_button(false),
        ..Default::default()
    };

    eframe::run_native(
        "Cordial ModPlayer",
        options,
        Box::new(|cc| {
            egui_extras::install_image_loaders(&cc.egui_ctx);
            Ok(Box::new(Launcher { addr, music_path }))
        }),
    )
}

impl eframe::App for Launcher {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        ctx.set_pixels_per_point(2.0);
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.vertical_centered(|ui| {
                let image = egui::Image::new(egui::include_image!("../background2.png"));
                image.paint_at(ui, ctx.screen_rect());
                ui.heading("Cordial ModPlayer");
                ui.hyperlink_to("Launch in browser", &self.addr);
                if ui.button("Open music folder").clicked() {
                    std::process::Command::new("open")
                        .arg(&self.music_path)
                        .spawn()
                        .unwrap();
                }
            });
        });
    }
}
