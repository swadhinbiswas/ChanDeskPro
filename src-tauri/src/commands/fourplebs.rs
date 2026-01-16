/**
 * 4plebs Archive API Commands
 * 
 * Backend commands for fetching data from 4plebs.org
 * 
 * 4plebs is a 4chan archive using FoolFuuka software.
 * API Documentation: https://archive.4plebs.org/_/api/chan/
 */

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const FOURPLEBS_API_BASE: &str = "https://archive.4plebs.org/_/api/chan";
const FOURPLEBS_IMAGE_BASE: &str = "https://i.4pcdn.org";

/// Archived boards on 4plebs
const FOURPLEBS_BOARDS: &[(&str, &str, bool)] = &[
    ("adv", "Advice", false),
    ("f", "Flash", false),
    ("hr", "High Resolution", false),
    ("o", "Auto", false),
    ("pol", "Politically Incorrect", true),
    ("s4s", "Shit 4chan Says", true),
    ("sp", "Sports", false),
    ("tg", "Traditional Games", false),
    ("trv", "Travel", false),
    ("tv", "Television & Film", false),
    ("x", "Paranormal", false),
];

#[derive(Debug, Serialize, Deserialize)]
pub struct FourPlebsBoard {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub nsfw: bool,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FourPlebsPost {
    pub no: u64,
    pub resto: u64,
    pub time: u64,
    pub name: Option<String>,
    pub trip: Option<String>,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<String>,       // 4plebs uses string for media ID
    pub ext: Option<String>,
    pub filename: Option<String>,
    pub fsize: Option<u64>,
    pub w: Option<u32>,
    pub h: Option<u32>,
    pub tn_w: Option<u32>,
    pub tn_h: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FourPlebsThread {
    pub posts: Vec<FourPlebsPost>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FourPlebsCatalogThread {
    pub no: u64,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<String>,
    pub ext: Option<String>,
    pub replies: u32,
    pub images: u32,
    pub time: u64,
    pub name: Option<String>,
    pub trip: Option<String>,
}

/// Parse a FoolFuuka post from the API response
fn parse_foolfuuka_post(post: &Value, thread_num: u64) -> Option<FourPlebsPost> {
    let no = post.get("num")?.as_u64()
        .or_else(|| post.get("num").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))?;
    
    let timestamp = post.get("timestamp")?.as_u64()
        .or_else(|| post.get("timestamp").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))?;
    
    // Get media info if present
    let media = post.get("media");
    let (tim, ext, filename, fsize, w, h, tn_w, tn_h) = if let Some(m) = media {
        if m.is_null() {
            (None, None, None, None, None, None, None, None)
        } else {
            let media_id = m.get("media_id").and_then(|v| v.as_str()).map(String::from)
                .or_else(|| m.get("media_id").and_then(|v| v.as_u64()).map(|n| n.to_string()));
            let ext = m.get("media_filename").and_then(|v| v.as_str())
                .and_then(|f| f.rsplit_once('.').map(|(_, e)| format!(".{}", e)));
            let filename = m.get("media_filename").and_then(|v| v.as_str())
                .and_then(|f| f.rsplit_once('.').map(|(n, _)| n.to_string()));
            let fsize = m.get("media_size").and_then(|v| v.as_u64())
                .or_else(|| m.get("media_size").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()));
            let w = m.get("media_w").and_then(|v| v.as_u64())
                .or_else(|| m.get("media_w").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                .map(|n| n as u32);
            let h = m.get("media_h").and_then(|v| v.as_u64())
                .or_else(|| m.get("media_h").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                .map(|n| n as u32);
            let tn_w = m.get("preview_w").and_then(|v| v.as_u64())
                .or_else(|| m.get("preview_w").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                .map(|n| n as u32);
            let tn_h = m.get("preview_h").and_then(|v| v.as_u64())
                .or_else(|| m.get("preview_h").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                .map(|n| n as u32);
            
            (media_id, ext, filename, fsize, w, h, tn_w, tn_h)
        }
    } else {
        (None, None, None, None, None, None, None, None)
    };
    
    Some(FourPlebsPost {
        no,
        resto: if no == thread_num { 0 } else { thread_num },
        time: timestamp,
        name: post.get("name").and_then(|v| v.as_str()).map(String::from),
        trip: post.get("trip").and_then(|v| v.as_str()).map(String::from),
        sub: post.get("title").and_then(|v| v.as_str()).map(String::from),
        com: post.get("comment_sanitized")
            .or_else(|| post.get("comment"))
            .and_then(|v| v.as_str())
            .map(String::from),
        tim,
        ext,
        filename,
        fsize,
        w,
        h,
        tn_w,
        tn_h,
    })
}

/// Get list of available boards on 4plebs
#[tauri::command]
pub async fn fetch_fourplebs_boards() -> Result<Vec<FourPlebsBoard>, String> {
    let boards: Vec<FourPlebsBoard> = FOURPLEBS_BOARDS
        .iter()
        .map(|(id, name, nsfw)| FourPlebsBoard {
            id: id.to_string(),
            name: name.to_string(),
            description: Some(format!("4plebs archive of /{}/", id)),
            nsfw: *nsfw,
            category: "Archive".to_string(),
        })
        .collect();
    
    Ok(boards)
}

/// Fetch catalog/index from 4plebs for a specific board
#[tauri::command]
pub async fn fetch_fourplebs_catalog(board: String, page: Option<u32>) -> Result<Vec<FourPlebsCatalogThread>, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let page_num = page.unwrap_or(1);
    let url = format!("{}/index/?board={}&page={}", FOURPLEBS_API_BASE, board, page_num);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to fetch catalog: HTTP {}", response.status()));
    }
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    let json: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    
    // FoolFuuka index format: { "board_shortname": { thread_num: { op: {...}, posts: {...} } } }
    let mut threads = Vec::new();
    
    if let Some(board_data) = json.get(&board) {
        if let Some(obj) = board_data.as_object() {
            for (thread_num_str, thread_data) in obj {
                let thread_num: u64 = thread_num_str.parse().unwrap_or(0);
                
                // Get OP post
                if let Some(op) = thread_data.get("op") {
                    let timestamp = op.get("timestamp").and_then(|v| v.as_u64())
                        .or_else(|| op.get("timestamp").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                        .unwrap_or(0);
                    
                    // Count posts
                    let posts_count = thread_data.get("posts")
                        .and_then(|p| p.as_object())
                        .map(|p| p.len() as u32)
                        .unwrap_or(0);
                    
                    // Get media info
                    let media = op.get("media");
                    let (tim, ext) = if let Some(m) = media {
                        if m.is_null() {
                            (None, None)
                        } else {
                            let media_id = m.get("media_id").and_then(|v| v.as_str()).map(String::from)
                                .or_else(|| m.get("media_id").and_then(|v| v.as_u64()).map(|n| n.to_string()));
                            let ext = m.get("media_filename").and_then(|v| v.as_str())
                                .and_then(|f| f.rsplit_once('.').map(|(_, e)| format!(".{}", e)));
                            (media_id, ext)
                        }
                    } else {
                        (None, None)
                    };
                    
                    threads.push(FourPlebsCatalogThread {
                        no: thread_num,
                        sub: op.get("title").and_then(|v| v.as_str()).map(String::from),
                        com: op.get("comment_sanitized")
                            .or_else(|| op.get("comment"))
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        tim,
                        ext,
                        replies: posts_count,
                        images: 0,  // FoolFuuka doesn't provide image count in index
                        time: timestamp,
                        name: op.get("name").and_then(|v| v.as_str()).map(String::from),
                        trip: op.get("trip").and_then(|v| v.as_str()).map(String::from),
                    });
                }
            }
        }
    }
    
    // Sort by time descending (newest first)
    threads.sort_by(|a, b| b.time.cmp(&a.time));
    
    Ok(threads)
}

/// Fetch a specific thread from 4plebs
#[tauri::command]
pub async fn fetch_fourplebs_thread(board: String, thread_id: u64) -> Result<FourPlebsThread, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let url = format!("{}/thread/?board={}&num={}", FOURPLEBS_API_BASE, board, thread_id);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Thread not found: HTTP {}", response.status()));
    }
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    let json: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    
    // FoolFuuka thread format: { thread_num: { op: {...}, posts: { post_num: {...}, ... } } }
    let mut posts = Vec::new();
    
    let thread_key = thread_id.to_string();
    if let Some(thread_data) = json.get(&thread_key) {
        // Parse OP
        if let Some(op) = thread_data.get("op") {
            if let Some(post) = parse_foolfuuka_post(op, thread_id) {
                posts.push(post);
            }
        }
        
        // Parse replies
        if let Some(replies) = thread_data.get("posts").and_then(|p| p.as_object()) {
            let mut reply_posts: Vec<_> = replies.iter()
                .filter_map(|(_, post_data)| parse_foolfuuka_post(post_data, thread_id))
                .collect();
            
            // Sort replies by post number
            reply_posts.sort_by(|a, b| a.no.cmp(&b.no));
            posts.extend(reply_posts);
        }
    }
    
    if posts.is_empty() {
        return Err("Thread not found or empty".to_string());
    }
    
    Ok(FourPlebsThread { posts })
}
