use tauri::State;
use crate::api::{ChanClient, Catalog, catalog_endpoint};

#[tauri::command]
pub async fn fetch_catalog(board: String, client: State<'_, ChanClient>) -> Result<Catalog, String> {
    client
        .get_json(&catalog_endpoint(&board))
        .await
        .map_err(|e| e.to_string())
}
