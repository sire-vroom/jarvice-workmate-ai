import {
  Briefcase,
  MessageSquare,
  Mail,
  FileText,
  CheckSquare,
  Search,
  Palette,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Keyboard,
  Trash2,
} from "lucide-react";
import { THEMES, useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export type ViewId = "chat" | "email" | "summarize" | "planner" | "research";

export const NAV: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "chat", label: "Chat Assistant", icon: MessageSquare },
  { id: "email", label: "Email Generator", icon: Mail },
  { id: "summarize", label: "Meeting Notes", icon: FileText },
  { id: "planner", label: "Task Planner", icon: CheckSquare },
  { id: "research", label: "Research", icon: Search },
];

export function Sidebar({
  view,
  setView,
  open,
  history,
  onClearHistory,
  density,
  setDensity,
}: {
  view: ViewId;
  setView: (v: ViewId) => void;
  open: boolean;
  history: { id: string; title: string; view: ViewId }[];
  onClearHistory: () => void;
  density: "comfortable" | "compact";
  setDensity: (d: "comfortable" | "compact") => void;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        open ? "w-72" : "w-0 overflow-hidden",
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Briefcase className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold tracking-tight">Workplace Jarvice</div>
          <div className="truncate text-[11px] text-muted-foreground">AI Workplace Assistant</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 px-5">
        <SectionHeader icon={Palette} label="Theme" />
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

      <div className="mt-6 px-5">
        <SectionHeader icon={SettingsIcon} label="Settings" />
        <div className="rounded-lg border border-sidebar-border p-2">
          <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">Layout density</div>
          <div className="grid grid-cols-2 gap-1">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                  density === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-5">
        <SectionHeader icon={Keyboard} label="Shortcuts">
          <span className="text-[10px] text-muted-foreground">tips</span>
        </SectionHeader>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <ShortcutRow keys="/email" desc="Open Email Generator" />
          <ShortcutRow keys="/summarize" desc="Open Meeting Notes" />
          <ShortcutRow keys="/plan" desc="Open Task Planner" />
          <ShortcutRow keys="/research" desc="Open Research" />
          <ShortcutRow keys="↵" desc="Send chat message" />
        </ul>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col px-5">
        <SectionHeader icon={HistoryIcon} label="History">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-muted-foreground hover:text-foreground"
              title="Clear history"
            >
              <Trash2 className="h-3 w-3" strokeWidth={1.75} />
            </button>
          )}
        </SectionHeader>
        <div className="flex-1 space-y-0.5 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-xs text-muted-foreground/70">No activity yet.</div>
          ) : (
            history.slice(0, 30).map((h) => {
              const Icon = NAV.find((n) => n.id === h.view)?.icon ?? MessageSquare;
              return (
                <button
                  key={h.id}
                  onClick={() => setView(h.view)}
                  className="flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                >
                  <Icon className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{h.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-sidebar-border px-5 py-3 text-[10px] text-muted-foreground">
        © Workplace Jarvice
      </div>
    </aside>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {label}
      </div>
      {children}
    </div>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-sidebar-accent/40">
      <span className="truncate">{desc}</span>
      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        {keys}
      </kbd>
    </li>
  );
}
