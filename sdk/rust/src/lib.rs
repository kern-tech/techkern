//! Rust client for the techkern MCP server.
//!
//! ```no_run
//! # async fn ex() -> anyhow::Result<()> {
//! let client = techkern::Client::new();
//! let swaps: serde_json::Value = client
//!     .call("query_solana_swaps", serde_json::json!({ "minUsd": 50000, "limit": 20 }))
//!     .await?;
//! # Ok(()) }
//! ```
use serde_json::Value;

pub const HOSTED_URL: &str = "https://api.techkern.xyz/mcp";

pub struct Client {
    url: String,
    api_key: Option<String>,
    http: reqwest::Client,
}

impl Client {
    pub fn new() -> Self {
        Self {
            url: HOSTED_URL.to_string(),
            api_key: std::env::var("TECHKERN_API_KEY").ok(),
            http: reqwest::Client::new(),
        }
    }

    pub fn with_url(mut self, url: impl Into<String>) -> Self {
        self.url = url.into();
        self
    }

    pub async fn call(&self, tool: &str, args: Value) -> reqwest::Result<Value> {
        let mut req = self.http.post(format!("{}/tools/{}", self.url, tool)).json(&args);
        if let Some(k) = &self.api_key {
            req = req.bearer_auth(k);
        }
        req.send().await?.error_for_status()?.json::<Value>().await
    }
}

impl Default for Client {
    fn default() -> Self {
        Self::new()
    }
}
