use tauri::{AppHandle, Manager};
use reqwest;
use std::path::PathBuf;
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
pub async fn fetch_image_with_cors_bypass(
    url: String,
    app: AppHandle,
) -> Result<String, String> {
    // Create cache directory
    let cache_dir = app.path().cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?
        .join("images");
    
    std::fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache dir: {}", e))?;

    // Extract filename from URL
    let filename = url.split('/').last()
        .ok_or_else(|| "Invalid URL".to_string())?;
    
    let cache_path = cache_dir.join(filename);

    // Check if already cached
    if cache_path.exists() {
        let bytes = std::fs::read(&cache_path)
            .map_err(|e| format!("Failed to read cached image: {}", e))?;
        
        // Detect MIME type from extension
        let mime_type = get_mime_type(filename);
        let base64 = general_purpose::STANDARD.encode(&bytes);
        return Ok(format!("data:{};base64,{}", mime_type, base64));
    }

    // Download image
    let client = reqwest::Client::new();
    let response = client.get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .header("Referer", "https://boards.4chan.org/")
        .send()
        .await
        .map_err(|e| format!("Failed to download image: {}", e))?;

    let bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {}", e))?;

    // Save to cache
    std::fs::write(&cache_path, &bytes)
        .map_err(|e| format!("Failed to write image: {}", e))?;

    // Return as base64 data URL
    let mime_type = get_mime_type(filename);
    let base64 = general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime_type, base64))
}

fn get_mime_type(filename: &str) -> &str {
    if filename.ends_with(".jpg") || filename.ends_with(".jpeg") {
        "image/jpeg"
    } else if filename.ends_with(".png") {
        "image/png"
    } else if filename.ends_with(".gif") {
        "image/gif"
    } else if filename.ends_with(".webp") {
        "image/webp"
    } else {
        "image/jpeg" // default
    }
}

#[tauri::command]
pub async fn clear_image_cache(app: AppHandle) -> Result<(), String> {
    let cache_dir = app.path().cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?
        .join("images");
    
    if cache_dir.exists() {
        std::fs::remove_dir_all(&cache_dir)
            .map_err(|e| format!("Failed to clear cache: {}", e))?;
    }
    
    Ok(())
}
