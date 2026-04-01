use tauri::State;
use crate::database::Database;
use crate::models::*;
use crate::services::NoteService;
use crate::sync::{SyncConfig, SyncService};
use crate::sync::service::SyncStatus;

/// 应用状态 (简化版，无用户认证)
pub struct AppState {
    pub db: Database,
}

// ==================== 笔记管理 ====================

#[tauri::command]
pub async fn create_note(state: State<'_, AppState>, request: CreateNoteRequest) -> Result<Note, String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::create(pool, request).await
}

#[tauri::command]
pub async fn update_note(state: State<'_, AppState>, note_id: String, request: UpdateNoteRequest) -> Result<Note, String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::update(pool, &note_id, request).await
}

#[tauri::command]
pub async fn get_note(state: State<'_, AppState>, note_id: String) -> Result<Option<Note>, String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::get_by_id(pool, &note_id).await
}

#[tauri::command]
pub async fn get_all_notes(state: State<'_, AppState>) -> Result<Vec<Note>, String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::get_all(pool).await
}

#[tauri::command]
pub async fn search_notes(state: State<'_, AppState>, query: String) -> Result<Vec<Note>, String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::search(pool, &query).await
}

#[tauri::command]
pub async fn delete_note(state: State<'_, AppState>, note_id: String) -> Result<(), String> {
    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    NoteService::delete(pool, &note_id).await
}

// ==================== 云同步 ====================

#[tauri::command]
pub async fn get_sync_config() -> Result<Option<SyncConfig>, String> {
    Ok(crate::sync::config::load_sync_config())
}

#[tauri::command]
pub async fn save_sync_config(config: SyncConfig) -> Result<(), String> {
    crate::sync::config::save_sync_config(&config)
}

#[tauri::command]
pub async fn test_sync_connection(config: SyncConfig) -> Result<bool, String> {
    SyncService::test_connection(&config).await
}

#[tauri::command]
pub async fn sync_upload(state: State<'_, AppState>) -> Result<SyncStatus, String> {
    let config = crate::sync::config::load_sync_config()
        .ok_or("Sync not configured")?;

    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    SyncService::upload(pool, &config).await
}

#[tauri::command]
pub async fn sync_download(state: State<'_, AppState>) -> Result<SyncStatus, String> {
    let config = crate::sync::config::load_sync_config()
        .ok_or("Sync not configured")?;

    let pool = state.db.get_pool();
    let pool_guard = pool.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not connected")?;

    SyncService::download(pool, &config).await
}