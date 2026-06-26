import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Workplace Jarvice, a professional, efficient AI workplace assistant. Be concise, structured, and actionable. Use markdown formatting (headings, bullets, tables) when it improves clarity. Maintain a supportive, objective, professional tone. If asked about capabilities, mention: Smart Email Generation, Meeting Notes Summarization, Task Planning with interactive checklists, Research synthesis, and conversational Q&A. Never fabricate facts — if information is missing, say so. Slash commands: /email, /summarize, /plan, /research route users to dedicated tools in the sidebar.`;

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
