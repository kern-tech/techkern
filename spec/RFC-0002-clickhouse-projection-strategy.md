# RFC-0002: ClickHouse projection strategy for sub-50ms latency

- **Status:** Accepted (shipped v0.3.2, 2026-05-15)
- **Author:** @kern-tech
- **Created:** 2026-04-22

## Problem

Pre-projection, the hot path on `query_solana_swaps` was 110ms p95 on 247B-row `solana.swaps`. ClickHouse was scanning the primary key (`block_time` DESC) and filtering on `(input_mint, output_mint, dex)` after the fact. The agent-call distribution is heavily skewed toward "swaps for one mint in the last hour," which means the scan was reading orders of magnitude more rows than it returned.

## Decision

Add 4 projections to `solana.swaps`:

```sql
-- P1: hot path — single mint, recent window
ALTER TABLE solana.swaps ADD PROJECTION p_mint_time (
  SELECT *
  ORDER BY (input_mint, block_time)
);

-- P2: output-side filter (same shape, other leg of the swap)
ALTER TABLE solana.swaps ADD PROJECTION p_outmint_time (
  SELECT *
  ORDER BY (output_mint, block_time)
);

-- P3: wallet-centric queries (KOL, dev history)
ALTER TABLE solana.swaps ADD PROJECTION p_wallet_time (
  SELECT *
  ORDER BY (wallet, block_time)
);

-- P4: whale flow — usd_value range scans
ALTER TABLE solana.swaps ADD PROJECTION p_usd_time (
  SELECT *
  ORDER BY (usd_value, block_time)
  WHERE usd_value >= 1000
);
```

## Results

| Query shape | Before | After |
|---|---|---|
| `query_solana_swaps` p95 | 110ms | 38ms |
| `query_solana_swaps` p99 | 280ms | 91ms |
| `whale_tracker` p95 | 410ms | 44ms |
| Cluster write throughput | unchanged | -2% |

## Trade-offs

- Storage overhead: +1.6x raw data size (acceptable — disk is cheap, latency is not)
- Background merges spike CPU during projection rebuild; mitigated by scheduling merges off-peak
- New projections require a full rewrite — adding a 5th is a multi-hour operation

## Future work

- Move `pumpfun_launches` to the same projection scheme (currently 60ms p95 — fine, but trend is up)
- Investigate per-region projections for the `kol` shard
