<script lang="ts">
  import { DemoShell, SvgScene } from "@ai-history/demo-core";
  import { getDecisionBoundaryDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import { getBoundaryPath } from "./boundaryPath";

  export let locale: Locale = "zh-CN";

  let activeModeId = "linear";
  let outlierY = 94;
  $: decisionBoundaryDemo = getDecisionBoundaryDemo(locale);
  $: activityTitle = getLocalizedLearningChapter(
    "decision-boundary",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          modeAriaLabel: "Boundary mode",
          sceneLabel: "Decision boundary comparison",
          legendLabel: "Point classes",
          positiveLabel: "Positive examples",
          negativeLabel: "Negative examples",
          outlierImpact:
            "Moving the outlier now changes the displayed boundary. The flexible modes react more strongly, illustrating sensitivity rather than a real training run.",
        }
      : {
          modeAriaLabel: "边界模式",
          sceneLabel: "决策边界比较",
          legendLabel: "样本类别",
          positiveLabel: "正类样本",
          negativeLabel: "负类样本",
          outlierImpact:
            "移动异常点会改变当前边界；越灵活的模式弯曲得越明显。这里展示的是敏感性直觉，并非真实训练过程。",
        };
  $: activeMode =
    decisionBoundaryDemo.modes.find((mode) => mode.id === activeModeId) ??
    decisionBoundaryDemo.modes[0];
  $: boundaryPath = getBoundaryPath(activeMode.id, Number(outlierY));
</script>

<DemoShell
  title={activityTitle ?? decisionBoundaryDemo.title}
  question={decisionBoundaryDemo.question}
  simplificationNote={decisionBoundaryDemo.simplificationNote}
  learningGoals={decisionBoundaryDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div class="mode-buttons" role="group" aria-label={copy.modeAriaLabel}>
    {#each decisionBoundaryDemo.modes as mode}
      <button
        type="button"
        class:active={mode.id === activeModeId}
        aria-pressed={mode.id === activeModeId}
        on:click={() => (activeModeId = mode.id)}
      >
        {mode.label}
      </button>
    {/each}
  </div>

  <SvgScene
    label={copy.sceneLabel}
    viewBox="0 0 700 380"
    fitLabel={demoCoreCopy.fitLabel}
    detailLabel={demoCoreCopy.detailLabel}
    scrollSuffix={demoCoreCopy.scrollSuffix}
  >
    <rect class="plot" x="54" y="40" width="590" height="300" rx="8"></rect>
    <path id={`boundary-${activeMode.id}`} class="boundary" d={boundaryPath}
    ></path>
    {#each decisionBoundaryDemo.points as point}
      {#if point.className === "positive"}
        <circle class="data-point positive" cx={point.x} cy={point.y} r="13"
        ></circle>
      {:else}
        <rect
          class="data-point negative"
          x={point.x - 12}
          y={point.y - 12}
          width="24"
          height="24"
          rx="4"
        ></rect>
      {/if}
    {/each}
    <rect
      id="outlier-point"
      class="data-point negative outlier"
      x="458"
      y={Number(outlierY) - 12}
      width="24"
      height="24"
      transform={`rotate(45 470 ${outlierY})`}
    ></rect>
    <text x="470" y={outlierY - 24} text-anchor="middle"
      >{decisionBoundaryDemo.outlierLabel}</text
    >
  </SvgScene>

  <ul class="legend" aria-label={copy.legendLabel}>
    <li><span class="legend-marker positive"></span>{copy.positiveLabel}</li>
    <li><span class="legend-marker negative"></span>{copy.negativeLabel}</li>
    <li>
      <span class="legend-marker outlier"></span>
      {decisionBoundaryDemo.outlierLabel}
    </li>
  </ul>

  <label class="outlier-control">
    <span>{decisionBoundaryDemo.outlierLabel}: y={outlierY}</span>
    <input
      aria-label={decisionBoundaryDemo.outlierLabel}
      type="range"
      min="78"
      max="260"
      bind:value={outlierY}
    />
  </label>

  <section class="explanation" aria-live="polite">
    <h3>{activeMode.title}</h3>
    <p>{activeMode.description}</p>
    <p class="outlier-impact">{copy.outlierImpact}</p>
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
    background: #805400;
    border-color: #805400;
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

  .data-point {
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

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
  }

  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-muted, #5f6864);
    font-weight: 700;
  }

  .legend-marker {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid white;
    outline: 1px solid var(--color-line, #d7ddd7);
  }

  .legend-marker.positive {
    border-radius: 50%;
    background: var(--color-green, #2f7d5b);
  }

  .legend-marker.negative {
    border-radius: 3px;
    background: var(--color-blue, #3469a6);
  }

  .legend-marker.outlier {
    border-radius: 2px;
    background: var(--color-coral, #c6543f);
    transform: rotate(45deg) scale(0.78);
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

  .outlier-impact {
    margin-top: 8px;
  }
</style>
