import type {
  SafetyEvalDemo,
  SafetyEvalScenario,
  SafetyEvalStep,
} from "@ai-history/demo-core";

function assertSafetyReferences(demo: SafetyEvalDemo): void {
  const nodeIds = new Set(demo.nodes.map(({ id }) => id));
  const edgeIds = new Set(demo.edges.map(({ id }) => id));

  for (const edge of demo.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(
        `Safety evaluation edge "${edge.id}" references an unknown node.`,
      );
    }
  }

  for (const step of demo.steps) {
    if (!nodeIds.has(step.nodeId)) {
      throw new Error(
        `Safety evaluation step "${step.id}" references unknown node "${step.nodeId}".`,
      );
    }

    for (const edgeId of step.activeEdgeIds) {
      if (!edgeIds.has(edgeId)) {
        throw new Error(
          `Safety evaluation step "${step.id}" references unknown edge "${edgeId}".`,
        );
      }
    }
  }
}

export function resolveSafetyScenario(
  demo: Pick<SafetyEvalDemo, "scenarios" | "defaultScenarioId">,
  selectedScenarioId: string,
): SafetyEvalScenario {
  const fallback = demo.scenarios.find(
    ({ id }) => id === demo.defaultScenarioId,
  );

  if (!fallback) {
    throw new Error(
      `Safety evaluation default scenario "${demo.defaultScenarioId}" does not exist.`,
    );
  }

  return demo.scenarios.find(({ id }) => id === selectedScenarioId) ?? fallback;
}

export function resolveSafetyScenarioSteps(
  demo: SafetyEvalDemo,
  scenario: Pick<SafetyEvalScenario, "id" | "stepIds">,
): SafetyEvalStep[] {
  assertSafetyReferences(demo);
  const stepsById = new Map(demo.steps.map((step) => [step.id, step]));

  return scenario.stepIds.map((stepId) => {
    const step = stepsById.get(stepId);

    if (!step) {
      throw new Error(
        `Safety evaluation scenario "${scenario.id}" references unknown step "${stepId}".`,
      );
    }

    return step;
  });
}
