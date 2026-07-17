import { getAgentLoopDemo } from "@ai-history/data";
import { describe, expect, it } from "vitest";
import {
  resolveAgentScenario,
  resolveAgentScenarioSteps,
} from "./agent-loop/agentState";

describe("agent loop scenario state", () => {
  it("uses the default success scenario and falls back to it for unknown IDs", () => {
    const demo = getAgentLoopDemo("zh-CN");
    const defaultScenario = resolveAgentScenario(demo, demo.defaultScenarioId);
    const fallbackScenario = resolveAgentScenario(demo, "unknown-scenario");

    expect(defaultScenario.id).toBe("success");
    expect(defaultScenario.label).toBe("正常成功");
    expect(fallbackScenario).toEqual(defaultScenario);
  });

  it("resolves the exact success and retry trajectories in both locales", () => {
    const expectedTrajectories = {
      success: ["plan", "tool-primary", "observe-success", "final"],
      "tool-failure": [
        "plan",
        "tool-primary",
        "observe-failure",
        "revise",
        "tool-retry",
        "observe-retry",
        "final",
      ],
    };

    for (const locale of ["zh-CN", "en"] as const) {
      const demo = getAgentLoopDemo(locale);

      for (const [scenarioId, expectedStepIds] of Object.entries(
        expectedTrajectories,
      )) {
        const scenario = resolveAgentScenario(demo, scenarioId);
        const steps = resolveAgentScenarioSteps(demo, scenario);

        expect(steps.map(({ id }) => id)).toEqual(expectedStepIds);
      }
    }
  });

  it("revisits Tool and Observation before Final in the failure scenario", () => {
    const demo = getAgentLoopDemo("zh-CN");
    const scenario = resolveAgentScenario(demo, "tool-failure");
    const steps = resolveAgentScenarioSteps(demo, scenario);

    expect(steps.map(({ nodeId }) => nodeId)).toEqual([
      "plan",
      "tool",
      "observe",
      "revise",
      "tool",
      "observe",
      "final",
    ]);
    expect(steps.at(-2)?.id).toBe("observe-retry");
    expect(steps.at(-1)?.id).toBe("final");
  });

  it("throws when the default scenario or a scenario step is invalid", () => {
    const missingDefault = getAgentLoopDemo("zh-CN");
    missingDefault.defaultScenarioId = "missing";

    expect(() => resolveAgentScenario(missingDefault, "unknown")).toThrow(
      'Agent loop default scenario "missing" does not exist.',
    );

    const missingStep = getAgentLoopDemo("zh-CN");
    const scenario = resolveAgentScenario(missingStep, "tool-failure");
    scenario.stepIds[0] = "missing";

    expect(() => resolveAgentScenarioSteps(missingStep, scenario)).toThrow(
      'Agent loop scenario "tool-failure" references unknown step "missing".',
    );
  });

  it("throws for invalid node and edge references", () => {
    const invalidNode = getAgentLoopDemo("zh-CN");
    invalidNode.steps[0]!.nodeId = "missing-node";

    expect(() =>
      resolveAgentScenarioSteps(
        invalidNode,
        resolveAgentScenario(invalidNode, "success"),
      ),
    ).toThrow('Agent loop step "plan" references unknown node "missing-node".');

    const invalidEdge = getAgentLoopDemo("zh-CN");
    invalidEdge.steps[1]!.activeEdgeIds = ["missing-edge"];

    expect(() =>
      resolveAgentScenarioSteps(
        invalidEdge,
        resolveAgentScenario(invalidEdge, "success"),
      ),
    ).toThrow(
      'Agent loop step "tool-primary" references unknown active edge "missing-edge".',
    );

    const invalidEndpoint = getAgentLoopDemo("zh-CN");
    invalidEndpoint.edges[0]!.to = "missing-node";

    expect(() =>
      resolveAgentScenarioSteps(
        invalidEndpoint,
        resolveAgentScenario(invalidEndpoint, "success"),
      ),
    ).toThrow(
      'Agent loop edge "plan-tool" references unknown target node "missing-node".',
    );
  });
});
