/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
      storageEstimate={{ usage: 0, quota: 0, usageLabel: "0 B", quotaLabel: "indisponível" }}
    />,
  );
}

describe("área OPFS organizada na interface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
    vi.mocked(loadLargeFileMetadata).mockResolvedValue(storedFiles);
    vi.mocked(readLargeFile).mockResolvedValue(new File(["livro"], "manual.epub", { type: "application/epub+zip" }));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:manual") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
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
