import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

// --- Email generator ---
const EmailInput = z.object({
  intent: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  context: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      prompt: `Compose a professional email.
Intent: ${data.intent}
Audience: ${data.audience}
Tone: ${data.tone}
Additional context: ${data.context ?? "(none)"}

Structure: Opening -> Core Message -> Call to Action -> Professional Sign-off. Be clear, free of fluff.`,
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
        }),
      }),
    });
    return output;
  });

// --- Meeting summarizer ---
const SummaryInput = z.object({ transcript: z.string().min(10) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummaryInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      prompt: `Summarize this meeting transcript. Extract structured information.\n\nTRANSCRIPT:\n${data.transcript}`,
      output: Output.object({
        schema: z.object({
          executiveSummary: z.string(),
          keyPoints: z.array(z.string()),
          actionItems: z.array(
            z.object({ owner: z.string(), task: z.string(), deadline: z.string() }),
          ),
          decisions: z.array(z.string()),
        }),
      }),
    });
    return output;
  });

// --- Task planner ---
const PlanInput = z.object({ goal: z.string().min(3) });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      prompt: `Break this goal into a prioritized, time-estimated task plan.\n\nGOAL: ${data.goal}`,
      output: Output.object({
        schema: z.object({
          tasks: z.array(
            z.object({
              title: z.string(),
              priority: z.enum(["High", "Medium", "Low"]),
              estimate: z.string(),
            }),
          ),
        }),
      }),
    });
    return output;
  });

// --- Research ---
const ResearchInput = z.object({ topic: z.string().min(3), notes: z.string().optional() });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      prompt: `Provide structured research on the topic. Be objective. If unsure, say so.\n\nTOPIC: ${data.topic}\nNOTES: ${data.notes ?? "(none)"}`,
      output: Output.object({
        schema: z.object({
          executiveSummary: z.string(),
          insights: z.array(z.object({ category: z.string(), insight: z.string() })),
          recommendations: z.array(z.string()),
        }),
      }),
    });
    return output;
  });
