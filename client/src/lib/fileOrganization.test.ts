import { describe, expect, it } from "vitest";
import { getStoredFileCategory, organizeStoredFiles, type FileCategory } from "./fileOrganization";
import type { StoredFileMetadata } from "./offlineStorage";

const files: StoredFileMetadata[] = [
  { name: "Fisica.pdf", size: 200, type: "application/pdf", updatedAt: 1000 },
  { name: "Biologia.epub", size: 300, type: "application/epub+zip", updatedAt: 3000 },
  { name: "Passaporte.png", size: 400, type: "image/png", category: "Universidade", updatedAt: 2000 },
];

describe("organização local de ficheiros", () => {
  it("infere livros, PDFs e imagens sem categoria antiga", () => {
    expect(getStoredFileCategory(files[0])).toBe("PDF");
    expect(getStoredFileCategory(files[1])).toBe("Livro");
    expect(getStoredFileCategory(files[2])).toBe("Universidade");
  });

  it("filtra por categoria e mantém ficheiros sem categoria compatíveis", () => {
    expect(organizeStoredFiles(files, "Livro").map((file) => file.name)).toEqual(["Biologia.epub"]);
    expect(organizeStoredFiles(files, "Universidade").map((file) => file.name)).toEqual(["Passaporte.png"]);
    expect(organizeStoredFiles(files, "PDF").map((file) => file.name)).toEqual(["Fisica.pdf"]);
  });

  it("ordena por data e nome", () => {
    expect(organizeStoredFiles(files, "all", "newest").map((file) => file.name)).toEqual(["Biologia.epub", "Passaporte.png", "Fisica.pdf"]);
    expect(organizeStoredFiles(files, "all", "oldest").map((file) => file.name)).toEqual(["Fisica.pdf", "Passaporte.png", "Biologia.epub"]);
    expect(organizeStoredFiles(files, "all", "name").map((file) => file.name)).toEqual(["Biologia.epub", "Fisica.pdf", "Passaporte.png"]);
  });

  it("combina categoria, pesquisa e ordenação para a ação Abrir", () => {
    const filtered = organizeStoredFiles(files, "PDF", "newest", "fis");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Fisica.pdf");
    expect(filtered[0].category).toBe("PDF");
  });

  it("não altera os metadados existentes ao organizar", () => {
    const before = structuredClone(files);
    const organized = organizeStoredFiles(files, "all", "newest");
    expect(files).toEqual(before);
    expect(organized.every((file) => ["Livro", "PDF", "Universidade"].includes(file.category as FileCategory))).toBe(true);
  });
});
