<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import type {
    LlmSystemEdge,
    LlmSystemNode,
    LlmSystemStep,
  } from "@ai-history/demo-core";
  import { getLlmSystemDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import {
    resolveLlmSystemScenario,
    resolveLlmSystemScenarioSteps,
  } from "./llmSystemState";

  export let locale: Locale = "zh-CN";

  const nodeWidth = 132;
  const nodeHeight = 82;
  const initialDemo = getLlmSystemDemo();

  let currentIndex = 0;
  let selectedScenarioId = initialDemo.defaultScenarioId;

  $: llmSystemDemo = getLlmSystemDemo(locale);
  $: selectedScenario = resolveLlmSystemScenario(
    llmSystemDemo,
    selectedScenarioId,
  );
  $: selectedSteps = resolveLlmSystemScenarioSteps(
    llmSystemDemo,
    selectedScenario,
  );
  $: currentStep = selectedSteps[currentIndex] ?? selectedSteps[0];
  $: activityTitle = getLocalizedLearningChapter(
    "llm-system",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Task-specific LLM system boundary map",
          scenarioLabel: "System task",
          requestLabel: "User request",
          requirementLabel: "Required system path",
          findingLabel: "What this boundary proves",
        }
      : {
          sceneLabel: "按任务组合的 LLM 系统边界图",
          scenarioLabel: "系统任务",
          requestLabel: "用户请求",
          requirementLabel: "所需系统路径",
          findingLabel: "这个边界证明",
        };

  function getNode(nodes: LlmSystemNode[], nodeId: string): LlmSystemNode {
    const node = nodes.find(({ id }) => id === nodeId);

    if (!node) {
      throw new Error(`LLM system edge references unknown node "${nodeId}".`);
    }

    return node;
  }

  function getEdgePath(edge: LlmSystemEdge, nodes: LlmSystemNode[]): string {
    const from = getNode(nodes, edge.from);
    const to = getNode(nodes, edge.to);

    if (edge.id === "memory-context") {
      const x = from.x + nodeWidth / 2;
      return `M ${x} ${from.y + nodeHeight} L ${x} ${to.y}`;
    }

    if (edge.id === "retrieval-context") {
      const x = from.x + nodeWidth / 2;
      return `M ${x} ${from.y} L ${x} ${to.y + nodeHeight}`;
    }

    if (edge.id === "model-tools") {
      const startX = from.x + nodeWidth;
      const startY = from.y + nodeHeight / 2;
      const endX = to.x + nodeWidth / 2;
      const endY = to.y;
      return `M ${startX} ${startY} C ${startX + 48} ${startY}, ${endX} ${endY - 38}, ${endX} ${endY}`;
    }

    if (edge.id === "tools-eval") {
      const startX = from.x + nodeWidth / 2;
      const startY = from.y;
      const endX = to.x + nodeWidth / 2;
      const endY = to.y + nodeHeight;
      return `M ${startX} ${startY} C ${startX} ${startY - 42}, ${endX} ${endY + 38}, ${endX} ${endY}`;
    }

    return `M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} L ${to.x} ${to.y + nodeHeight / 2}`;
  }

  function isNodeActive(
    step: Pick<LlmSystemStep, "activeNodeIds">,
    id: string,
  ): boolean {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(
    step: Pick<LlmSystemStep, "activeEdgeIds">,
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
  title={activityTitle ?? llmSystemDemo.title}
  question={llmSystemDemo.question}
  simplificationNote={llmSystemDemo.simplificationNote}
  learningGoals={llmSystemDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <section class="scenario-panel" data-testid="llm-system-scenario-panel">
    <div class="scenario-buttons" role="group" aria-label={copy.scenarioLabel}>
      {#each llmSystemDemo.scenarios as scenario}
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
          <dt>{copy.requirementLabel}</dt>
          <dd>{selectedScenario.requirement}</dd>
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
      viewBox="0 0 1030 390"
      fitLabel={demoCoreCopy.fitLabel}
      detailLabel={demoCoreCopy.detailLabel}
      scrollSuffix={demoCoreCopy.scrollSuffix}
    >
      <defs>
        <marker
          id="llm-system-arrow"
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
          id="llm-system-arrow-active"
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

      {#each llmSystemDemo.edges as edge}
        <path
          id={`arrow-${edge.id}`}
          data-role="arrow"
          class="system-edge"
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          d={getEdgePath(edge, llmSystemDemo.nodes)}
          marker-end={isEdgeActive(currentStep, edge.id)
            ? "url(#llm-system-arrow-active)"
            : "url(#llm-system-arrow)"}
        />
      {/each}

      {#each llmSystemDemo.nodes as node}
        <g
          id={`node-${node.id}`}
          data-role="node"
          class:node-path={isNodeActive(currentStep, node.id)}
          class:node-muted={!isNodeActive(currentStep, node.id)}
          class:node-current={node.id === currentStep.nodeId}
          class:node-gap={node.id === currentStep.nodeId &&
            currentStep.findingTone === "gap"}
          class:node-action={node.id === currentStep.nodeId &&
            currentStep.findingTone === "action"}
          class:node-verified={node.id === currentStep.nodeId &&
            currentStep.findingTone === "verified"}
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
            y={node.y + 58}
            text-anchor="middle">{node.description}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>

  <section
    class={`finding ${currentStep.findingTone}`}
    data-llm-system-status={currentStep.findingTone}
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
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
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
    padding: 8px 14px;
    border: 1px solid var(--color-blue, #3469a6);
    border-radius: 8px;
    color: var(--color-blue, #3469a6);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  .scenario-buttons button[aria-pressed="true"] {
    color: white;
    background: var(--color-blue, #3469a6);
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

  .system-edge {
    fill: none;
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 180ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .arrow-muted {
    fill: #9ba9a1;
  }

  .arrow-active {
    fill: var(--color-green, #2f7d5b);
  }

  .edge-active {
    stroke: var(--color-green, #2f7d5b);
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

  .node-path rect {
    fill: #eef4fb;
    stroke: var(--color-blue, #3469a6);
  }

  .node-current rect {
    fill: #eef8f2;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 3;
  }

  .node-gap rect {
    fill: #fff1ed;
    stroke: var(--color-coral, #c6543f);
  }

  .node-action rect {
    fill: #fff8e8;
    stroke: var(--color-amber, #b87918);
  }

  .node-verified rect {
    fill: #eaf6ef;
    stroke: var(--color-green, #2f7d5b);
  }

  .node-muted {
    opacity: 0.38;
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

  .finding {
    margin-top: 18px;
    border-left: 4px solid var(--color-blue, #3469a6);
  }

  .finding > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .finding strong {
    color: var(--color-blue, #3469a6);
  }

  .finding p {
    margin-top: 6px;
    color: var(--color-ink, #17201d);
  }

  .finding.gap {
    border-left-color: var(--color-coral, #c6543f);
  }

  .finding.gap strong {
    color: var(--color-coral, #c6543f);
  }

  .finding.action {
    border-left-color: var(--color-amber, #b87918);
  }

  .finding.action strong {
    color: var(--color-amber, #b87918);
  }

  .finding.verified {
    border-left-color: var(--color-green, #2f7d5b);
  }

  .finding.verified strong {
    color: var(--color-green, #2f7d5b);
  }

  @media (max-width: 720px) {
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

  @media (max-width: 460px) {
    .scenario-buttons,
    .finding > div {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
