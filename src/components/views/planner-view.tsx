import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingBlock } from "../skeleton";
import { ComplianceFooter } from "../compliance-footer";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

type Task = { id: string; title: string; priority: "High" | "Medium" | "Low"; estimate: string; done: boolean };

const PRIO_STYLES: Record<Task["priority"], string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-primary/15 text-primary border-primary/30",
  Low: "bg-muted text-muted-foreground border-border",
};

export function PlannerView({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
}) {
  const fn = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const completed = tasks.filter((t) => t.done).length;
  const pct = useMemo(() => (tasks.length ? Math.round((completed / tasks.length) * 100) : 0), [completed, tasks.length]);

  async function onPlan() {
    if (goal.trim().length < 3) {
      toast.error("Describe your goal");
      return;
    }
    setLoading(true);
    try {
      const r = await fn({ data: { goal } });
      setTasks((prev) => [
        ...r.tasks.map((t) => ({ ...t, id: crypto.randomUUID(), done: false })),
        ...prev,
      ]);
      setGoal("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">AI Task Planner</h1>
        <p className="text-sm text-muted-foreground">Break goals into a live, tickable checklist.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex gap-2">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Launch beta of internal analytics tool"
            onKeyDown={(e) => e.key === "Enter" && onPlan()}
          />
          <Button onClick={onPlan} disabled={loading}>
            {loading ? "Planning…" : "Generate Plan"}
          </Button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              Progress · {completed}/{tasks.length}
            </span>
            <button onClick={clearDone} className="text-xs text-muted-foreground hover:text-foreground">
              Clear completed
            </button>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      )}

      <div className="space-y-2">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <LoadingBlock lines={5} />
          </div>
        )}
        {!loading && tasks.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-10 text-sm text-muted-foreground">
            Your checklist will appear here.
          </div>
        )}
        {tasks.map((t) => (
          <label
            key={t.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all",
              t.done && "opacity-60",
            )}
          >
            <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
            <div className="min-w-0 flex-1">
              <div className={cn("text-sm font-medium transition-all", t.done && "line-through text-muted-foreground")}>
                {t.title}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", PRIO_STYLES[t.priority])}>
                  {t.priority}
                </span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" strokeWidth={1.75} />{t.estimate}</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      <ComplianceFooter />
    </div>
  );
}

export type { Task };
