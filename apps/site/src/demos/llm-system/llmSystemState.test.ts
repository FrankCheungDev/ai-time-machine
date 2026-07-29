import { describe, expect, it } from "vitest";
import { getLlmSystemDemo } from "@ai-history/data";
import {
  resolveLlmSystemScenario,
  resolveLlmSystemScenarioSteps,
} from "./llmSystemState";

describe("LLM system scenario state", () => {
  it("falls back to the default scenario", () => {
    const demo = getLlmSystemDemo();

    expect(resolveLlmSystemScenario(demo, "unknown").id).toBe(
      demo.defaultScenarioId,
    );
  });

  it("selects task-specific component paths", () => {
    const demo = getLlmSystemDemo();
    const policy = resolveLlmSystemScenario(demo, "current-policy");
    const resume = resolveLlmSystemScenario(demo, "resume-and-submit");
    const policySteps = resolveLlmSystemScenarioSteps(demo, policy);
    const resumeSteps = resolveLlmSystemScenarioSteps(demo, resume);

    expect(policySteps.at(-1)?.activeNodeIds).toContain("retrieval");
    expect(policySteps.at(-1)?.activeNodeIds).not.toContain("tools");
    expect(resumeSteps.at(-1)?.activeNodeIds).toContain("memory");
    expect(resumeSteps.at(-1)?.activeNodeIds).toContain("tools");
    expect(resumeSteps.at(-1)?.activeNodeIds).not.toContain("retrieval");
  });

  it("rejects scenario references to unknown steps", () => {
    const demo = getLlmSystemDemo();
    const scenario = {
      ...demo.scenarios[0],
      stepIds: ["missing-step"],
    };

    expect(() => resolveLlmSystemScenarioSteps(demo, scenario)).toThrow(
      /missing-step/,
    );
  });
});
