<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { getCnnKernelDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";

  export let locale: Locale = "zh-CN";

  let activeKernelId = "edge";
  let stepIndex = 0;
  $: cnnKernelDemo = getCnnKernelDemo(locale);
  $: activityTitle = getLocalizedLearningChapter("cnn", locale).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          kernelAriaLabel: "Kernel selection",
          imageGridAriaLabel: "Input image grid",
          kernelMatrixAriaLabel: "Kernel matrix",
          featureMapAriaLabel: "Feature map",
          responseLabel: "Current window response",
          explanationSeparator: ". ",
        }
      : {
          kernelAriaLabel: "卷积核选择",
          imageGridAriaLabel: "输入图像网格",
          kernelMatrixAriaLabel: "卷积核矩阵",
          featureMapAriaLabel: "特征图",
          responseLabel: "当前窗口响应",
          explanationSeparator: "。",
        };
  $: activeKernel =
    cnnKernelDemo.kernels.find((kernel) => kernel.id === activeKernelId) ??
    cnnKernelDemo.kernels[0];
  $: activeStep = cnnKernelDemo.scanSteps[stepIndex];
  $: response = activeKernel.matrix
    .flatMap((row, y) =>
      row.map(
        (value, x) =>
          value * cnnKernelDemo.imageGrid[activeStep.y + y][activeStep.x + x],
      ),
    )
    .reduce((sum, value) => sum + value, 0);

  function nextStep() {
    stepIndex = Math.min(cnnKernelDemo.scanSteps.length - 1, stepIndex + 1);
  }
</script>

<DemoShell
  title={activityTitle ?? cnnKernelDemo.title}
  question={cnnKernelDemo.question}
  simplificationNote={cnnKernelDemo.simplificationNote}
  learningGoals={cnnKernelDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div class="kernel-buttons" aria-label={copy.kernelAriaLabel}>
    {#each cnnKernelDemo.kernels as kernel}
      <button
        type="button"
        class:active={kernel.id === activeKernelId}
        on:click={() => (activeKernelId = kernel.id)}
      >
        {kernel.label}
      </button>
    {/each}
    <button
      type="button"
      on:click={nextStep}
      disabled={stepIndex === cnnKernelDemo.scanSteps.length - 1}
    >
      {demoCoreCopy.nextLabel}
    </button>
  </div>

  <div class="cnn-grid">
    <div class="image-grid" aria-label={copy.imageGridAriaLabel}>
      {#each cnnKernelDemo.imageGrid as row, y}
        {#each row as value, x}
          <span
            class:active={x >= activeStep.x &&
              x < activeStep.x + 3 &&
              y >= activeStep.y &&
              y < activeStep.y + 3}
            style={`opacity: ${0.28 + value * 0.62}`}
          ></span>
        {/each}
      {/each}
    </div>

    <div class="kernel-matrix" aria-label={copy.kernelMatrixAriaLabel}>
      {#each activeKernel.matrix as row}
        {#each row as value}
          <span>{value}</span>
        {/each}
      {/each}
    </div>

    <div class="feature-map" aria-label={copy.featureMapAriaLabel}>
      {#each cnnKernelDemo.scanSteps as step, index}
        <span class:filled={index <= stepIndex}
          >{index <= stepIndex ? response : ""}</span
        >
      {/each}
    </div>
  </div>

  <section class="explanation" aria-live="polite">
    <span>{copy.responseLabel}: {response}</span>
    <h3>{activeStep.title}</h3>
    <p>
      {activeKernel.title}{copy.explanationSeparator}{activeStep.description}
    </p>
  </section>
</DemoShell>

<style>
  .kernel-buttons {
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

  button.active,
  button:last-child {
    color: white;
    background: var(--color-green, #2f7d5b);
    border-color: var(--color-green, #2f7d5b);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .cnn-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 0.8fr;
    gap: 18px;
    margin-top: 20px;
  }

  .image-grid,
  .kernel-matrix,
  .feature-map {
    display: grid;
    gap: 6px;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .image-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .kernel-matrix,
  .feature-map {
    grid-template-columns: repeat(3, 1fr);
  }

  .image-grid span,
  .kernel-matrix span,
  .feature-map span {
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 6px;
    background: var(--color-blue, #3469a6);
    color: white;
    font-weight: 760;
  }

  .image-grid span.active {
    outline: 3px solid var(--color-coral, #c6543f);
  }

  .kernel-matrix span {
    background: #f0f4f2;
    color: var(--color-ink, #17201d);
  }

  .feature-map span {
    background: #e8ece8;
    color: var(--color-ink, #17201d);
  }

  .feature-map span.filled {
    background: #eaf6ef;
  }

  .explanation {
    min-height: 134px;
    margin-top: 18px;
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: #f7faf8;
  }

  .explanation span {
    color: var(--color-green, #2f7d5b);
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

  @media (max-width: 820px) {
    .cnn-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
