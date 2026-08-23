export type GitHubBackupResponse = {
  ok?: boolean;
  path?: string;
  commit?: string | null;
  exportedAt?: string;
  pending?: boolean;
  error?: string;
};

export function createGitHubBackupPayload<T>(data: T, exportedAt = new Date().toISOString()) {
  return { data, exportedAt };
}

export async function sendGitHubBackup<T>(endpoint: string, accessToken: string, data: T, fetcher: typeof fetch = fetch): Promise<GitHubBackupResponse> {
  if (!endpoint || !accessToken) throw new Error("A sessão não está disponível para o backup.");
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      // text/plain is a CORS-safelisted content type, so Safari can send the
      // request without a preflight. The token remains inside the HTTPS body,
      // never in the URL or in the public bundle.
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ ...createGitHubBackupPayload(data), accessToken }),
    });
  } catch {
    // Some iOS standalone sessions still reject cross-origin fetch even when
    // the endpoint is reachable. Beacon submits the same HTTPS body without
    // requiring a readable CORS response, so the server can finish the commit.
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(endpoint, new Blob([JSON.stringify({ ...createGitHubBackupPayload(data), accessToken })], { type: "text/plain" }));
      if (sent) return { ok: true, pending: true, path: "backups/super-tracker-joselio-latest.json" };
    }
    throw new Error("Não foi possível contactar o servidor de backup. Verifica a ligação à Internet.");
  }
  const result = await response.json().catch(() => ({})) as GitHubBackupResponse;
  if (!response.ok) throw new Error(result.error || "O servidor não aceitou o backup.");
  return result;
}
