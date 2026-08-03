declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}

interface D1Database {
  prepare(query: string): unknown;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
