use sqlx::SqlitePool;
use uuid::Uuid;
use chrono::Utc;

use crate::models::{Note, CreateNoteRequest, UpdateNoteRequest};

/// 笔记服务
pub struct NoteService;

impl NoteService {
    /// 创建笔记
    pub async fn create(pool: &SqlitePool, request: CreateNoteRequest) -> Result<Note, String> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let content_plain = strip_markdown(&request.content);

        sqlx::query(
            "INSERT INTO notes (id, title, content, content_plain, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&request.title)
        .bind(&request.content)
        .bind(&content_plain)
        .bind(&request.folder_id)
        .bind(now.to_rfc3339())
        .bind(now.to_rfc3339())
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create note: {}", e))?;

        // 添加标签关联
        for tag_id in &request.tags {
            sqlx::query(
                "INSERT INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)"
            )
            .bind(&id)
            .bind(tag_id)
            .bind(now.to_rfc3339())
            .execute(pool)
            .await
            .ok();
        }

        Ok(Note {
            id,
            title: request.title,
            content: request.content,
            content_plain,
            folder_id: request.folder_id,
            is_pinned: false,
            is_archived: false,
            created_at: now,
            updated_at: now,
        })
    }

    /// 更新笔记
    pub async fn update(pool: &SqlitePool, note_id: &str, request: UpdateNoteRequest) -> Result<Note, String> {
        let now = Utc::now();

        // 构建更新SQL
        let mut updates = vec!["updated_at = ?"];
        let mut values: Vec<String> = vec![now.to_rfc3339()];

        if let Some(title) = &request.title {
            updates.push("title = ?");
            values.push(title.clone());
        }
        if let Some(content) = &request.content {
            updates.push("content = ?");
            values.push(content.clone());
            updates.push("content_plain = ?");
            values.push(strip_markdown(content));
        }
        if let Some(folder_id) = &request.folder_id {
            updates.push("folder_id = ?");
            values.push(folder_id.clone());
        }
        if let Some(is_pinned) = request.is_pinned {
            updates.push("is_pinned = ?");
            values.push(if is_pinned { "1" } else { "0" }.to_string());
        }
        if let Some(is_archived) = request.is_archived {
            updates.push("is_archived = ?");
            values.push(if is_archived { "1" } else { "0" }.to_string());
        }

        values.push(note_id.to_string());

        let sql = format!(
            "UPDATE notes SET {} WHERE id = ?",
            updates.join(", ")
        );

        // 执行更新
        sqlx::query(&sql)
            .execute(pool)
            .await
            .map_err(|e| format!("Failed to update note: {}", e))?;

        // 更新标签
        if let Some(tags) = request.tags {
            // 删除旧标签
            sqlx::query("DELETE FROM note_tags WHERE note_id = ?")
                .bind(note_id)
                .execute(pool)
                .await
                .ok();

            // 添加新标签
            for tag_id in tags {
                sqlx::query("INSERT INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)")
                    .bind(note_id)
                    .bind(&tag_id)
                    .bind(now.to_rfc3339())
                    .execute(pool)
                    .await
                    .ok();
            }
        }

        // 返回更新后的笔记
        Self::get_by_id(pool, note_id)
            .await?
            .ok_or_else(|| "Note not found".to_string())
    }

    /// 获取笔记
    pub async fn get_by_id(pool: &SqlitePool, note_id: &str) -> Result<Option<Note>, String> {
        sqlx::query_as::<_, Note>(
            "SELECT id, title, content, content_plain, folder_id, is_pinned, is_archived, created_at, updated_at FROM notes WHERE id = ?"
        )
        .bind(note_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Database error: {}", e))
    }

    /// 获取所有笔记
    pub async fn get_all(pool: &SqlitePool) -> Result<Vec<Note>, String> {
        sqlx::query_as::<_, Note>(
            "SELECT id, title, content, content_plain, folder_id, is_pinned, is_archived, created_at, updated_at FROM notes ORDER BY is_pinned DESC, updated_at DESC"
        )
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Database error: {}", e))
    }

    /// 搜索笔记
    pub async fn search(pool: &SqlitePool, query: &str) -> Result<Vec<Note>, String> {
        sqlx::query_as::<_, Note>(
            "SELECT id, title, content, content_plain, folder_id, is_pinned, is_archived, created_at, updated_at FROM notes WHERE title LIKE ? OR content_plain LIKE ? ORDER BY is_pinned DESC, updated_at DESC"
        )
        .bind(format!("%{}%", query))
        .bind(format!("%{}%", query))
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Database error: {}", e))
    }

    /// 删除笔记
    pub async fn delete(pool: &SqlitePool, note_id: &str) -> Result<(), String> {
        sqlx::query("DELETE FROM notes WHERE id = ?")
            .bind(note_id)
            .execute(pool)
            .await
            .map_err(|e| format!("Failed to delete note: {}", e))?;
        Ok(())
    }
}

/// 移除Markdown标记
fn strip_markdown(content: &str) -> String {
    content
        .replace("#", "")
        .replace("**", "")
        .replace("*", "")
        .replace("`", "")
        .replace("~~", "")
        .lines()
        .map(|l| l.trim())
        .collect::<Vec<_>>()
        .join(" ")
}