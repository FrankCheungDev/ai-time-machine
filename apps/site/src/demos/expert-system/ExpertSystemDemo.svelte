<script lang="ts">
  import { DemoShell } from "@ai-history/demo-core";
  import { getExpertSystemDemo, type Locale } from "@ai-history/data";
  import { getLocalizedLearningChapter } from "../../i18n/learning";
  import { getSiteCopy } from "../../i18n/siteCopy";
  import { resolveExpertSystemResult } from "./expertSystemState";

  export let locale: Locale = "zh-CN";

  const initialDemo = getExpertSystemDemo();
  const initialSelected = Object.fromEntries(
    [...initialDemo.conditions, initialDemo.exceptionCondition].map(
      (condition) => [condition.id, condition.defaultSelected],
    ),
  );

  let selected: Record<string, boolean> = initialSelected;

  $: expertSystemDemo = getExpertSystemDemo(locale);
  $: activityTitle = getLocalizedLearningChapter(
    "expert-system",
    locale,
  ).activityTitle;
  $: demoCoreCopy = getSiteCopy(locale).demoCore;
  $: copy =
    locale === "en"
      ? { conditionsAriaLabel: "Condition selection", ifLabel: "IF" }
      : { conditionsAriaLabel: "条件选择", ifLabel: "IF" };
  $: result = resolveExpertSystemResult(expertSystemDemo, selected);
  $: matchedRules = result.matchedRules;
  $: hasConflict = result.kind === "conflict";
  $: hasNoMatch = result.kind === "no-match";

  function toggle(conditionId: string) {
    selected = { ...selected, [conditionId]: !selected[conditionId] };
  }
</script>

<DemoShell
  title={activityTitle ?? expertSystemDemo.title}
  question={expertSystemDemo.question}
  simplificationNote={expertSystemDemo.simplificationNote}
  learningGoals={expertSystemDemo.learningGoals}
  demoKicker={demoCoreCopy.demoKicker}
  learningGoalsLabel={demoCoreCopy.learningGoalsLabel}
  simplificationLabel={demoCoreCopy.simplificationLabel}
>
  <div class="rule-demo">
    <div class="conditions" aria-label={copy.conditionsAriaLabel}>
      {#each expertSystemDemo.conditions as condition}
        <label>
          <input
            type="checkbox"
            checked={selected[condition.id]}
            on:change={() => toggle(condition.id)}
          />
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
        <article
          class:matched={matchedRules.some(
            (matchedRule) => matchedRule.id === rule.id,
          )}
        >
          <span>{copy.ifLabel} {rule.ifAll.join(" + ")}</span>
          <strong>{rule.then}</strong>
          <p>{rule.explanation}</p>
        </article>
      {/each}
    </div>

    <section
      class:conflict={hasConflict}
      class:no-match={hasNoMatch}
      class="result"
      aria-live="polite"
    >
      <h3>{result.title}</h3>
      <p>{result.description}</p>
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

  .result.no-match {
    border-color: var(--color-amber, #b87918);
    background: #fff8e8;
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
