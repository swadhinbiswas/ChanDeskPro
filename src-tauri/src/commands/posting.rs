use reqwest::{Client, multipart};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{Duration, Instant};

const POST_URL: &str = "https://sys.4chan.org";
const RATE_LIMIT_SECONDS: u64 = 60; // 1 minute between posts

lazy_static::lazy_static! {
    static ref LAST_POST_TIME: Mutex<Option<Instant>> = Mutex::new(None);
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostRequest {
    pub board: String,
    pub resto: Option<u64>, // 0 or None for new thread, thread number for reply
    pub name: Option<String>,
    pub email: Option<String>,
    pub subject: Option<String>,
    pub comment: String,
    pub file_path: Option<String>,
    pub file_name: Option<String>,
    pub captcha_challenge: Option<String>,
    pub captcha_response: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostResponse {
    pub success: bool,
    pub thread_id: Option<u64>,
    pub post_id: Option<u64>,
    pub error: Option<String>,
}

/// Check rate limit and return seconds until next post allowed
fn check_rate_limit() -> Option<u64> {
    let last = LAST_POST_TIME.lock().unwrap();
    if let Some(instant) = *last {
        let elapsed = instant.elapsed();
        if elapsed < Duration::from_secs(RATE_LIMIT_SECONDS) {
            return Some(RATE_LIMIT_SECONDS - elapsed.as_secs());
        }
    }
    None
}

fn update_last_post_time() {
    let mut last = LAST_POST_TIME.lock().unwrap();
    *last = Some(Instant::now());
}

#[tauri::command]
pub async fn submit_post(
    request: PostRequest,
    pass_token: Option<String>,
) -> Result<PostResponse, String> {
    // Check rate limit
    if let Some(seconds) = check_rate_limit() {
        return Err(format!("Please wait {} seconds before posting again", seconds));
    }

    // Build multipart form
    let mut form = multipart::Form::new()
        .text("mode", "regist")
        .text("resto", request.resto.unwrap_or(0).to_string())
        .text("com", request.comment.clone());

    // Optional fields
    if let Some(name) = &request.name {
        form = form.text("name", name.clone());
    }
    if let Some(email) = &request.email {
        form = form.text("email", email.clone());
    }
    if let Some(subject) = &request.subject {
        form = form.text("subject", subject.clone());
    }

    // File attachment
    if let Some(file_path) = &request.file_path {
        let file_data = std::fs::read(file_path).map_err(|e| format!("Failed to read file: {}", e))?;
        let filename = request.file_name.clone().unwrap_or_else(|| {
            std::path::Path::new(file_path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("file")
                .to_string()
        });
        
        let mime = mime_guess::from_path(file_path)
            .first_or_octet_stream()
            .to_string();
            
        let part = multipart::Part::bytes(file_data)
            .file_name(filename)
            .mime_str(&mime)
            .map_err(|e| e.to_string())?;
            
        form = form.part("upfile", part);
    }

    // Add captcha fields if provided
    if let Some(challenge) = &request.captcha_challenge {
        form = form.text("t-challenge", challenge.clone());
    }
    if let Some(response) = &request.captcha_response {
        form = form.text("t-response", response.clone());
    }

    // Build client with cookies for 4chan Pass
    let mut client_builder = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(Duration::from_secs(30));

    // Add pass cookie if provided
    let mut headers = reqwest::header::HeaderMap::new();
    if let Some(token) = pass_token {
        headers.insert(
            reqwest::header::COOKIE, 
            format!("pass_id={}", token).parse().unwrap()
        );
    }
    
    client_builder = client_builder.default_headers(headers);
    let client = client_builder.build().map_err(|e| e.to_string())?;

    // Submit post
    let url = format!("{}/{}/post", POST_URL, request.board);
    let response = client
        .post(&url)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    update_last_post_time();

    let status = response.status();
    let text = response.text().await.unwrap_or_default();

    // Parse response
    // 4chan returns HTML, we need to check for success/error patterns
    if text.contains("Post successful") || text.contains("Thread posted") {
        // Try to extract post/thread number from response
        // This is a simplified parser - real implementation would need proper HTML parsing
        Ok(PostResponse {
            success: true,
            thread_id: if request.resto.unwrap_or(0) == 0 { Some(0) } else { None }, // Would need to parse
            post_id: Some(0), // Would need to parse
            error: None,
        })
    } else if text.contains("Error") || !status.is_success() {
        // Extract error message
        let error = if text.contains("banned") {
            "You are banned from posting".to_string()
        } else if text.contains("flood detected") {
            "Flood detected. Please wait before posting again.".to_string()
        } else if text.contains("CAPTCHA") || text.contains("Verification") {
            "CAPTCHA verification failed or expired. Please try again.".to_string()
        } else if text.contains("file too large") {
            "File is too large".to_string()
        } else if text.contains("duplicate file") {
            "Duplicate file entry detected".to_string()
        } else {
            format!("Post failed: HTTP {}", status)
        };
        
        Ok(PostResponse {
            success: false,
            thread_id: None,
            post_id: None,
            error: Some(error),
        })
    } else {
        Ok(PostResponse {
            success: false,
            thread_id: None,
            post_id: None,
            error: Some("Unknown response from server".to_string()),
        })
    }
}

#[tauri::command]
pub fn get_post_cooldown() -> u64 {
    check_rate_limit().unwrap_or(0)
}

/// Captcha challenge response from 4chan
#[derive(Debug, Serialize, Deserialize)]
pub struct CaptchaChallenge {
    pub challenge: String,
    pub image_url: String,
    pub ttl: u32, // Time to live in seconds
    pub cd: u32,  // Cooldown in seconds
}

/// Fetch a new captcha challenge from 4chan
#[tauri::command]
pub async fn fetch_captcha(board: String) -> Result<CaptchaChallenge, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    // 4chan captcha API endpoint
    let url = format!("https://sys.4chan.org/captcha?board={}", board);
    
    let response = client
        .get(&url)
        .header("Referer", format!("https://boards.4chan.org/{}/", board))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch captcha: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Captcha request failed: HTTP {}", response.status()));
    }
    
    // Parse the response - 4chan returns a specific format
    // The response contains challenge ID and image data
    let text = response.text().await.map_err(|e| e.to_string())?;
    
    // Try to parse as JSON first (newer API format)
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
        if let Some(challenge) = json.get("challenge").and_then(|v| v.as_str()) {
            let ttl = json.get("ttl").and_then(|v| v.as_u64()).unwrap_or(120) as u32;
            let cd = json.get("cd").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
            
            // Image is base64 encoded in the response
            let img = json.get("img").and_then(|v| v.as_str()).unwrap_or("");
            let image_url = format!("data:image/png;base64,{}", img);
            
            return Ok(CaptchaChallenge {
                challenge: challenge.to_string(),
                image_url,
                ttl,
                cd,
            });
        }
    }
    
    Err("Failed to parse captcha response. Try using a 4chan Pass.".to_string())
}

#[tauri::command]
pub async fn validate_pass_token(token: String) -> Result<bool, String> {
    // Try to access a Pass-only endpoint to verify token
    let client = Client::builder()
        .user_agent("Mozilla/5.0")
        .build()
        .map_err(|e| e.to_string())?;
        
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::COOKIE,
        format!("pass_id={}", token).parse().unwrap()
    );
    
    let response = client
        .get("https://sys.4chan.org/auth")
        .headers(headers)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    // If we get a 200, token is valid
    Ok(response.status().is_success())
}

