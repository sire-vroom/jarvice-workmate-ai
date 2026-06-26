import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "blue" | "slate" | "amethyst" | "cyber" | "emerald" | "amber";

export const THEMES: { id: ThemeId; name: string; swatch: string[]; dark?: boolean }[] = [
  { id: "blue", name: "Calming Blue", swatch: ["#3b82f6", "#dbeafe", "#1e3a8a"] },
  { id: "slate", name: "Slate Dark", swatch: ["#0f172a", "#1e293b", "#60a5fa"], dark: true },
  { id: "amethyst", name: "Amethyst Purple", swatch: ["#7c3aed", "#ede9fe", "#4c1d95"] },
  { id: "cyber", name: "Cyberpunk Orchid", swatch: ["#1a0b2e", "#d946ef", "#22d3ee"], dark: true },
  { id: "emerald", name: "Emerald Forest", swatch: ["#10b981", "#f0fdf4", "#064e3b"] },
  { id: "amber", name: "Sunset Amber", swatch: ["#f59e0b", "#fffbeb", "#92400e"] },
];

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("blue");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("wj-theme")) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${theme}`);
    const meta = THEMES.find((t) => t.id === theme);
    if (meta?.dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("wj-theme", theme); } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
