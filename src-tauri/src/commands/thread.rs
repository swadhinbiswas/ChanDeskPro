use tauri::State;
use crate::api::{ChanClient, Thread, thread_endpoint};

#[tauri::command]
pub async fn fetch_thread(
    board: String,
    thread_id: u64,
    client: State<'_, ChanClient>
) -> Result<Thread, String> {
    client
        .get_json(&thread_endpoint(&board, thread_id))
        .await
        .map_err(|e| e.to_string())
}
