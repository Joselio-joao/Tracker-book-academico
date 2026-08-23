import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

type WorkerEvent = { waitUntil: (promise: Promise<unknown>) => void };

type FakeCache = {
  entries: Map<string, unknown>;
  put: (key: string, value: unknown) => Promise<void>;
};

function createWorkerHarness() {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const entries = new Map<string, unknown>();
  const cache: FakeCache = {
    entries,
    put: async (key, value) => {
      entries.set(key, value);
    },
  };
  const cacheStorage = {
    open: async () => cache,
    keys: async () => ["super-tracker-shell"],
    delete: async () => {
      throw new Error("A atualização não pode apagar caches.");
    },
  };
  const localData = {
    indexedDb: { notes: [{ id: "existing-note", title: "Nota existente" }] },
    opfs: { "plano.pdf": "conteúdo existente" },
    localStorage: { "legacy-key": "valor existente" },
  };
  const context = {
    self: {
      registration: { scope: "https://example.test/Tracker-book-academico/" },
      clients: { claim: async () => undefined },
      skipWaiting: () => undefined,
      addEventListener: (type: string, handler: (event: WorkerEvent) => void) => listeners.set(type, handler),
    },
    caches: cacheStorage,
    fetch: async () => ({ ok: true, clone: () => ({ marker: "cached-shell" }), text: async () => "<html><body>Super Tracker</body></html>" }),
    URL,
    indexedDB: {
      open: () => {
        throw new Error("O service worker não deve abrir IndexedDB.");
      },
    },
    navigator: {
      storage: {
        getDirectory: () => {
          throw new Error("O service worker não deve abrir OPFS.");
        },
      },
    },
    localStorage: {
      clear: () => {
        throw new Error("O service worker não deve limpar localStorage.");
      },
      removeItem: () => {
        throw new Error("O service worker não deve remover localStorage.");
      },
    },
  };
  vm.runInNewContext(readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8"), context);
  return { listeners, entries, localData, cacheStorage };
}

async function runWorkerEvent(handler: ((event: WorkerEvent) => void) | undefined) {
  if (!handler) throw new Error("Evento do service worker não registado.");
  const promises: Promise<unknown>[] = [];
  handler({ waitUntil: (promise) => promises.push(promise) });
  await Promise.all(promises);
}

describe("atualização funcional do service worker", () => {
  it("instala uma versão nova sem tocar nos dados existentes do telefone", async () => {
    const harness = createWorkerHarness();
    const before = structuredClone(harness.localData);

    await runWorkerEvent(harness.listeners.get("install"));
    await runWorkerEvent(harness.listeners.get("activate"));
    await runWorkerEvent(harness.listeners.get("install"));
    await runWorkerEvent(harness.listeners.get("activate"));

    expect(harness.entries.size).toBeGreaterThan(0);
    expect(harness.localData).toEqual(before);
    await expect(harness.cacheStorage.delete()).rejects.toThrow("não pode apagar caches");
  });
});
