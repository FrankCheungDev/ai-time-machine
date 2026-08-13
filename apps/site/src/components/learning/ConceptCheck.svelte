<script lang="ts">
  import { getConceptCheck } from "@ai-history/data";
  import { onMount, tick } from "svelte";
  import { emitLearningSignal } from "../../analytics/learningSignals";
  import { conceptCheckUiCopy } from "../../i18n/conceptCheck";
  import { synchronizeLanguageSwitchUrl } from "../../i18n/languagePreference";
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
  const clearConfirmationId = `concept-check-clear-confirmation-${check.id}`;

  let selectedOptionId = "";
  let submitted = false;
  let correct = false;
  let reviewSuggested = false;
  let reviewResolved = false;
  let explanationVisible = false;
  let showStorageWarning = false;
  let showClearConfirmation = false;
  let result: ConceptCheckResult | undefined;
  let conceptCheckHeading: HTMLHeadingElement | undefined;
  let feedbackHeading: HTMLHeadingElement | undefined;
  let clearTrigger: HTMLButtonElement | undefined;
  let confirmClearButton: HTMLButtonElement | undefined;
  let deepLinkFocusRequest = 0;

  function syncProgress(): void {
    const snapshot = readConceptCheckProgress();
    result = snapshot.progress.results.find(
      (entry) => entry.chapterId === chapterId,
    );
    showStorageWarning =
      !snapshot.storageAvailable || !snapshot.schemaSupported;
  }

  function hasMeaningfulFocus(): boolean {
    const activeElement = document.activeElement;
    return (
      activeElement !== null &&
      activeElement !== document.body &&
      activeElement !== document.documentElement &&
      activeElement !== conceptCheckHeading
    );
  }

  function focusDeepLinkedCheck(preserveExistingFocus: boolean): void {
    if (
      window.location.hash !== `#${conceptCheckAnchor}` ||
      (preserveExistingFocus && hasMeaningfulFocus())
    )
      return;
    conceptCheckHeading?.focus({ preventScroll: true });
  }

  function waitForEarlierIslands(preserveExistingFocus: boolean): () => void {
    const request = ++deepLinkFocusRequest;
    const currentIsland = conceptCheckHeading?.closest("astro-island");
    const main = conceptCheckHeading?.closest("main");
    if (!currentIsland || !main) {
      if (request === deepLinkFocusRequest)
        focusDeepLinkedCheck(preserveExistingFocus);
      return () => {};
    }

    const allIslands = Array.from(
      main.querySelectorAll<HTMLElement>('astro-island[client="load"]'),
    );
    const currentIndex = allIslands.indexOf(currentIsland as HTMLElement);
    const pendingIslands = allIslands
      .slice(0, currentIndex < 0 ? 0 : currentIndex)
      .filter(
        (island) =>
          island.hasAttribute("ssr") &&
          !window.__aiHistoryHydrationErrors?.has(island),
      );

    if (pendingIslands.length === 0) {
      if (request === deepLinkFocusRequest)
        focusDeepLinkedCheck(preserveExistingFocus);
      return () => {};
    }

    let remaining = pendingIslands.length;
    let settled = false;
    const listeners = new Map<HTMLElement, () => void>();
    const settleIsland = (island: HTMLElement): void => {
      if (settled) return;
      const listener = listeners.get(island);
      if (!listener) return;
      island.removeEventListener("astro:hydrate", listener);
      island.removeEventListener("astro:hydration-error", listener);
      listeners.delete(island);
      remaining -= 1;
      if (remaining > 0) return;
      settled = true;
      if (request === deepLinkFocusRequest)
        focusDeepLinkedCheck(preserveExistingFocus);
    };

    for (const island of pendingIslands) {
      const listener = (): void => settleIsland(island);
      listeners.set(island, listener);
      island.addEventListener("astro:hydrate", listener, { once: true });
      island.addEventListener("astro:hydration-error", listener, {
        once: true,
      });
    }

    for (const island of pendingIslands) {
      if (
        !island.hasAttribute("ssr") ||
        window.__aiHistoryHydrationErrors?.has(island)
      )
        settleIsland(island);
    }

    return () => {
      settled = true;
      for (const [island, listener] of listeners) {
        island.removeEventListener("astro:hydrate", listener);
        island.removeEventListener("astro:hydration-error", listener);
      }
      listeners.clear();
    };
  }

  onMount(() => {
    syncProgress();
    synchronizeLanguageSwitchUrl();
    let stopWaitingForEarlierIslands = waitForEarlierIslands(true);

    const handleProgressChanged = (): void => syncProgress();
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === conceptCheckProgressStorageKey) {
        syncProgress();
      }
    };
    const handleHashChange = (): void => {
      stopWaitingForEarlierIslands();
      synchronizeLanguageSwitchUrl();
      stopWaitingForEarlierIslands = waitForEarlierIslands(false);
    };

    window.addEventListener(
      conceptCheckProgressChangedEventName,
      handleProgressChanged,
    );
    window.addEventListener("storage", handleStorage);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      stopWaitingForEarlierIslands();
      window.removeEventListener(
        conceptCheckProgressChangedEventName,
        handleProgressChanged,
      );
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("hashchange", handleHashChange);
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

  async function openClearConfirmation(): Promise<void> {
    showClearConfirmation = true;
    await tick();
    confirmClearButton?.focus();
  }

  async function cancelClearConfirmation(): Promise<void> {
    showClearConfirmation = false;
    await tick();
    clearTrigger?.focus();
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
  <h2 bind:this={conceptCheckHeading} tabindex="-1">{copy.heading}</h2>
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
      <span id={clearConfirmationId}>{copy.clearConfirmation}</span>
      <button
        bind:this={confirmClearButton}
        class="button subtle"
        type="button"
        aria-describedby={clearConfirmationId}
        onclick={clearProgress}
      >
        {copy.confirmClear}
      </button>
      <button
        class="button subtle"
        type="button"
        aria-describedby={clearConfirmationId}
        onclick={cancelClearConfirmation}
      >
        {copy.cancelClear}
      </button>
    {:else}
      <button
        bind:this={clearTrigger}
        class="button subtle"
        type="button"
        onclick={openClearConfirmation}
      >
        {copy.clearProgress}
      </button>
    {/if}
  </div>
</section>
