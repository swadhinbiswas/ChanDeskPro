/**
 * Archived.moe API Commands
 * 
 * Backend commands for fetching data from archived.moe
 * 
 * Archived.moe is a 4chan archive using FoolFuuka software (same as 4plebs).
 * API endpoint: https://archived.moe/_/api/chan/
 */

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;

const ARCHIVEDMOE_API_BASE: &str = "https://archived.moe/_/api/chan";

/// Archived boards on archived.moe
const ARCHIVEDMOE_BOARDS: &[(&str, &str, bool)] = &[
    ("a", "Anime & Manga", false),
    ("c", "Anime/Cute", false),
    ("g", "Technology", false),
    ("k", "Weapons", false),
    ("m", "Mecha", false),
    ("o", "Auto", false),
    ("n", "Transportation", false),
    ("p", "Photography", false),
    ("v", "Video Games", false),
    ("vg", "Video Game Generals", false),
    ("vm", "Video Games/Multiplayer", false),
    ("vmg", "Video Games/Mobile", false),
    ("vp", "Pokémon", false),
    ("vr", "Retro Games", false),
    ("vst", "Video Games/Strategy", false),
    ("vt", "Virtual YouTubers", false),
    ("w", "Anime/Wallpapers", false),
    ("wg", "Wallpapers/General", false),
    ("i", "Oekaki", false),
    ("ic", "Artwork/Critique", false),
    ("r", "Adult Requests", true),
    ("r9k", "ROBOT9001", true),
    ("s4s", "Shit 4chan Says", true),
    ("cm", "Cute/Male", false),
    ("hm", "Handsome Men", true),
    ("lgbt", "LGBT", true),
    ("y", "Yaoi", true),
    ("3", "3DCG", true),
    ("aco", "Adult Cartoons", true),
    ("adv", "Advice", false),
    ("an", "Animals & Nature", false),
    ("bant", "International/Random", true),
    ("biz", "Business & Finance", false),
    ("cgl", "Cosplay & EGL", false),
    ("ck", "Food & Cooking", false),
    ("co", "Comics & Cartoons", false),
    ("diy", "Do It Yourself", false),
    ("fa", "Fashion", false),
    ("fit", "Fitness", false),
    ("gd", "Graphic Design", false),
    ("hc", "Hardcore", true),
    ("his", "History & Humanities", false),
    ("int", "International", false),
    ("jp", "Otaku Culture", false),
    ("lit", "Literature", false),
    ("mlp", "My Little Pony", false),
    ("mu", "Music", false),
    ("news", "Current News", false),
    ("out", "Outdoors", false),
    ("po", "Papercraft & Origami", false),
    ("pw", "Professional Wrestling", false),
    ("qst", "Quests", false),
    ("sci", "Science & Math", false),
    ("soc", "Cams & Meetups", true),
    ("sp", "Sports", false),
    ("tg", "Traditional Games", false),
    ("toy", "Toys", false),
    ("trv", "Travel", false),
    ("tv", "Television & Film", false),
    ("vip", "Very Important Posts", false),
    ("vrpg", "Video Games/RPG", false),
    ("wsg", "Worksafe GIF", false),
    ("wsr", "Worksafe Requests", false),
    ("x", "Paranormal", false),
    ("xs", "Extreme Sports", false),
];

#[derive(Debug, Serialize, Deserialize)]
pub struct ArchivedMoeBoard {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub nsfw: bool,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArchivedMoePost {
    pub no: u64,
    pub resto: u64,
    pub time: u64,
    pub name: Option<String>,
    pub trip: Option<String>,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<String>,
    pub ext: Option<String>,
    pub filename: Option<String>,
    pub fsize: Option<u64>,
    pub w: Option<u32>,
    pub h: Option<u32>,
    pub tn_w: Option<u32>,
    pub tn_h: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArchivedMoeThread {
    pub posts: Vec<ArchivedMoePost>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArchivedMoeCatalogThread {
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
fn parse_foolfuuka_post(post: &Value, thread_num: u64) -> Option<ArchivedMoePost> {
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
            let media_filename = m.get("media_filename").and_then(|v| v.as_str());
            let tim = m.get("media_orig").and_then(|v| v.as_str())
                .and_then(|f| f.rsplit_once('.').map(|(n, _)| n.to_string()));
            let ext = media_filename
                .and_then(|f| f.rsplit_once('.').map(|(_, e)| format!(".{}", e)));
            let filename = media_filename
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
            
            (tim, ext, filename, fsize, w, h, tn_w, tn_h)
        }
    } else {
        (None, None, None, None, None, None, None, None)
    };
    
    Some(ArchivedMoePost {
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

/// Get list of available boards on archived.moe
#[tauri::command]
pub async fn fetch_archivedmoe_boards() -> Result<Vec<ArchivedMoeBoard>, String> {
    let boards: Vec<ArchivedMoeBoard> = ARCHIVEDMOE_BOARDS
        .iter()
        .map(|(id, name, nsfw)| ArchivedMoeBoard {
            id: id.to_string(),
            name: name.to_string(),
            description: Some(format!("archived.moe archive of /{}/", id)),
            nsfw: *nsfw,
            category: "Archive".to_string(),
        })
        .collect();
    
    Ok(boards)
}

/// Fetch catalog/index from archived.moe for a specific board
#[tauri::command]
pub async fn fetch_archivedmoe_catalog(board: String, page: Option<u32>) -> Result<Vec<ArchivedMoeCatalogThread>, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let page_num = page.unwrap_or(1);
    let url = format!("{}/index/?board={}&page={}", ARCHIVEDMOE_API_BASE, board, page_num);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to fetch catalog: HTTP {}", response.status()));
    }
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    let json: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    
    // FoolFuuka index format
    let mut threads = Vec::new();
    
    if let Some(board_data) = json.get(&board) {
        if let Some(obj) = board_data.as_object() {
            for (thread_num_str, thread_data) in obj {
                let thread_num: u64 = thread_num_str.parse().unwrap_or(0);
                
                if let Some(op) = thread_data.get("op") {
                    let timestamp = op.get("timestamp").and_then(|v| v.as_u64())
                        .or_else(|| op.get("timestamp").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()))
                        .unwrap_or(0);
                    
                    let posts_count = thread_data.get("posts")
                        .and_then(|p| p.as_object())
                        .map(|p| p.len() as u32)
                        .unwrap_or(0);
                    
                    let media = op.get("media");
                    let (tim, ext) = if let Some(m) = media {
                        if m.is_null() {
                            (None, None)
                        } else {
                            let tim = m.get("media_orig").and_then(|v| v.as_str())
                                .and_then(|f| f.rsplit_once('.').map(|(n, _)| n.to_string()));
                            let ext = m.get("media_filename").and_then(|v| v.as_str())
                                .and_then(|f| f.rsplit_once('.').map(|(_, e)| format!(".{}", e)));
                            (tim, ext)
                        }
                    } else {
                        (None, None)
                    };
                    
                    threads.push(ArchivedMoeCatalogThread {
                        no: thread_num,
                        sub: op.get("title").and_then(|v| v.as_str()).map(String::from),
                        com: op.get("comment_sanitized")
                            .or_else(|| op.get("comment"))
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        tim,
                        ext,
                        replies: posts_count,
                        images: 0,
                        time: timestamp,
                        name: op.get("name").and_then(|v| v.as_str()).map(String::from),
                        trip: op.get("trip").and_then(|v| v.as_str()).map(String::from),
                    });
                }
            }
        }
    }
    
    threads.sort_by(|a, b| b.time.cmp(&a.time));
    
    Ok(threads)
}

/// Fetch a specific thread from archived.moe
#[tauri::command]
pub async fn fetch_archivedmoe_thread(board: String, thread_id: u64) -> Result<ArchivedMoeThread, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let url = format!("{}/thread/?board={}&num={}", ARCHIVEDMOE_API_BASE, board, thread_id);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Thread not found: HTTP {}", response.status()));
    }
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    let json: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    
    let mut posts = Vec::new();
    
    let thread_key = thread_id.to_string();
    if let Some(thread_data) = json.get(&thread_key) {
        if let Some(op) = thread_data.get("op") {
            if let Some(post) = parse_foolfuuka_post(op, thread_id) {
                posts.push(post);
            }
        }
        
        if let Some(replies) = thread_data.get("posts").and_then(|p| p.as_object()) {
            let mut reply_posts: Vec<_> = replies.iter()
                .filter_map(|(_, post_data)| parse_foolfuuka_post(post_data, thread_id))
                .collect();
            
            reply_posts.sort_by(|a, b| a.no.cmp(&b.no));
            posts.extend(reply_posts);
        }
    }
    
    if posts.is_empty() {
        return Err("Thread not found or empty".to_string());
    }
    
    Ok(ArchivedMoeThread { posts })
}
