use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// 云存储提供商
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum CloudProvider {
    MinIO,
    S3,
    AliyunOSS,
    TencentCOS,
}

impl CloudProvider {
    pub fn default_endpoint(&self) -> &'static str {
        match self {
            CloudProvider::MinIO => "http://localhost:9000",
            CloudProvider::S3 => "https://s3.amazonaws.com",
            CloudProvider::AliyunOSS => "https://oss-cn-hangzhou.aliyuncs.com",
            CloudProvider::TencentCOS => "https://cos.ap-guangzhou.myqcloud.com",
        }
    }

    pub fn default_region(&self) -> &'static str {
        match self {
            CloudProvider::MinIO => "us-east-1",
            CloudProvider::S3 => "us-east-1",
            CloudProvider::AliyunOSS => "oss-cn-hangzhou",
            CloudProvider::TencentCOS => "ap-guangzhou",
        }
    }
}

/// 同步配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConfig {
    pub enabled: bool,
    pub provider: CloudProvider,
    pub endpoint: String,
    pub region: String,
    pub bucket: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub auto_sync: bool,
    pub sync_interval: u32,
}

impl Default for SyncConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            provider: CloudProvider::AliyunOSS,
            endpoint: CloudProvider::AliyunOSS.default_endpoint().to_string(),
            region: CloudProvider::AliyunOSS.default_region().to_string(),
            bucket: String::new(),
            access_key_id: String::new(),
            secret_access_key: String::new(),
            auto_sync: false,
            sync_interval: 30,
        }
    }
}

/// 获取同步配置文件路径
fn get_config_path() -> PathBuf {
    if let Some(proj_dirs) = ProjectDirs::from("com", "noteflow", "NoteFlow") {
        let config_dir = proj_dirs.config_dir();
        if !config_dir.exists() {
            fs::create_dir_all(config_dir).ok();
        }
        config_dir.join("sync_config.json")
    } else {
        PathBuf::from("sync_config.json")
    }
}

/// 加载同步配置
pub fn load_sync_config() -> Option<SyncConfig> {
    let path = get_config_path();
    if path.exists() {
        let content = fs::read_to_string(&path).ok()?;
        serde_json::from_str(&content).ok()
    } else {
        None
    }
}

/// 保存同步配置
pub fn save_sync_config(config: &SyncConfig) -> Result<(), String> {
    let path = get_config_path();
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    Ok(())
}