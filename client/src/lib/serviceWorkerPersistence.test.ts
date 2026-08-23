import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serviceWorkerSource = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

describe("persistência durante atualizações", () => {
  it("atualiza apenas recursos da aplicação", () => {
    expect(serviceWorkerSource).toContain("caches.open(CACHE_NAME)");
    expect(serviceWorkerSource).toContain("cache.put");
    expect(serviceWorkerSource).toContain("self.clients.claim");
  });

  it("não contém operações de limpeza de dados locais", () => {
    expect(serviceWorkerSource).not.toMatch(/indexedDB|localStorage|removeEntry|caches\.delete|clearStoredTrackerData/);
  });
});
