import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV, type ViewId } from "./sidebar";
import { cn } from "@/lib/utils";

export function WorkspaceSelector({
  view,
  setView,
}: {
  view: ViewId;
  setView: (v: ViewId) => void;
}) {
  const current = NAV.find((n) => n.id === view) ?? NAV[0];
  const Icon = current.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <span>{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Workspace Feature
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NAV.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setView(item.id)}
              className={cn("gap-2.5 py-2", item.id === view && "bg-accent")}
            >
              <ItemIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span className="text-sm">{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
