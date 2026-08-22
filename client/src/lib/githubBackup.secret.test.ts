import { describe, expect, it } from "vitest";

describe("GITHUB_BACKUP_TOKEN", () => {
  it("valida a autorização no endpoint leve do GitHub sem expor o token", async () => {
    const token = process.env.GITHUB_BACKUP_TOKEN;
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
