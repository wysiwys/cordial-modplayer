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
