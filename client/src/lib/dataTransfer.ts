const LIST_KEYS = ["sessions", "assessments", "universityTasks", "scholarships", "notes", "tutors"] as const;

export type ImportPayload = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseImportedTrackerData(raw: string): ImportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("O ficheiro não contém JSON válido.");
  }
  const payload = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : parsed;
  if (!isRecord(payload)) throw new Error("A estrutura importada não é compatível com o Super Tracker.");
  const hasKnownSection = LIST_KEYS.some((key) => Array.isArray(payload[key])) || isRecord(payload.habits) || isRecord(payload.timer);
  if (!hasKnownSection) throw new Error("O JSON não contém secções reconhecidas do tracker.");
  return payload;
}

export function mergeImportedTrackerData<T extends object>(current: T, imported: ImportPayload): T {
  const next = { ...current } as Record<string, unknown>;
  for (const key of LIST_KEYS) {
    const existing = Array.isArray(next[key]) ? next[key] : [];
    const incoming = Array.isArray(imported[key]) ? imported[key] : [];
    const existingIds = new Set(existing.filter(isRecord).map((item) => item.id).filter((id): id is string => typeof id === "string"));
    const additions = incoming.filter((item): item is Record<string, unknown> => isRecord(item) && typeof item.id === "string" && !existingIds.has(item.id));
    next[key] = [...existing, ...additions];
  }
  if (isRecord(imported.habits) && isRecord(next.habits)) next.habits = { ...imported.habits, ...next.habits };
  return next as T;
}

export function toGitHubRawUrl(value: string): string {
  const url = value.trim();
  if (url.includes("raw.githubusercontent.com")) return url;
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (match) return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
  return url;
}
