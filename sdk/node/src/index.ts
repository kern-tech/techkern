/**
 * @techkern/sdk — Node.js client for the techkern MCP server.
 *
 * Two modes:
 *   1. install()     — write MCP config snippets for Claude / Cursor / Cline
 *   2. MCPClient     — direct programmatic access to tools (skips MCP runtime)
 */

const HOSTED = "https://api.techkern.xyz/mcp";

export type ClientName = "claude-desktop" | "cursor" | "cline" | "continue" | "zed";

export function install(client: ClientName, opts?: { hosted?: boolean }): Record<string, unknown> {
  const hosted = opts?.hosted ?? false;
  if (hosted) {
    return { mcpServers: { techkern: { url: HOSTED } } };
  }
  return { mcpServers: { techkern: { command: "npx", args: ["@techkern/mcp"] } } };
}

export class MCPClient {
  constructor(private readonly url: string = HOSTED, private readonly apiKey?: string) {}

  async call<T = unknown>(tool: string, args: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.url}/tools/${tool}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`techkern ${tool}: ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }
}
