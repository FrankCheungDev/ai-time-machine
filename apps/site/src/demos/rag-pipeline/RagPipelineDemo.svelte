<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import { getRagPipelineDemo, type Locale } from "@ai-history/data";
  import type { DemoStep } from "@ai-history/demo-core";
  import { gsap } from "gsap";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";

  export let locale: Locale = "zh-CN";

  const positions: Record<string, { x: number; y: number }> = {
    query: { x: 36, y: 164 },
    embedding: { x: 166, y: 164 },
    "vector-db": { x: 306, y: 164 },
    reranker: { x: 456, y: 164 },
    prompt: { x: 596, y: 164 },
    llm: { x: 718, y: 164 },
    answer: { x: 824, y: 164 },
  };

  const englishDiagramCaptions: Record<string, string> = {
    query: "Ask question",
    embedding: "Encode query",
    "vector-db": "Find passages",
    reranker: "Rank passages",
    prompt: "Build prompt",
    llm: "Use context",
    answer: "Grounded answer",
  };

  const nodeWidth = 100;
  const nodeHeight = 74;
  const initialDemo = getRagPipelineDemo();
  let selectedScenarioId = initialDemo.scenarios?.[1]?.id ?? "";

  $: ragPipelineDemo = getRagPipelineDemo(locale);
  $: activityTitle = getLocalizedLearningChapter("rag", locale).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          sceneLabel: "RAG pipeline flow diagram",
          scenarioLabel: "Retrieval scenario",
        }
      : {
          sceneLabel: "RAG Pipeline 流程图",
          scenarioLabel: "检索场景",
        };
  $: selectedScenario =
    ragPipelineDemo.scenarios?.find(
      (scenario) => scenario.id === selectedScenarioId,
    ) ?? ragPipelineDemo.scenarios?.[0];

  function isActive(step: DemoStep, id: string) {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(step: DemoStep, id: string) {
    return step.activeEdgeIds.includes(id);
  }

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function drawIn(node: SVGLineElement, active: boolean) {
    function update(isActive: boolean) {
      if (!isActive) return;

      if (prefersReducedMotion()) {
        gsap.set(node, { strokeDasharray: "0", strokeDashoffset: 0 });
        return;
      }

      gsap.fromTo(
        node,
        { strokeDasharray: "18 10", strokeDashoffset: 28 },
        {
          strokeDashoffset: 0,
          duration: 0.42,
          ease: "power2.out",
          overwrite: true,
        },
      );
    }

    update(active);

    return { update };
  }
</script>

<DemoShell
  title={activityTitle ?? ragPipelineDemo.title}
  question={ragPipelineDemo.question}
  simplificationNote={ragPipelineDemo.simplificationNote}
  learningGoals={ragPipelineDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <StepperDemo
    steps={ragPipelineDemo.steps}
    previousLabel={demoCoreCopy.previousLabel}
    nextLabel={demoCoreCopy.nextLabel}
    let:currentStep
  >
    <SvgScene
      label={copy.sceneLabel}
      fitLabel={demoCoreCopy.fitLabel}
      detailLabel={demoCoreCopy.detailLabel}
      scrollSuffix={demoCoreCopy.scrollSuffix}
    >
      <defs>
        <marker
          id="rag-arrow"
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

      {#each ragPipelineDemo.edges as edge}
        {@const from = positions[edge.from]}
        {@const to = positions[edge.to]}
        <line
          id={`arrow-${edge.id}`}
          data-role="arrow"
          data-motion={isEdgeActive(currentStep, edge.id) ? "draw-in" : "idle"}
          use:drawIn={isEdgeActive(currentStep, edge.id)}
          class:edge-active={isEdgeActive(currentStep, edge.id)}
          class:edge-muted={!isEdgeActive(currentStep, edge.id)}
          x1={from.x + nodeWidth}
          y1={from.y + nodeHeight / 2}
          x2={to.x}
          y2={to.y + nodeHeight / 2}
          marker-end="url(#rag-arrow)"
        />
      {/each}

      {#each ragPipelineDemo.nodes as node}
        {@const position = positions[node.id]}
        <g
          id={`node-${node.id}`}
          data-role="node"
          class:node-active={isActive(currentStep, node.id)}
          class:node-muted={!isActive(currentStep, node.id)}
        >
          <rect
            x={position.x}
            y={position.y}
            width={nodeWidth}
            height={nodeHeight}
            rx="8"
          ></rect>
          <text
            class="node-label"
            x={position.x + nodeWidth / 2}
            y={position.y + 30}
            text-anchor="middle">{node.label}</text
          >
          <text
            class="node-caption"
            x={position.x + nodeWidth / 2}
            y={position.y + 52}
            text-anchor="middle"
            >{locale === "en"
              ? (englishDiagramCaptions[node.id] ?? node.description)
              : node.description}</text
          >
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>

  {#if ragPipelineDemo.scenarios?.length && selectedScenario}
    <section class="scenario-panel" aria-labelledby="rag-scenario-title">
      <div class="scenario-control">
        <label for="rag-scenario">{copy.scenarioLabel}</label>
        <select id="rag-scenario" bind:value={selectedScenarioId}>
          {#each ragPipelineDemo.scenarios as scenario}
            <option value={scenario.id}>{scenario.label}</option>
          {/each}
        </select>
      </div>

      <article class="scenario-result">
        <span>{selectedScenario.label}</span>
        <h3 id="rag-scenario-title">{selectedScenario.title}</h3>
        <p>{selectedScenario.description}</p>
        <p class="answer-preview">{selectedScenario.answerPreview}</p>
        <small>{selectedScenario.riskNote}</small>
      </article>
    </section>
  {/if}
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
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 5;
    opacity: 1;
  }

  .edge-muted {
    opacity: 0.34;
  }

  g {
    transition:
      opacity 160ms ease,
      transform 160ms ease;
  }

  rect {
    fill: white;
    stroke: var(--color-line, #d7ddd7);
    stroke-width: 2;
    filter: drop-shadow(0 10px 18px rgba(30, 45, 39, 0.08));
  }

  .node-active rect {
    fill: #eaf6ef;
    stroke: var(--color-green, #2f7d5b);
    stroke-width: 3;
  }

  .node-muted {
    opacity: 0.46;
  }

  .node-label {
    fill: var(--color-ink, #17201d);
    font-size: 16px;
    font-weight: 780;
  }

  .node-caption {
    fill: var(--color-muted, #5f6864);
    font-size: 10px;
  }

  .scenario-panel {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 14px;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #fffaf0;
  }

  .scenario-control {
    display: grid;
    align-content: start;
    gap: 8px;
  }

  label {
    color: var(--color-blue, #3469a6);
    font-weight: 760;
  }

  select {
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
  }

  .scenario-result {
    display: grid;
    gap: 8px;
  }

  .scenario-result span {
    width: fit-content;
    padding: 3px 8px;
    color: var(--color-amber, #b87918);
    border: 1px solid rgba(184, 121, 24, 0.32);
    border-radius: 8px;
    font-size: 0.86rem;
    font-weight: 760;
  }

  .scenario-result h3,
  .scenario-result p {
    margin: 0;
  }

  .scenario-result h3 {
    font-size: 1.1rem;
    letter-spacing: 0;
  }

  .answer-preview {
    color: var(--color-ink, #17201d);
    font-weight: 680;
  }

  .scenario-result small {
    color: var(--color-muted, #5f6864);
  }

  @media (max-width: 680px) {
    .scenario-panel {
      grid-template-columns: 1fr;
    }
  }
</style>
