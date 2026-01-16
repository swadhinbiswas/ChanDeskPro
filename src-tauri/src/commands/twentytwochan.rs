/**
 * 22chan HTML Scraper Commands
 * 
 * Backend commands for fetching data from 22chan.org
 * 
 * 22chan uses a custom Django/Python stack with no JSON API,
 * so we use HTML scraping to extract data.
 */

use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};

const TWENTYTWOCHAN_BASE: &str = "https://22chan.org";

/// 22chan boards - hardcoded since there's no API
const TWENTYTWOCHAN_BOARDS: &[(&str, &str, bool)] = &[
    ("a", "Anime & Manga", false),
    ("b", "Random", true),
    ("cat", "Cinema", false),
    ("co", "Comics & Cartoons", false),
    ("fit", "Fitness", false),
    ("k", "Weapons", false),
    ("lit", "Literature", false),
    ("meta", "Meta", false),
    ("mu", "Music", false),
    ("out", "Outdoors", false),
    ("pol", "Politics", true),
    ("sci", "Science", false),
    ("tech", "Technology", false),
    ("v", "Video Games General", false),
    ("vg", "Video Games", false),
    ("w", "Wallpapers", false),
];

#[derive(Debug, Serialize, Deserialize)]
pub struct TwentyTwoChanBoard {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub nsfw: bool,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TwentyTwoChanPost {
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
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TwentyTwoChanThread {
    pub posts: Vec<TwentyTwoChanPost>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TwentyTwoChanCatalogThread {
    pub no: u64,
    pub sub: Option<String>,
    pub com: Option<String>,
    pub tim: Option<String>,
    pub ext: Option<String>,
    pub replies: u32,
    pub images: u32,
    pub time: u64,
    pub name: Option<String>,
}

/// Get list of available boards on 22chan
#[tauri::command]
pub async fn fetch_twentytwochan_boards() -> Result<Vec<TwentyTwoChanBoard>, String> {
    let boards: Vec<TwentyTwoChanBoard> = TWENTYTWOCHAN_BOARDS
        .iter()
        .map(|(id, name, nsfw)| TwentyTwoChanBoard {
            id: id.to_string(),
            name: name.to_string(),
            description: Some(format!("22chan /{}/", id)),
            nsfw: *nsfw,
            category: "22chan".to_string(),
        })
        .collect();
    
    Ok(boards)
}

/// Fetch catalog from 22chan by scraping the board page
#[tauri::command]
pub async fn fetch_twentytwochan_catalog(board: String) -> Result<Vec<TwentyTwoChanCatalogThread>, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let url = format!("{}/{}/", TWENTYTWOCHAN_BASE, board);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to fetch board: HTTP {}", response.status()));
    }
    
    let html = response.text().await.map_err(|e| e.to_string())?;
    let document = Html::parse_document(&html);
    
    // Selectors for 22chan
    let thread_selector = Selector::parse(".thread").map_err(|e| e.to_string())?;
    let subject_selector = Selector::parse(".subject").map_err(|e| e.to_string())?;
    let name_selector = Selector::parse(".name").map_err(|e| e.to_string())?;
    let timestamp_selector = Selector::parse(".timestamp").map_err(|e| e.to_string())?;
    let image_selector = Selector::parse("a[href*='/UserMedia/uploads/']").map_err(|e| e.to_string())?;
    let inner_selector = Selector::parse(".inner").map_err(|e| e.to_string())?;
    
    let mut threads = Vec::new();
    
    for thread_el in document.select(&thread_selector) {
        // Get thread ID from data-slug attribute
        let thread_id: u64 = thread_el
            .value()
            .attr("data-slug")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        
        if thread_id == 0 {
            continue;
        }
        
        // Get subject
        let subject = thread_el
            .select(&subject_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        // Get author name
        let name = thread_el
            .select(&name_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        // Get timestamp (convert to unix timestamp if possible)
        let timestamp_text = thread_el
            .select(&timestamp_selector)
            .next()
            .map(|el| el.text().collect::<String>());
        
        // Get image URL
        let (tim, ext) = thread_el
            .select(&image_selector)
            .next()
            .and_then(|el| el.value().attr("href"))
            .map(|href| {
                let filename = href.rsplit('/').next().unwrap_or("");
                let parts: Vec<&str> = filename.rsplitn(2, '.').collect();
                if parts.len() == 2 {
                    (Some(parts[1].to_string()), Some(format!(".{}", parts[0])))
                } else {
                    (None, None)
                }
            })
            .unwrap_or((None, None));
        
        // Get content preview
        let content = thread_el
            .select(&inner_selector)
            .next()
            .map(|el| {
                el.text()
                    .collect::<String>()
                    .lines()
                    .skip(1) // Skip header info
                    .take(5) // Take first few lines
                    .collect::<Vec<&str>>()
                    .join("\n")
                    .trim()
                    .to_string()
            });
        
        // Parse reply count from header text (looking for ★ N pattern)
        let header_text = thread_el.text().collect::<String>();
        let replies = header_text
            .split('★')
            .nth(1)
            .and_then(|s| s.trim().split_whitespace().next())
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        
        threads.push(TwentyTwoChanCatalogThread {
            no: thread_id,
            sub: subject,
            com: content,
            tim,
            ext,
            replies,
            images: 0,
            time: 0, // Would need to parse timestamp
            name,
        });
    }
    
    Ok(threads)
}

/// Fetch a thread from 22chan by scraping the thread page
#[tauri::command]
pub async fn fetch_twentytwochan_thread(board: String, thread_id: u64) -> Result<TwentyTwoChanThread, String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| e.to_string())?;
    
    let url = format!("{}/{}/{}/", TWENTYTWOCHAN_BASE, board, thread_id);
    
    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Thread not found: HTTP {}", response.status()));
    }
    
    let html = response.text().await.map_err(|e| e.to_string())?;
    let document = Html::parse_document(&html);
    
    // Selectors - OP is .thread, replies are .reply
    let op_selector = Selector::parse(".thread").map_err(|e| e.to_string())?;
    let reply_selector = Selector::parse(".reply").map_err(|e| e.to_string())?;
    let name_selector = Selector::parse(".name").map_err(|e| e.to_string())?;
    let subject_selector = Selector::parse(".subject").map_err(|e| e.to_string())?;
    let image_selector = Selector::parse("a[href*='/UserMedia/uploads/']").map_err(|e| e.to_string())?;
    let inner_selector = Selector::parse(".inner").map_err(|e| e.to_string())?;
    
    let mut posts = Vec::new();
    
    // Parse OP
    if let Some(op_el) = document.select(&op_selector).next() {
        let post_id: u64 = op_el
            .value()
            .attr("data-slug")
            .and_then(|s| s.parse().ok())
            .unwrap_or(thread_id);
        
        let subject = op_el
            .select(&subject_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        let name = op_el
            .select(&name_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        let (tim, ext, filename) = op_el
            .select(&image_selector)
            .next()
            .and_then(|el| el.value().attr("href"))
            .map(|href| {
                let fname = href.rsplit('/').next().unwrap_or("");
                let parts: Vec<&str> = fname.rsplitn(2, '.').collect();
                if parts.len() == 2 {
                    (Some(parts[1].to_string()), Some(format!(".{}", parts[0])), Some(fname.to_string()))
                } else {
                    (None, None, None)
                }
            })
            .unwrap_or((None, None, None));
        
        let content = op_el
            .select(&inner_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        posts.push(TwentyTwoChanPost {
            no: post_id,
            resto: 0,
            time: 0,
            name,
            trip: None,
            sub: subject,
            com: content,
            tim,
            ext,
            filename,
        });
    }
    
    // Parse replies
    for reply_el in document.select(&reply_selector) {
        let post_id: u64 = reply_el
            .value()
            .attr("data-slug")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        
        if post_id == 0 {
            continue;
        }
        
        let name = reply_el
            .select(&name_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        let (tim, ext, filename) = reply_el
            .select(&image_selector)
            .next()
            .and_then(|el| el.value().attr("href"))
            .map(|href| {
                let fname = href.rsplit('/').next().unwrap_or("");
                let parts: Vec<&str> = fname.rsplitn(2, '.').collect();
                if parts.len() == 2 {
                    (Some(parts[1].to_string()), Some(format!(".{}", parts[0])), Some(fname.to_string()))
                } else {
                    (None, None, None)
                }
            })
            .unwrap_or((None, None, None));
        
        let content = reply_el
            .select(&inner_selector)
            .next()
            .map(|el| el.text().collect::<String>().trim().to_string());
        
        posts.push(TwentyTwoChanPost {
            no: post_id,
            resto: thread_id,
            time: 0,
            name,
            trip: None,
            sub: None,
            com: content,
            tim,
            ext,
            filename,
        });
    }
    
    if posts.is_empty() {
        return Err("Thread not found or empty".to_string());
    }
    
    Ok(TwentyTwoChanThread { posts })
}
