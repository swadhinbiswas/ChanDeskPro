use serde::{Deserialize, Serialize};

// Board types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Board {
    pub board: String,
    pub title: String,
    pub ws_board: u8,
    pub per_page: u16,
    pub pages: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta_description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BoardList {
    pub boards: Vec<Board>,
}

// Post type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub no: u64,
    pub resto: u64,
    pub now: String,
    pub time: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trip: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub capcode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sub: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub com: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tim: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ext: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fsize: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub md5: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub w: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub h: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tn_w: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tn_h: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filedeleted: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spoiler: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sticky: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub closed: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub replies: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub images: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bumplimit: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imagelimit: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub semantic_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unique_ips: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_modified: Option<u64>,
}

// Thread type
#[derive(Debug, Serialize, Deserialize)]
pub struct Thread {
    pub posts: Vec<Post>,
}

// Catalog types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CatalogThread {
    pub no: u64,
    pub last_modified: u64,
    pub replies: u32,
    pub images: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sub: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub com: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tim: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filename: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ext: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub w: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub h: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tn_w: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tn_h: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sticky: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub closed: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bumplimit: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imagelimit: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub semantic_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unique_ips: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CatalogPage {
    pub page: u8,
    pub threads: Vec<CatalogThread>,
}

pub type Catalog = Vec<CatalogPage>;
