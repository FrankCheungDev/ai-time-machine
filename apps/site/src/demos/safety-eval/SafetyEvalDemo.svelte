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

  export let locale: Locale = "zh-CN";

  const nodeWidth = 140;
  const nodeHeight = 78;
  const initialDemo = getSafetyEvalDemo();

  let currentIndex = 0;
  let selectedScenarioId = initialDemo.defaultScenarioId;

  $: safetyEvalDemo = getSafetyEvalDemo(locale);
  $: selectedScenario =
    safetyEvalDemo.scenarios.find(({ id }) => id === selectedScenarioId) ??
    safetyEvalDemo.scenarios[0];
  $: selectedStep =
    safetyEvalDemo.steps[currentIndex] ?? safetyEvalDemo.steps[0];
  $: activityTitle = getLocalizedLearningChapter(
    "safety",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Safety evaluation feedback loop",
          scenarioLabel: "Risk scenario",
          findingLabel: "What this step teaches",
        }
      : {
          sceneLabel: "安全评估反馈回路",
          scenarioLabel: "风险场景",
          findingLabel: "这一步说明",
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

    if (edge.id === "eval-policy") {
      const startX = from.x + nodeWidth / 2;
      const startY = from.y + nodeHeight;
      const endX = to.x + nodeWidth;
      const endY = to.y + nodeHeight / 2;

      return `M ${startX} ${startY} C ${startX} ${startY + 66}, ${endX + 44} ${endY}, ${endX} ${endY}`;
    }

    return `M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} L ${to.x} ${to.y + nodeHeight / 2}`;
  }

  function isNodeActive(
    step: Pick<SafetyEvalStep, "activeNodeIds">,
    id: string,
  ) {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(
    step: Pick<SafetyEvalStep, "activeEdgeIds">,
    id: string,
  ) {
    return step.activeEdgeIds.includes(id);
  }

  function selectScenario(scenarioId: string) {
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
  <section class="scenario-panel" aria-labelledby="safety-scenario-title">
    <div class="scenario-control">
      <label for="safety-scenario">{copy.scenarioLabel}</label>
      <select
        id="safety-scenario"
        aria-label={copy.scenarioLabel}
        bind:value={selectedScenarioId}
        on:change={() => selectScenario(selectedScenarioId)}
      >
        {#each safetyEvalDemo.scenarios as scenario}
          <option value={scenario.id}>{scenario.label}</option>
        {/each}
      </select>
    </div>
    {#if selectedScenario}
      <article class="scenario-result">
        <span>{selectedScenario.label}</span>
        <h3 id="safety-scenario-title">{selectedScenario.title}</h3>
        <p>{selectedScenario.description}</p>
        <p>
          <strong>{locale === "en" ? "Risk:" : "风险："}</strong>
          {selectedScenario.risk}
        </p>
        <p>
          <strong>{locale === "en" ? "Mitigation:" : "应对："}</strong>
          {selectedScenario.mitigation}
        </p>
      </article>
    {/if}
  </section>

  <StepperDemo
    steps={safetyEvalDemo.steps}
    bind:currentIndex
    previousLabel={demoCoreCopy.previousLabel}
    nextLabel={demoCoreCopy.nextLabel}
    let:currentStep
  >
    <SvgScene
      label={copy.sceneLabel}
      viewBox="0 0 910 430"
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
            y={node.y + 32}
            text-anchor="middle">{node.label}</text
          >
          <text
            class="node-caption"
            x={node.x + nodeWidth / 2}
            y={node.y + 56}
            text-anchor="middle">{node.description}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>

  <section class={`finding ${selectedStep.findingTone}`} aria-live="polite">
    <span>{copy.findingLabel}</span>
    <p>{selectedStep.finding}</p>
  </section>
</DemoShell>

<style>
  .scenario-panel {
    display: grid;
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
    gap: 16px;
    margin-top: 18px;
  }

  .scenario-control,
  .scenario-result,
  .finding {
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .scenario-control {
    display: grid;
    align-content: start;
    gap: 8px;
  }

  label,
  .scenario-result span,
  .finding span {
    color: var(--color-blue, #3469a6);
    font-size: 0.88rem;
    font-weight: 760;
  }

  select {
    min-height: 44px;
    padding: 0 10px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
  }

  h3 {
    margin: 6px 0 8px;
  }

  p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }

  .scenario-result p + p {
    margin-top: 8px;
  }

  .finding {
    margin-top: 18px;
    border-left: 4px solid var(--color-blue, #3469a6);
  }

  .finding p {
    margin-top: 6px;
    color: var(--color-ink, #17201d);
  }

  .finding.risk {
    border-left-color: var(--color-coral, #c6543f);
  }

  .finding.pass {
    border-left-color: var(--color-green, #2f7d5b);
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
    fill: #fff1ed;
    stroke: var(--color-coral, #c6543f);
    stroke-width: 3;
  }

  .node-muted {
    opacity: 0.46;
  }

  text {
    fill: var(--color-ink, #17201d);
    font-size: 15px;
    font-weight: 760;
  }

  .node-caption {
    fill: var(--color-muted, #5f6864);
    font-size: 12px;
    font-weight: 620;
  }

  @media (max-width: 700px) {
    .scenario-panel {
      grid-template-columns: 1fr;
    }
  }
</style>
