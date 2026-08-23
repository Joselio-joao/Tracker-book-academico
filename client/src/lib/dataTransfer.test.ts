import { describe, expect, it } from "vitest";
import { mergeImportedTrackerData, parseImportedTrackerData, toGitHubRawUrl } from "./dataTransfer";

describe("transferência local de estrutura", () => {
  it("aceita uma exportação direta ou dentro de data", () => {
    expect(parseImportedTrackerData(JSON.stringify({ sessions: [] })).sessions).toEqual([]);
    expect(parseImportedTrackerData(JSON.stringify({ data: { notes: [] } })).notes).toEqual([]);
  });

  it("recusa JSON inválido ou sem secções reconhecidas", () => {
    expect(() => parseImportedTrackerData("não-json")).toThrow("JSON válido");
    expect(() => parseImportedTrackerData(JSON.stringify({ hello: true }))).toThrow("secções reconhecidas");
  });

  it("combina apenas IDs novos e mantém os dados locais", () => {
    const current = { notes: [{ id: "local", title: "Local" }], sessions: [], habits: { hoje: { Estudo: true } } };
    const merged = mergeImportedTrackerData(current, { notes: [{ id: "local", title: "Importada diferente" }, { id: "nova", title: "Nova" }], habits: { outro: { Leitura: true } } });
    expect(merged.notes).toEqual([{ id: "local", title: "Local" }, { id: "nova", title: "Nova" }]);
    expect(merged.habits).toEqual({ hoje: { Estudo: true }, outro: { Leitura: true } });
  });

  it("preserva metadados OPFS existentes ao importar estrutura", () => {
    const current = { notes: [], fileMetadata: [{ name: "manual.pdf", size: 1200, type: "application/pdf" }] };
    const merged = mergeImportedTrackerData(current, { notes: [{ id: "nova", title: "Importada" }] });
    expect(merged.fileMetadata).toEqual(current.fileMetadata);
    expect(merged.notes).toEqual([{ id: "nova", title: "Importada" }]);
  });

  it("converte links GitHub blob para raw sem aceitar alteração de domínio", () => {
    expect(toGitHubRawUrl("https://github.com/Joselio-joao/Tracker-book-academico/blob/main/data.json")).toBe("https://raw.githubusercontent.com/Joselio-joao/Tracker-book-academico/main/data.json");
    expect(toGitHubRawUrl("https://raw.githubusercontent.com/a/b/main/data.json")).toBe("https://raw.githubusercontent.com/a/b/main/data.json");
  });
});
