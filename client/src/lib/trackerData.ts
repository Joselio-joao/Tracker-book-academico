export type TrackerStore = {
  sessions: unknown[];
  assessments: unknown[];
  universityTasks: unknown[];
  scholarships: unknown[];
  notes: unknown[];
  tutors: unknown[];
  habits: Record<string, Record<string, boolean>>;
  timer: { duration: number };
};

export type ClearableSection = keyof TrackerStore | "all";

/** Returns a new store with only the requested local-data area cleared. */
export function clearTrackerSection<T extends TrackerStore>(data: T, section: ClearableSection): T {
  if (section === "all") {
    return { ...data, sessions: [], assessments: [], universityTasks: [], scholarships: [], notes: [], tutors: [], habits: {}, timer: { duration: 45, remaining: 45 * 60, running: false, endsAt: null } };
  }

  const emptyValue = section === "habits" ? {} : [];
  return { ...data, [section]: emptyValue } as T;
}

/** Executes a destructive action only after the supplied confirmation accepts it. */
export function confirmDestructiveAction(confirm: (message: string) => boolean, message: string, action: () => void) {
  if (!confirm(message)) return false;
  action();
  return true;
}
