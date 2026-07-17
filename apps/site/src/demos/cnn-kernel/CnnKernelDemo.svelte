<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { getCnnKernelDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import { calculateFeatureMapResults, formatCnnValue } from "./cnnState";

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
          stepControlsAriaLabel: "Scan step controls",
          imageGridAriaLabel: "Input image grid",
          kernelMatrixAriaLabel: "Kernel matrix",
          featureMapAriaLabel: "Feature map",
          responseLabel: "Current window response",
          weightedSumLabel: "Weighted sum",
          pendingLabel: "not calculated yet",
          currentLabel: "current response",
          insideWindowLabel: "inside the current scan window",
          outsideWindowLabel: "outside the current scan window",
          explanationSeparator: ". ",
        }
      : {
          kernelAriaLabel: "卷积核选择",
          stepControlsAriaLabel: "扫描步骤控制",
          imageGridAriaLabel: "输入图像网格",
          kernelMatrixAriaLabel: "卷积核矩阵",
          featureMapAriaLabel: "特征图",
          responseLabel: "当前窗口响应",
          weightedSumLabel: "加权和",
          pendingLabel: "尚未计算",
          currentLabel: "当前响应",
          insideWindowLabel: "位于当前扫描窗口内",
          outsideWindowLabel: "位于当前扫描窗口外",
          explanationSeparator: "。",
        };
  $: activeKernel =
    cnnKernelDemo.kernels.find((kernel) => kernel.id === activeKernelId) ??
    cnnKernelDemo.kernels[0]!;
  $: activeStep = cnnKernelDemo.scanSteps[stepIndex]!;
  $: featureMapResults = calculateFeatureMapResults(
    cnnKernelDemo.imageGrid,
    activeKernel,
    cnnKernelDemo.scanSteps,
  );
  $: activeResult = featureMapResults[stepIndex] ?? {
    weightedSum: 0,
    normalizationDivisor: activeKernel.normalizationDivisor,
    response: 0,
  };
  $: formattedResponse = formatCnnValue(activeResult.response);
  $: formattedWeightedSum = formatCnnValue(activeResult.weightedSum);
  $: imageGridAccessibleName =
    locale === "en"
      ? `${copy.imageGridAriaLabel}, 5 rows by 5 columns. Scan step ${stepIndex + 1} of ${cnnKernelDemo.scanSteps.length}; the window starts at row ${activeStep.y + 1}, column ${activeStep.x + 1}.`
      : `${copy.imageGridAriaLabel}，5 行 5 列；扫描步骤 ${stepIndex + 1} / ${cnnKernelDemo.scanSteps.length}，窗口从第 ${activeStep.y + 1} 行第 ${activeStep.x + 1} 列开始。`;
  $: kernelMatrixAccessibleName =
    locale === "en"
      ? `${activeKernel.label} ${copy.kernelMatrixAriaLabel.toLowerCase()}, 3 rows by 3 columns${activeKernel.normalizationDivisor === 1 ? "." : `, multiplied by 1/${activeKernel.normalizationDivisor}.`}`
      : `${activeKernel.label}${copy.kernelMatrixAriaLabel}，3 行 3 列${activeKernel.normalizationDivisor === 1 ? "。" : `，整体乘以 1/${activeKernel.normalizationDivisor}。`}`;
  $: featureMapAccessibleName =
    locale === "en"
      ? `${copy.featureMapAriaLabel}, 3 rows by 3 columns. ${stepIndex + 1} of ${cnnKernelDemo.scanSteps.length} positions calculated; current response ${formattedResponse}.`
      : `${copy.featureMapAriaLabel}，3 行 3 列；已计算 ${stepIndex + 1} / ${cnnKernelDemo.scanSteps.length} 个位置，当前响应 ${formattedResponse}。`;

  function selectKernel(kernelId: string) {
    activeKernelId = kernelId;
    stepIndex = 0;
  }

  function previousStep() {
    stepIndex = Math.max(0, stepIndex - 1);
  }

  function nextStep() {
    stepIndex = Math.min(cnnKernelDemo.scanSteps.length - 1, stepIndex + 1);
  }

  function isInsideActiveWindow(x: number, y: number): boolean {
    return (
      x >= activeStep.x &&
      x < activeStep.x + activeKernel.matrix[0]!.length &&
      y >= activeStep.y &&
      y < activeStep.y + activeKernel.matrix.length
    );
  }

  function imageCellAriaLabel(
    rowIndex: number,
    columnIndex: number,
    value: number,
  ): string {
    const positionLabel = isInsideActiveWindow(columnIndex, rowIndex)
      ? copy.insideWindowLabel
      : copy.outsideWindowLabel;

    return locale === "en"
      ? `Row ${rowIndex + 1}, column ${columnIndex + 1}, value ${value}, ${positionLabel}`
      : `第 ${rowIndex + 1} 行第 ${columnIndex + 1} 列，值 ${value}，${positionLabel}`;
  }

  function kernelCellAriaLabel(
    rowIndex: number,
    columnIndex: number,
    value: number,
  ): string {
    return locale === "en"
      ? `Row ${rowIndex + 1}, column ${columnIndex + 1}, weight ${value}`
      : `第 ${rowIndex + 1} 行第 ${columnIndex + 1} 列，权重 ${value}`;
  }

  function featureCellAriaLabel(index: number): string {
    const step = cnnKernelDemo.scanSteps[index]!;

    if (index > stepIndex) {
      return locale === "en"
        ? `Row ${step.y + 1}, column ${step.x + 1}, ${copy.pendingLabel}`
        : `第 ${step.y + 1} 行第 ${step.x + 1} 列，${copy.pendingLabel}`;
    }

    const value = formatCnnValue(featureMapResults[index]!.response);
    const currentSuffix = index === stepIndex ? `, ${copy.currentLabel}` : "";

    return locale === "en"
      ? `Row ${step.y + 1}, column ${step.x + 1}, value ${value}${currentSuffix}`
      : `第 ${step.y + 1} 行第 ${step.x + 1} 列，值 ${value}${currentSuffix}`;
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
  <div class="kernel-buttons">
    <div class="kernel-options" role="group" aria-label={copy.kernelAriaLabel}>
      {#each cnnKernelDemo.kernels as kernel}
        <button
          type="button"
          class:active={kernel.id === activeKernelId}
          aria-pressed={kernel.id === activeKernelId}
          on:click={() => selectKernel(kernel.id)}
        >
          {kernel.label}
        </button>
      {/each}
    </div>
    <div
      class="step-buttons"
      role="group"
      aria-label={copy.stepControlsAriaLabel}
    >
      <button
        class="previous-step-button"
        type="button"
        on:click={previousStep}
        disabled={stepIndex === 0}
      >
        {demoCoreCopy.previousLabel}
      </button>
      <button
        class="next-step-button"
        type="button"
        on:click={nextStep}
        disabled={stepIndex === cnnKernelDemo.scanSteps.length - 1}
      >
        {demoCoreCopy.nextLabel}
      </button>
    </div>
  </div>

  <div class="cnn-grid">
    <div
      class="matrix-panel image-grid"
      role="table"
      aria-label={imageGridAccessibleName}
    >
      {#each cnnKernelDemo.imageGrid as row, y}
        <div class="matrix-row" role="row">
          {#each row as value, x}
            <span
              role="cell"
              aria-label={imageCellAriaLabel(y, x, value)}
              class:active={isInsideActiveWindow(x, y)}
              style={`opacity: ${0.28 + value * 0.62}`}
            ></span>
          {/each}
        </div>
      {/each}
    </div>

    <div class="matrix-panel kernel-panel">
      <span
        class:placeholder={activeKernel.normalizationDivisor === 1}
        class="normalization-factor"
        aria-hidden={activeKernel.normalizationDivisor === 1}
      >
        1/{activeKernel.normalizationDivisor} ×
      </span>
      <div
        class="kernel-matrix"
        role="table"
        aria-label={kernelMatrixAccessibleName}
      >
        {#each activeKernel.matrix as row, y}
          <div class="matrix-row" role="row">
            {#each row as value, x}
              <span role="cell" aria-label={kernelCellAriaLabel(y, x, value)}
                >{value}</span
              >
            {/each}
          </div>
        {/each}
      </div>
    </div>

    <div
      class="matrix-panel feature-map"
      role="table"
      aria-label={featureMapAccessibleName}
    >
      {#each [0, 1, 2] as rowIndex}
        <div class="matrix-row" role="row">
          {#each cnnKernelDemo.scanSteps.slice(rowIndex * 3, rowIndex * 3 + 3) as step, columnIndex}
            {@const index = rowIndex * 3 + columnIndex}
            <span
              role="cell"
              aria-label={featureCellAriaLabel(index)}
              aria-current={index === stepIndex ? "step" : undefined}
              class:filled={index <= stepIndex}
              class:current={index === stepIndex}
              >{index <= stepIndex
                ? formatCnnValue(featureMapResults[index]!.response)
                : ""}</span
            >
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <section class="explanation" aria-live="polite" aria-atomic="true">
    <span>{copy.responseLabel}: {formattedResponse}</span>
    <p class="calculation">
      {copy.weightedSumLabel}
      {formattedWeightedSum} ÷ {activeResult.normalizationDivisor}
      = {formattedResponse}
    </p>
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-top: 20px;
  }

  .kernel-options,
  .step-buttons {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    gap: 10px;
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
  .next-step-button {
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

  .matrix-panel {
    display: grid;
    align-content: start;
    gap: 6px;
    padding: 16px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  .matrix-row {
    display: grid;
    gap: 6px;
  }

  .image-grid .matrix-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .kernel-matrix,
  .feature-map {
    display: grid;
    gap: 6px;
  }

  .kernel-matrix .matrix-row,
  .feature-map .matrix-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .normalization-factor {
    min-height: 24px;
    color: var(--color-green, #2f7d5b);
    font-weight: 800;
  }

  .normalization-factor.placeholder {
    visibility: hidden;
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

  .feature-map span.current {
    outline: 3px solid var(--color-coral, #c6543f);
  }

  .explanation {
    min-height: 158px;
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

  .calculation {
    margin-top: 6px;
    color: var(--color-ink, #17201d);
    font-variant-numeric: tabular-nums;
    font-weight: 720;
  }

  h3 {
    margin: 10px 0 8px;
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

    .step-buttons {
      width: 100%;
    }

    .step-buttons button {
      flex: 1;
    }
  }
</style>
