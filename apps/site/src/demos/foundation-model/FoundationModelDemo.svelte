<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import type {
    FoundationModelEdge,
    FoundationModelNode,
    FoundationModelStep,
  } from "@ai-history/demo-core";
  import { getFoundationModelDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";

  export let locale: Locale = "zh-CN";

  const nodeWidth = 128;
  const nodeHeight = 78;

  let currentIndex = 0;

  $: foundationModelDemo = getFoundationModelDemo(locale);
  $: currentStep =
    foundationModelDemo.steps[currentIndex] ?? foundationModelDemo.steps[0];
  $: activityTitle = getLocalizedLearningChapter(
    "foundation-model",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "Foundation model training and inference lifecycle",
          findingLabel: "What changes at this stage",
          previewLabel: "Scripted output preview",
          trainingPhase: "Weights can change",
          inferencePhase: "Weights stay fixed",
        }
      : {
          sceneLabel: "基础模型训练与推理生命周期",
          findingLabel: "这个阶段改变什么",
          previewLabel: "脚本化输出预览",
          trainingPhase: "权重可更新",
          inferencePhase: "权重保持不变",
        };

  function getNode(
    nodes: FoundationModelNode[],
    nodeId: string,
  ): FoundationModelNode {
    const node = nodes.find(({ id }) => id === nodeId);

    if (!node) {
      throw new Error(
        `Foundation model lifecycle references unknown node "${nodeId}".`,
      );
    }

    return node;
  }

  function getEdgePath(
    edge: FoundationModelEdge,
    nodes: FoundationModelNode[],
  ): string {
    const from = getNode(nodes, edge.from);
    const to = getNode(nodes, edge.to);

    if (edge.id === "assistant-output") {
      const x = from.x + nodeWidth / 2;
      return `M ${x} ${from.y + nodeHeight} L ${x} ${to.y}`;
    }

    return `M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} L ${to.x} ${to.y + nodeHeight / 2}`;
  }

  function isNodeActive(
    step: Pick<FoundationModelStep, "activeNodeIds">,
    nodeId: string,
  ): boolean {
    return step.activeNodeIds.includes(nodeId);
  }

  function isEdgeActive(
    step: Pick<FoundationModelStep, "activeEdgeIds">,
    edgeId: string,
  ): boolean {
    return step.activeEdgeIds.includes(edgeId);
  }
</script>

<DemoShell
  title={activityTitle ?? foundationModelDemo.title}
  question={foundationModelDemo.question}
  simplificationNote={foundationModelDemo.simplificationNote}
  learningGoals={foundationModelDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div class="phase-legend" aria-label={copy.sceneLabel}>
    <span class="training">{copy.trainingPhase}</span>
    <span class="inference">{copy.inferencePhase}</span>
  </div>

  <StepperDemo
    steps={foundationModelDemo.steps}
    bind:currentIndex
    previousLabel={demoCoreCopy.previousLabel}
    nextLabel={demoCoreCopy.nextLabel}
    let:currentStep
  >
    <SvgScene
      label={copy.sceneLabel}
      viewBox="0 0 1080 440"
      fitLabel={demoCoreCopy.fitLabel}
      detailLabel={demoCoreCopy.detailLabel}
      scrollSuffix={demoCoreCopy.scrollSuffix}
    >
      <defs>
        <marker
          id="foundation-arrow"
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
          id="foundation-arrow-active"
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

      <rect class="training-zone" x="8" y="116" width="1064" height="180" rx="8"
      ></rect>
      <rect
        class="inference-zone"
        x="608"
        y="306"
        width="464"
        height="126"
        rx="8"
      ></rect>

      {#each foundationModelDemo.edges as edge}
        <path
          id={`foundation-edge-${edge.id}`}
          data-role="arrow"
          class="lifecycle-edge"
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          d={getEdgePath(edge, foundationModelDemo.nodes)}
          marker-end={isEdgeActive(currentStep, edge.id)
            ? "url(#foundation-arrow-active)"
            : "url(#foundation-arrow)"}
        />
      {/each}

      {#each foundationModelDemo.nodes as node}
        <g
          id={`foundation-node-${node.id}`}
          data-role="node"
          class:node-active={isNodeActive(currentStep, node.id)}
          class:node-muted={!isNodeActive(currentStep, node.id)}
          class:node-current={currentStep.nodeId === node.id}
          class:node-boundary={currentStep.findingTone === "boundary" &&
            isNodeActive(currentStep, node.id)}
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

  <div class="result-grid" aria-live="polite">
    <section
      class={`finding ${currentStep.findingTone}`}
      data-foundation-status={currentStep.findingTone}
    >
      <span>{copy.findingLabel}</span>
      <strong>{currentStep.statusLabel}</strong>
      <p>{currentStep.finding}</p>
    </section>
    <section class="output-preview" data-testid="foundation-output-preview">
      <span>{copy.previewLabel}</span>
      <strong>{currentStep.outputTitle}</strong>
      <p>{currentStep.outputPreview}</p>
    </section>
  </div>
</DemoShell>

<style>
  .phase-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .phase-legend span {
    padding: 7px 12px;
    border-radius: 999px;
    font-size: 0.86rem;
    font-weight: 760;
  }

  .phase-legend .training {
    color: var(--color-blue, #3469a6);
    background: #eef4fb;
  }

  .phase-legend .inference {
    color: var(--color-green, #2f7d5b);
    background: #eaf6ef;
  }

  .training-zone {
    fill: #f6f9fd;
    stroke: #c9d9ec;
    stroke-dasharray: 8 8;
  }

  .inference-zone {
    fill: #f2faf5;
    stroke: #c7dfd1;
    stroke-dasharray: 8 8;
  }

  .lifecycle-edge {
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
    opacity: 0.2;
  }

  g rect {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    transition:
      fill 180ms ease,
      stroke 180ms ease,
      opacity 180ms ease;
  }

  .node-active rect {
    fill: #eef4fb;
    stroke: var(--color-blue, #3469a6);
  }

  .node-current rect {
    fill: #eef8f2;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 4;
  }

  .node-boundary rect {
    fill: #fff8e8;
    stroke: var(--color-amber, #b87918);
  }

  .node-muted {
    opacity: 0.34;
  }

  text {
    fill: var(--color-ink, #17201d);
    font-size: 11px;
    font-weight: 760;
  }

  .node-caption {
    fill: var(--color-muted, #5f6864);
    font-size: 9px;
    font-weight: 620;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 18px;
  }

  .finding,
  .output-preview {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-left: 4px solid var(--color-blue, #3469a6);
    border-radius: 8px;
    background: white;
  }

  .finding.boundary {
    border-left-color: var(--color-amber, #b87918);
  }

  .output-preview {
    border-left-color: var(--color-green, #2f7d5b);
    background: #f7faf8;
  }

  .finding span,
  .output-preview span {
    display: block;
    color: var(--color-muted, #5f6864);
    font-size: 0.84rem;
    font-weight: 720;
  }

  .finding strong,
  .output-preview strong {
    display: block;
    margin-top: 4px;
    color: var(--color-blue, #3469a6);
  }

  .output-preview strong {
    color: var(--color-green, #2f7d5b);
  }

  .finding p,
  .output-preview p {
    margin: 8px 0 0;
    overflow-wrap: anywhere;
    color: var(--color-ink, #17201d);
  }

  @media (max-width: 760px) {
    .result-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
