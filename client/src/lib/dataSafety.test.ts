import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DATA_SAFETY_COPY } from "./dataSafety";

describe("DATA_SAFETY_COPY", () => {
  it("explica que os dados locais se mantêm e quando podem ser perdidos", () => {
    expect(DATA_SAFETY_COPY.summary).toContain("não apagam");
    expect(DATA_SAFETY_COPY.retained).toContain("armazenamento local");
    expect(DATA_SAFETY_COPY.backup).toContain("Exportar cópia");
    expect(DATA_SAFETY_COPY.loss).toContain("Apagar tudo");
    expect(DATA_SAFETY_COPY.attachments).toContain("OPFS");
  });

  it("é uma cópia estática e não expõe operações de armazenamento", () => {
    expect(Object.values(DATA_SAFETY_COPY).every((value) => typeof value === "string")).toBe(true);
    expect(Object.keys(DATA_SAFETY_COPY)).not.toContain("saveTrackerData");
    expect(Object.keys(DATA_SAFETY_COPY)).not.toContain("clearStoredTrackerData");
  });

  it("mantém a área do aviso sem chamadas de escrita ou limpeza local", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const start = home.indexOf('id="data-safety-title"');
    const end = home.indexOf("</section><DataControls", start);
    const safetyBlock = home.slice(start, end);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(safetyBlock).toContain("DATA_SAFETY_COPY");
    expect(safetyBlock).not.toMatch(/saveTrackerData|clearStoredTrackerData|saveLargeFileMetadata|removeLargeFile/);
  });
});
