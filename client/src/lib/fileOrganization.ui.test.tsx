/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MoreView } from "../pages/Home";
import { loadLargeFileMetadata, readLargeFile } from "./offlineStorage";

vi.mock("./offlineStorage", () => ({
  estimateStorage: vi.fn(),
  getLargeFilePreviewKind: vi.fn((type: string, name: string) => type === "application/pdf" || name.endsWith(".pdf") ? "pdf" : type.startsWith("image/") ? "image" : "other"),
  loadLargeFileMetadata: vi.fn(),
  loadTrackerData: vi.fn(),
  readLargeFile: vi.fn(),
  removeLargeFile: vi.fn(),
  saveLargeFile: vi.fn(),
  saveLargeFileMetadata: vi.fn(),
  saveTrackerData: vi.fn(),
}));

const onImportGitHub = vi.fn();
const onUpdateApp = vi.fn();
const onCreateEncryptedBackup = vi.fn();

const storedFiles = [
  { name: "manual.epub", size: 300, type: "application/epub+zip", category: "Livro", updatedAt: 3000 },
  { name: "plano.pdf", size: 200, type: "application/pdf", category: "PDF", updatedAt: 1000 },
];

function renderMoreView() {
  return render(
    <MoreView
      section="calendário"
      setSection={vi.fn()}
      habits={{}}
      onToggleHabit={vi.fn()}
      habitRate={0}
      notes={[]}
      noteForm={{ title: "", content: "", subject: "Geral" }}
      setNoteForm={vi.fn()}
      onAddNote={vi.fn()}
      onToggleNotePin={vi.fn()}
      onUpdateNote={vi.fn(() => true)}
      onRemoveNote={vi.fn()}
      onClearHabits={vi.fn()}
      onClearTasks={vi.fn()}
      onClearScholarships={vi.fn()}
      onClearNotes={vi.fn()}
      onClearAll={vi.fn()}
      onExport={vi.fn()}
      onUpdateApp={onUpdateApp}
      onImportFile={vi.fn()}
      onImportGitHub={onImportGitHub}
      importUrl="https://raw.githubusercontent.com/a/b/main/data.json"
      setImportUrl={vi.fn()}
      importFileRef={{ current: null }}
      storageEstimate={{ usage: 0, quota: 0, usageLabel: "0 B", quotaLabel: "indisponível" }}
      onCreateEncryptedBackup={onCreateEncryptedBackup}
      onRestoreEncryptedBackup={vi.fn()}
      backupFileRef={{ current: null }}
    />,
  );
}

describe("área OPFS organizada na interface", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    vi.mocked(loadLargeFileMetadata).mockResolvedValue(storedFiles);
    vi.mocked(readLargeFile).mockResolvedValue(new File(["livro"], "manual.epub", { type: "application/epub+zip" }));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:manual") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  it("mostra atualizar e importar estrutura na área de dados locais", async () => {
    renderMoreView();
    await waitFor(() => expect(screen.getByText("manual.epub")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Atualizar" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Criar cópia cifrada" }));
    expect(onCreateEncryptedBackup).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Restaurar cópia" })).toBeTruthy();
    const portfolioLink = screen.getByRole("link", { name: "Abrir Portfólio numa nova aba" });
    expect(portfolioLink.getAttribute("href")).toBe("https://jos-lio-portofolio.pages.dev/");
    expect(portfolioLink.getAttribute("target")).toBe("_blank");
    expect(portfolioLink.getAttribute("rel")).toContain("noopener");
    fireEvent.click(screen.getByRole("button", { name: "Atualizar aplicação" }));
    expect(onUpdateApp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Importar ficheiro JSON" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ler GitHub" }).hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Ler GitHub" }));
    expect(onImportGitHub).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(loadLargeFileMetadata).toHaveBeenCalledTimes(2));
  });

  it("filtra, pesquisa, ordena e abre o ficheiro que ficou visível", async () => {
    renderMoreView();
    await waitFor(() => expect(screen.getByText("manual.epub")).toBeTruthy());

    fireEvent.click(screen.getByRole("combobox", { name: "Filtrar por categoria" }));
    fireEvent.click(await screen.findByRole("option", { name: "Livro" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Pesquisar ficheiros" }), { target: { value: "manual" } });
    fireEvent.click(screen.getByRole("combobox", { name: "Ordenar ficheiros" }));
    fireEvent.click(await screen.findByRole("option", { name: "Por nome" }));

    expect(screen.getByText("manual.epub")).toBeTruthy();
    expect(screen.queryByText("plano.pdf")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    await waitFor(() => expect(screen.getByText("Pré-visualização offline")).toBeTruthy());
    expect(readLargeFile).toHaveBeenCalledWith("manual.epub");
  });
});
