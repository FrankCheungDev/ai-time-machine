<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import type {
    AgentLoopEdge,
    AgentLoopNode,
    AgentLoopStep,
  } from "@ai-history/demo-core";
  import { getAgentLoopDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import {
    resolveAgentScenario,
    resolveAgentScenarioSteps,
  } from "./agentState";

  export let locale: Locale = "zh-CN";

  const nodeWidth = 132;
  const nodeHeight = 84;
  const initialDemo = getAgentLoopDemo();

  let currentIndex = 0;
  let selectedScenarioId = initialDemo.defaultScenarioId;

  $: agentLoopDemo = getAgentLoopDemo(locale);
  $: selectedScenario = resolveAgentScenario(agentLoopDemo, selectedScenarioId);
  $: selectedSteps = resolveAgentScenarioSteps(agentLoopDemo, selectedScenario);
  $: activityTitle = getLocalizedLearningChapter("agent", locale).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Agent plan, tool, observation, and revision loop",
          scenarioLabel: "Agent scenario",
        }
      : {
          sceneLabel: "Agent 计划、工具、观察与修正循环",
          scenarioLabel: "Agent 场景",
        };

  function getNode(nodes: AgentLoopNode[], nodeId: string): AgentLoopNode {
    const node = nodes.find(({ id }) => id === nodeId);

    if (!node) {
      throw new Error(`Agent loop edge references unknown node "${nodeId}".`);
    }

    return node;
  }

  function getEdgePath(edge: AgentLoopEdge, nodes: AgentLoopNode[]): string {
    const from = getNode(nodes, edge.from);
    const to = getNode(nodes, edge.to);

    if (edge.id === "observe-revise") {
      const startX = from.x + nodeWidth / 2;
      const startY = from.y + nodeHeight;
      const endX = to.x + nodeWidth;
      const endY = to.y + nodeHeight / 2;

      return `M ${startX} ${startY} C ${startX} ${startY + 42}, ${endX + 34} ${endY}, ${endX} ${endY}`;
    }

    if (edge.id === "revise-tool") {
      const startX = from.x;
      const startY = from.y + nodeHeight / 2;
      const endX = to.x + nodeWidth / 2;
      const endY = to.y + nodeHeight;

      return `M ${startX} ${startY} C ${endX} ${startY}, ${endX} ${endY + 42}, ${endX} ${endY}`;
    }

    return `M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} L ${to.x} ${to.y + nodeHeight / 2}`;
  }

  function isNodeActive(
    step: Pick<AgentLoopStep, "activeNodeIds">,
    id: string,
  ) {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(
    step: Pick<AgentLoopStep, "activeEdgeIds">,
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
  title={activityTitle ?? agentLoopDemo.title}
  question={agentLoopDemo.question}
  simplificationNote={agentLoopDemo.simplificationNote}
  learningGoals={agentLoopDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <section class="scenario-panel">
    <div class="scenario-copy" aria-live="polite">
      <strong>{selectedScenario.label}</strong>
      <p>{selectedScenario.description}</p>
    </div>
    <div class="scenario-buttons" role="group" aria-label={copy.scenarioLabel}>
      {#each agentLoopDemo.scenarios as scenario}
        <button
          type="button"
          aria-pressed={scenario.id === selectedScenario.id}
          on:click={() => selectScenario(scenario.id)}
        >
          {scenario.label}
        </button>
      {/each}
    </div>
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
      viewBox="0 0 820 430"
      fitLabel={demoCoreCopy.fitLabel}
      detailLabel={demoCoreCopy.detailLabel}
      scrollSuffix={demoCoreCopy.scrollSuffix}
    >
      <defs>
        <marker
          id="agent-arrow"
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
          id="agent-arrow-active"
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

      {#each agentLoopDemo.edges as edge}
        <path
          id={`agent-edge-${edge.id}`}
          class="agent-edge"
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          d={getEdgePath(edge, agentLoopDemo.nodes)}
          marker-end={isEdgeActive(currentStep, edge.id)
            ? "url(#agent-arrow-active)"
            : "url(#agent-arrow)"}
        />
      {/each}

      {#each agentLoopDemo.nodes as node}
        <g
          class:node-active={isNodeActive(currentStep, node.id)}
          class:node-muted={!isNodeActive(currentStep, node.id)}
        >
          <rect
            id={`agent-node-${node.id}`}
            x={node.x}
            y={node.y}
            width={nodeWidth}
            height={nodeHeight}
            rx="8"
          ></rect>
          <text
            class="loop-label"
            x={node.x + nodeWidth / 2}
            y={node.y + 34}
            text-anchor="middle">{node.label}</text
          >
          <text
            class="loop-title"
            x={node.x + nodeWidth / 2}
            y={node.y + 58}
            text-anchor="middle">{node.description}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>
</DemoShell>

<style>
  .agent-edge {
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
    opacity: 0.26;
  }

  rect {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    filter: drop-shadow(0 10px 18px rgba(30, 45, 39, 0.08));
  }

  .node-active rect {
    fill: #fff0ed;
    stroke: var(--color-coral, #c6543f);
    stroke-width: 3;
  }

  .node-muted {
    opacity: 0.48;
  }

  .loop-label {
    fill: var(--color-ink, #17201d);
    font-size: 15px;
    font-weight: 780;
  }

  .loop-title {
    fill: var(--color-muted, #5f6864);
    font-size: 10px;
  }

  .scenario-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 18px;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #fff8f6;
  }

  .scenario-copy {
    min-width: 0;
  }

  .scenario-copy strong {
    color: var(--color-ink, #17201d);
  }

  .scenario-copy p {
    margin: 4px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .scenario-buttons {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
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

  @media (max-width: 640px) {
    .scenario-panel,
    .scenario-buttons {
      align-items: stretch;
      flex-direction: column;
    }

    .scenario-buttons button {
      width: 100%;
    }
  }
</style>
