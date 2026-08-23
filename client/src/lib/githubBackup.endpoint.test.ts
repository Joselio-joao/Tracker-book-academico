import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../../server/index";

const originalToken = process.env.GITHUB_BACKUP_TOKEN;
const originalEmail = process.env.GITHUB_BACKUP_ALLOWED_EMAIL;
const originalSupabaseUrl = process.env.VITE_SUPABASE_URL;
const originalSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function withServer(fetcher: typeof fetch, callback: (baseUrl: string) => Promise<void>) {
  const server = createApp(fetcher).listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Servidor de teste sem endereço.");
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

afterEach(() => {
  process.env.GITHUB_BACKUP_TOKEN = originalToken;
  process.env.GITHUB_BACKUP_ALLOWED_EMAIL = originalEmail;
  process.env.VITE_SUPABASE_URL = originalSupabaseUrl;
  process.env.VITE_SUPABASE_ANON_KEY = originalSupabaseKey;
  vi.restoreAllMocks();
});

describe("endpoint de backup GitHub", () => {
  it("aceita um POST autenticado e prepara a atualização do ficheiro único", async () => {
    process.env.GITHUB_BACKUP_TOKEN = "github-test-token";
    process.env.GITHUB_BACKUP_ALLOWED_EMAIL = "joselio@example.com";
    process.env.VITE_SUPABASE_URL = "https://supabase.example";
    process.env.VITE_SUPABASE_ANON_KEY = "supabase-anon-test";
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url, init) => {
      calls.push({ url: String(url), init });
      if (String(url).endsWith("/auth/v1/user")) return new Response(JSON.stringify({ email: "joselio@example.com" }), { status: 200 });
      if (init?.method === "GET") return new Response(JSON.stringify({ sha: "old-sha" }), { status: 200 });
      return new Response(JSON.stringify({ commit: { sha: "new-sha" } }), { status: 200 });
    });

    await withServer(fetcher, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/github/backup`, {
        method: "POST",
        headers: { Origin: "https://joselio-joao.github.io", "Content-Type": "text/plain" },
        body: JSON.stringify({ accessToken: "supabase-session", data: { notes: [{ id: "local-1" }] }, exportedAt: "2026-08-23T10:00:00.000Z" }),
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ ok: true, path: "backups/super-tracker-joselio-latest.json" });
    });

    const githubPut = calls.find((call) => call.init?.method === "PUT");
    expect(githubPut?.url).toContain("backups/super-tracker-joselio-latest.json");
    expect(JSON.parse(String(githubPut?.init?.body))).toMatchObject({ message: "Atualizar backup do Super Tracker", sha: "old-sha" });
  });

  it("recusa uma sessão cujo e-mail não está autorizado e não chama o GitHub", async () => {
    process.env.GITHUB_BACKUP_TOKEN = "github-test-token";
    process.env.GITHUB_BACKUP_ALLOWED_EMAIL = "joselio@example.com";
    process.env.VITE_SUPABASE_URL = "https://supabase.example";
    process.env.VITE_SUPABASE_ANON_KEY = "supabase-anon-test";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ email: "outra@example.com" }), { status: 200 }));

    await withServer(fetcher, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/github/backup`, {
        method: "POST",
        headers: { Origin: "https://joselio-joao.github.io", Authorization: "Bearer supabase-session", "Content-Type": "application/json" },
        body: JSON.stringify({ data: { notes: [] } }),
      });
      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: "Esta conta não está autorizada a enviar backups." });
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("recusa sessão Supabase inválida e não chama o GitHub", async () => {
    process.env.GITHUB_BACKUP_TOKEN = "github-test-token";
    process.env.GITHUB_BACKUP_ALLOWED_EMAIL = "joselio@example.com";
    process.env.VITE_SUPABASE_URL = "https://supabase.example";
    process.env.VITE_SUPABASE_ANON_KEY = "supabase-anon-test";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("sessão inválida", { status: 401 }));

    await withServer(fetcher, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/github/backup`, {
        method: "POST",
        headers: { Origin: "https://joselio-joao.github.io", Authorization: "Bearer expired-session", "Content-Type": "application/json" },
        body: JSON.stringify({ data: { notes: [] } }),
      });
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: "A sessão é inválida ou expirou. Entra novamente." });
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("recusa origem desconhecida e pedido sem sessão antes de qualquer escrita", async () => {
    process.env.GITHUB_BACKUP_TOKEN = "github-test-token";
    process.env.GITHUB_BACKUP_ALLOWED_EMAIL = "joselio@example.com";
    const fetcher = vi.fn<typeof fetch>();

    await withServer(fetcher, async (baseUrl) => {
      const originResponse = await fetch(`${baseUrl}/api/github/backup`, { method: "OPTIONS", headers: { Origin: "https://example.invalid" } });
      expect(originResponse.status).toBe(403);
      const authResponse = await fetch(`${baseUrl}/api/github/backup`, { method: "POST", headers: { Origin: "https://joselio-joao.github.io", "Content-Type": "application/json" }, body: JSON.stringify({ data: {} }) });
      expect(authResponse.status).toBe(401);
      await expect(authResponse.json()).resolves.toEqual({ error: "É necessária uma sessão autenticada para fazer o backup." });
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
