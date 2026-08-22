import { describe, expect, it } from "vitest";

describe("configuração do backup GitHub", () => {
  it("tem conta autorizada e valida o token no endpoint leve do GitHub", async () => {
    const allowedEmail = process.env.GITHUB_BACKUP_ALLOWED_EMAIL;
    const token = process.env.GITHUB_BACKUP_TOKEN;
    expect(allowedEmail, "GITHUB_BACKUP_ALLOWED_EMAIL não está configurado").toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(token, "GITHUB_BACKUP_TOKEN não está configurado").toBeTruthy();

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(response.status).toBe(200);
  }, 15_000);
});
