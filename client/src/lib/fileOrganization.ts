import type { StoredFileMetadata } from "./offlineStorage";

export const FILE_CATEGORIES = ["Livro", "PDF", "Imagem", "Estudo", "Universidade", "Bolsa", "Outro"] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];
export type FileCategoryFilter = "all" | FileCategory;
export type FileSort = "newest" | "oldest" | "name";

export function isFileCategory(value: unknown): value is FileCategory {
  return typeof value === "string" && (FILE_CATEGORIES as readonly string[]).includes(value);
}

export function inferFileCategory(type: string, fileName: string): FileCategory {
  const normalizedName = fileName.toLowerCase();
  if ([".epub", ".mobi", ".azw", ".azw3", ".fb2"].some((extension) => normalizedName.endsWith(extension))) return "Livro";
  if (type === "application/pdf" || normalizedName.endsWith(".pdf")) return "PDF";
  if (type.startsWith("image/")) return "Imagem";
  return "Outro";
}

export function getStoredFileCategory(file: Pick<StoredFileMetadata, "type" | "name" | "category">): FileCategory {
  return isFileCategory(file.category) ? file.category : inferFileCategory(file.type, file.name);
}

export function organizeStoredFiles(files: StoredFileMetadata[], filter: FileCategoryFilter = "all", sort: FileSort = "newest", query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-PT");
  return files
    .map((file) => ({ ...file, category: getStoredFileCategory(file) }))
    .filter((file) => filter === "all" || file.category === filter)
    .filter((file) => !normalizedQuery || `${file.name} ${file.category}`.toLocaleLowerCase("pt-PT").includes(normalizedQuery))
    .sort((first, second) => {
      if (sort === "name") return first.name.localeCompare(second.name, "pt-PT", { sensitivity: "base" });
      return sort === "newest" ? second.updatedAt - first.updatedAt : first.updatedAt - second.updatedAt;
    });
}
