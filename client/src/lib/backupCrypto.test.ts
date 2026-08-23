import { webcrypto } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { decryptBackup, encryptBackup } from "./backupCrypto";

vi.stubGlobal("crypto", webcrypto);
vi.stubGlobal("btoa", (value: string) => Buffer.from(value, "binary").toString("base64"));
vi.stubGlobal("atob", (value: string) => Buffer.from(value, "base64").toString("binary"));

describe("backup cifrado", () => {
  it("cifra e decifra o payload sem expor o conteúdo original", async () => {
    const payload = JSON.stringify({ sessions: [{ id: "s1", subject: "Matemática" }] });
    const encrypted = await encryptBackup(payload, "palavra-secreta-forte");
    expect(encrypted).not.toContain("Matemática");
    expect(await decryptBackup(encrypted, "palavra-secreta-forte")).toBe(payload);
  });

  it("rejeita palavra-passe incorreta e conteúdo adulterado", async () => {
    const encrypted = await encryptBackup("{\"notes\":[]}", "palavra-secreta-forte");
    await expect(decryptBackup(encrypted, "errada")).rejects.toThrow("Não foi possível abrir a cópia");
    const parts = encrypted.split(".");
    parts[3] = `${parts[3].startsWith("A") ? "B" : "A"}${parts[3].slice(1)}`;
    await expect(decryptBackup(parts.join("."), "palavra-secreta-forte")).rejects.toThrow("Não foi possível abrir a cópia");
  });

  it("rejeita um ficheiro que não pertence ao formato do tracker", async () => {
    await expect(decryptBackup("ficheiro-sem-formato", "palavra-secreta-forte")).rejects.toThrow("backup válido");
  });
});
