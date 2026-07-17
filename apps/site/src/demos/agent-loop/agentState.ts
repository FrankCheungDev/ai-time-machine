import type {
  AgentLoopDemo,
  AgentLoopScenario,
  AgentLoopStep,
} from "@ai-history/demo-core";

function assertAgentLoopReferences(demo: AgentLoopDemo): void {
  const nodeIds = new Set(demo.nodes.map(({ id }) => id));
  const edgeIds = new Set(demo.edges.map(({ id }) => id));

  for (const edge of demo.edges) {
    if (!nodeIds.has(edge.from)) {
      throw new Error(
        `Agent loop edge "${edge.id}" references unknown source node "${edge.from}".`,
      );
    }

    if (!nodeIds.has(edge.to)) {
      throw new Error(
        `Agent loop edge "${edge.id}" references unknown target node "${edge.to}".`,
      );
    }
  }

  for (const step of demo.steps) {
    if (!nodeIds.has(step.nodeId)) {
      throw new Error(
        `Agent loop step "${step.id}" references unknown node "${step.nodeId}".`,
      );
    }

    for (const nodeId of step.activeNodeIds) {
      if (!nodeIds.has(nodeId)) {
        throw new Error(
          `Agent loop step "${step.id}" references unknown active node "${nodeId}".`,
        );
      }
    }

    for (const edgeId of step.activeEdgeIds) {
      if (!edgeIds.has(edgeId)) {
        throw new Error(
          `Agent loop step "${step.id}" references unknown active edge "${edgeId}".`,
        );
      }
    }
  }
}

export function resolveAgentScenario(
  demo: Pick<AgentLoopDemo, "scenarios" | "defaultScenarioId">,
  selectedScenarioId: string,
): AgentLoopScenario {
  const defaultScenario = demo.scenarios.find(
    ({ id }) => id === demo.defaultScenarioId,
  );

  if (!defaultScenario) {
    throw new Error(
      `Agent loop default scenario "${demo.defaultScenarioId}" does not exist.`,
    );
  }

  return (
    demo.scenarios.find(({ id }) => id === selectedScenarioId) ??
    defaultScenario
  );
}

export function resolveAgentScenarioSteps(
  demo: AgentLoopDemo,
  scenario: Pick<AgentLoopScenario, "id" | "stepIds">,
): AgentLoopStep[] {
  assertAgentLoopReferences(demo);
  const stepsById = new Map(demo.steps.map((step) => [step.id, step]));

  return scenario.stepIds.map((stepId) => {
    const step = stepsById.get(stepId);

    if (!step) {
      throw new Error(
        `Agent loop scenario "${scenario.id}" references unknown step "${stepId}".`,
      );
    }

    return step;
  });
}
