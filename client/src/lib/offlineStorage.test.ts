import { beforeEach, describe, expect, it } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { clearStoredTrackerData, getLargeFilePreviewKind, loadLargeFileMetadata, loadTrackerData, mergeLegacyTrackerData, readLargeFile, saveLargeFileMetadata, saveTrackerData } from "./offlineStorage";

const legacyStorage = new Map<string, string>();
Object.defineProperty(globalThis, "indexedDB", { value: indexedDB, configurable: true });
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => legacyStorage.get(key) ?? null,
    setItem: (key: string, value: string) => legacyStorage.set(key, value),
    removeItem: (key: string) => legacyStorage.delete(key),
  },
  configurable: true,
});

const fallback = { sessions: [], notes: [], tutors: [], timer: { duration: 45, remaining: 45 * 60, running: false, endsAt: null }, habits: {}, version: 1 };

describe("offlineStorage", () => {
  beforeEach(async () => {
    legacyStorage.clear();
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("joselio-super-tracker");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });

  it("migra dados legados sem perder os valores predefinidos", () => {
    const migrated = mergeLegacyTrackerData(fallback, JSON.stringify({ sessions: [{ id: "legacy-1" }] }));
    expect(migrated).toEqual({ sessions: [{ id: "legacy-1" }], notes: [], tutors: [], timer: { duration: 45, remaining: 45 * 60, running: false, endsAt: null }, habits: {}, version: 1 });
  });

  it("migra localStorage e preserva os dados após gravar e recarregar", async () => {
    legacyStorage.set("joselio-super-tracker-v1", JSON.stringify({ sessions: [{ id: "legacy-1" }] }));
    await expect(loadTrackerData(fallback)).resolves.toEqual({ sessions: [{ id: "legacy-1" }], notes: [], tutors: [], timer: { duration: 45, remaining: 45 * 60, running: false, endsAt: null }, habits: {}, version: 1 });

    const saved = { ...fallback, sessions: [{ id: "indexed-1" }], notes: [{ id: "note-1", title: "Revisão", content: "Rever funções", subject: "Matemática", pinned: true }], tutors: [{ id: "tutor-1", name: "Prof. Ana" }], timer: { duration: 50, remaining: 2870, running: true, endsAt: Date.now() + 2870000 } };
    await saveTrackerData(saved);
    await expect(loadTrackerData(fallback)).resolves.toEqual(saved);
  });

  it("limpa o registo IndexedDB e o legado", async () => {
    await saveTrackerData({ ...fallback, sessions: [{ id: "to-delete" }] });
    await clearStoredTrackerData();
    await expect(loadTrackerData(fallback)).resolves.toEqual(fallback);
  });

  it("ignora uma cópia legada inválida com segurança", () => {
    expect(mergeLegacyTrackerData(fallback, "{invalid-json")).toEqual(fallback);
  });

  it("devolve uma lista vazia de metadados OPFS quando o armazenamento ainda não existe", async () => {
    await expect(loadLargeFileMetadata()).resolves.toEqual([]);
  });

  it("lê PDFs e imagens existentes sem os alterar nem apagar os metadados", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const savedPdf = new File(["conteúdo-pdf"], "plano.pdf", { type: "application/pdf" });
    const savedImage = new File(["conteúdo-imagem"], "foto.png", { type: "image/png" });
    const files = new Map([["plano.pdf", savedPdf], ["foto.png", savedImage]]);
    const metadata = [
      { name: "plano.pdf", size: savedPdf.size, type: savedPdf.type, updatedAt: 1 },
      { name: "foto.png", size: savedImage.size, type: savedImage.type, updatedAt: 2 },
    ];
    const directory = {
      getFileHandle: async (name: string) => ({ getFile: async () => files.get(name) }),
    };
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    try {
      await saveLargeFileMetadata(metadata);
      await expect(readLargeFile("plano.pdf")).resolves.toBe(savedPdf);
      await expect(readLargeFile("foto.png")).resolves.toBe(savedImage);
      await expect(savedPdf.text()).resolves.toBe("conteúdo-pdf");
      await expect(savedImage.text()).resolves.toBe("conteúdo-imagem");
      await expect(loadLargeFileMetadata()).resolves.toEqual(metadata);
    } finally {
      Object.defineProperty(navigator, "storage", { configurable: true, value: originalStorage });
    }
  });

  it("classifica os formatos suportados pelo visualizador", () => {
    expect(getLargeFilePreviewKind("application/pdf", "documento.bin")).toBe("pdf");
    expect(getLargeFilePreviewKind("", "documento.pdf")).toBe("pdf");
    expect(getLargeFilePreviewKind("image/jpeg", "foto.jpg")).toBe("image");
    expect(getLargeFilePreviewKind("application/zip", "arquivo.zip")).toBe("other");
  });

  it("devolve nulo quando o ficheiro OPFS já não existe", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const directory = { getFileHandle: async () => { throw new DOMException("Ficheiro não encontrado", "NotFoundError"); } };
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    try {
      await expect(readLargeFile("apagado.pdf")).resolves.toBeNull();
    } finally {
      Object.defineProperty(navigator, "storage", { configurable: true, value: originalStorage });
    }
  });
});
