/**
 * MCP tool: query_solana_swaps
 *
 * DEX swaps across Jupiter, Raydium, Orca, Meteora.
 */
import { z } from "zod";
import { query, timeWindowSql } from "../clickhouse/client";
import { Swap, SOL_MINT, USDC_MINT } from "../types";

export const inputSchema = z.object({
  mint: z.string().optional().describe("Token mint to filter on either side of the swap"),
  wallet: z.string().optional().describe("Filter by signer wallet"),
  dex: z.enum(["jupiter", "raydium", "orca", "meteora"]).optional(),
  minUsd: z.number().optional().default(0),
  from: z.string().optional().describe("ISO time or relative — e.g. 'now-1h'"),
  to: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type Input = z.infer<typeof inputSchema>;

async function handler(input: Input): Promise<Swap[]> {
  const filters: string[] = ["usd_value >= {minUsd:Float64}"];
  if (input.mint) filters.push("(input_mint = {mint:String} OR output_mint = {mint:String})");
  if (input.wallet) filters.push("wallet = {wallet:String}");
  if (input.dex) filters.push("dex = {dex:String}");

  const sql = `
    SELECT signature, slot, toUnixTimestamp(block_time) AS blockTime,
           dex, input_mint AS inputMint, output_mint AS outputMint,
           input_amount AS inputAmount, output_amount AS outputAmount,
           usd_value AS usdValue, wallet
    FROM solana.swaps
    WHERE ${filters.join(" AND ")} ${timeWindowSql(input.from, input.to)}
    ORDER BY block_time DESC
    LIMIT {limit:UInt32}
  `;

  return query<Swap>(sql, {
    minUsd: input.minUsd ?? 0,
    mint: input.mint ?? SOL_MINT,
    wallet: input.wallet ?? "",
    dex: input.dex ?? "",
    limit: input.limit,
  });
}

export const querySolanaSwaps = {
  name: "query_solana_swaps",
  description: "Query Solana DEX swaps (Jupiter, Raydium, Orca, Meteora) with filters.",
  inputSchema,
  handler,
};

// Default suggestion to give agents a sane first call
export const DEFAULT_PAIR = { input: SOL_MINT, output: USDC_MINT };
