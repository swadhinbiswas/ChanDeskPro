use std::path::PathBuf;
use std::fs;
use dirs;

fn get_media_cache_dir() -> PathBuf {
    let cache_dir = dirs::cache_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("chandesk")
        .join("media");
    
    fs::create_dir_all(&cache_dir).ok();
    cache_dir
}

#[tauri::command]
pub async fn download_media(
    url: String,
    board: String,
    thread_id: u64,
) -> Result<String, String> {
    let cache_dir = get_media_cache_dir();
    let board_dir = cache_dir.join(&board).join(thread_id.to_string());
    
    fs::create_dir_all(&board_dir).map_err(|e| e.to_string())?;

    // Extract filename from URL
    let filename = url
        .split('/')
        .last()
        .ok_or("Invalid URL")?
        .to_string();
    
    let file_path = board_dir.join(&filename);

    // Check if already cached
    if file_path.exists() {
        return Ok(file_path.to_string_lossy().to_string());
    }

    // Download file
    let response = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?;

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    fs::write(&file_path, bytes).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_cached_media_path(
    board: String,
    thread_id: u64,
    filename: String,
) -> Result<Option<String>, String> {
    let cache_dir = get_media_cache_dir();
    let file_path = cache_dir.join(&board).join(thread_id.to_string()).join(&filename);

    if file_path.exists() {
        Ok(Some(file_path.to_string_lossy().to_string()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn clear_media_cache() -> Result<(), String> {
    let cache_dir = get_media_cache_dir();
    fs::remove_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_cache_size() -> Result<u64, String> {
    let cache_dir = get_media_cache_dir();
    
    fn dir_size(path: &PathBuf) -> Result<u64, std::io::Error> {
        let mut size = 0;
        if path.is_dir() {
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let path = entry.path();
                if path.is_dir() {
                    size += dir_size(&path)?;
                } else {
                    size += entry.metadata()?.len();
                }
            }
        }
        Ok(size)
    }

    dir_size(&cache_dir).map_err(|e| e.to_string())
}
