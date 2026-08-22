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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(createGitHubBackupPayload(data)),
    });
  } catch {
    throw new Error("Não foi possível contactar o servidor de backup. Verifica a ligação à Internet.");
  }
  const result = await response.json().catch(() => ({})) as GitHubBackupResponse;
  if (!response.ok) throw new Error(result.error || "O servidor não aceitou o backup.");
  return result;
}
