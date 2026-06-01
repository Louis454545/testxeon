import type { AISettings } from "../shared/types";
import { getDefaultModel, getModelsForProvider } from "../agent/modelRegistry";

export const DEFAULT_SETTINGS: AISettings = {
  apiKey: "",
  provider: "google",
  model: "gemini-3.5-flash",
  screenshotsEnabled: true,
};

const SETTINGS_KEY = "aiConfig";
const PROMPT_KEY = "systemPrompt";

export async function getSettings(): Promise<AISettings> {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings(data[SETTINGS_KEY] as Partial<AISettings> | undefined);
}

export async function saveSettings(settings: Partial<AISettings>): Promise<AISettings> {
  const current = await getSettings();
  const next = normalizeSettings({ ...current, ...settings });
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function getSystemPrompt(): Promise<string> {
  const data = await chrome.storage.local.get(PROMPT_KEY);
  if (typeof data[PROMPT_KEY] === "string" && data[PROMPT_KEY].trim()) {
    return data[PROMPT_KEY];
  }

  const response = await fetch(chrome.runtime.getURL("assets/default-prompt.md"));
  const prompt = await response.text();
  await chrome.storage.local.set({ [PROMPT_KEY]: prompt });
  return prompt;
}

export async function saveSystemPrompt(prompt: string): Promise<void> {
  await chrome.storage.local.set({ [PROMPT_KEY]: prompt });
}

export async function resetSystemPrompt(): Promise<string> {
  const response = await fetch(chrome.runtime.getURL("assets/default-prompt.md"));
  const prompt = await response.text();
  await saveSystemPrompt(prompt);
  return prompt;
}

function normalizeSettings(input: Partial<AISettings> | undefined): AISettings {
  const settings = { ...DEFAULT_SETTINGS, ...(input ?? {}) };
  const provider = settings.provider === "openai" ? "openai" : "google";
  const model = getModelsForProvider(provider).some((option) => option.id === settings.model)
    ? settings.model
    : getDefaultModel(provider);
  return {
    apiKey: settings.apiKey || "",
    provider,
    model,
    screenshotsEnabled: settings.screenshotsEnabled !== false,
  };
}
