<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { getBayesUpdateDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import { calculatePosteriorPercent } from "./bayesMath";

  export let locale: Locale = "zh-CN";

  const initialDemo = getBayesUpdateDemo();
  let prior = initialDemo.priorDefault;
  let evidence = initialDemo.evidenceDefault;

  $: bayesUpdateDemo = getBayesUpdateDemo(locale);
  $: activityTitle = getLocalizedLearningChapter("bayes", locale).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? {
          priorStatusLabel: "Prior",
          posteriorStatusLabel: "Posterior belief",
          explanationTitle: "The posterior belief changes with the evidence",
          evidenceOpposes: "opposes the belief",
          evidenceNeutral: "neutral evidence",
          evidenceSupports: "supports the belief",
        }
      : {
          priorStatusLabel: "先验",
          posteriorStatusLabel: "后验信念",
          explanationTitle: "后验信念会随证据改变",
          evidenceOpposes: "反对当前信念",
          evidenceNeutral: "中性证据",
          evidenceSupports: "支持当前信念",
        };
  $: evidenceDirection =
    Number(evidence) < 50
      ? copy.evidenceOpposes
      : Number(evidence) > 50
        ? copy.evidenceSupports
        : copy.evidenceNeutral;
  $: posterior = calculatePosteriorPercent(Number(prior), Number(evidence));
</script>

<DemoShell
  title={activityTitle ?? bayesUpdateDemo.title}
  question={bayesUpdateDemo.question}
  simplificationNote={bayesUpdateDemo.simplificationNote}
  learningGoals={bayesUpdateDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div class="bayes-demo">
    <div class="controls">
      <label>
        <span>{bayesUpdateDemo.priorLabel}: {prior}%</span>
        <input
          aria-label={bayesUpdateDemo.priorLabel}
          type="range"
          min="5"
          max="95"
          bind:value={prior}
        />
      </label>
      <label>
        <span>
          {bayesUpdateDemo.evidenceLabel}: {evidence}% · {evidenceDirection}
        </span>
        <input
          aria-label={bayesUpdateDemo.evidenceLabel}
          type="range"
          min="0"
          max="100"
          bind:value={evidence}
        />
      </label>
    </div>

    <div class="probability-bars" aria-live="polite">
      <div>
        <span>{copy.priorStatusLabel}</span>
        <div class="track"><i style={`width: ${prior}%`}></i></div>
      </div>
      <div>
        <span>{copy.posteriorStatusLabel} {posterior}%</span>
        <div class="track posterior">
          <i style={`width: ${posterior}%`}></i>
        </div>
      </div>
    </div>

    <section class="explanation">
      <h3>{copy.explanationTitle}</h3>
      <p>{bayesUpdateDemo.insight}</p>
    </section>
  </div>
</DemoShell>

<style>
  .bayes-demo,
  .controls,
  .probability-bars {
    display: grid;
    gap: 16px;
  }

  .bayes-demo {
    margin-top: 22px;
  }

  .controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  label,
  .probability-bars,
  .explanation {
    padding: 18px;
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  label span,
  .probability-bars span {
    display: block;
    margin-bottom: 10px;
    font-weight: 760;
  }

  input {
    width: 100%;
    accent-color: var(--color-blue, #3469a6);
  }

  .track {
    overflow: hidden;
    height: 18px;
    border-radius: 999px;
    background: #e8ece8;
  }

  .track i {
    display: block;
    height: 100%;
    background: var(--color-amber, #b87918);
  }

  .track.posterior i {
    background: var(--color-blue, #3469a6);
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

  @media (max-width: 700px) {
    .controls {
      grid-template-columns: 1fr;
    }
  }
</style>
