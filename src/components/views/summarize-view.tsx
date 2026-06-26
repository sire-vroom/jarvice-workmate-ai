import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingBlock } from "../skeleton";
import { ComplianceFooter } from "../compliance-footer";
import { toast } from "sonner";

type Result = Awaited<ReturnType<typeof summarizeMeeting>>;

export function SummarizeView() {
  const fn = useServerFn(summarizeMeeting);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onRun() {
    if (text.trim().length < 20) {
      toast.error("Paste a longer transcript");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await fn({ data: { transcript: text } });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Meeting Notes Summarizer</h1>
        <p className="text-sm text-muted-foreground">Turn raw transcripts into structured outputs.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="Paste the meeting transcript, notes, or chat log…"
            className="resize-none"
          />
          <Button onClick={onRun} disabled={loading} className="mt-3 w-full">
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <LoadingBlock lines={8} />
            </div>
          )}
          {!loading && !result && (
            <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-10 text-sm text-muted-foreground">
              Summary will appear here
            </div>
          )}
          {result && (
            <>
              <Card title="Executive Summary">
                <p className="text-sm leading-relaxed">{result.executiveSummary}</p>
              </Card>
              <Card title="Key Discussion Points">
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {result.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </Card>
              <Card title="Action Items">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="py-2 text-left font-medium">Owner</th>
                        <th className="py-2 text-left font-medium">Task</th>
                        <th className="py-2 text-left font-medium">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.actionItems.map((a, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 font-medium">{a.owner}</td>
                          <td className="py-2 pr-4">{a.task}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{a.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="Decisions Made">
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {result.decisions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>

      <ComplianceFooter />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
