import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingBlock } from "../skeleton";
import { ComplianceFooter } from "../compliance-footer";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Mail, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type LogEntry = { id: string; ts: string; audience: string; subject: string; hour: string };

export function EmailView({
  log,
  setLog,
}: {
  log: LogEntry[];
  setLog: (fn: (prev: LogEntry[]) => LogEntry[]) => void;
}) {
  const gen = useServerFn(generateEmail);
  const [intent, setIntent] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  async function onGenerate() {
    if (!intent || !audience) {
      toast.error("Intent and audience are required");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await gen({ data: { intent, audience, tone, context } });
      setResult(r);
      const now = new Date();
      setLog((prev) => [
        {
          id: crypto.randomUUID(),
          ts: now.toLocaleString(),
          audience,
          subject: r.subject,
          hour: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  // Build trend data: last 10 entries
  const trend = [...log].slice(0, 10).reverse().map((l, i) => ({ name: l.hour, count: i + 1 }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Smart Email Generator</h1>
        <p className="text-sm text-muted-foreground">Draft polished emails from intent + audience + tone.</p>
      </header>

      {/* Analytics cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Emails Created" value={log.length.toString()} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="Last Generated" value={log[0]?.hour ?? "—"} icon={<TrendingUp className="h-4 w-4" />} />
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Output Volume</div>
          <div className="h-16">
            {trend.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">
                Trends appear after multiple generations
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-xs">Intent</Label>
              <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="e.g. Request a meeting with the design team" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Audience</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Engineering manager" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Persuasive", "Direct", "Apologetic", "Enthusiastic"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Additional Context (optional)</Label>
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} placeholder="Specific points to include…" />
            </div>
            <Button onClick={onGenerate} disabled={loading} className="w-full">
              {loading ? "Generating…" : "Generate Email"}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Draft</div>
          {loading ? (
            <div className="space-y-4">
              <LoadingBlock lines={1} />
              <LoadingBlock lines={6} />
            </div>
          ) : result ? (
            <div className="space-y-3">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Subject</div>
                <div className="font-semibold">{result.subject}</div>
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
                {result.body}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
                  toast.success("Copied");
                }}
              >
                Copy
              </Button>
            </div>
          ) : (
            <div className="grid h-40 place-items-center text-sm text-muted-foreground">Draft will appear here</div>
          )}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 text-sm font-semibold">Email Generation Log</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Timestamp</th>
                <th className="py-2 text-left font-medium">Audience</th>
                <th className="py-2 text-left font-medium">Subject</th>
              </tr>
            </thead>
            <tbody>
              {log.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">No emails generated yet.</td></tr>
              ) : (
                log.map((l) => (
                  <tr key={l.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{l.ts}</td>
                    <td className="py-2 pr-4">{l.audience}</td>
                    <td className="py-2 pr-4 font-medium">{l.subject}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ComplianceFooter />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
