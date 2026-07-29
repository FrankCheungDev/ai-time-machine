import { describe, expect, it } from "vitest";
import { getLlmSystemDemo } from "./index";

function projectTopology(locale: "zh-CN" | "en") {
  const demo = getLlmSystemDemo(locale);

  return {
    nodes: demo.nodes.map(({ id, x, y }) => ({ id, x, y })),
    edges: demo.edges,
    steps: demo.steps.map(
      ({ id, nodeId, activeNodeIds, activeEdgeIds, findingTone }) => ({
        id,
        nodeId,
        activeNodeIds,
        activeEdgeIds,
        findingTone,
      }),
    ),
    scenarios: demo.scenarios.map(({ id, stepIds }) => ({ id, stepIds })),
    defaultScenarioId: demo.defaultScenarioId,
  };
}

describe("LLM system boundary demo", () => {
  it("keeps every scenario path inside the known graph", () => {
    const demo = getLlmSystemDemo();
    const nodeIds = new Set(demo.nodes.map(({ id }) => id));
    const edgeIds = new Set(demo.edges.map(({ id }) => id));
    const stepIds = new Set(demo.steps.map(({ id }) => id));

    for (const edge of demo.edges) {
      expect(nodeIds, edge.id).toContain(edge.from);
      expect(nodeIds, edge.id).toContain(edge.to);
    }

    for (const step of demo.steps) {
      expect(nodeIds, step.id).toContain(step.nodeId);
      expect(
        step.activeNodeIds.every((nodeId) => nodeIds.has(nodeId)),
        step.id,
      ).toBe(true);
      expect(
        step.activeEdgeIds.every((edgeId) => edgeIds.has(edgeId)),
        step.id,
      ).toBe(true);
    }

    for (const scenario of demo.scenarios) {
      expect(
        scenario.stepIds.every((stepId) => stepIds.has(stepId)),
        scenario.id,
      ).toBe(true);
    }
  });

  it("uses distinct retrieval and action paths", () => {
    const demo = getLlmSystemDemo();
    const stepsById = new Map(demo.steps.map((step) => [step.id, step]));
    const finalNodes = (scenarioId: string) => {
      const scenario = demo.scenarios.find(({ id }) => id === scenarioId)!;
      return stepsById.get(scenario.stepIds.at(-1)!)!.activeNodeIds;
    };

    expect(finalNodes("current-policy")).toContain("retrieval");
    expect(finalNodes("current-policy")).not.toContain("memory");
    expect(finalNodes("current-policy")).not.toContain("tools");
    expect(finalNodes("resume-and-submit")).toContain("memory");
    expect(finalNodes("resume-and-submit")).toContain("tools");
    expect(finalNodes("resume-and-submit")).not.toContain("retrieval");
  });

  it("localizes copy without changing topology", () => {
    expect(projectTopology("en")).toEqual(projectTopology("zh-CN"));
    expect(getLlmSystemDemo("en").question).not.toBe(
      getLlmSystemDemo("zh-CN").question,
    );
  });
});
