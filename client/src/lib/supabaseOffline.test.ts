import { describe, expect, it, vi } from "vitest";
import { getPersistedSupabaseSession } from "./supabase";

describe("Supabase offline session", () => {
  it("reads the locally persisted session without a network call", () => {
    const session = {
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: "offline-user", aud: "authenticated", role: "authenticated", email: "offline@example.com" },
    };
    const storage = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: () => undefined } });
    const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL as string).hostname.split(".")[0];
    storage.set(`sb-${projectRef}-auth-token`, JSON.stringify(session));

    expect(getPersistedSupabaseSession()?.user.id).toBe("offline-user");
    vi.unstubAllGlobals();
  });
});
