import { Briefcase } from "lucide-react";
import { THEMES, useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export type ViewId = "chat" | "email" | "summarize" | "planner" | "research";

const NAV: { id: ViewId; label: string; icon: string }[] = [
  { id: "chat", label: "Chat Assistant", icon: "💬" },
  { id: "email", label: "Email Generator", icon: "✉️" },
  { id: "summarize", label: "Meeting Notes", icon: "📝" },
  { id: "planner", label: "Task Planner", icon: "✅" },
  { id: "research", label: "Research", icon: "🔍" },
];

export function Sidebar({
  view,
  setView,
  open,
  history,
}: {
  view: ViewId;
  setView: (v: ViewId) => void;
  open: boolean;
  history: { id: string; title: string; view: ViewId }[];
}) {
  const { theme, setTheme } = useTheme();
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        open ? "w-72" : "w-0 overflow-hidden",
      )}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">Workplace Jarvice</div>
          <div className="truncate text-[11px] text-muted-foreground">AI Workplace Assistant</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              view === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "hover:bg-sidebar-accent/60",
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 px-5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Themes
        </div>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              className={cn(
                "group relative flex h-10 items-center justify-center overflow-hidden rounded-lg border transition-all",
                theme === t.id
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-sidebar-border hover:border-primary/50",
              )}
            >
              <div className="flex h-full w-full">
                {t.swatch.map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {THEMES.find((t) => t.id === theme)?.name}
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col px-5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          History
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-xs text-muted-foreground/70">No activity yet.</div>
          ) : (
            history.slice(0, 30).map((h) => (
              <button
                key={h.id}
                onClick={() => setView(h.view)}
                className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              >
                <span className="mr-1">{NAV.find((n) => n.id === h.view)?.icon}</span>
                {h.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-sidebar-border px-5 py-3 text-[10px] text-muted-foreground">
        © Workplace Jarvice
      </div>
    </aside>
  );
}
