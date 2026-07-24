import { describe, expect, it } from "vitest";
import { getSafetyEvalDemo } from "@ai-history/data";
import {
  resolveSafetyScenario,
  resolveSafetyScenarioSteps,
} from "./safetyState";

describe("safety evaluation state", () => {
  it("falls back to the normal scenario", () => {
    const demo = getSafetyEvalDemo("en");

    expect(resolveSafetyScenario(demo, "unknown").id).toBe("normal");
  });

  it("turns the risk failure into a repaired regression trace", () => {
    const demo = getSafetyEvalDemo("en");
    const scenario = resolveSafetyScenario(demo, "prompt-injection");
    const steps = resolveSafetyScenarioSteps(demo, scenario);

    expect(steps.map(({ nodeId }) => nodeId)).toEqual([
      "red-team",
      "guardrail",
      "permission",
      "review",
      "regression",
      "release",
    ]);
    expect(steps.map(({ findingTone }) => findingTone)).toEqual([
      "risk",
      "blocked",
      "blocked",
      "review",
      "fixed",
      "pass",
    ]);
    expect(steps.at(-2)?.finding).toContain("stable test");
    expect(steps.at(-1)?.description).toContain("old version fails RT-017");
  });
});
