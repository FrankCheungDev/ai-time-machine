<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { bayesUpdateDemo } from "@ai-history/data";

  let prior = bayesUpdateDemo.priorDefault;
  let evidence = bayesUpdateDemo.evidenceDefault;

  $: priorProbability = Math.min(0.95, Math.max(0.05, Number(prior) / 100));
  $: likelihoodRatio = 0.2 + (Number(evidence) / 100) * 4.8;
  $: posteriorOdds = (priorProbability / (1 - priorProbability)) * likelihoodRatio;
  $: posterior = Math.round((posteriorOdds / (1 + posteriorOdds)) * 100);
</script>

<DemoShell
  title={bayesUpdateDemo.title}
  question={bayesUpdateDemo.question}
  simplificationNote={bayesUpdateDemo.simplificationNote}
  learningGoals={bayesUpdateDemo.learningGoals}
>
  <div class="bayes-demo">
    <div class="controls">
      <label>
        <span>{bayesUpdateDemo.priorLabel}: {prior}%</span>
        <input aria-label="先验信念" type="range" min="5" max="95" bind:value={prior} />
      </label>
      <label>
        <span>{bayesUpdateDemo.evidenceLabel}: {evidence}%</span>
        <input aria-label="证据强度" type="range" min="0" max="100" bind:value={evidence} />
      </label>
    </div>

    <div class="probability-bars" aria-live="polite">
      <div>
        <span>先验</span>
        <div class="track"><i style={`width: ${prior}%`}></i></div>
      </div>
      <div>
        <span>后验信念 {posterior}%</span>
        <div class="track posterior"><i style={`width: ${posterior}%`}></i></div>
      </div>
    </div>

    <section class="explanation">
      <h3>后验信念会随证据改变</h3>
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
