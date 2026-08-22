export type GitHubBackupResponse = {
  ok?: boolean;
  path?: string;
  commit?: string | null;
  exportedAt?: string;
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
    throw new Error("Não foi possível contactar o servidor de backup. Verifica a ligação à Internet.");
  }
  const result = await response.json().catch(() => ({})) as GitHubBackupResponse;
  if (!response.ok) throw new Error(result.error || "O servidor não aceitou o backup.");
  return result;
}
