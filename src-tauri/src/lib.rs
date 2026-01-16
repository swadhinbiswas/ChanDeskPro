mod api;
mod commands;
mod boards_metadata;
mod video_server;
mod cache;

use api::ChanClient;
use commands::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize API client
    let client = ChanClient::new().expect("Failed to create API client");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(client)
        .setup(|app| {
            // Initialize cache database
            if let Err(e) = cache::init_cache_db() {
                eprintln!("Failed to initialize cache database: {}", e);
            } else {
                println!("Cache database initialized");
                // Run auto cleanup on startup
                match cache::run_auto_cleanup(None, None) {
                    Ok((by_age, by_size)) => {
                        if by_age > 0 || by_size > 0 {
                            println!("Cache cleanup: {} by age, {} by size", by_age, by_size);
                        }
                    }
                    Err(e) => eprintln!("Cache cleanup error: {}", e),
                }
            }

            // Start video server on app setup
            let cache_dir = app.path().cache_dir()
                .expect("Failed to get cache dir")
                .join("videos");
            
            std::fs::create_dir_all(&cache_dir).ok();
            
            match video_server::start_video_server(cache_dir) {
                Ok(port) => println!("Video server started on port {}", port),
                Err(e) => eprintln!("Failed to start video server: {}", e),
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_all_boards_with_metadata,
            search_boards,
            fetch_popular_threads,
            fetch_catalog,
            fetch_thread,
            download_media,
            get_cached_media_path,
            clear_media_cache,
            get_cache_size,
            fetch_image_with_cors_bypass,
            clear_image_cache,
            submit_post,
            get_post_cooldown,
            validate_pass_token,
            fetch_captcha,
            fetch_sevenchan_catalog,
            fetch_sevenchan_thread,
            fetch_fourplebs_boards,
            fetch_fourplebs_catalog,
            fetch_fourplebs_thread,
            fetch_archivedmoe_boards,
            fetch_archivedmoe_catalog,
            fetch_archivedmoe_thread,
            fetch_twentytwochan_boards,
            fetch_twentytwochan_catalog,
            fetch_twentytwochan_thread,
            proxy_video,
            clear_video_cache,
            get_thread_cache_stats,
            is_thread_cached,
            get_cached_thread,
            cache_thread,
            cleanup_thread_cache,
            clear_thread_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
