<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import type { SearchAlgorithm, SearchTreeNode } from "@ai-history/demo-core";
  import { getSearchTreeDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import {
    runSearch,
    type SearchFrontierEntry,
    type SearchStepState,
  } from "./searchState";

  export let locale: Locale = "zh-CN";

  const startNodeId = "start";
  const goalNodeId = "goal";
  let activeStrategyId: SearchAlgorithm = "bfs";
  let stepIndex = 0;

  $: searchTreeDemo = getSearchTreeDemo(locale);
  $: activityTitle = getLocalizedLearningChapter(
    "search",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          strategyAriaLabel: "Search strategy",
          sceneLabel: "Search tree algorithm walkthrough",
          legendLabel: "Search node states",
          currentLegend: "Current",
          expandedLegend: "Expanded",
          frontierLegend: "Frontier",
          pathLegend: "Final path",
          frontierCountLabel: "Frontier size",
          expandedCountLabel: "Expanded total",
          frontierPeakLabel: "Frontier peak",
          expansionOrderLabel: "Expansion order",
          frontierOrderLabel: "Frontier order",
          emptyFrontierLabel: "empty",
          currentScoreLabel: "Current score",
          foundLabel: "Goal popped from the frontier",
          unreachableLabel: "Goal unreachable",
          pathLabel: "Final path",
          pathCostLabel: "Path cost",
          growthLabel: "Combinatorial growth",
          growthDescription:
            "With branching factor b and depth d, a uniform search layer grows on the order of b^d.",
          controlsLabel: "Search walkthrough controls",
          stepLabel: "Step",
        }
      : {
          strategyAriaLabel: "搜索策略",
          sceneLabel: "搜索树算法逐步演示",
          legendLabel: "搜索节点状态",
          currentLegend: "当前节点",
          expandedLegend: "已展开",
          frontierLegend: "frontier",
          pathLegend: "最终路径",
          frontierCountLabel: "frontier 数量",
          expandedCountLabel: "累计展开数",
          frontierPeakLabel: "frontier 峰值",
          expansionOrderLabel: "展开序列",
          frontierOrderLabel: "frontier 顺序",
          emptyFrontierLabel: "空",
          currentScoreLabel: "当前评分",
          foundLabel: "Goal 已从 frontier 取出",
          unreachableLabel: "目标不可达",
          pathLabel: "最终路径",
          pathCostLabel: "路径成本",
          growthLabel: "组合增长",
          growthDescription:
            "若平均分支数为 b、目标深度为 d，均匀搜索到该层的状态量级约为 b^d。",
          controlsLabel: "搜索演示步进控制",
          stepLabel: "步骤",
        };
  $: activeStrategy =
    searchTreeDemo.strategies.find(
      (strategy) => strategy.id === activeStrategyId,
    ) ?? searchTreeDemo.strategies[0]!;
  $: searchRun = runSearch({
    nodes: searchTreeDemo.nodes,
    edges: searchTreeDemo.edges,
    algorithm: activeStrategy.id,
    startNodeId,
    goalNodeId,
  });
  $: activeStep = searchRun.steps[stepIndex] ?? searchRun.steps[0]!;
  $: nodeById = Object.fromEntries(
    searchTreeDemo.nodes.map((node) => [node.id, node]),
  ) as Record<string, SearchTreeNode>;
  $: scoreByNodeId = Object.fromEntries(
    activeStep.nodeScores.map((score) => [score.nodeId, score]),
  ) as Record<string, SearchFrontierEntry>;
  $: maxBranchingFactor = getMaxBranchingFactor(searchTreeDemo.nodes);
  $: goalDepth = Math.max(0, searchRun.pathNodeIds.length - 1);
  $: theoreticalGrowth = maxBranchingFactor ** goalDepth;

  function getMaxBranchingFactor(nodes: SearchTreeNode[]) {
    const counts = new Map(nodes.map((node) => [node.id, 0]));

    for (const edge of searchTreeDemo.edges) {
      counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
    }

    return Math.max(0, ...counts.values());
  }

  function getNodeLabel(id: string) {
    return nodeById[id]?.label ?? id;
  }

  function isCurrentNode(step: SearchStepState, id: string) {
    return step.current.nodeId === id;
  }

  function isExpandedNode(step: SearchStepState, id: string) {
    return step.expandedNodeIds.includes(id) && !isCurrentNode(step, id);
  }

  function isFrontierNode(step: SearchStepState, id: string) {
    return step.frontier.some((entry) => entry.nodeId === id);
  }

  function isPathNode(step: SearchStepState, id: string) {
    return step.status === "found" && step.pathNodeIds.includes(id);
  }

  function getNodeState(step: SearchStepState, id: string) {
    if (isCurrentNode(step, id)) return "current";
    if (isPathNode(step, id)) return "path";
    if (isFrontierNode(step, id)) return "frontier";
    if (isExpandedNode(step, id)) return "expanded";
    return "idle";
  }

  function isDiscoveredEdge(step: SearchStepState, id: string) {
    return step.discoveredEdgeIds.includes(id);
  }

  function isPathEdge(step: SearchStepState, id: string) {
    return step.status === "found" && step.pathEdgeIds.includes(id);
  }

  function selectStrategy(strategyId: SearchAlgorithm) {
    activeStrategyId = strategyId;
    stepIndex = 0;
  }

  function previousStep() {
    stepIndex = Math.max(0, stepIndex - 1);
  }

  function nextStep() {
    stepIndex = Math.min(searchRun.steps.length - 1, stepIndex + 1);
  }

  function formatFrontierEntry(entry: SearchFrontierEntry) {
    const label = getNodeLabel(entry.nodeId);

    return activeStrategyId === "astar"
      ? `${label} (g=${entry.g} h=${entry.h} f=${entry.f})`
      : label;
  }
</script>

<DemoShell
  title={activityTitle ?? searchTreeDemo.title}
  question={searchTreeDemo.question}
  simplificationNote={searchTreeDemo.simplificationNote}
  learningGoals={searchTreeDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div
    class="strategy-buttons"
    role="group"
    aria-label={copy.strategyAriaLabel}
  >
    {#each searchTreeDemo.strategies as strategy}
      <button
        type="button"
        class:active={strategy.id === activeStrategyId}
        aria-pressed={strategy.id === activeStrategyId}
        on:click={() => selectStrategy(strategy.id)}
      >
        {strategy.label}
      </button>
    {/each}
  </div>

  <div class="legend" aria-label={copy.legendLabel}>
    <span><i class="legend-swatch current"></i>{copy.currentLegend}</span>
    <span><i class="legend-swatch expanded"></i>{copy.expandedLegend}</span>
    <span><i class="legend-swatch frontier"></i>{copy.frontierLegend}</span>
    <span><i class="legend-swatch path"></i>{copy.pathLegend}</span>
  </div>

  <SvgScene
    label={copy.sceneLabel}
    viewBox="0 0 840 360"
    fitLabel={demoCoreCopy.fitLabel}
    detailLabel={demoCoreCopy.detailLabel}
    scrollSuffix={demoCoreCopy.scrollSuffix}
  >
    {#each searchTreeDemo.edges as edge}
      {@const from = nodeById[edge.from]}
      {@const to = nodeById[edge.to]}
      <g>
        <line
          id={`search-edge-${edge.id}`}
          data-search-state={isPathEdge(activeStep, edge.id)
            ? "path"
            : isDiscoveredEdge(activeStep, edge.id)
              ? "discovered"
              : "idle"}
          class:edge-path={isPathEdge(activeStep, edge.id)}
          class:edge-discovered={isDiscoveredEdge(activeStep, edge.id)}
          class:edge-idle={!isDiscoveredEdge(activeStep, edge.id)}
          x1={from.x}
          y1={from.y + 26}
          x2={to.x}
          y2={to.y - 26}
        />
        <text
          class="edge-cost"
          x={(from.x + to.x) / 2}
          y={from.y * 0.3 + to.y * 0.7 - 2}
          text-anchor="middle">c={edge.cost}</text
        >
      </g>
    {/each}
    {#each searchTreeDemo.nodes as node}
      {@const nodeState = getNodeState(activeStep, node.id)}
      {@const score = scoreByNodeId[node.id]}
      <g
        data-search-state={nodeState}
        data-search-path={isPathNode(activeStep, node.id)}
        class:node-current={isCurrentNode(activeStep, node.id)}
        class:node-expanded={isExpandedNode(activeStep, node.id)}
        class:node-frontier={isFrontierNode(activeStep, node.id)}
        class:node-path={isPathNode(activeStep, node.id)}
        class:node-idle={nodeState === "idle"}
      >
        <circle id={`search-node-${node.id}`} cx={node.x} cy={node.y} r="28"
        ></circle>
        <text class="node-label" x={node.x} y={node.y + 5} text-anchor="middle"
          >{node.label}</text
        >
        {#if activeStrategyId === "astar"}
          <text
            class="node-score"
            x={node.x}
            y={node.y + 46}
            text-anchor="middle"
            >{score
              ? `g=${score.g} h=${score.h} f=${score.f}`
              : `g=– h=${node.heuristicCost} f=–`}</text
          >
        {/if}
      </g>
    {/each}
  </SvgScene>

  <section class="explanation" aria-live="polite">
    <div class="status-metrics">
      <div>
        <span>{copy.frontierCountLabel}</span>
        <strong>{activeStep.frontier.length}</strong>
      </div>
      <div>
        <span>{copy.expandedCountLabel}</span>
        <strong>{activeStep.expandedNodeIds.length}</strong>
      </div>
      <div>
        <span>{copy.frontierPeakLabel}</span>
        <strong>{activeStep.frontierPeak}</strong>
      </div>
    </div>

    <p class="state-line">
      <strong>{copy.expansionOrderLabel}:</strong>
      {activeStep.expandedNodeIds.map(getNodeLabel).join(" → ")}
    </p>
    <p class="state-line">
      <strong>{copy.frontierOrderLabel}:</strong>
      {activeStep.frontier.length > 0
        ? activeStep.frontier.map(formatFrontierEntry).join(" → ")
        : copy.emptyFrontierLabel}
    </p>

    {#if activeStrategyId === "astar"}
      <p class="state-line score-line">
        <strong>{copy.currentScoreLabel}:</strong>
        {getNodeLabel(activeStep.current.nodeId)}
        g={activeStep.current.g} h={activeStep.current.h} f={activeStep.current
          .f}
      </p>
    {/if}

    <p class="growth-note">
      <strong>{copy.growthLabel}:</strong>
      {copy.growthDescription} b={maxBranchingFactor}, d={goalDepth}, b^d =
      {maxBranchingFactor}^{goalDepth} = {theoreticalGrowth}.
    </p>

    {#if activeStep.status === "found"}
      <p class="result-note found">
        <strong>{copy.foundLabel}.</strong>
        {copy.pathLabel}: {activeStep.pathNodeIds
          .map(getNodeLabel)
          .join(" → ")};
        {copy.pathCostLabel}: {activeStep.pathCost}
      </p>
    {:else if activeStep.status === "unreachable"}
      <p class="result-note unreachable">
        <strong>{copy.unreachableLabel}:</strong>
        frontier {copy.emptyFrontierLabel}.
      </p>
    {/if}

    <h3>{activeStrategy.title}</h3>
    <p class="strategy-description">{activeStrategy.description}</p>
  </section>

  <div class="step-controls" role="group" aria-label={copy.controlsLabel}>
    <button type="button" on:click={previousStep} disabled={stepIndex === 0}
      >{demoCoreCopy.previousLabel}</button
    >
    <span>{copy.stepLabel} {stepIndex + 1} / {searchRun.steps.length}</span>
    <button
      type="button"
      on:click={nextStep}
      disabled={stepIndex === searchRun.steps.length - 1}
      >{demoCoreCopy.nextLabel}</button
    >
  </div>
</DemoShell>

<style>
  .strategy-buttons,
  .legend,
  .step-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .strategy-buttons {
    margin-top: 20px;
  }

  button {
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  button.active,
  .step-controls button:last-child {
    color: white;
    background: var(--color-green, #2f7d5b);
    border-color: var(--color-green, #2f7d5b);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .legend {
    margin-top: 14px;
    color: var(--color-muted, #5f6864);
    font-size: 0.88rem;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .legend-swatch {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-line, #d7ddd7);
    border-radius: 50%;
    background: white;
  }

  .legend-swatch.current {
    border-color: var(--color-blue, #3469a6);
    background: #eaf2fb;
  }

  .legend-swatch.expanded {
    border-color: var(--color-green, #2f7d5b);
    background: #eaf6ef;
  }

  .legend-swatch.frontier {
    border-color: var(--color-blue, #3469a6);
    border-style: dashed;
  }

  .legend-swatch.path {
    border-color: var(--color-coral, #c6543f);
    background: #fff0ed;
  }

  line {
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 160ms ease,
      stroke 160ms ease,
      stroke-width 160ms ease;
  }

  .edge-discovered {
    stroke: var(--color-green, #2f7d5b);
    opacity: 0.72;
  }

  .edge-path {
    stroke: var(--color-coral, #c6543f);
    stroke-width: 5;
    opacity: 1;
  }

  .edge-idle {
    opacity: 0.2;
  }

  .edge-cost {
    fill: var(--color-muted, #5f6864);
    stroke: #fbfbf8;
    stroke-width: 4px;
    paint-order: stroke;
    font-size: 10px;
    font-weight: 760;
  }

  circle {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    transition:
      fill 160ms ease,
      stroke 160ms ease,
      stroke-width 160ms ease,
      opacity 160ms ease;
  }

  .node-expanded circle {
    fill: #eaf6ef;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 3;
  }

  .node-frontier circle {
    fill: white;
    stroke: var(--color-blue, #3469a6);
    stroke-width: 3;
    stroke-dasharray: 6 4;
  }

  .node-path circle {
    fill: #fff0ed;
    stroke: var(--color-coral, #c6543f);
    stroke-width: 4;
  }

  .node-current circle {
    fill: #eaf2fb;
    stroke: var(--color-blue, #3469a6);
    stroke-width: 5;
    stroke-dasharray: none;
  }

  .node-idle {
    opacity: 0.52;
  }

  .node-label {
    fill: var(--color-ink, #17201d);
    font-size: 15px;
    font-weight: 780;
  }

  .node-score {
    fill: var(--color-muted, #5f6864);
    stroke: #fbfbf8;
    stroke-width: 3px;
    paint-order: stroke;
    font-size: 10px;
    font-weight: 700;
  }

  .explanation {
    min-height: 138px;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f7faf8;
  }

  .status-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .status-metrics div {
    display: grid;
    gap: 3px;
    padding: 10px 12px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .status-metrics span {
    color: var(--color-muted, #5f6864);
    font-size: 0.78rem;
    font-weight: 680;
  }

  .status-metrics strong {
    color: var(--color-blue, #3469a6);
    font-size: 1.15rem;
  }

  .state-line,
  .growth-note,
  .result-note {
    margin: 12px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .state-line strong,
  .growth-note strong {
    color: var(--color-ink, #17201d);
  }

  .score-line {
    color: var(--color-blue, #3469a6);
    font-variant-numeric: tabular-nums;
  }

  .growth-note {
    padding-top: 10px;
    border-top: 1px solid var(--color-line, #d7ddd7);
    font-size: 0.92rem;
  }

  .result-note {
    padding: 10px 12px;
    border-radius: 8px;
  }

  .result-note.found {
    color: #7e352a;
    background: #fff0ed;
  }

  .result-note.unreachable {
    color: #7b3a32;
    background: #f8e7e4;
  }

  h3 {
    margin: 16px 0 8px;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  .strategy-description {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }

  .step-controls {
    justify-content: flex-end;
    margin-top: 14px;
  }

  .step-controls span {
    min-width: 96px;
    color: var(--color-muted, #5f6864);
    text-align: center;
    font-weight: 720;
  }

  @media (max-width: 640px) {
    .status-metrics {
      grid-template-columns: 1fr;
    }

    .step-controls {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
    }

    .step-controls button {
      min-width: 0;
    }
  }
</style>
