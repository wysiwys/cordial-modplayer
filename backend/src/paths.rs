/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>.

*/
use directories::ProjectDirs;

use std::path::PathBuf;

pub(crate) fn user_data_dir() -> PathBuf {
    ProjectDirs::from("", "", "cordial")
        .unwrap()
        .data_local_dir()
        .into()
}

pub(crate) fn user_music_dir() -> PathBuf {
    user_data_dir().join("music")
}

pub(crate) fn user_music_dir_str() -> String {
    user_music_dir().to_str().unwrap().into()
}

#[cfg(debug_assertions)]
pub(crate) fn js_dir() -> PathBuf {
    "../frontend/dist".into()
}

#[cfg(not(debug_assertions))]
pub(crate) fn program_data_dir() -> PathBuf {
    std::env::current_exe().unwrap().parent().unwrap().into()
}

#[cfg(not(debug_assertions))]
pub(crate) fn js_dir() -> PathBuf {
    program_data_dir().join("dist")
}

pub(crate) fn process_raw_path(path: &str) -> PathBuf {
    let home_dir: PathBuf = directories::UserDirs::new().unwrap().home_dir().into();
    if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
        if path.starts_with('~') {
            return home_dir.join(&path[2..]);
        }
    } else if cfg!(target_os = "windows") {
        // XXX: Untested, so I don't know if this works
        let prefix = "%LOCALAPPDATA%";
        if path.starts_with(prefix) {
            let start_idx = prefix.len() + 1;
            return home_dir.join(&path[start_idx..]);
        }
    }

    path.into()
}
