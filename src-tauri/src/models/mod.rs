use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 笔记模型 (单用户，无 user_id)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub content_plain: String,
    pub folder_id: Option<String>,
    pub is_pinned: bool,
    pub is_archived: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// 标签模型 (单用户，无 user_id)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: DateTime<Utc>,
}

/// 笔记-标签关联模型
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NoteTag {
    pub note_id: String,
    pub tag_id: String,
    pub created_at: DateTime<Utc>,
}

/// 文件夹模型 (单用户，无 user_id)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// 创建笔记请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateNoteRequest {
    pub title: String,
    pub content: String,
    pub folder_id: Option<String>,
    pub tags: Vec<String>,
}

/// 更新笔记请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateNoteRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub folder_id: Option<String>,
    pub is_pinned: Option<bool>,
    pub is_archived: Option<bool>,
    pub tags: Option<Vec<String>>,
}