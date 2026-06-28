<script lang="ts">
  import { DemoShell, StepperDemo, SvgScene } from "@ai-history/demo-core";
  import { ragPipelineDemo } from "@ai-history/data";
  import type { DemoStep } from "@ai-history/demo-core";

  const positions: Record<string, { x: number; y: number }> = {
    query: { x: 36, y: 164 },
    embedding: { x: 166, y: 164 },
    "vector-db": { x: 306, y: 164 },
    reranker: { x: 456, y: 164 },
    prompt: { x: 596, y: 164 },
    llm: { x: 718, y: 164 },
    answer: { x: 824, y: 164 }
  };

  const nodeWidth = 100;
  const nodeHeight = 74;

  function isActive(step: DemoStep, id: string) {
    return step.activeNodeIds.includes(id);
  }

  function isEdgeActive(step: DemoStep, id: string) {
    return step.activeEdgeIds.includes(id);
  }
</script>

<DemoShell
  title={ragPipelineDemo.title}
  question={ragPipelineDemo.question}
  simplificationNote={ragPipelineDemo.simplificationNote}
>
  <StepperDemo steps={ragPipelineDemo.steps} let:currentStep>
    <SvgScene label="RAG pipeline flow diagram">
      <defs>
        <marker id="rag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z"></path>
        </marker>
      </defs>

      {#each ragPipelineDemo.edges as edge}
        {@const from = positions[edge.from]}
        {@const to = positions[edge.to]}
        <line
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
        <g class:node-active={isActive(currentStep, node.id)} class:node-muted={!isActive(currentStep, node.id)}>
          <rect x={position.x} y={position.y} width={nodeWidth} height={nodeHeight} rx="8"></rect>
          <text class="node-label" x={position.x + nodeWidth / 2} y={position.y + 30} text-anchor="middle">{node.label}</text>
          <text class="node-caption" x={position.x + nodeWidth / 2} y={position.y + 52} text-anchor="middle">{node.description}</text>
        </g>
      {/each}
    </SvgScene>
  </StepperDemo>
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
</style>
