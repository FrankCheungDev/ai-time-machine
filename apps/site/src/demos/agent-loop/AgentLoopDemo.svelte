<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import { getAgentLoopDemo, type Locale } from "@ai-history/data";
  import type { AgentLoopStep } from "@ai-history/demo-core";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import { resolveAgentBranchNote } from "./agentState";

  export let locale: Locale = "zh-CN";

  let currentIndex = 0;
  let selectedBranchId = "";

  $: agentLoopDemo = getAgentLoopDemo(locale);
  $: branchNote = resolveAgentBranchNote(agentLoopDemo, selectedBranchId);
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Agent plan, tool, observation, and revision loop",
          branchFallback:
            "Choose a failure path to see how the agent returns from an observation to a revised plan.",
        }
      : {
          sceneLabel: "Agent 计划、工具、观察与修正循环",
          branchFallback:
            "选择一个失败路径，观察 Agent 如何从观察结果回到修正计划。",
        };

  const positions: Record<string, { x: number; y: number }> = {
    plan: { x: 90, y: 92 },
    tool: { x: 356, y: 92 },
    observe: { x: 612, y: 92 },
    revise: { x: 476, y: 246 },
    final: { x: 176, y: 246 },
  };

  const edges = [
    { id: "plan-tool", from: "plan", to: "tool" },
    { id: "tool-observe", from: "tool", to: "observe" },
    { id: "observe-revise", from: "observe", to: "revise" },
    { id: "revise-tool", from: "revise", to: "tool" },
    { id: "revise-final", from: "revise", to: "final" },
  ];

  function isNodeActive(step: AgentLoopStep, id: string) {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(step: AgentLoopStep, id: string) {
    return step.activeEdgeIds.includes(id);
  }

  function triggerBranch(targetStepId: string, branchId: string) {
    const nextIndex = agentLoopDemo.steps.findIndex(
      (step) => step.id === targetStepId,
    );
    currentIndex = Math.max(0, nextIndex);
    selectedBranchId = branchId;
  }
</script>

<DemoShell
  title={agentLoopDemo.title}
  question={agentLoopDemo.question}
  simplificationNote={agentLoopDemo.simplificationNote}
  learningGoals={agentLoopDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <StepperDemo
    steps={agentLoopDemo.steps}
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
          <path d="M 0 0 L 10 5 L 0 10 z"></path>
        </marker>
      </defs>

      {#each edges as edge}
        {@const from = positions[edge.from]}
        {@const to = positions[edge.to]}
        <line
          id={`agent-edge-${edge.id}`}
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          x1={from.x + 92}
          y1={from.y + 42}
          x2={to.x}
          y2={to.y + 42}
          marker-end="url(#agent-arrow)"
        />
      {/each}

      {#each agentLoopDemo.steps as step}
        {@const position = positions[step.id]}
        <g
          class:node-active={isNodeActive(currentStep, step.id)}
          class:node-muted={!isNodeActive(currentStep, step.id)}
        >
          <rect
            id={`agent-node-${step.id}`}
            x={position.x}
            y={position.y}
            width="132"
            height="84"
            rx="8"
          ></rect>
          <text
            class="loop-label"
            x={position.x + 66}
            y={position.y + 34}
            text-anchor="middle">{step.loopLabel}</text
          >
          <text
            class="loop-title"
            x={position.x + 66}
            y={position.y + 58}
            text-anchor="middle">{step.title}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>

  <div class="branch-panel">
    <p>{branchNote || copy.branchFallback}</p>
    {#each agentLoopDemo.branchOptions as option}
      <button
        type="button"
        on:click={() => triggerBranch(option.targetStepId, option.id)}
      >
        {option.label}
      </button>
    {/each}
  </div>
</DemoShell>

<style>
  line {
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 160ms ease,
      stroke 160ms ease,
      stroke-width 160ms ease;
  }

  marker path {
    fill: #9ba9a1;
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

  .branch-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 18px;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #fff8f6;
  }

  .branch-panel p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }

  button {
    min-height: 44px;
    flex: 0 0 auto;
    padding: 0 14px;
    border: 1px solid var(--color-coral, #c6543f);
    border-radius: 8px;
    color: white;
    background: var(--color-coral, #c6543f);
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .branch-panel {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
