# RFC-0001: MCP tool input / output schema

- **Status:** Accepted
- **Author:** @kern-tech
- **Created:** 2026-04-05
- **Updated:** 2026-05-08

## Summary

Defines the shape that every techkern MCP tool follows for input validation, output serialization, and error propagation. Aligns with the official Anthropic MCP spec v1.0.

## Motivation

The MCP spec leaves tool schemas to the server. Without an internal convention, tool handlers drift — some return strings, others raw rows, others mixed. Agents see inconsistent shapes and prompts have to compensate. We standardize:

1. Inputs are validated via Zod and exposed as JSON Schema in `tools/list`.
2. Outputs are always JSON-serializable arrays of homogeneous records, or a single object.
3. Errors carry a `code` + `hint` so the model can self-correct.

## Tool definition shape

```ts
interface MCPToolDefinition<I, O> {
  name: string;                       // snake_case, matches MCP `tools/list`
  description: string;                // first sentence shown in agent context
  inputSchema: ZodType<I>;            // converted to JSON Schema for the wire
  handler: (input: I) => Promise<O>;
}
```

## Time arguments

Any `from` / `to` field accepts either ISO 8601 or a relative shorthand:

- `now`, `now-1m`, `now-5h`, `now-3d`
- `2026-05-22T14:00:00Z`

Parser lives in `src/clickhouse/client.ts:timeWindowSql`.

## Error codes

| Code | Meaning | Agent hint |
|---|---|---|
| `INVALID_INPUT` | Zod validation failed | "fix the listed fields and retry" |
| `RPC_TIMEOUT` | Helius / upstream timeout | "retry in a few seconds" |
| `RATE_LIMITED` | Per-key quota hit | "back off, switch to hosted plan" |
| `NOT_FOUND` | Mint / wallet doesn't exist | "verify the address" |

Errors are returned as MCP-spec error objects, not as result content. Models that retry on error get the hint as the message body.

## Versioning

Tool schemas are additive-only within a major version. Adding a field is non-breaking; removing or renaming bumps the MCP server major version.
