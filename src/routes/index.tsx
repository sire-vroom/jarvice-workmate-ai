import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, type ViewId } from "@/components/sidebar";
import { WorkspaceSelector } from "@/components/workspace-selector";
import { ChatView } from "@/components/views/chat-view";
import { EmailView } from "@/components/views/email-view";
import { SummarizeView } from "@/components/views/summarize-view";
import { PlannerView } from "@/components/views/planner-view";
import { ResearchView } from "@/components/views/research-view";
import type { Task } from "@/components/views/planner-view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace Jarvice — AI Workplace Assistant" },
      { name: "description", content: "Draft emails, summarize meetings, plan tasks, run research, and chat with an AI workplace copilot." },
    ],
  }),
  component: App,
});

type EmailLog = { id: string; ts: string; audience: string; subject: string; hour: string };
type Density = "comfortable" | "compact";

function App() {
  const [view, setView] = useState<ViewId>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emailLog, setEmailLog] = useState<EmailLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<{ id: string; title: string; view: ViewId }[]>([]);
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    try {
      const e = localStorage.getItem("wj-emails");
      const t = localStorage.getItem("wj-tasks");
      const h = localStorage.getItem("wj-history");
      const d = localStorage.getItem("wj-density") as Density | null;
      if (e) setEmailLog(JSON.parse(e));
      if (t) setTasks(JSON.parse(t));
      if (h) setHistory(JSON.parse(h));
      if (d === "comfortable" || d === "compact") setDensity(d);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("wj-emails", JSON.stringify(emailLog)); } catch {} }, [emailLog]);
  useEffect(() => { try { localStorage.setItem("wj-tasks", JSON.stringify(tasks)); } catch {} }, [tasks]);
  useEffect(() => { try { localStorage.setItem("wj-history", JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem("wj-density", density); } catch {} }, [density]);

  useEffect(() => {
    if (emailLog[0]) {
      setHistory((prev) => {
        const id = `email-${emailLog[0].id}`;
        if (prev.some((p) => p.id === id)) return prev;
        return [{ id, title: `Email: ${emailLog[0].subject}`, view: "email" }, ...prev];
      });
    }
  }, [emailLog]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        view={view}
        setView={setView}
        open={sidebarOpen}
        history={history}
        onClearHistory={() => setHistory([])}
        density={density}
        setDensity={setDensity}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/50 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
          <WorkspaceSelector view={view} setView={setView} />
          <div className="ml-auto text-[11px] text-muted-foreground">
            Workplace Jarvice · serverless workspace
          </div>
        </header>

        <main className={cn("min-h-0 flex-1 overflow-y-auto", density === "compact" ? "px-4 py-4" : "px-6 py-6")}>
          <div className="mx-auto max-w-6xl">
            {view === "chat" && <ChatView onJumpView={setView} />}
            {view === "email" && <EmailView log={emailLog} setLog={setEmailLog} />}
            {view === "summarize" && <SummarizeView />}
            {view === "planner" && <PlannerView tasks={tasks} setTasks={setTasks} />}
            {view === "research" && <ResearchView />}
          </div>
        </main>
      </div>
    </div>
  );
}
