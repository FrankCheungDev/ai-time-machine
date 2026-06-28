<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { expertSystemDemo } from "@ai-history/data";

  const initialSelected = Object.fromEntries(
    [...expertSystemDemo.conditions, expertSystemDemo.exceptionCondition].map((condition) => [
      condition.id,
      condition.defaultSelected
    ])
  );

  let selected: Record<string, boolean> = initialSelected;

  $: matchedRules = expertSystemDemo.rules.filter((rule) => rule.ifAll.every((conditionId) => selected[conditionId]));
  $: hasConflict = matchedRules.length > 1;
  $: resultTitle = hasConflict ? expertSystemDemo.conflictTitle : expertSystemDemo.stableTitle;
  $: resultDescription = hasConflict ? expertSystemDemo.conflictDescription : expertSystemDemo.stableDescription;

  function toggle(conditionId: string) {
    selected = { ...selected, [conditionId]: !selected[conditionId] };
  }
</script>

<DemoShell
  title={expertSystemDemo.title}
  question={expertSystemDemo.question}
  simplificationNote={expertSystemDemo.simplificationNote}
>
  <div class="rule-demo">
    <div class="conditions" aria-label="条件选择">
      {#each expertSystemDemo.conditions as condition}
        <label>
          <input type="checkbox" checked={selected[condition.id]} on:change={() => toggle(condition.id)} />
          <span>{condition.label}</span>
        </label>
      {/each}
      <label class="exception">
        <input
          type="checkbox"
          checked={selected[expertSystemDemo.exceptionCondition.id]}
          on:change={() => toggle(expertSystemDemo.exceptionCondition.id)}
        />
        <span>{expertSystemDemo.exceptionCondition.label}</span>
      </label>
    </div>

    <div class="rule-grid">
      {#each expertSystemDemo.rules as rule}
        <article class:matched={matchedRules.some((matchedRule) => matchedRule.id === rule.id)}>
          <span>IF {rule.ifAll.join(" + ")}</span>
          <strong>{rule.then}</strong>
          <p>{rule.explanation}</p>
        </article>
      {/each}
    </div>

    <section class:conflict={hasConflict} class="result" aria-live="polite">
      <h3>{resultTitle}</h3>
      <p>{resultDescription}</p>
    </section>
  </div>
</DemoShell>

<style>
  .rule-demo {
    display: grid;
    gap: 18px;
    margin-top: 22px;
  }

  .conditions,
  .rule-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  label,
  article,
  .result {
    border: 1px solid var(--color-line, #d7ddd7);
    border-radius: 8px;
    background: white;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 12px;
    font-weight: 720;
  }

  .exception {
    border-color: var(--color-amber, #b87918);
  }

  .rule-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  article {
    padding: 16px;
    opacity: 0.58;
  }

  article.matched {
    border-color: var(--color-green, #2f7d5b);
    background: #edf8f2;
    opacity: 1;
  }

  article span {
    color: var(--color-blue, #3469a6);
    font-size: 0.84rem;
    font-weight: 760;
  }

  article strong {
    display: block;
    margin-top: 6px;
  }

  p {
    margin: 8px 0 0;
    color: var(--color-muted, #5f6864);
  }

  .result {
    padding: 18px;
    background: #f7faf8;
  }

  .result.conflict {
    border-color: var(--color-coral, #c6543f);
    background: #fff2ef;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  @media (max-width: 760px) {
    .conditions,
    .rule-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
