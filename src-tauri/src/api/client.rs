use anyhow::Result;
use reqwest::{Client, header};
use std::time::{Duration, Instant};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

const BASE_URL: &str = "https://a.4cdn.org";
const USER_AGENT: &str = "ChanDesk/0.1.0";
const RATE_LIMIT_DURATION: Duration = Duration::from_secs(1);

pub struct ChanClient {
    client: Client,
    // Rate limiter: endpoint -> last request time
    rate_limiter: Arc<Mutex<HashMap<String, Instant>>>,
}

impl ChanClient {
    pub fn new() -> Result<Self> {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            header::USER_AGENT,
            header::HeaderValue::from_static(USER_AGENT),
        );

        let client = Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            rate_limiter: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    async fn wait_for_rate_limit(&self, endpoint: &str) {
        let mut limiter = self.rate_limiter.lock().await;
        
        if let Some(last_request) = limiter.get(endpoint) {
            let elapsed = last_request.elapsed();
            if elapsed < RATE_LIMIT_DURATION {
                let wait_time = RATE_LIMIT_DURATION - elapsed;
                drop(limiter); // Release lock before sleeping
                tokio::time::sleep(wait_time).await;
                limiter = self.rate_limiter.lock().await;
            }
        }

        limiter.insert(endpoint.to_string(), Instant::now());
    }

    pub async fn get_json<T>(&self, endpoint: &str) -> Result<T>
    where
        T: serde::de::DeserializeOwned,
    {
        self.wait_for_rate_limit(endpoint).await;

        let url = format!("{}{}", BASE_URL, endpoint);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            anyhow::bail!("Request failed with status: {}", response.status());
        }

        let data = response.json::<T>().await?;
        Ok(data)
    }
}

// Endpoint builders
pub fn boards_endpoint() -> String {
    "/boards.json".to_string()
}

pub fn catalog_endpoint(board: &str) -> String {
    format!("/{}/catalog.json", board)
}

pub fn thread_endpoint(board: &str, thread_id: u64) -> String {
    format!("/{}/thread/{}.json", board, thread_id)
}
