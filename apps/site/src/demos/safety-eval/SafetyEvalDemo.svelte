<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import type {
    SafetyEvalEdge,
    SafetyEvalNode,
    SafetyEvalStep,
  } from "@ai-history/demo-core";
  import { getSafetyEvalDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import {
    resolveSafetyScenario,
    resolveSafetyScenarioSteps,
  } from "./safetyState";

  export let locale: Locale = "zh-CN";

  const nodeWidth = 132;
  const nodeHeight = 82;
  const initialDemo = getSafetyEvalDemo();

  let currentIndex = 0;
  let selectedScenarioId = initialDemo.defaultScenarioId;

  $: safetyEvalDemo = getSafetyEvalDemo(locale);
  $: selectedScenario = resolveSafetyScenario(
    safetyEvalDemo,
    selectedScenarioId,
  );
  $: selectedSteps = resolveSafetyScenarioSteps(
    safetyEvalDemo,
    selectedScenario,
  );
  $: currentStep = selectedSteps[currentIndex] ?? selectedSteps[0];
  $: activityTitle = getLocalizedLearningChapter(
    "safety",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Safety evaluation release feedback loop",
          scenarioLabel: "Request type",
          requestLabel: "Test request",
          outcomeLabel: "Expected system outcome",
          findingLabel: "What this step proves",
        }
      : {
          sceneLabel: "安全评估发布反馈回路",
          scenarioLabel: "请求类型",
          requestLabel: "测试请求",
          outcomeLabel: "系统预期结果",
          findingLabel: "这一步证明",
        };

  function getNode(nodes: SafetyEvalNode[], nodeId: string): SafetyEvalNode {
    const node = nodes.find(({ id }) => id === nodeId);

    if (!node) {
      throw new Error(`Safety evaluation references unknown node "${nodeId}".`);
    }

    return node;
  }

  function getEdgePath(edge: SafetyEvalEdge, nodes: SafetyEvalNode[]): string {
    const from = getNode(nodes, edge.from);
    const to = getNode(nodes, edge.to);

    return `M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} L ${to.x} ${to.y + nodeHeight / 2}`;
  }

  function isNodeActive(
    step: Pick<SafetyEvalStep, "activeNodeIds">,
    id: string,
  ): boolean {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(
    step: Pick<SafetyEvalStep, "activeEdgeIds">,
    id: string,
  ): boolean {
    return step.activeEdgeIds.includes(id);
  }

  function selectScenario(scenarioId: string): void {
    currentIndex = 0;
    selectedScenarioId = scenarioId;
  }
</script>

<DemoShell
  title={activityTitle ?? safetyEvalDemo.title}
  question={safetyEvalDemo.question}
  simplificationNote={safetyEvalDemo.simplificationNote}
  learningGoals={safetyEvalDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <section class="scenario-panel" data-testid="safety-scenario-panel">
    <div class="scenario-buttons" role="group" aria-label={copy.scenarioLabel}>
      {#each safetyEvalDemo.scenarios as scenario}
        <button
          type="button"
          aria-pressed={scenario.id === selectedScenario.id}
          on:click={() => selectScenario(scenario.id)}
        >
          {scenario.label}
        </button>
      {/each}
    </div>
    <article class="scenario-result" aria-live="polite">
      <span>{selectedScenario.label}</span>
      <h3>{selectedScenario.title}</h3>
      <p>{selectedScenario.description}</p>
      <dl>
        <div>
          <dt>{copy.requestLabel}</dt>
          <dd>{selectedScenario.request}</dd>
        </div>
        <div>
          <dt>{copy.outcomeLabel}</dt>
          <dd>{selectedScenario.expectedOutcome}</dd>
        </div>
      </dl>
    </article>
  </section>

  <StepperDemo
    steps={selectedSteps}
    bind:currentIndex
    previousLabel={demoCoreCopy.previousLabel}
    nextLabel={demoCoreCopy.nextLabel}
    let:currentStep
  >
    <SvgScene
      label={copy.sceneLabel}
      viewBox="0 0 980 330"
      fitLabel={demoCoreCopy.fitLabel}
      detailLabel={demoCoreCopy.detailLabel}
      scrollSuffix={demoCoreCopy.scrollSuffix}
    >
      <defs>
        <marker
          id="safety-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="arrow-muted" d="M 0 0 L 10 5 L 0 10 z"></path>
        </marker>
        <marker
          id="safety-arrow-active"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path class="arrow-active" d="M 0 0 L 10 5 L 0 10 z"></path>
        </marker>
      </defs>

      {#each safetyEvalDemo.edges as edge}
        <path
          id={`safety-edge-${edge.id}`}
          class="safety-edge"
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          d={getEdgePath(edge, safetyEvalDemo.nodes)}
          marker-end={isEdgeActive(currentStep, edge.id)
            ? "url(#safety-arrow-active)"
            : "url(#safety-arrow)"}
        />
      {/each}

      {#each safetyEvalDemo.nodes as node}
        <g
          id={`safety-node-${node.id}`}
          class:node-active={isNodeActive(currentStep, node.id)}
          class:node-muted={!isNodeActive(currentStep, node.id)}
          class:node-risk={isNodeActive(currentStep, node.id) &&
            currentStep.findingTone === "risk"}
          class:node-blocked={isNodeActive(currentStep, node.id) &&
            currentStep.findingTone === "blocked"}
          class:node-fixed={isNodeActive(currentStep, node.id) &&
            currentStep.findingTone === "fixed"}
        >
          <rect
            x={node.x}
            y={node.y}
            width={nodeWidth}
            height={nodeHeight}
            rx="8"
          ></rect>
          <text
            class="node-label"
            x={node.x + nodeWidth / 2}
            y={node.y + 34}
            text-anchor="middle">{node.label}</text
          >
          <text
            class="node-caption"
            x={node.x + nodeWidth / 2}
            y={node.y + 59}
            text-anchor="middle">{node.description}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>

  <section
    class={`finding ${currentStep.findingTone}`}
    data-safety-status={currentStep.findingTone}
    aria-live="polite"
  >
    <div>
      <span>{copy.findingLabel}</span>
      <strong>{currentStep.statusLabel}</strong>
    </div>
    <p>{currentStep.finding}</p>
  </section>
</DemoShell>

<style>
  .scenario-panel {
    display: grid;
    grid-template-columns: minmax(170px, 220px) minmax(0, 1fr);
    gap: 16px;
    margin-top: 18px;
  }

  .scenario-buttons,
  .scenario-result,
  .finding {
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .scenario-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scenario-buttons button {
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color-coral, #c6543f);
    border-radius: 8px;
    color: var(--color-coral, #c6543f);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  .scenario-buttons button[aria-pressed="true"] {
    color: white;
    background: var(--color-coral, #c6543f);
  }

  .scenario-result > span,
  .finding span {
    color: var(--color-blue, #3469a6);
    font-size: 0.88rem;
    font-weight: 760;
  }

  h3 {
    margin: 6px 0 8px;
  }

  p,
  dd {
    color: var(--color-muted, #5f6864);
  }

  .scenario-result > p,
  .finding p {
    margin: 0;
  }

  dl {
    display: grid;
    gap: 10px;
    margin: 14px 0 0;
  }

  dl div {
    padding: 12px;
    border-radius: 8px;
    background: #f7faf8;
  }

  dt {
    color: var(--color-ink, #17201d);
    font-weight: 760;
  }

  dd {
    margin: 4px 0 0;
  }

  .finding {
    margin-top: 18px;
    border-left: 4px solid var(--color-green, #2f7d5b);
  }

  .finding > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .finding strong {
    color: var(--color-green, #2f7d5b);
  }

  .finding p {
    margin-top: 6px;
    color: var(--color-ink, #17201d);
  }

  .finding.risk {
    border-left-color: var(--color-coral, #c6543f);
  }

  .finding.risk strong {
    color: var(--color-coral, #c6543f);
  }

  .finding.blocked,
  .finding.review {
    border-left-color: var(--color-blue, #3469a6);
  }

  .finding.blocked strong,
  .finding.review strong {
    color: var(--color-blue, #3469a6);
  }

  .finding.fixed {
    border-left-color: #8a5a9d;
  }

  .finding.fixed strong {
    color: #8a5a9d;
  }

  .safety-edge {
    fill: none;
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 160ms ease,
      stroke 160ms ease,
      stroke-width 160ms ease;
  }

  .arrow-muted {
    fill: #9ba9a1;
  }

  .arrow-active {
    fill: var(--color-coral, #c6543f);
  }

  .edge-active {
    stroke: var(--color-coral, #c6543f);
    stroke-width: 5;
    opacity: 1;
  }

  .edge-muted {
    opacity: 0.24;
  }

  rect {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
  }

  .node-active rect {
    fill: #eef8f2;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 3;
  }

  .node-risk rect {
    fill: #fff1ed;
    stroke: var(--color-coral, #c6543f);
  }

  .node-blocked rect {
    fill: #eef4fb;
    stroke: var(--color-blue, #3469a6);
  }

  .node-fixed rect {
    fill: #f6eff9;
    stroke: #8a5a9d;
  }

  .node-muted {
    opacity: 0.46;
  }

  text {
    fill: var(--color-ink, #17201d);
    font-size: 14px;
    font-weight: 760;
  }

  .node-caption {
    fill: var(--color-muted, #5f6864);
    font-size: 11px;
    font-weight: 620;
  }

  @media (max-width: 700px) {
    .scenario-panel {
      grid-template-columns: 1fr;
    }

    .scenario-buttons {
      flex-direction: row;
    }

    .scenario-buttons button {
      flex: 1;
    }
  }

  @media (max-width: 440px) {
    .scenario-buttons,
    .finding > div {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
