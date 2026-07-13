<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import { getSearchTreeDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";

  export let locale: Locale = "zh-CN";

  let activeStrategyId = "bfs";
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
          sceneLabel: "Search tree strategy comparison",
        }
      : {
          strategyAriaLabel: "搜索策略",
          sceneLabel: "搜索树策略比较",
        };
  $: activeStrategy =
    searchTreeDemo.strategies.find(
      (strategy) => strategy.id === activeStrategyId,
    ) ?? searchTreeDemo.strategies[0];
  $: nodeById = Object.fromEntries(
    searchTreeDemo.nodes.map((node) => [node.id, node]),
  );

  function isActiveNode(id: string) {
    return activeStrategy.activeNodeIds.includes(id);
  }

  function isActiveEdge(id: string) {
    return activeStrategy.activeEdgeIds.includes(id);
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
  <div class="strategy-buttons" aria-label={copy.strategyAriaLabel}>
    {#each searchTreeDemo.strategies as strategy}
      <button
        type="button"
        class:active={strategy.id === activeStrategyId}
        on:click={() => (activeStrategyId = strategy.id)}
      >
        {strategy.label}
      </button>
    {/each}
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
      <line
        id={`search-edge-${edge.id}`}
        class:edge-active={isActiveEdge(edge.id)}
        class:edge-muted={!isActiveEdge(edge.id)}
        x1={from.x}
        y1={from.y + 26}
        x2={to.x}
        y2={to.y - 26}
      />
    {/each}
    {#each searchTreeDemo.nodes as node}
      <g
        class:node-active={isActiveNode(node.id)}
        class:node-muted={!isActiveNode(node.id)}
      >
        <circle id={`search-node-${node.id}`} cx={node.x} cy={node.y} r="28"
        ></circle>
        <text x={node.x} y={node.y + 5} text-anchor="middle">{node.label}</text>
      </g>
    {/each}
  </SvgScene>

  <section class="explanation" aria-live="polite">
    <span>{activeStrategy.frontierLabel}</span>
    <h3>{activeStrategy.title}</h3>
    <p>{activeStrategy.description}</p>
  </section>
</DemoShell>

<style>
  .strategy-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
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

  button.active {
    color: white;
    background: var(--color-green, #2f7d5b);
    border-color: var(--color-green, #2f7d5b);
  }

  line {
    stroke: #9ba9a1;
    stroke-width: 3;
    transition:
      opacity 160ms ease,
      stroke 160ms ease;
  }

  .edge-active {
    stroke: var(--color-green, #2f7d5b);
    opacity: 1;
  }

  .edge-muted {
    opacity: 0.22;
  }

  circle {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
  }

  .node-active circle {
    fill: #eaf6ef;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 4;
  }

  .node-muted {
    opacity: 0.5;
  }

  text {
    fill: var(--color-ink, #17201d);
    font-size: 15px;
    font-weight: 780;
  }

  .explanation {
    min-height: 138px;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f7faf8;
  }

  .explanation span {
    color: var(--color-blue, #3469a6);
    font-weight: 760;
  }

  h3 {
    margin: 6px 0 8px;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }
</style>
