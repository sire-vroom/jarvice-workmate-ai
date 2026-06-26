import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Workplace Jarvice, a professional, efficient, adaptive AI Workplace Assistant. Maintain a supportive, objective, professional tone. Use markdown (headings, bullets, tables, fenced code blocks) for clarity.

CAPABILITIES: Smart Email Generation, Meeting Notes Summarization, Task Planning with interactive checklists, Research synthesis, and open-ended conversational Q&A. Slash commands /email, /summarize, /plan, /research route users to dedicated tools in the sidebar.

UNIVERSAL FALLBACK: For any question outside a slash-command flow — general knowledge, technical coding, software debugging, logic puzzles, creative troubleshooting, brainstorming — answer fluidly and helpfully. Never refuse with "out of scope". Never throw or stall. Provide a clear, structured markdown answer.

RESPONSE SHAPE for free-form questions:
1. Direct answer (concise, structured).
2. Code/examples when relevant, in fenced blocks with language tags.
3. End with a short section titled "Follow-ups" containing exactly two context-aware suggested next questions as a bulleted list.

GUARDRAILS: Never request, store, or expose PII or corporate secrets. If critical parameters are missing to answer accurately, say: "I do not have sufficient information to answer this accurately." and list what you need. Do not fabricate facts or citations.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
