/**
 * Video Server Module
 * 
 * Runs a local HTTP server to serve cached videos, bypassing browser security restrictions.
 * This approach is more reliable than Tauri's asset protocol for video streaming.
 */

use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU16, Ordering};
use std::sync::Arc;
use std::thread;
use tauri::{AppHandle, Manager};

static VIDEO_SERVER_PORT: AtomicU16 = AtomicU16::new(0);

/// Get the video server base URL
pub fn get_video_server_url() -> Option<String> {
    let port = VIDEO_SERVER_PORT.load(Ordering::SeqCst);
    if port > 0 {
        Some(format!("http://127.0.0.1:{}", port))
    } else {
        None
    }
}

/// Start the video server on a random available port
pub fn start_video_server(cache_dir: PathBuf) -> Result<u16, String> {
    // Find an available port
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("Failed to bind: {}", e))?;
    
    let port = listener.local_addr()
        .map_err(|e| format!("Failed to get addr: {}", e))?
        .port();
    
    VIDEO_SERVER_PORT.store(port, Ordering::SeqCst);
    
    println!("Starting video server on http://127.0.0.1:{}", port);
    
    // Spawn server thread
    let cache_dir_clone = cache_dir.clone();
    thread::spawn(move || {
        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    let cache_dir = cache_dir_clone.clone();
                    thread::spawn(move || {
                        if let Err(e) = handle_request(stream, &cache_dir) {
                            eprintln!("Request error: {}", e);
                        }
                    });
                }
                Err(e) => eprintln!("Connection failed: {}", e),
            }
        }
    });
    
    Ok(port)
}

fn handle_request(mut stream: TcpStream, cache_dir: &PathBuf) -> Result<(), String> {
    let mut buffer = [0; 4096];
    let bytes_read = stream.read(&mut buffer)
        .map_err(|e| format!("Failed to read: {}", e))?;
    
    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    
    // Parse request line
    let first_line = request.lines().next().unwrap_or("");
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    
    if parts.len() < 2 {
        return send_error(&mut stream, 400, "Bad Request");
    }
    
    let path = parts[1];
    
    // Handle CORS preflight
    if parts[0] == "OPTIONS" {
        return send_cors_preflight(&mut stream);
    }
    
    // Only handle GET
    if parts[0] != "GET" {
        return send_error(&mut stream, 405, "Method Not Allowed");
    }
    
    // Get filename from path
    let filename = path.trim_start_matches('/');
    if filename.is_empty() || filename.contains("..") {
        return send_error(&mut stream, 400, "Invalid path");
    }
    
    let file_path = cache_dir.join(filename);
    
    // Check if file exists
    if !file_path.exists() {
        return send_error(&mut stream, 404, "Not Found");
    }
    
    // Read file and send response
    let mut file = File::open(&file_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let metadata = file.metadata()
        .map_err(|e| format!("Failed to get metadata: {}", e))?;
    
    let content_type = if filename.ends_with(".webm") {
        "video/webm"
    } else if filename.ends_with(".mp4") {
        "video/mp4"
    } else if filename.ends_with(".gif") {
        "image/gif"
    } else {
        "application/octet-stream"
    };
    
    // Parse Range header for seeking support
    let range_header = request.lines()
        .find(|l| l.to_lowercase().starts_with("range:"))
        .map(|l| l.trim_start_matches(|c: char| !c.is_ascii_digit()));
    
    let file_size = metadata.len();
    
    let (start, end, status) = if let Some(range) = range_header {
        // Parse range: bytes=0-1234
        let range = range.trim().trim_start_matches("bytes=");
        let parts: Vec<&str> = range.split('-').collect();
        let start: u64 = parts.get(0).and_then(|s| s.parse().ok()).unwrap_or(0);
        let end: u64 = parts.get(1)
            .and_then(|s| if s.is_empty() { None } else { s.parse().ok() })
            .unwrap_or(file_size - 1)
            .min(file_size - 1);
        (start, end, 206)
    } else {
        (0, file_size - 1, 200)
    };
    
    let content_length = end - start + 1;
    
    // Seek to start position
    use std::io::Seek;
    file.seek(std::io::SeekFrom::Start(start))
        .map_err(|e| format!("Failed to seek: {}", e))?;
    
    // Build response
    let status_text = if status == 206 { "Partial Content" } else { "OK" };
    let mut response = format!(
        "HTTP/1.1 {} {}\r\n\
        Content-Type: {}\r\n\
        Content-Length: {}\r\n\
        Accept-Ranges: bytes\r\n\
        Access-Control-Allow-Origin: *\r\n\
        Access-Control-Allow-Methods: GET, OPTIONS\r\n\
        Access-Control-Allow-Headers: Range\r\n\
        Connection: close\r\n",
        status, status_text, content_type, content_length
    );
    
    if status == 206 {
        response.push_str(&format!(
            "Content-Range: bytes {}-{}/{}\r\n",
            start, end, file_size
        ));
    }
    
    response.push_str("\r\n");
    
    stream.write_all(response.as_bytes())
        .map_err(|e| format!("Failed to write headers: {}", e))?;
    
    // Stream file content
    let mut buffer = vec![0u8; 64 * 1024]; // 64KB chunks
    let mut remaining = content_length as usize;
    
    while remaining > 0 {
        let to_read = remaining.min(buffer.len());
        let bytes_read = file.read(&mut buffer[..to_read])
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        if bytes_read == 0 {
            break;
        }
        
        stream.write_all(&buffer[..bytes_read])
            .map_err(|e| format!("Failed to write: {}", e))?;
        
        remaining -= bytes_read;
    }
    
    Ok(())
}

fn send_error(stream: &mut TcpStream, code: u16, message: &str) -> Result<(), String> {
    let response = format!(
        "HTTP/1.1 {} {}\r\n\
        Content-Type: text/plain\r\n\
        Content-Length: {}\r\n\
        Access-Control-Allow-Origin: *\r\n\
        Connection: close\r\n\r\n{}",
        code, message, message.len(), message
    );
    stream.write_all(response.as_bytes())
        .map_err(|e| format!("Failed to send error: {}", e))
}

fn send_cors_preflight(stream: &mut TcpStream) -> Result<(), String> {
    let response = "HTTP/1.1 204 No Content\r\n\
        Access-Control-Allow-Origin: *\r\n\
        Access-Control-Allow-Methods: GET, OPTIONS\r\n\
        Access-Control-Allow-Headers: Range\r\n\
        Access-Control-Max-Age: 86400\r\n\
        Connection: close\r\n\r\n";
    stream.write_all(response.as_bytes())
        .map_err(|e| format!("Failed to send preflight: {}", e))
}
