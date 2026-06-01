import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { AISettings } from "../shared/types";

export function resolveLanguageModel(settings: AISettings): LanguageModel {
  if (!settings.apiKey.trim()) {
    throw new Error(`Missing ${settings.provider === "google" ? "Google" : "OpenAI"} API key`);
  }

  if (settings.provider === "openai") {
    return createOpenAI({ apiKey: settings.apiKey })(settings.model);
  }

  return createGoogleGenerativeAI({ apiKey: settings.apiKey })(settings.model);
}
