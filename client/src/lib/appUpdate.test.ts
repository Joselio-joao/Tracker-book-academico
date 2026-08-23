import { afterEach, describe, expect, it, vi } from "vitest";
import { updateApplicationShell } from "./appUpdate";

afterEach(() => vi.unstubAllGlobals());

describe("atualização da aplicação", () => {
  it("não faz nada quando não existe service worker registado", async () => {
    vi.stubGlobal("navigator", { serviceWorker: { getRegistration: vi.fn().mockResolvedValue(undefined) } });
    await expect(updateApplicationShell()).resolves.toBe("unavailable");
  });

  it("verifica o service worker sem tocar no armazenamento local", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ update, installing: null }) } });
    await expect(updateApplicationShell()).resolves.toBe("updated");
    expect(update).toHaveBeenCalledTimes(1);
  });
});
