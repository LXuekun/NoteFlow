use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::sync::Arc;
use tokio::sync::RwLock;
use directories::ProjectDirs;
use std::path::PathBuf;

pub type DbPool = Arc<RwLock<Option<SqlitePool>>>;

/// 数据库管理器 (SQLite 本地数据库)
#[derive(Clone)]
pub struct Database {
    pool: DbPool,
    db_path: PathBuf,
}

impl Database {
    pub fn new() -> Self {
        // 获取应用数据目录
        let db_path = Self::get_db_path_static();

        Self {
            pool: Arc::new(RwLock::new(None)),
            db_path,
        }
    }

    /// 获取数据库文件路径（静态方法）
    fn get_db_path_static() -> PathBuf {
        if let Some(proj_dirs) = ProjectDirs::from("com", "noteflow", "NoteFlow") {
            let data_dir = proj_dirs.data_dir();
            // 确保目录存在
            if !data_dir.exists() {
                std::fs::create_dir_all(data_dir)
                    .expect("Failed to create data directory");
            }
            data_dir.join("noteflow.db")
        } else {
            // 回退到当前目录
            PathBuf::from("noteflow.db")
        }
    }

    /// 获取数据库连接池
    pub fn get_pool(&self) -> DbPool {
        self.pool.clone()
    }

    /// 获取数据库文件路径
    pub fn get_db_path(&self) -> &PathBuf {
        &self.db_path
    }

    /// 连接数据库 (自动创建数据库文件)
    pub async fn connect(&self) -> Result<(), String> {
        let db_url = format!("sqlite:{}?mode=rwc", self.db_path.display());

        log::info!("Connecting to SQLite database: {}", self.db_path.display());

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .map_err(|e| format!("Failed to connect to database: {}", e))?;

        let mut pool_guard = self.pool.write().await;
        *pool_guard = Some(pool);

        log::info!("Database connected successfully");
        Ok(())
    }

    /// 断开连接
    pub async fn disconnect(&self) {
        let mut pool_guard = self.pool.write().await;
        if let Some(pool) = pool_guard.take() {
            pool.close().await;
            log::info!("Database disconnected");
        }
    }

    /// 检查连接状态
    pub async fn is_connected(&self) -> bool {
        let pool_guard = self.pool.read().await;
        pool_guard.is_some()
    }

    /// 初始化数据库表
    pub async fn init_tables(&self) -> Result<(), String> {
        let pool_guard = self.pool.read().await;
        let pool = pool_guard.as_ref().ok_or("Database not connected")?;

        // 创建笔记表 (单用户，无 user_id)
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                content_plain TEXT,
                folder_id TEXT,
                is_pinned INTEGER DEFAULT 0,
                is_archived INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create notes table: {}", e))?;

        // 创建索引
        sqlx::query(r#"
            CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at)
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create notes index: {}", e))?;

        sqlx::query(r#"
            CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create folder_id index: {}", e))?;

        // 创建标签表 (单用户，无 user_id)
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                color TEXT DEFAULT '#3B82F6',
                created_at TEXT NOT NULL
            )
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create tags table: {}", e))?;

        // 创建笔记-标签关联表
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                PRIMARY KEY (note_id, tag_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create note_tags table: {}", e))?;

        // 创建文件夹表 (单用户，无 user_id)
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
            )
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create folders table: {}", e))?;

        // 创建文件夹索引
        sqlx::query(r#"
            CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)
        "#)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to create folders index: {}", e))?;

        log::info!("Database tables initialized successfully");
        Ok(())
    }
}