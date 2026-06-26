import { ShieldCheck } from "lucide-react";

export function ComplianceFooter() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span>AI-generated content may require human review</span>
    </div>
  );
}
