use crate::sync::config::SyncConfig;
use base64::Engine;
use chrono::Utc;
use hex::encode as hex_encode;
use hmac::{Hmac, Mac};
use md5::Md5;
use reqwest::Client;
use sha2::{Digest, Sha256};

type HmacSha256 = Hmac<Sha256>;

/// S3 兼容客户端
pub struct S3Client {
    config: SyncConfig,
    client: Client,
}

impl S3Client {
    pub fn new(config: SyncConfig) -> Result<Self, String> {
        let client = Client::builder()
            .danger_accept_invalid_certs(false)
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        Ok(Self { config, client })
    }

    /// 获取主机名 (从 endpoint 中提取)
    fn get_host(&self) -> String {
        let endpoint = &self.config.endpoint;
        // 移除协议前缀
        if let Some(pos) = endpoint.find("://") {
            endpoint[pos + 3..].to_string()
        } else {
            endpoint.clone()
        }
    }

    /// 生成 AWS V4 签名
    fn sign_request(
        &self,
        method: &str,
        path: &str,
        query: &str,
        headers: &mut Vec<(String, String)>,
        payload_hash: &str,
    ) {
        let now = Utc::now();
        let amz_date = now.format("%Y%m%dT%H%M%SZ").to_string();
        let date_stamp = now.format("%Y%m%d").to_string();

        let host = self.get_host();
        headers.push(("host".to_string(), host.clone()));
        headers.push(("x-amz-date".to_string(), amz_date.clone()));
        headers.push(("x-amz-content-sha256".to_string(), payload_hash.to_string()));

        // 排序 headers
        headers.sort_by(|a, b| a.0.cmp(&b.0));

        // 构建规范请求
        let canonical_headers: String = headers
            .iter()
            .map(|(k, v)| format!("{}:{}", k.to_lowercase(), v))
            .collect::<Vec<_>>()
            .join("\n");

        let signed_headers: String = headers
            .iter()
            .map(|(k, _)| k.to_lowercase())
            .collect::<Vec<_>>()
            .join(";");

        let canonical_request = format!(
            "{}\n{}\n{}\n{}\n\n{}\n{}",
            method, path, query, canonical_headers, signed_headers, payload_hash
        );

        // 计算规范请求的哈希
        let mut hasher = Sha256::new();
        hasher.update(canonical_request.as_bytes());
        let canonical_request_hash = hex_encode(hasher.finalize());

        // 构建待签名字符串
        let credential_scope = format!("{}/{}/s3/aws4_request", date_stamp, self.config.region);
        let string_to_sign = format!(
            "AWS4-HMAC-SHA256\n{}\n{}\n{}",
            amz_date, credential_scope, canonical_request_hash
        );

        // 计算签名
        let signature = self.calculate_signature(&date_stamp, &string_to_sign);

        // 构建 Authorization header
        let auth_header = format!(
            "AWS4-HMAC-SHA256 Credential={}/{}, SignedHeaders={}, Signature={}",
            self.config.access_key_id, credential_scope, signed_headers, signature
        );

        headers.push(("authorization".to_string(), auth_header));
    }

    /// 计算签名
    fn calculate_signature(&self, date_stamp: &str, string_to_sign: &str) -> String {
        // kDate = HMAC("AWS4" + kSecret, Date)
        let key = format!("AWS4{}", self.config.secret_access_key);
        let mut mac = HmacSha256::new_from_slice(key.as_bytes()).unwrap();
        mac.update(date_stamp.as_bytes());
        let k_date = mac.finalize().into_bytes();

        // kRegion = HMAC(kDate, Region)
        let mut mac = HmacSha256::new_from_slice(&k_date).unwrap();
        mac.update(self.config.region.as_bytes());
        let k_region = mac.finalize().into_bytes();

        // kService = HMAC(kRegion, "s3")
        let mut mac = HmacSha256::new_from_slice(&k_region).unwrap();
        mac.update(b"s3");
        let k_service = mac.finalize().into_bytes();

        // kSigning = HMAC(kService, "aws4_request")
        let mut mac = HmacSha256::new_from_slice(&k_service).unwrap();
        mac.update(b"aws4_request");
        let k_signing = mac.finalize().into_bytes();

        // Signature = HMAC(kSigning, StringToSign)
        let mut mac = HmacSha256::new_from_slice(&k_signing).unwrap();
        mac.update(string_to_sign.as_bytes());
        hex_encode(mac.finalize().into_bytes())
    }

    /// 计算 SHA256 哈希
    fn sha256_hash(data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hex_encode(hasher.finalize())
    }

    /// 计算 MD5 哈希 (用于 Content-MD5 header)
    fn md5_hash(data: &[u8]) -> String {
        let mut hasher = Md5::new();
        hasher.update(data);
        base64::engine::general_purpose::STANDARD.encode(hasher.finalize())
    }

    /// 测试连接 (ListBucket)
    pub async fn test_connection(&self) -> Result<bool, String> {
        let path = "/";
        let query = "";
        let payload_hash = Self::sha256_hash(b"");

        let mut headers: Vec<(String, String)> = Vec::new();
        self.sign_request("GET", path, query, &mut headers, &payload_hash);

        let url = format!("{}{}", self.config.endpoint, path);

        let mut request = self.client.get(&url);
        for (key, value) in headers {
            if key == "host" {
                continue; // reqwest 会自动设置 host
            }
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Connection failed: {}", e))?;

        if response.status().is_success() || response.status().as_u16() == 404 {
            Ok(true)
        } else {
            Err(format!("Connection failed with status: {}", response.status()))
        }
    }

    /// 上传对象
    pub async fn put_object(&self, key: &str, data: &[u8]) -> Result<(), String> {
        let path = format!("/{}", key);
        let query = "";
        let payload_hash = Self::sha256_hash(data);
        let content_md5 = Self::md5_hash(data);

        let mut headers: Vec<(String, String)> = Vec::new();
        headers.push(("content-type".to_string(), "application/json".to_string()));
        headers.push(("content-md5".to_string(), content_md5));
        self.sign_request("PUT", &path, query, &mut headers, &payload_hash);

        let url = format!("{}/{}", self.config.endpoint, key);

        let mut request = self.client.put(&url).body(data.to_vec());
        for (key, value) in headers {
            if key == "host" {
                continue;
            }
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Upload failed: {}", e))?;

        if response.status().is_success() {
            Ok(())
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("Upload failed with status {}: {}", status, body))
        }
    }

    /// 下载对象
    pub async fn get_object(&self, key: &str) -> Result<Option<Vec<u8>>, String> {
        let path = format!("/{}", key);
        let query = "";
        let payload_hash = Self::sha256_hash(b"");

        let mut headers: Vec<(String, String)> = Vec::new();
        self.sign_request("GET", &path, query, &mut headers, &payload_hash);

        let url = format!("{}/{}", self.config.endpoint, key);

        let mut request = self.client.get(&url);
        for (key, value) in headers {
            if key == "host" {
                continue;
            }
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Download failed: {}", e))?;

        if response.status().as_u16() == 404 {
            return Ok(None);
        }

        if response.status().is_success() {
            let data = response
                .bytes()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;
            Ok(Some(data.to_vec()))
        } else {
            Err(format!("Download failed with status: {}", response.status()))
        }
    }

    /// 检查对象是否存在
    pub async fn head_object(&self, key: &str) -> Result<bool, String> {
        let path = format!("/{}", key);
        let query = "";
        let payload_hash = Self::sha256_hash(b"");

        let mut headers: Vec<(String, String)> = Vec::new();
        self.sign_request("HEAD", &path, query, &mut headers, &payload_hash);

        let url = format!("{}/{}", self.config.endpoint, key);

        let mut request = self.client.head(&url);
        for (key, value) in headers {
            if key == "host" {
                continue;
            }
            request = request.header(key, value);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Head request failed: {}", e))?;

        Ok(response.status().is_success())
    }
}