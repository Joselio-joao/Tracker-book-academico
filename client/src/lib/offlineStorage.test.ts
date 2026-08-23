import { beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { encryptBackup, decryptBackup } from "./backupCrypto";
import { DATA_SAFETY_COPY } from "./dataSafety";
import { updateApplicationShell } from "./appUpdate";
import { mergeImportedTrackerData, parseImportedTrackerData } from "./dataTransfer";
import { organizeStoredFiles } from "./fileOrganization";
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

  it("mantém IndexedDB, OPFS e localStorage ao atualizar e importar estrutura", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const originalServiceWorker = (navigator as Navigator & { serviceWorker?: unknown }).serviceWorker;
    const file = new File(["livro local"], "manual.epub", { type: "application/epub+zip" });
    const metadata = [{ name: file.name, size: file.size, type: file.type, category: "Livro", updatedAt: 42 }];
    const directory = { getFileHandle: async () => ({ getFile: async () => file }) };
    const update = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { getRegistration: vi.fn().mockResolvedValue({ update, installing: null }) } });
    try {
      const existing = { ...fallback, notes: [{ id: "local-note", title: "Nota local" }], sessions: [{ id: "local-session", minutes: 45 }] };
      await saveTrackerData(existing);
      await saveLargeFileMetadata(metadata);
      legacyStorage.set("local-only-sentinel", "preservar");
      const beforeInvalidData = await loadTrackerData(fallback);
      const beforeInvalidMetadata = await loadLargeFileMetadata();
      expect(() => parseImportedTrackerData("{ JSON inválido")).toThrow();
      expect(await loadTrackerData(fallback)).toEqual(beforeInvalidData);
      expect(await loadLargeFileMetadata()).toEqual(beforeInvalidMetadata);
      expect(legacyStorage.get("local-only-sentinel")).toBe("preservar");
      const imported = parseImportedTrackerData(JSON.stringify({ notes: [{ id: "local-note", title: "não substituir" }, { id: "new-note", title: "Nova nota" }] }));
      const combined = mergeImportedTrackerData(existing, imported);
      await updateApplicationShell();
      await saveTrackerData(combined);
      expect(update).toHaveBeenCalledTimes(1);
      expect((await loadTrackerData(fallback)).notes).toEqual([{ id: "local-note", title: "Nota local" }, { id: "new-note", title: "Nova nota" }]);
      expect(await loadLargeFileMetadata()).toEqual(metadata);
      await expect(readLargeFile(file.name)).resolves.toBe(file);
      expect(legacyStorage.get("local-only-sentinel")).toBe("preservar");
    } finally {
      Object.defineProperty(navigator, "storage", { configurable: true, value: originalStorage });
      Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: originalServiceWorker });
    }
  });

  it("restaura backup cifrado sem sobrescrever IndexedDB, OPFS ou localStorage", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const localFile = new File(["ficheiro local"], "manual.epub", { type: "application/epub+zip" });
    const localMetadata = [{ name: localFile.name, size: localFile.size, type: localFile.type, category: "Livro", updatedAt: 10 }];
    const backupMetadata = [{ name: "novo.pdf", size: 8, type: "application/pdf", category: "PDF", updatedAt: 20 }];
    const directory = { getFileHandle: async (name: string) => ({ getFile: async () => name === localFile.name ? localFile : null }) };
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    const existing = { ...fallback, notes: [{ id: "existing-note", title: "Nota local", content: "não substituir" }], sessions: [{ id: "existing-session", minutes: 45 }] };
    const backupData = { ...fallback, notes: [{ id: "existing-note", title: "versão da cópia", content: "não deve substituir" }, { id: "new-note", title: "Nota nova", content: "restaurar" }] };
    try {
      await saveTrackerData(existing);
      await saveLargeFileMetadata(localMetadata);
      legacyStorage.set("local-only-sentinel", "preservar");
      const encrypted = await encryptBackup(JSON.stringify({ format: "super-tracker-backup", version: 1, data: backupData, files: backupMetadata }), "palavra-secreta-forte");
      const restored = JSON.parse(await decryptBackup(encrypted, "palavra-secreta-forte")) as { data: typeof backupData; files: typeof backupMetadata };
      const imported = parseImportedTrackerData(JSON.stringify(restored.data));
      const combined = mergeImportedTrackerData(existing, imported);
      const currentMetadata = await loadLargeFileMetadata();
      const metadataByName = new Map(currentMetadata.map((item) => [item.name, item]));
      restored.files.forEach((item) => { if (!metadataByName.has(item.name)) metadataByName.set(item.name, item); });
      await saveLargeFileMetadata(Array.from(metadataByName.values()));
      await saveTrackerData(combined);
      expect((await loadTrackerData(fallback)).notes).toEqual([{ id: "existing-note", title: "Nota local", content: "não substituir" }, { id: "new-note", title: "Nota nova", content: "restaurar" }]);
      expect(await loadLargeFileMetadata()).toEqual([...localMetadata, ...backupMetadata]);
      await expect(readLargeFile(localFile.name)).resolves.toBe(localFile);
      expect(legacyStorage.get("local-only-sentinel")).toBe("preservar");
    } finally {
      Object.defineProperty(navigator, "storage", { configurable: true, value: originalStorage });
    }
  });

  it("limpa o registo IndexedDB e o legado", async () => {
    await saveTrackerData({ ...fallback, sessions: [{ id: "to-delete" }] });
    await clearStoredTrackerData();
    await expect(loadTrackerData(fallback)).resolves.toEqual(fallback);
  });

  it("preserva dados existentes quando a mensagem de persistência é carregada", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const metadata = [{ name: "plano.pdf", size: 12, type: "application/pdf", updatedAt: 10 }];
    const directory = { getFileHandle: async () => ({ getFile: async () => new File(["pdf"], "plano.pdf", { type: "application/pdf" }) }) };
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    const existing = {
      ...fallback,
      sessions: [{ id: "existing-session", date: "2026-08-23", subject: "Matemática", minutes: 45, topic: "Funções", quality: 4 }],
      notes: [{ id: "existing-note", title: "Revisão", content: "Derivadas", subject: "Matemática", pinned: true }],
      tutors: [{ id: "existing-tutor", name: "Prof. Ana", role: "Tutora", phone: "+244900000000", email: "", subject: "Matemática", notes: "" }],
    };
    try {
      await saveTrackerData(existing);
      await saveLargeFileMetadata(metadata);
      const beforeData = await loadTrackerData(fallback);
      const beforeMetadata = await loadLargeFileMetadata();
      expect(DATA_SAFETY_COPY.title).toBe("Os teus dados vão manter-se?");
      await expect(loadTrackerData(fallback)).resolves.toEqual(beforeData);
      await expect(loadLargeFileMetadata()).resolves.toEqual(beforeMetadata);
    } finally {
      Object.defineProperty(navigator, "storage", { configurable: true, value: originalStorage });
    }
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

  it("mantém a organização após recarregar metadados e abre o item filtrado", async () => {
    const originalStorage = (navigator as Navigator & { storage?: unknown }).storage;
    const savedBook = new File(["livro"], "manual.epub", { type: "application/epub+zip" });
    const savedPdf = new File(["pdf"], "plano.pdf", { type: "application/pdf" });
    const files = new Map([["manual.epub", savedBook], ["plano.pdf", savedPdf]]);
    const metadata = [
      { name: "manual.epub", size: savedBook.size, type: savedBook.type, category: "Livro", updatedAt: 20 },
      { name: "plano.pdf", size: savedPdf.size, type: savedPdf.type, category: "PDF", updatedAt: 10 },
    ];
    const directory = { getFileHandle: async (name: string) => ({ getFile: async () => files.get(name) }) };
    Object.defineProperty(navigator, "storage", { configurable: true, value: { getDirectory: async () => directory } });
    try {
      await saveLargeFileMetadata(metadata);
      const reloaded = await loadLargeFileMetadata();
      const visible = organizeStoredFiles(reloaded, "Livro", "newest", "manual");
      expect(visible.map((file) => file.name)).toEqual(["manual.epub"]);
      await expect(readLargeFile(visible[0].name)).resolves.toBe(savedBook);
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
