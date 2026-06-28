<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import { decisionBoundaryDemo } from "@ai-history/data";

  let activeModeId = "linear";
  let outlierY = 94;
  $: activeMode = decisionBoundaryDemo.modes.find((mode) => mode.id === activeModeId) ?? decisionBoundaryDemo.modes[0];
</script>

<DemoShell
  title={decisionBoundaryDemo.title}
  question={decisionBoundaryDemo.question}
  simplificationNote={decisionBoundaryDemo.simplificationNote}
>
  <div class="mode-buttons" aria-label="边界模式">
    {#each decisionBoundaryDemo.modes as mode}
      <button type="button" class:active={mode.id === activeModeId} on:click={() => (activeModeId = mode.id)}>
        {mode.label}
      </button>
    {/each}
  </div>

  <SvgScene label="Decision boundary comparison" viewBox="0 0 700 380">
    <rect class="plot" x="54" y="40" width="590" height="300" rx="8"></rect>
    <path id={`boundary-${activeMode.id}`} class="boundary" d={activeMode.path}></path>
    {#each decisionBoundaryDemo.points as point}
      <circle class={point.className} cx={point.x} cy={point.y} r="13"></circle>
    {/each}
    <circle id="outlier-point" class="negative outlier" cx="470" cy={outlierY} r="15"></circle>
    <text x="470" y={outlierY - 24} text-anchor="middle">{decisionBoundaryDemo.outlierLabel}</text>
  </SvgScene>

  <label class="outlier-control">
    <span>{decisionBoundaryDemo.outlierLabel}: y={outlierY}</span>
    <input type="range" min="78" max="260" bind:value={outlierY} />
  </label>

  <section class="explanation" aria-live="polite">
    <h3>{activeMode.title}</h3>
    <p>{activeMode.description}</p>
  </section>
</DemoShell>

<style>
  .mode-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  button {
    min-height: 40px;
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
    background: var(--color-amber, #b87918);
    border-color: var(--color-amber, #b87918);
  }

  .plot {
    fill: #fbfbf8;
    stroke: var(--color-line, #d7ddd7);
  }

  .boundary {
    fill: none;
    stroke: var(--color-amber, #b87918);
    stroke-width: 5;
    stroke-linecap: round;
  }

  circle {
    stroke: white;
    stroke-width: 3;
  }

  .positive {
    fill: var(--color-green, #2f7d5b);
  }

  .negative {
    fill: var(--color-blue, #3469a6);
  }

  .outlier {
    fill: var(--color-coral, #c6543f);
  }

  text {
    fill: var(--color-muted, #5f6864);
    font-size: 12px;
    font-weight: 760;
  }

  .outlier-control,
  .explanation {
    display: block;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .outlier-control span {
    display: block;
    margin-bottom: 10px;
    font-weight: 760;
  }

  input {
    width: 100%;
    accent-color: var(--color-coral, #c6543f);
  }

  .explanation {
    background: #f7faf8;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--color-muted, #5f6864);
  }
</style>
