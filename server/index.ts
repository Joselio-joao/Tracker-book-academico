import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_OWNER = "Joselio-joao";
const GITHUB_REPOSITORY = "Tracker-book-academico";
const GITHUB_BACKUP_PATH = "backups/super-tracker-joselio-latest.json";
const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const backupAttempts = new Map<string, { startedAt: number; count: number }>();

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return true;
  return origin === "https://joselio-joao.github.io"
    || origin === "https://supertrack-v8vbxk6j.manus.space"
    || origin.startsWith("http://localhost:")
    || origin.endsWith(".manus.computer");
}

function setBackupCors(req: express.Request, res: express.Response) {
  const origin = req.get("origin");
  if (origin && isAllowedOrigin(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function isRateLimited(request: express.Request) {
  const key = request.ip || request.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const current = backupAttempts.get(key);
  if (!current || now - current.startedAt > 60_000) {
    backupAttempts.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function verifySupabaseSession(accessToken: string, fetcher: typeof fetch) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { configured: false, email: null };
  const response = await fetcher(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return { configured: true, email: null };
  const user = await response.json() as { email?: string };
  return { configured: true, email: user.email?.trim().toLowerCase() || null };
}

async function githubRequest(url: string, init: RequestInit, token: string, fetcher: typeof fetch) {
  return fetcher(url, {
    ...init,
    headers: { ...GITHUB_API_HEADERS, Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
}

export function createApp(externalFetch: typeof fetch = fetch) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/github/backup", express.text({ type: "text/plain", limit: "1mb" }));

  app.options("/api/github/backup", (req, res) => {
    setBackupCors(req, res);
    if (!isAllowedOrigin(req.get("origin"))) return res.status(403).end();
    return res.status(204).end();
  });

  app.post("/api/github/backup", async (req, res) => {
    setBackupCors(req, res);
    if (!isAllowedOrigin(req.get("origin"))) return res.status(403).json({ error: "Origem não autorizada." });
    if (isRateLimited(req)) return res.status(429).json({ error: "Aguarda um minuto antes de enviar outro backup." });

    let requestBody: { data?: unknown; exportedAt?: unknown; accessToken?: unknown } = {};
    try {
      requestBody = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    } catch {
      return res.status(400).json({ error: "Dados de backup inválidos." });
    }
    const accessToken = req.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
      || (typeof requestBody.accessToken === "string" ? requestBody.accessToken.trim() : "");
    if (!accessToken) return res.status(401).json({ error: "É necessária uma sessão autenticada para fazer o backup." });
    const githubToken = process.env.GITHUB_BACKUP_TOKEN;
    const allowedEmail = process.env.GITHUB_BACKUP_ALLOWED_EMAIL?.trim().toLowerCase();
    if (!githubToken || !allowedEmail) return res.status(503).json({ error: "Backup ainda não está configurado no servidor." });

    try {
      const auth = await verifySupabaseSession(accessToken, externalFetch);
      if (!auth.configured) return res.status(503).json({ error: "A autenticação do backup não está configurada." });
      if (!auth.email) return res.status(401).json({ error: "A sessão é inválida ou expirou. Entra novamente." });
      if (auth.email !== allowedEmail) return res.status(403).json({ error: "Esta conta não está autorizada a enviar backups." });

      const data = requestBody.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) return res.status(400).json({ error: "Dados de backup inválidos." });
      const backup = {
        app: "super-tracker-joselio",
        version: 1,
        exportedAt: typeof requestBody.exportedAt === "string" ? requestBody.exportedAt : new Date().toISOString(),
        data,
      };
      const serialized = JSON.stringify(backup, null, 2);
      const encoded = Buffer.from(serialized, "utf8").toString("base64");
      const contentUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${GITHUB_BACKUP_PATH}`;
      const existing = await githubRequest(contentUrl, { method: "GET" }, githubToken, externalFetch);
      let sha: string | undefined;
      if (existing.ok) {
        const current = await existing.json() as { sha?: string };
        sha = current.sha;
      } else if (existing.status !== 404) {
        return res.status(502).json({ error: "Não foi possível consultar o backup no GitHub." });
      }

      const githubResponse = await githubRequest(contentUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Atualizar backup do Super Tracker", content: encoded, branch: "main", ...(sha ? { sha } : {}) }),
      }, githubToken, externalFetch);
      if (!githubResponse.ok) return res.status(502).json({ error: "O GitHub recusou a atualização do backup." });
      const result = await githubResponse.json() as { commit?: { sha?: string } };
      return res.json({ ok: true, path: GITHUB_BACKUP_PATH, commit: result.commit?.sha || null, exportedAt: backup.exportedAt });
    } catch (error) {
      console.error("GitHub backup failed", error instanceof Error ? error.message : error);
      return res.status(502).json({ error: "Não foi possível concluir o backup agora." });
    }
  });

  // Serve static files from dist/public in production
  const staticPath = process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  return app;
}

export async function startServer() {
  const app = createApp();
  const server = createServer(app);
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) startServer().catch(console.error);
