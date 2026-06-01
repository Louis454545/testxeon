import type { ProviderId } from "../shared/types";

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderId;
  description: string;
  tier: "fast" | "balanced" | "strong";
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "google",
    description: "Fast browser automation default",
    tier: "fast",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Better reasoning with good latency",
    tier: "balanced",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Stronger multi-step planning",
    tier: "strong",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Reliable vision-capable OpenAI model",
    tier: "balanced",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Strong instruction following",
    tier: "strong",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Lower latency OpenAI model",
    tier: "fast",
  },
];

export function getModelsForProvider(provider: ProviderId): ModelOption[] {
  return MODEL_OPTIONS.filter((model) => model.provider === provider);
}

export function getDefaultModel(provider: ProviderId): string {
  return getModelsForProvider(provider)[0]?.id ?? "gemini-3.5-flash";
}
