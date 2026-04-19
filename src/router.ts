import { RouteRequest, RouteResponse } from "./types";
import { FEATURES } from "./config/features";

export class Techkern {
  constructor(private opts: { apiKey: string; baseUrl?: string }) {}

  async route(req: RouteRequest): Promise<RouteResponse> {
    // Pick cheapest provider that satisfies qualityFloor
    // Stub: routes everything to Groq Llama 3.3 70B for now
    const url = `${this.opts.baseUrl ?? "https://api.techkern.xyz"}/v1/route`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (!r.ok) throw new Error(`techkern: ${r.status}`);
    return r.json();
  }
}
// step 1
