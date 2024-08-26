/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>.

*/
use serde::Serialize;
use std::borrow::Cow;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};

#[derive(Clone, Serialize, Debug)]
pub(crate) enum FileType {
    Amiga,
    Xm,
}
impl std::fmt::Display for FileType {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            FileType::Amiga => write!(f, "Amiga")?,
            FileType::Xm => write!(f, "Xm")?,
        };

        Ok(())
    }
}

struct Extension(String);

impl TryFrom<&OsStr> for Extension {
    type Error = &'static str;
    fn try_from(s: &OsStr) -> Result<Self, Self::Error> {
        let s = s.to_str().ok_or("failed to get extension")?.to_string();

        Ok(Extension(s))
    }
}

impl TryFrom<Extension> for FileType {
    type Error = &'static str;
    fn try_from(s: Extension) -> Result<Self, Self::Error> {
        let file_type = match s.0.to_lowercase().as_str() {
            "xm" => FileType::Xm,
            "mod" => FileType::Amiga,
            _ => return Err("Unsupported file type"),
        };

        Ok(file_type)
    }
}

// Serializable wire format
#[derive(Debug, Clone, Serialize)]
pub(crate) struct SongLoadInfo {
    /*
    pub(crate) name: String,
    pub(crate) file_name: String,
    pub(crate) file_type: String,
    pub(crate) comment: String,
    pub(crate) instrument_comment: String,
    */
    pub(crate) id: usize,
    pub(crate) url: String,
    pub(crate) file_name: String,
    pub(crate) file_type: FileType,
    pub(crate) name: String,
    //pub(crate) instrument_comment: String,
}

fn file_name_to_url(file_name: &str) -> String {
    format!("/music/{}", file_name)
}

fn path_to_prefix(path: &Path) -> Option<String> {
    path.file_name()
        .and_then(|f| f.to_str())
        .map(|s| s.to_string())
}

fn load_amiga_name(bytes: &[u8]) -> Cow<'_, str> {
    String::from_utf8_lossy(&bytes[0..22])
}
fn load_xm_name(bytes: &[u8]) -> Cow<'_, str> {
    String::from_utf8_lossy(&bytes[17..37])
}

impl TryFrom<PathBuf> for SongLoadInfo {
    type Error = String;
    fn try_from(path: PathBuf) -> Result<Self, Self::Error> {
        let prefix = path_to_prefix(&path).ok_or("File has no prefix")?;

        let extension = Extension::try_from(path.extension().ok_or("path missing extension")?)?;

        let file_type = FileType::try_from(extension)?;

        let data = std::fs::read(path.clone()).map_err(|e| e.to_string())?;

        let name = match file_type {
            FileType::Amiga => load_amiga_name(&data),
            FileType::Xm => load_xm_name(&data),
        };

        let name = match name.find('\0') {
            Some(idx) => name[..idx].to_string(),
            None => name.into(),
        };

        // replace empty name with filename
        // TODO: reevaluate this default
        let name = match name.len() {
            0 => prefix.clone(),
            _ => name,
        };
        let url = file_name_to_url(&prefix);

        Ok(Self {
            id: 0,
            file_name: prefix,
            file_type,
            url,

            // Info from module
            name,
        })
    }
}

#[allow(dead_code)]
#[derive(Debug)]
pub(crate) enum DataProcessError {
    Io(String),
}

#[derive(Clone)]
pub(crate) struct SongsList(pub(crate) Vec<SongLoadInfo>);

impl SongsList {
    pub(crate) fn from_dir<P: AsRef<Path>>(p: P) -> Result<Self, DataProcessError> {
        let songs = std::fs::read_dir(p)
            .map_err(|e| DataProcessError::Io(e.to_string()))?
            .flatten()
            .flat_map(|entry| SongLoadInfo::try_from(entry.path()))
            .enumerate()
            .map(|(i, mut entry)| {
                entry.id = i;
                entry
            })
            .collect::<Vec<_>>();

        Ok(Self(songs))
    }
}
