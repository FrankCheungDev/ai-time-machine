<script lang="ts">
  import { getNextStepIndex, getPreviousStepIndex } from "./stepperState";
  import type { DemoStep } from "./types";

  export let steps: DemoStep[];

  export let currentIndex = 0;
  export let previousLabel = "上一步";
  export let nextLabel = "下一步";
  $: currentStep = steps[currentIndex];
  $: isFirst = currentIndex === 0;
  $: isLast = currentIndex === steps.length - 1;

  function previous() {
    currentIndex = getPreviousStepIndex(currentIndex);
  }

  function next() {
    currentIndex = getNextStepIndex(currentIndex, steps.length);
  }
</script>

<div class="stepper">
  <div class="step-scene">
    <slot {currentStep} {currentIndex} />
  </div>
  <div class="step-content" aria-live="polite">
    <span>{currentIndex + 1} / {steps.length}</span>
    <h3>{currentStep.title}</h3>
    <p>{currentStep.description}</p>
  </div>
  <div class="controls">
    <button type="button" on:click={previous} disabled={isFirst}
      >{previousLabel}</button
    >
    <button type="button" on:click={next} disabled={isLast}>{nextLabel}</button>
  </div>
</div>

<style>
  .stepper {
    display: grid;
    grid-template-areas:
      "scene content"
      "scene controls";
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
    gap: 14px 18px;
    align-items: start;
    margin-top: 24px;
  }

  .step-scene {
    grid-area: scene;
    min-width: 0;
  }

  .step-scene :global(.svg-scene-shell) {
    margin-top: 0;
  }

  .step-content {
    grid-area: content;
    min-height: 142px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f7faf8;
  }

  .step-content span {
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

  .controls {
    grid-area: controls;
    display: flex;
    gap: 10px;
    justify-content: stretch;
  }

  .controls button {
    flex: 1;
  }

  button {
    min-width: 96px;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    color: var(--color-ink, #17201d);
    background: white;
    font: inherit;
    font-weight: 720;
    cursor: pointer;
  }

  button:last-child {
    color: white;
    background: var(--color-green, #2f7d5b);
    border-color: var(--color-green, #2f7d5b);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  @media (max-width: 900px) {
    .stepper {
      grid-template-areas:
        "content"
        "controls"
        "scene";
      grid-template-columns: 1fr;
    }

    .step-scene {
      grid-area: scene;
    }

    .step-content {
      grid-area: content;
      min-height: 0;
    }

    .controls {
      grid-area: controls;
      justify-content: stretch;
    }

    button {
      flex: 1;
    }
  }
</style>
