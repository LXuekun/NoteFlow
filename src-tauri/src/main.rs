#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod models;
mod services;
mod sync;

use commands::AppState;
use database::Database;
use tauri::Manager;

fn main() {
    // 初始化日志
    env_logger::init();

    // 创建数据库实例并自动初始化
    let db = Database::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState { db })
        .invoke_handler(tauri::generate_handler![
            // 笔记管理
            commands::create_note,
            commands::update_note,
            commands::get_note,
            commands::get_all_notes,
            commands::search_notes,
            commands::delete_note,
            // 云同步
            commands::get_sync_config,
            commands::save_sync_config,
            commands::test_sync_connection,
            commands::sync_upload,
            commands::sync_download,
        ])
        .setup(|app| {
            // 应用启动时自动连接数据库并初始化表
            let db = app.state::<AppState>().db.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = db.connect().await {
                    log::error!("Failed to connect database: {}", e);
                } else if let Err(e) = db.init_tables().await {
                    log::error!("Failed to initialize tables: {}", e);
                } else {
                    log::info!("Database initialized successfully at: {}", db.get_db_path().display());
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}