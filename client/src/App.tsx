import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";


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

const ACCESS_HASH = "64304bfca32c95854144f9ee81546bf78cdb89acf076bf1ad0d6dfec49cae4ad";

function AccessGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("access");
    if (!token || !window.crypto?.subtle) { setChecking(false); return; }
    void crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((digest) => {
      const hash = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
      setAllowed(hash === ACCESS_HASH);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);
  if (checking) return <div className="grid min-h-screen place-items-center bg-[#f8f6ef] text-[#274592]">A verificar o acesso…</div>;
  if (!allowed) return <div className="grid min-h-screen place-items-center bg-[#f8f6ef] px-6 text-center"><div className="max-w-md rounded-[28px] border border-[#dfe2d7] bg-white p-8 shadow-xl"><h1 className="font-serif text-3xl font-bold text-[#1e357b]">Acesso privado</h1><p className="mt-3 text-sm leading-6 text-[#657188]">Usa o endereço privado completo que te foi fornecido. O acesso é feito por link e os teus dados continuam guardados apenas neste dispositivo.</p></div></div>;
  return <>{children}</>;
}

function App() {
  return (
    <AccessGate><ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary></AccessGate>
  );
}

export default App;
