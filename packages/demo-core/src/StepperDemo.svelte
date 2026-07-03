<script lang="ts">
  import { getNextStepIndex, getPreviousStepIndex } from "./stepperState";
  import type { DemoStep } from "./types";

  export let steps: DemoStep[];

  export let currentIndex = 0;
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
    <button type="button" on:click={previous} disabled={isFirst}>上一步</button>
    <button type="button" on:click={next} disabled={isLast}>下一步</button>
  </div>
</div>

<style>
  .stepper {
    display: grid;
    gap: 18px;
    margin-top: 24px;
  }

  .step-scene {
    min-width: 0;
  }

  .step-scene :global(.svg-scene-shell) {
    margin-top: 0;
  }

  .step-content {
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
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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

  @media (max-width: 560px) {
    .stepper {
      grid-template-areas:
        "content"
        "controls"
        "scene";
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
