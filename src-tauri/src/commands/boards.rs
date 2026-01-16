use crate::boards_metadata::{get_all_boards_info, BoardInfo};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PopularThread {
    pub no: u32,
    pub board: String,
    pub title: Option<String>,
    pub com: Option<String>,
    pub tim: u64,
    pub ext: String,
    pub replies: u32,
    pub images: u32,
}

#[derive(Debug, Deserialize)]
struct CatalogPage {
    threads: Vec<CatalogThread>,
}

#[derive(Debug, Deserialize)]
struct CatalogThread {
    no: u32,
    #[serde(default)]
    sub: Option<String>,
    #[serde(default)]
    com: Option<String>,
    #[serde(default)]
    tim: u64,
    #[serde(default)]
    ext: String,
    #[serde(default)]
    replies: u32,
    #[serde(default)]
    images: u32,
}

#[tauri::command]
pub fn fetch_all_boards_with_metadata() -> Result<Vec<BoardInfo>, String> {
    Ok(get_all_boards_info())
}

#[tauri::command]
pub fn search_boards(query: String) -> Result<Vec<BoardInfo>, String> {
    let all_boards = get_all_boards_info();
    let query_lower = query.to_lowercase();
    
    let filtered: Vec<BoardInfo> = all_boards
        .into_iter()
        .filter(|board| {
            board.id.to_lowercase().contains(&query_lower) ||
            board.name.to_lowercase().contains(&query_lower)
        })
        .collect();
    
    Ok(filtered)
}

#[tauri::command]
pub async fn fetch_popular_threads() -> Result<Vec<PopularThread>, String> {
    // Boards to check for popular threads
    let boards = vec!["g", "v", "a", "tv", "sp", "fit", "int", "sci"];
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;
        
    let mut tasks = Vec::new();

    println!("Fetching popular threads from boards: {:?}", boards);

    for board in boards {
        let client = client.clone();
        tasks.push(tokio::spawn(async move {
            let url = format!("https://a.4cdn.org/{}/catalog.json", board);
            println!("Fetching {}", url);
            match client.get(&url).send().await {
                Ok(resp) => {
                    if !resp.status().is_success() {
                        println!("Failed to fetch {}: Status {}", board, resp.status());
                        return vec![];
                    }
                    match resp.json::<Vec<CatalogPage>>().await {
                        Ok(catalog) => {
                            // Get top 2 threads from first page of each board
                            let mut top_threads = Vec::new();
                            if let Some(page) = catalog.first() {
                                // Filter for threads with images
                                let mut valid_threads: Vec<&CatalogThread> = page.threads.iter()
                                    .filter(|t| t.tim > 0)
                                    .collect();
                                    
                                // Sort by replies
                                valid_threads.sort_by(|a, b| b.replies.cmp(&a.replies));
                                
                                println!("Board {} has {} valid threads", board, valid_threads.len());

                                // Take top 2
                                for t in valid_threads.into_iter().take(2) {
                                    top_threads.push(PopularThread {
                                        no: t.no,
                                        board: board.to_string(),
                                        title: t.sub.clone(),
                                        com: t.com.clone(),
                                        tim: t.tim,
                                        ext: t.ext.clone(),
                                        replies: t.replies,
                                        images: t.images,
                                    });
                                }
                            }
                            top_threads
                        },
                        Err(e) => {
                            println!("Failed to parse JSON for {}: {}", board, e);
                            vec![]
                        }
                    }
                },
                Err(e) => {
                    println!("Failed to send request for {}: {}", board, e);
                    vec![]
                }
            }
        }));
    }

    let mut all_popular = Vec::new();
    for task in tasks {
        if let Ok(threads) = task.await {
            all_popular.extend(threads);
        }
    }

    // Sort all collected threads by replies
    all_popular.sort_by(|a, b| b.replies.cmp(&a.replies));
    
    println!("Total popular threads found: {}", all_popular.len());

    Ok(all_popular)
}
