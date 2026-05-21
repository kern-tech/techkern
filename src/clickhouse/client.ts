/**
 * ClickHouse client wrapper. Single shared connection pool across all tool handlers.
 *
 * Indexer shards: swaps · pumpfun · holders · kol
 * Projections are configured to keep p95 < 50ms on the hot query paths.
 */
import { createClient, ClickHouseClient } from "@clickhouse/client";

let _client: ClickHouseClient | null = null;

export function getClient(): ClickHouseClient {
  if (_client) return _client;
  _client = createClient({
    url: process.env.TECHKERN_CH_URL ?? "https://ch.techkern.xyz",
    username: process.env.TECHKERN_CH_USER ?? "reader",
    password: process.env.TECHKERN_CH_PASSWORD ?? "",
    database: process.env.TECHKERN_CH_DB ?? "solana",
    request_timeout: 10_000,
  });
  return _client;
}

/**
 * Run a parameterized SELECT and return rows as JSON.
 * Always uses ReadOnly profile.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const client = getClient();
  const result = await client.query({
    query: sql,
    query_params: params,
    format: "JSONEachRow",
    clickhouse_settings: { readonly: "1" },
  });
  return (await result.json()) as T[];
}

/** Tiny helper for time-window predicates. */
export function timeWindowSql(from?: string, to?: string): string {
  const parts: string[] = [];
  if (from) parts.push(`block_time >= parseDateTimeBestEffort('${from}')`);
  if (to) parts.push(`block_time <= parseDateTimeBestEffort('${to}')`);
  return parts.length ? `AND ${parts.join(" AND ")}` : "";
}
