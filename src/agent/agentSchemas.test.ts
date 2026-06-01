import { describe, expect, it } from "vitest";
import { agentResponseSchema, getWaitDuration, isFinalAction } from "../shared/actions";
import { getDefaultModel, getModelsForProvider } from "./modelRegistry";

describe("agent action schema", () => {
  it("normalizes numeric element ids to strings", () => {
    const parsed = agentResponseSchema.parse({
      current_state: { message: "Clicking search" },
      action: [{ click: { id: 42, description: "Click search" } }],
    });

    expect(parsed.action[0]).toEqual({
      click: { id: "42", description: "Click search" },
    });
  });

  it("accepts legacy wait time and converts it to milliseconds", () => {
    const parsed = agentResponseSchema.parse({
      current_state: { message: "Waiting" },
      action: [{ wait: { time: 2 } }],
    });

    const wait = parsed.action[0];
    expect("wait" in wait && getWaitDuration(wait.wait)).toBe(2000);
  });

  it("detects final actions", () => {
    expect(isFinalAction({ done: { message: "Complete" } })).toBe(true);
    expect(isFinalAction({ ask: { query: "Which option?" } })).toBe(true);
    expect(isFinalAction({ keyboard: { key: "Enter" } })).toBe(false);
  });
});

describe("model registry", () => {
  it("keeps provider defaults inside their provider group", () => {
    expect(getModelsForProvider("google").some((model) => model.id === getDefaultModel("google"))).toBe(true);
    expect(getModelsForProvider("openai").some((model) => model.id === getDefaultModel("openai"))).toBe(true);
  });
});
