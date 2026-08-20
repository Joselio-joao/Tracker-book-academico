import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";


function Router() {
  const repositoryBase = "/Tracker-book-academico";
  const base = typeof window !== "undefined" && window.location.pathname.startsWith(repositoryBase)
    ? repositoryBase
    : "";

  return (
    <WouterRouter base={base}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) setMessage(result.error.message);
    else setMessage(mode === "signup" ? "Conta criada. Confirma o teu e-mail se for solicitado." : "Acesso autorizado.");
    setBusy(false);
  }

  return <main className="grid min-h-screen place-items-center bg-[#f8f6ef] px-5 py-10 text-[#24345f]"><div className="w-full max-w-md rounded-[28px] border border-[#dfe2d7] bg-white p-7 shadow-xl"><div className="mb-6 text-center"><img src="./logo.png" alt="Logotipo do Super Tracker" className="mx-auto mb-4 h-16 w-16 object-contain" /><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2457c5]">Super Tracker</p><h1 className="mt-2 font-serif text-3xl font-bold">Acesso protegido</h1><p className="mt-2 text-sm leading-6 text-[#657188]">Entra para abrir o teu tracker. Depois do primeiro acesso, a sessão pode ser restaurada no iPhone sem Internet.</p></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">E-mail<input className="mt-1 w-full rounded-xl border border-[#dfe2d7] px-3 py-3 outline-none focus:border-[#2457c5]" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="block text-sm font-semibold">Palavra-passe<input className="mt-1 w-full rounded-xl border border-[#dfe2d7] px-3 py-3 outline-none focus:border-[#2457c5]" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="rounded-xl bg-[#fff4d6] px-3 py-2 text-sm text-[#745514]">{message}</p>}<button className="w-full rounded-xl bg-[#2457c5] px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={busy}>{busy ? "A processar…" : mode === "login" ? "Entrar" : "Criar conta"}</button></form><button className="mt-4 w-full text-sm font-semibold text-[#2457c5]" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Ainda não tens conta? Criar conta" : "Já tens conta? Entrar"}</button></div></main>;
}

function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setChecking(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  if (checking) return <div className="grid min-h-screen place-items-center bg-[#f8f6ef] text-[#274592]">A verificar a sessão…</div>;
  if (!session) return <LoginScreen />;
  return <><div className="fixed right-4 top-4 z-50"><button className="rounded-full border border-[#dfe2d7] bg-white/95 px-3 py-2 text-xs font-semibold text-[#24345f] shadow-sm backdrop-blur" onClick={() => void supabase.auth.signOut()}>Terminar sessão</button></div>{children}</>;
}

function App() {
  return (
    <AuthGate><ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary></AuthGate>
  );
}

export default App;
