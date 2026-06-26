import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

function extractJSON(raw: string): unknown {
  let cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const objStart = cleaned.indexOf("{");
    const arrStart = cleaned.indexOf("[");
    const isArray = arrStart !== -1 && (objStart === -1 || arrStart < objStart);
    const start = isArray ? arrStart : objStart;
    const end = isArray ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1);
    } else {
      throw new Error("No valid JSON found in response");
    }
  }
  return JSON.parse(cleaned);
}

async function generateJSON<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(DEFAULT_MODEL),
    prompt: `${prompt}\n\nRespond ONLY with valid JSON matching the requested structure. No markdown, no commentary.`,
  });
  const parsed = extractJSON(text);
  return schema.parse(parsed);
}

// --- Email generator ---
const EmailInput = z.object({
  intent: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  context: z.string().optional(),
});

const EmailSchema = z.object({ subject: z.string(), body: z.string() });

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    return generateJSON(
      `Compose a professional email. Return JSON: { "subject": string, "body": string }.
Intent: ${data.intent}
Audience: ${data.audience}
Tone: ${data.tone}
Additional context: ${data.context ?? "(none)"}

Body structure: Opening -> Core Message -> Call to Action -> Professional Sign-off. Be clear, free of fluff.`,
      EmailSchema,
    );
  });

// --- Meeting summarizer ---
const SummaryInput = z.object({ transcript: z.string().min(10) });
const SummarySchema = z.object({
  executiveSummary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(
    z.object({ owner: z.string(), task: z.string(), deadline: z.string() }),
  ),
  decisions: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummaryInput.parse(d))
  .handler(async ({ data }) => {
    return generateJSON(
      `Summarize this meeting transcript. Return JSON with fields: executiveSummary (string), keyPoints (string[]), actionItems (array of { owner, task, deadline }), decisions (string[]).

TRANSCRIPT:
${data.transcript}`,
      SummarySchema,
    );
  });

// --- Task planner ---
const PlanInput = z.object({ goal: z.string().min(3) });
const PlanSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      estimate: z.string(),
    }),
  ),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    return generateJSON(
      `Break this goal into a prioritized, time-estimated task plan. Return JSON: { "tasks": [{ "title": string, "priority": "High"|"Medium"|"Low", "estimate": string }] }.

GOAL: ${data.goal}`,
      PlanSchema,
    );
  });

// --- Research ---
const ResearchInput = z.object({ topic: z.string().min(3), notes: z.string().optional() });
const ResearchSchema = z.object({
  executiveSummary: z.string(),
  insights: z.array(z.object({ category: z.string(), insight: z.string() })),
  recommendations: z.array(z.string()),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    return generateJSON(
      `Provide structured research on the topic. Be objective. If unsure, say so. Return JSON: { "executiveSummary": string, "insights": [{ "category": string, "insight": string }], "recommendations": string[] }.

TOPIC: ${data.topic}
NOTES: ${data.notes ?? "(none)"}`,
      ResearchSchema,
    );
  });
