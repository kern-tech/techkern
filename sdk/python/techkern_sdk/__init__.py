"""Python client for the techkern MCP server.

Example:
    from techkern import MCPClient
    client = MCPClient()
    swaps = await client.call("query_solana_swaps", {"minUsd": 50000, "limit": 20})
"""
from __future__ import annotations

import httpx

HOSTED_URL = "https://api.techkern.xyz/mcp"


class MCPClient:
    def __init__(self, url: str = HOSTED_URL, api_key: str | None = None) -> None:
        self.url = url
        self.api_key = api_key
        self._client = httpx.AsyncClient(timeout=30.0)

    async def call(self, tool: str, args: dict) -> dict:
        headers = {"content-type": "application/json"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        r = await self._client.post(f"{self.url}/tools/{tool}", json=args, headers=headers)
        r.raise_for_status()
        return r.json()

    async def aclose(self) -> None:
        await self._client.aclose()


__all__ = ["MCPClient", "HOSTED_URL"]
