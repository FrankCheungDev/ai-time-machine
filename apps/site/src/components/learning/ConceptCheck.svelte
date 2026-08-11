<script lang="ts">
  import { getConceptCheck } from "@ai-history/data";
  import { onMount, tick } from "svelte";
  import { emitLearningSignal } from "../../analytics/learningSignals";
  import { conceptCheckUiCopy } from "../../i18n/conceptCheck";
  import type { Locale } from "../../i18n/locales";
  import {
    conceptCheckProgressChangedEventName,
    conceptCheckProgressStorageKey,
    dispatchConceptCheckProgressChanged,
    markConceptExplanationViewed,
    readConceptCheckProgress,
    recordConceptCheckAttempt,
    resetConceptCheckProgress,
    type ConceptCheckResult,
  } from "../../learning/conceptCheckProgress";
  import type { LearningChapterId } from "../../learning/learningPath";

  export let locale: Locale;
  export let chapterId: LearningChapterId;

  const check = getConceptCheck(chapterId, locale);
  const copy = conceptCheckUiCopy[locale];
  const conceptCheckAnchor = `concept-check-${chapterId}`;
  const explanationId = `concept-check-explanation-${check.id}`;

  let selectedOptionId = "";
  let submitted = false;
  let correct = false;
  let reviewSuggested = false;
  let reviewResolved = false;
  let explanationVisible = false;
  let showStorageWarning = false;
  let showClearConfirmation = false;
  let result: ConceptCheckResult | undefined;
  let feedbackHeading: HTMLHeadingElement | undefined;

  function syncProgress(): void {
    const snapshot = readConceptCheckProgress();
    result = snapshot.progress.results.find(
      (entry) => entry.chapterId === chapterId,
    );
    showStorageWarning =
      !snapshot.storageAvailable || !snapshot.schemaSupported;
  }

  function syncLanguageSwitchHash(): void {
    const languageSwitch = document.querySelector<HTMLAnchorElement>(
      "[data-language-switch]",
    );
    if (!languageSwitch) return;

    const href = new URL(languageSwitch.href, window.location.href);
    href.hash =
      window.location.hash === `#${conceptCheckAnchor}`
        ? conceptCheckAnchor
        : "";
    languageSwitch.href = `${href.pathname}${href.search}${href.hash}`;
  }

  onMount(() => {
    syncProgress();
    syncLanguageSwitchHash();

    const handleProgressChanged = (): void => syncProgress();
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === conceptCheckProgressStorageKey) {
        syncProgress();
      }
    };

    window.addEventListener(
      conceptCheckProgressChangedEventName,
      handleProgressChanged,
    );
    window.addEventListener("storage", handleStorage);
    window.addEventListener("hashchange", syncLanguageSwitchHash);

    return () => {
      window.removeEventListener(
        conceptCheckProgressChangedEventName,
        handleProgressChanged,
      );
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("hashchange", syncLanguageSwitchHash);
    };
  });

  function resetFeedback(): void {
    submitted = false;
    explanationVisible = false;
    reviewSuggested = false;
    reviewResolved = false;
  }

  async function submitAnswer(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!selectedOptionId) return;

    const attempt = result ? "retry" : "first";
    const wasSuggestedForReview = result?.reviewSuggested ?? false;
    correct = selectedOptionId === check.correctOptionId;
    submitted = true;
    explanationVisible = false;
    reviewSuggested = false;
    reviewResolved = false;

    const writeResult = recordConceptCheckAttempt(chapterId, correct);
    if (writeResult.persisted) {
      result = writeResult.progress.results.find(
        (entry) => entry.chapterId === chapterId,
      );
      showStorageWarning = false;
      reviewSuggested = !correct;
      reviewResolved = correct && wasSuggestedForReview;
      dispatchConceptCheckProgressChanged(writeResult.progress);
    } else {
      showStorageWarning = true;
    }

    emitLearningSignal({
      name: "concept_check_completed",
      chapterId,
      locale,
      correct,
      attempt,
    });

    await tick();
    feedbackHeading?.focus();
  }

  function revealExplanation(): void {
    explanationVisible = !explanationVisible;
    if (!explanationVisible) return;

    const writeResult = markConceptExplanationViewed(chapterId);
    if (writeResult.persisted) {
      result = writeResult.progress.results.find(
        (entry) => entry.chapterId === chapterId,
      );
      showStorageWarning = false;
      dispatchConceptCheckProgressChanged(writeResult.progress);
    } else {
      showStorageWarning = true;
    }

    emitLearningSignal({
      name: "concept_explanation_opened",
      chapterId,
      locale,
    });
  }

  function tryAgain(): void {
    selectedOptionId = "";
    submitted = false;
    explanationVisible = false;
    reviewSuggested = false;
    reviewResolved = false;
  }

  function clearProgress(): void {
    const writeResult = resetConceptCheckProgress();
    if (!writeResult.persisted) {
      showStorageWarning = true;
      return;
    }

    result = undefined;
    selectedOptionId = "";
    submitted = false;
    explanationVisible = false;
    reviewSuggested = false;
    reviewResolved = false;
    showStorageWarning = false;
    showClearConfirmation = false;
    dispatchConceptCheckProgressChanged(writeResult.progress);
  }
</script>

<section
  id={conceptCheckAnchor}
  class="section-band concept-check"
  data-testid="concept-check"
  data-concept-check-id={check.id}
>
  <p class="eyebrow">{copy.eyebrow}</p>
  <h2>{copy.heading}</h2>
  <p class="concept-check-note">{copy.nonBlockingNote}</p>

  {#if result}
    <p class="concept-check-recorded" data-testid="concept-check-recorded">
      {copy.recorded(result.attempts)}
    </p>
    {#if result.reviewSuggested && !submitted}
      <p
        class="concept-check-review-note"
        data-testid="concept-check-review-note"
      >
        {copy.reviewPendingNote}
      </p>
    {/if}
  {/if}

  <form onsubmit={submitAnswer}>
    <fieldset>
      <legend>{check.prompt}</legend>
      <div class="concept-check-options">
        {#each check.options as option}
          <label>
            <input
              type="radio"
              name={`concept-check-${check.id}`}
              value={option.id}
              bind:group={selectedOptionId}
              onchange={resetFeedback}
            />
            <span>{option.label}</span>
          </label>
        {/each}
      </div>
    </fieldset>
    <button class="button primary" type="submit" disabled={!selectedOptionId}>
      {copy.submit}
    </button>
  </form>

  {#if submitted}
    <div
      class:correct
      class:incorrect={!correct}
      class="concept-check-feedback"
      data-concept-check-result={correct ? "correct" : "incorrect"}
      aria-live="polite"
    >
      <h3 bind:this={feedbackHeading} tabindex="-1">
        {correct ? copy.correctHeading : copy.incorrectHeading}
      </h3>
      <p>
        {correct
          ? reviewResolved
            ? copy.reviewResolvedSummary
            : copy.correctSummary
          : reviewSuggested
            ? copy.reviewSuggestedSummary
            : copy.incorrectSummary}
      </p>
      <div class="concept-check-feedback-actions">
        <button
          class="button"
          type="button"
          aria-expanded={explanationVisible}
          aria-controls={explanationId}
          onclick={revealExplanation}
        >
          {explanationVisible ? copy.hideExplanation : copy.showExplanation}
        </button>
        <button class="button subtle" type="button" onclick={tryAgain}>
          {copy.tryAgain}
        </button>
      </div>
      {#if explanationVisible}
        <p id={explanationId} class="concept-check-explanation">
          {check.explanation}
        </p>
      {/if}
    </div>
  {/if}

  {#if showStorageWarning}
    <p
      class="learning-warning"
      data-testid="concept-check-storage-warning"
      aria-live="polite"
    >
      {copy.storageWarning}
    </p>
  {/if}

  <div class="concept-check-clear">
    {#if showClearConfirmation}
      <span>{copy.clearConfirmation}</span>
      <button class="button subtle" type="button" onclick={clearProgress}>
        {copy.confirmClear}
      </button>
      <button
        class="button subtle"
        type="button"
        onclick={() => (showClearConfirmation = false)}
      >
        {copy.cancelClear}
      </button>
    {:else}
      <button
        class="button subtle"
        type="button"
        onclick={() => (showClearConfirmation = true)}
      >
        {copy.clearProgress}
      </button>
    {/if}
  </div>
</section>
