use crate::models::{Folder, Note, Tag};
use crate::sync::config::{load_sync_config, save_sync_config, SyncConfig};
use crate::sync::s3_client::S3Client;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

/// 同步状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub enabled: bool,
    pub last_sync_time: Option<String>,
    pub last_sync_result: Option<String>,
    pub is_syncing: bool,
}

/// 导出数据格式
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub exported_at: String,
    pub notes: Vec<NoteData>,
    pub tags: Vec<TagData>,
    pub folders: Vec<FolderData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteData {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder_id: Option<String>,
    pub is_pinned: bool,
    pub is_archived: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagData {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderData {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
}

/// 同步服务
pub struct SyncService;

impl SyncService {
    /// 测试云存储连接
    pub async fn test_connection(config: &SyncConfig) -> Result<bool, String> {
        let client = S3Client::new(config.clone())?;
        client.test_connection().await
    }

    /// 上传数据到云端
    pub async fn upload(pool: &SqlitePool, config: &SyncConfig) -> Result<SyncStatus, String> {
        let client = S3Client::new(config.clone())?;

        // 1. 读取所有笔记
        let notes = sqlx::query_as::<_, Note>(
            "SELECT id, title, content, content_plain, folder_id, is_pinned, is_archived, created_at, updated_at FROM notes"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to fetch notes: {}", e))?;

        // 2. 读取所有标签
        let tags = sqlx::query_as::<_, Tag>(
            "SELECT id, name, color, created_at FROM tags"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to fetch tags: {}", e))?;

        // 3. 读取所有文件夹
        let folders = sqlx::query_as::<_, Folder>(
            "SELECT id, name, parent_id, created_at FROM folders"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to fetch folders: {}", e))?;

        // 4. 读取笔记-标签关联
        let note_tag_relations: Vec<(String, String)> = sqlx::query_as(
            "SELECT note_id, tag_id FROM note_tags"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to fetch note_tags: {}", e))?;

        // 5. 构建导出数据
        let export_data = ExportData {
            version: "1.0".to_string(),
            exported_at: Utc::now().to_rfc3339(),
            notes: notes
                .into_iter()
                .map(|n| {
                    let _note_tags: Vec<String> = note_tag_relations
                        .iter()
                        .filter(|(note_id, _)| *note_id == n.id)
                        .map(|(_, tag_id)| tag_id.clone())
                        .collect();
                    NoteData {
                        id: n.id,
                        title: n.title,
                        content: n.content,
                        folder_id: n.folder_id,
                        is_pinned: n.is_pinned,
                        is_archived: n.is_archived,
                        created_at: n.created_at.to_rfc3339(),
                        updated_at: n.updated_at.to_rfc3339(),
                    }
                })
                .collect(),
            tags: tags
                .into_iter()
                .map(|t| TagData {
                    id: t.id,
                    name: t.name,
                    color: t.color,
                })
                .collect(),
            folders: folders
                .into_iter()
                .map(|f| FolderData {
                    id: f.id,
                    name: f.name,
                    parent_id: f.parent_id,
                })
                .collect(),
        };

        // 6. 序列化为 JSON
        let json = serde_json::to_string_pretty(&export_data)
            .map_err(|e| format!("Failed to serialize data: {}", e))?;

        // 7. 上传到 S3
        client.put_object("noteflow/data.json", json.as_bytes()).await?;

        // 8. 保存同步状态
        let status = SyncStatus {
            enabled: config.enabled,
            last_sync_time: Some(Utc::now().to_rfc3339()),
            last_sync_result: Some("上传成功".to_string()),
            is_syncing: false,
        };

        Ok(status)
    }

    /// 从云端下载数据
    pub async fn download(pool: &SqlitePool, config: &SyncConfig) -> Result<SyncStatus, String> {
        let client = S3Client::new(config.clone())?;

        // 1. 从 S3 下载数据
        let data = client
            .get_object("noteflow/data.json")
            .await?
            .ok_or("No data found in cloud")?;

        // 2. 解析 JSON
        let export_data: ExportData = serde_json::from_slice(&data)
            .map_err(|e| format!("Failed to parse data: {}", e))?;

        // 3. 开启事务
        let mut tx = pool.begin().await.map_err(|e| format!("Failed to begin transaction: {}", e))?;

        // 4. 合并标签 (基于 ID)
        for tag in &export_data.tags {
            let exists: bool = sqlx::query_scalar("SELECT COUNT(*) > 0 FROM tags WHERE id = ?")
                .bind(&tag.id)
                .fetch_one(&mut *tx)
                .await
                .unwrap_or(false);

            if exists {
                sqlx::query("UPDATE tags SET name = ?, color = ? WHERE id = ?")
                    .bind(&tag.name)
                    .bind(&tag.color)
                    .bind(&tag.id)
                    .execute(&mut *tx)
                    .await
                    .ok();
            } else {
                sqlx::query("INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)")
                    .bind(&tag.id)
                    .bind(&tag.name)
                    .bind(&tag.color)
                    .bind(Utc::now().to_rfc3339())
                    .execute(&mut *tx)
                    .await
                    .ok();
            }
        }

        // 5. 合并文件夹 (基于 ID)
        for folder in &export_data.folders {
            let exists: bool = sqlx::query_scalar("SELECT COUNT(*) > 0 FROM folders WHERE id = ?")
                .bind(&folder.id)
                .fetch_one(&mut *tx)
                .await
                .unwrap_or(false);

            if exists {
                sqlx::query("UPDATE folders SET name = ?, parent_id = ? WHERE id = ?")
                    .bind(&folder.name)
                    .bind(&folder.parent_id)
                    .bind(&folder.id)
                    .execute(&mut *tx)
                    .await
                    .ok();
            } else {
                sqlx::query("INSERT INTO folders (id, name, parent_id, created_at) VALUES (?, ?, ?, ?)")
                    .bind(&folder.id)
                    .bind(&folder.name)
                    .bind(&folder.parent_id)
                    .bind(Utc::now().to_rfc3339())
                    .execute(&mut *tx)
                    .await
                    .ok();
            }
        }

        // 6. 合并笔记 (基于 updated_at 时间戳)
        for note in &export_data.notes {
            let local_updated: Option<String> = sqlx::query_scalar(
                "SELECT updated_at FROM notes WHERE id = ?"
            )
            .bind(&note.id)
            .fetch_optional(&mut *tx)
            .await
            .ok()
            .flatten();

            let should_update = match &local_updated {
                Some(local) => {
                    // 比较时间戳，云端更新则更新本地
                    note.updated_at > *local
                }
                None => true, // 本地不存在，直接插入
            };

            if should_update {
                if local_updated.is_some() {
                    sqlx::query(
                        "UPDATE notes SET title = ?, content = ?, folder_id = ?, is_pinned = ?, is_archived = ?, updated_at = ? WHERE id = ?"
                    )
                    .bind(&note.title)
                    .bind(&note.content)
                    .bind(&note.folder_id)
                    .bind(note.is_pinned)
                    .bind(note.is_archived)
                    .bind(&note.updated_at)
                    .bind(&note.id)
                    .execute(&mut *tx)
                    .await
                    .ok();
                } else {
                    sqlx::query(
                        "INSERT INTO notes (id, title, content, content_plain, folder_id, is_pinned, is_archived, created_at, updated_at) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?)"
                    )
                    .bind(&note.id)
                    .bind(&note.title)
                    .bind(&note.content)
                    .bind(&note.folder_id)
                    .bind(note.is_pinned)
                    .bind(note.is_archived)
                    .bind(&note.created_at)
                    .bind(&note.updated_at)
                    .execute(&mut *tx)
                    .await
                    .ok();
                }
            }
        }

        // 7. 提交事务
        tx.commit().await.map_err(|e| format!("Failed to commit transaction: {}", e))?;

        // 8. 返回同步状态
        let status = SyncStatus {
            enabled: config.enabled,
            last_sync_time: Some(Utc::now().to_rfc3339()),
            last_sync_result: Some(format!(
                "下载成功：{} 篇笔记，{} 个标签，{} 个文件夹",
                export_data.notes.len(),
                export_data.tags.len(),
                export_data.folders.len()
            )),
            is_syncing: false,
        };

        Ok(status)
    }
}