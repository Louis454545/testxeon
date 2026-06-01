import { z } from "zod";

const descriptionSchema = z.string().optional();

export const clickActionSchema = z.object({
  click: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    description: descriptionSchema,
  }),
});

export const inputActionSchema = z.object({
  input: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    text: z.string(),
    description: descriptionSchema,
  }),
});

export const navigateActionSchema = z.object({
  navigate: z.object({
    url: z.string().url(),
    description: descriptionSchema,
  }),
});

export const switchTabActionSchema = z.object({
  switch_tab: z.object({
    tab_id: z.union([z.string(), z.number()]).transform(String),
    description: descriptionSchema,
  }),
});

export const backActionSchema = z.object({
  back: z.object({
    description: descriptionSchema,
  }),
});

export const forwardActionSchema = z.object({
  forward: z.object({
    description: descriptionSchema,
  }),
});

export const keyboardActionSchema = z.object({
  keyboard: z.object({
    key: z.string().optional(),
    keys: z.string().optional(),
    description: descriptionSchema,
  }),
});

export const waitActionSchema = z.object({
  wait: z.object({
    duration: z.number().min(100).max(30000).optional(),
    time: z.number().min(0.1).max(30).optional(),
    description: descriptionSchema,
  }),
});

export const askActionSchema = z.object({
  ask: z.object({
    query: z.string(),
    description: descriptionSchema,
  }),
});

export const doneActionSchema = z.object({
  done: z.object({
    message: z.string(),
    description: descriptionSchema,
  }),
});

export const agentActionSchema = z.union([
  clickActionSchema,
  inputActionSchema,
  navigateActionSchema,
  switchTabActionSchema,
  backActionSchema,
  forwardActionSchema,
  keyboardActionSchema,
  waitActionSchema,
  askActionSchema,
  doneActionSchema,
]);

export const agentResponseSchema = z.object({
  current_state: z.object({
    reasoning: z.string().optional(),
    evaluation: z.string().optional(),
    memory: z.string().optional(),
    message: z.string().default(""),
  }),
  action: z.array(agentActionSchema).default([]),
});

export type AgentAction = z.infer<typeof agentActionSchema>;
export type AgentResponse = z.infer<typeof agentResponseSchema>;

export function getActionName(action: AgentAction): keyof AgentAction {
  return Object.keys(action)[0] as keyof AgentAction;
}

export function isFinalAction(action: AgentAction): boolean {
  return "done" in action || "ask" in action;
}

export function getWaitDuration(action: z.infer<typeof waitActionSchema>["wait"]): number {
  if (typeof action.duration === "number") return action.duration;
  if (typeof action.time === "number") return action.time * 1000;
  return 1000;
}
