import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceFooter } from "../compliance-footer";
import type { ViewId } from "../sidebar";

const SLASH_HINTS: Record<string, { view: ViewId; label: string }> = {
  "/email": { view: "email", label: "Open the Email Generator" },
  "/summarize": { view: "summarize", label: "Open the Meeting Notes Summarizer" },
  "/plan": { view: "planner", label: "Open the Task Planner" },
  "/research": { view: "research", label: "Open the Research Assistant" },
};

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ChatView({ onJumpView }: { onJumpView: (v: ViewId) => void }) {
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => console.error(e),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const cmd = text.split(" ")[0].toLowerCase();
    if (SLASH_HINTS[cmd]) {
      onJumpView(SLASH_HINTS[cmd].view);
      setInput("");
      return;
    }
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Chat Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask anything. Try <code className="rounded bg-muted px-1">/email</code>{" "}
          <code className="rounded bg-muted px-1">/summarize</code>{" "}
          <code className="rounded bg-muted px-1">/plan</code>{" "}
          <code className="rounded bg-muted px-1">/research</code>
        </p>
      </div>

      <div className="glass-card flex min-h-0 flex-1 flex-col rounded-2xl">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <div className="mb-3 text-4xl">💼</div>
                <div className="font-semibold text-foreground">How can I help you today?</div>
                <div className="mt-1">Brainstorm, summarize, draft, or plan — all in one place.</div>
              </div>
            </div>
          )}
          {messages.map((m: UIMessage) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              Thinking…
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              placeholder="Message Workplace Jarvice…"
              className="max-h-40 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} className="h-9 w-9 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      <ComplianceFooter />
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm"
            : "max-w-[85%] text-sm text-foreground"
        }
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
