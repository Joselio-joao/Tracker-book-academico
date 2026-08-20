import { describe, expect, it } from "vitest";

describe("Supabase Auth configuration", () => {
  it("accepts the configured public credentials", async () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    expect(baseUrl, "VITE_SUPABASE_URL is required").toMatch(/^https:\/\/[^/]+\.supabase\.co\/?$/);
    expect(anonKey, "VITE_SUPABASE_ANON_KEY is required").toMatch(/^eyJ/);

    const response = await fetch(`${baseUrl!.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey!}` },
    });

    expect(response.ok, `Supabase Auth settings returned ${response.status}`).toBe(true);
    const settings = await response.json() as { external?: Record<string, boolean> };
    expect(settings).toHaveProperty("external");
  }, 20_000);
});
