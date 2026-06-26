import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingBlock } from "../skeleton";
import { ComplianceFooter } from "../compliance-footer";
import { toast } from "sonner";

type R = Awaited<ReturnType<typeof researchTopic>>;

export function ResearchView() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<R | null>(null);

  async function onRun() {
    if (topic.trim().length < 3) {
      toast.error("Enter a topic");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      setResult(await fn({ data: { topic, notes } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">AI Research Assistant</h1>
        <p className="text-sm text-muted-foreground">Objective synthesis with insights and recommendations.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-3">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic — e.g. EU AI Act impact on SaaS" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional context, sources, or angles…" />
          <Button onClick={onRun} disabled={loading} className="w-full">
            {loading ? "Researching…" : "Run Research"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <LoadingBlock lines={8} />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Card title="Executive Summary">
            <p className="text-sm leading-relaxed">{result.executiveSummary}</p>
          </Card>
          <Card title="Key Insights">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Category</th>
                    <th className="py-2 text-left font-medium">Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {result.insights.map((i, idx) => (
                    <tr key={idx} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium">{i.category}</td>
                      <td className="py-2 pr-4">{i.insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Strategic Recommendations">
            <ul className="list-decimal space-y-1 pl-5 text-sm">
              {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </Card>
        </div>
      )}

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
