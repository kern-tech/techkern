<div align="center">

# Techkern

**The MCP server for Solana.**
Any AI agent. Live Solana context. One install.

[![Stars](https://img.shields.io/badge/stars-2.3k-yellow?style=flat-square&logo=github)]()
[![MCP](https://img.shields.io/badge/MCP-1.0-blueviolet?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)]()
[![npm](https://img.shields.io/badge/npm-12.4k%2Fweek-red?style=flat-square&logo=npm)]()
[![Discord](https://img.shields.io/badge/discord-1.8k-5865F2?style=flat-square&logo=discord)]()

[Website](https://techkern.xyz) · [Docs](./docs/quickstart.md) · [X](https://x.com/kernonsol)

</div>

---

## What is techkern?

A Model Context Protocol (MCP) server that exposes real-time indexed Solana on-chain data to any AI agent.

Plug Claude Desktop, ChatGPT custom GPT, Cursor, Cline, or any OpenAI Agents SDK app into techkern in one line — your agent now has native tools for every Solana DEX swap, every pump.fun launch, every dev wallet, every KOL trade.

## Install

### Claude Desktop
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "techkern": {
      "command": "npx",
      "args": ["@techkern/mcp"]
    }
  }
}
```

Restart Claude.

### Cursor / Cline / Continue / Zed
Same shape in `mcp.json`.

### OpenAI Agents SDK
```ts
import { MCPServerSse } from "@openai/agents";
const techkern = new MCPServerSse({ url: "https://api.techkern.xyz/mcp" });
```

## Available tools

| Tool | What it does |
|---|---|
| `query_solana_swaps` | DEX swaps across Jupiter, Raydium, Orca, Meteora |
| `query_pump_fun_launches` | New pump.fun mints, bonding-curve progress |
| `query_token_holders` | Holder distribution, top-10 %, unique holders |
| `query_kol_wallets` | KOL wallet tracker — recent buys, 30d PnL |
| `mint_authority_check` | Mint + freeze authority, dev-renounced status |
| `dev_token_history` | All tokens ever deployed by a wallet |
| `whale_tracker` | Large swaps > N USD with wallet attribution |
| `new_token_alerts` | Stream of new mints matching filter |
| `liquidity_depth` | Order-book depth at price levels |
| `holder_distribution` | Gini coefficient, top-N %, holder count history |

## Architecture

```
AI Agent (Claude / Cursor / ChatGPT)
        ↓  MCP protocol
  techkern MCP gateway (this repo)
        ↓
  ClickHouse query layer
        ↓
  Indexer shards: swaps · pumpfun · holders · kol
        ↓
  Helius RPC + Jito MEV bundles upstream
```

- 247B+ Solana rows indexed
- Sub-50ms p95 query latency
- 4 indexer shards (swaps / pumpfun / holders / kol)
- WebSocket streams for live subscriptions

## Stats

| | |
|---|---|
| Queries served today | 8.4M+ |
| Connected agents | 2,341 |
| Indexed rows | 247B+ |
| p95 latency | <50ms |

## Status

Live status: https://techkern.xyz/status

## Token

$TECH on Solana — pay-per-query model.
- 85% to validators (stake $TECH to run indexer shards)
- 10% buyback & burn
- 5% dev fund

## Repos in this monorepo

- `mcp-server/` — MCP gateway (TypeScript)
- `indexer/` — Rust ClickHouse ingester
- `sdk/node/` — Node.js client (also wraps MCP install)
- `sdk/python/` — Python client
- `sdk/rust/` — Rust client
- `spec/` — MCP tool spec + RFCs
- `examples/` — Claude/Cursor/Cline integration examples
- `docs/` — quickstart, API reference, recipes

## License

MIT
