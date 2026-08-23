import { describe, expect, it, vi } from "vitest";
import { createGitHubBackupPayload, sendGitHubBackup } from "./githubBackup";

describe("githubBackup", () => {
  const data = { notes: [{ id: "n1", content: "Revisão" }], sessions: [] };

  it("cria um payload sem remover ou modificar os dados locais", () => {
    const payload = createGitHubBackupPayload(data, "2026-08-23T10:00:00.000Z");
    expect(payload).toEqual({ data, exportedAt: "2026-08-23T10:00:00.000Z" });
    expect(data).toEqual({ notes: [{ id: "n1", content: "Revisão" }], sessions: [] });
  });

  it("envia o payload com a sessão e devolve a resposta de sucesso", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true, path: "backups/file.json" }), { status: 200 }));
    await expect(sendGitHubBackup("https://backup.example/api", "session-token", data, fetcher)).resolves.toEqual({ ok: true, path: "backups/file.json" });
    const request = fetcher.mock.calls[0]?.[1];
    expect(request).toMatchObject({ method: "POST", headers: { "Content-Type": "text/plain" } });
    expect(JSON.parse(String(request?.body))).toMatchObject({ accessToken: "session-token", data });
  });

  it("converte respostas 4xx/5xx em mensagens sem tocar nos dados", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ error: "Esta conta não está autorizada." }), { status: 403 }));
    await expect(sendGitHubBackup("https://backup.example/api", "session-token", data, fetcher)).rejects.toThrow("Esta conta não está autorizada.");
    expect(data.notes).toHaveLength(1);
  });

  it("usa sendBeacon quando o fetch é rejeitado no Safari standalone", async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { sendBeacon });
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("blocked by standalone browser"));
    await expect(sendGitHubBackup("https://backup.example/api", "session-token", data, fetcher)).resolves.toMatchObject({ ok: true, pending: true });
    expect(sendBeacon).toHaveBeenCalledWith("https://backup.example/api", expect.any(Blob));
  });

  it("apresenta uma mensagem própria quando a rede falha e o beacon também não é aceite", async () => {
    const sendBeacon = vi.fn().mockReturnValue(false);
    vi.stubGlobal("navigator", { sendBeacon });
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline"));
    await expect(sendGitHubBackup("https://backup.example/api", "session-token", data, fetcher)).rejects.toThrow("Verifica a ligação à Internet");
  });
});
