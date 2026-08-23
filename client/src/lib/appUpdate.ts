export type AppUpdateResult = "updated" | "unavailable";

export async function updateApplicationShell(): Promise<AppUpdateResult> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return "unavailable";
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return "unavailable";
  await registration.update();
  const worker = registration.installing;
  if (worker) {
    await new Promise<void>((resolve) => {
      if (worker.state === "activated" || worker.state === "installed") return resolve();
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated" || worker.state === "installed") resolve();
      }, { once: true });
    });
  }
  return "updated";
}
