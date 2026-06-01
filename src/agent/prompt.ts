import type { ActionResult, ChatMessage, TabInfo } from "../shared/types";

interface BuildContextOptions {
  task?: string;
  currentUrl: string;
  tabs: TabInfo[];
  accessibilityTree: unknown;
  previousMessages: ChatMessage[];
  previousActionResults: ActionResult[];
  stepIndex: number;
}

export function buildAgentContext(options: BuildContextOptions): string {
  const tabs = options.tabs
    .map((tab) => `- ${tab.active ? "[active] " : ""}${tab.id}: ${tab.title} (${tab.url})`)
    .join("\n");

  const previousMessages = options.previousMessages
    .slice(-8)
    .map((message) => `${message.isUser ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");

  const previousResults = options.previousActionResults
    .slice(-12)
    .map((result, index) => {
      const status = result.success ? "success" : "failed";
      return `${index + 1}. ${status}, attempt ${result.attempt}: ${result.description}${result.error ? ` (${result.error})` : ""}`;
    })
    .join("\n");

  return [
    `Task: ${options.task || "Continue the existing task based on the current page."}`,
    `Step: ${options.stepIndex + 1}`,
    `Current URL: ${options.currentUrl}`,
    "",
    "Available tabs:",
    tabs || "No tabs returned by Chrome.",
    "",
    "Recent conversation:",
    previousMessages || "No previous messages.",
    "",
    "Previous action results:",
    previousResults || "No previous action results.",
    "",
    "Interactive accessibility tree as JSON:",
    JSON.stringify(options.accessibilityTree, null, 2),
    "",
    "Harness policy:",
    "- If the last action failed, recover by choosing a different element/action or ask the user when recovery requires human input.",
    "- Do not repeat the exact same failing action.",
    "- Return the next short sequence of actions only.",
    "- Stop with done when the user task is complete. Use ask only when human input is required.",
  ].join("\n");
}
