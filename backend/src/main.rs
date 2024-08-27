/*

   Copyright 2024 wysiwys

     This file is part of cordial-modplayer.

    cordial-modplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    cordial-modplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with cordial-modplayer. If not, see <https://www.gnu.org/licenses/>.

*/
mod paths;
use paths::*;

mod fs;
use fs::*;

mod launcher;
use launcher::launcher;

use axum::{
    extract::State,
    http::{HeaderValue, Method, StatusCode},
    routing::get,
    Json, Router,
};

use std::path::PathBuf;

use clap::Parser;

use tower_http::{cors::CorsLayer, services::ServeDir, trace::TraceLayer};

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use tokio::net::TcpListener;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long, default_value_t = 3000)]
    port: u16,

    #[arg(short, long, default_value_t=user_music_dir_str())]
    music_dir: String,

    #[arg(short, long, default_value_t = false)]
    tracing: bool,
}

impl Args {
    fn to_config(&self) -> Config {
        Config {
            port: self.port,
            music_dir: process_raw_path(&self.music_dir),
        }
    }
}

#[derive(Clone)]
struct Config {
    port: u16,
    music_dir: PathBuf,
}

fn configure(config: &Config) {
    let user_data_dir = user_data_dir();

    if !(user_data_dir.exists()) {
        // create user's local data directory
        std::fs::create_dir_all(&user_data_dir).unwrap();
    }

    if config.music_dir == user_music_dir() && !config.music_dir.exists() {
        std::fs::create_dir(&config.music_dir).unwrap();
    }
}

#[tokio::main]
async fn main() -> eframe::Result {
    let args = Args::parse();

    if args.tracing {
        tracing_subscriber::registry()
            .with(
                tracing_subscriber::EnvFilter::try_from_default_env()
                    //.unwrap_or_else(|_| "cordial_modplayer=debug".into()),
                    .unwrap_or_else(|_| "cordial_modplayer=debug,tower_http=debug".into()),
            )
            .with(tracing_subscriber::fmt::layer())
            .init();
    }

    let mut config = args.to_config();

    configure(&config);

    let port = config.port;

    let listener = TcpListener::bind(format!("localhost:{}", port))
        .await
        .unwrap_or(TcpListener::bind("localhost:0").await.unwrap());

    // Update with correct port
    let local_addr = listener.local_addr().unwrap();
    config.port = local_addr.port();

    let router = make_router(&config).with_state(config.clone());

    tokio::spawn(serve(router, listener));

    launcher(&config)
}

impl TryFrom<String> for FileType {
    type Error = &'static str;

    fn try_from(s: String) -> Result<Self, Self::Error> {
        let ft = match s.to_lowercase().as_str() {
            "mod" => FileType::Amiga,
            "xm" => FileType::Xm,
            _ => return Err("Invalid file type"),
        };

        Ok(ft)
    }
}

async fn music_info(State(config): State<Config>) -> Result<Json<Vec<SongLoadInfo>>, StatusCode> {
    let songs_list =
        SongsList::from_dir(config.music_dir).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(songs_list.0))
}

fn make_router(config: &Config) -> Router<Config> {
    let cors = CorsLayer::new().allow_methods([Method::GET]).allow_origin(
        format!("http://localhost:{}", config.port)
            .parse::<HeaderValue>()
            .unwrap(),
    );

    Router::new()
        .layer(cors)
        .nest_service("/music", ServeDir::new(&config.music_dir))
        .nest_service("/", ServeDir::new(js_dir()))
        .route("/info", get(music_info))
}

async fn serve(app: Router, listener: TcpListener) {
    axum::serve(listener, app.layer(TraceLayer::new_for_http()))
        .await
        .unwrap();
}
