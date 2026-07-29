import type {
  LlmSystemDemo,
  LlmSystemScenario,
  LlmSystemStep,
} from "@ai-history/demo-core";

export function resolveLlmSystemScenario(
  demo: LlmSystemDemo,
  scenarioId: string,
): LlmSystemScenario {
  return (
    demo.scenarios.find((scenario) => scenario.id === scenarioId) ??
    demo.scenarios.find((scenario) => scenario.id === demo.defaultScenarioId) ??
    demo.scenarios[0]
  );
}

export function resolveLlmSystemScenarioSteps(
  demo: LlmSystemDemo,
  scenario: LlmSystemScenario,
): LlmSystemStep[] {
  const stepsById = new Map(demo.steps.map((step) => [step.id, step]));

  return scenario.stepIds.map((stepId) => {
    const step = stepsById.get(stepId);

    if (!step) {
      throw new Error(
        `LLM system scenario "${scenario.id}" references unknown step "${stepId}".`,
      );
    }

    return step;
  });
}
