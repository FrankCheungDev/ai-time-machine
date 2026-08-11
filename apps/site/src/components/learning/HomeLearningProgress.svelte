<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    getLocalizedConceptCheckHref,
    getLocalizedLearningChapter,
    learningUiCopy,
  } from "../../i18n/learning";
  import { toLocalizedPath, type Locale } from "../../i18n/locales";
  import {
    getFirstIncompleteChapter,
    isLearningPathComplete,
    learningPath,
  } from "../../learning/learningPath";
  import {
    conceptCheckProgressChangedEventName,
    conceptCheckProgressStorageKey,
    createEmptyConceptCheckProgress,
    dispatchConceptCheckProgressChanged,
    readConceptCheckProgress,
    resetConceptCheckProgress,
  } from "../../learning/conceptCheckProgress";
  import {
    createEmptyLearningProgress,
    dispatchLearningProgressChanged,
    learningProgressChangedEventName,
    learningProgressStorageKey,
    readLearningProgress,
    resetLearningProgress,
  } from "../../learning/learningProgress";
  import { getReviewQueue } from "../../learning/reviewQueue";

  export let locale: Locale;

  const copy = learningUiCopy[locale];
  const startChapter = getLocalizedLearningChapter("overview", locale);
  const reviewLinks = [
    {
      href: toLocalizedPath("/timeline/", locale),
      label: copy.reviewTimeline,
    },
    {
      href: toLocalizedPath("/lineage/", locale),
      label: copy.reviewLineage,
    },
    {
      href: toLocalizedPath("/diagrams/", locale),
      label: copy.reviewDiagrams,
    },
  ];

  let progress = createEmptyLearningProgress();
  let conceptProgress = createEmptyConceptCheckProgress();
  let showStorageWarning = false;
  let conceptProgressRead = false;
  let conceptSnapshotReadable = true;
  let showConceptStorageWarning = false;
  let showReviewClearConfirmation = false;
  let reviewRecordsCleared = false;
  let showResetConfirmation = false;
  let clearReviewTrigger: HTMLButtonElement | undefined;
  let confirmClearReviewButton: HTMLButtonElement | undefined;
  let reviewStatus: HTMLParagraphElement | undefined;

  $: completedCount = progress.completedChapterIds.length;
  $: pathComplete = isLearningPathComplete(progress.completedChapterIds);
  $: firstIncompleteDefinition = getFirstIncompleteChapter(
    progress.completedChapterIds,
  );
  $: firstIncompleteChapter = firstIncompleteDefinition
    ? getLocalizedLearningChapter(firstIncompleteDefinition.id, locale)
    : undefined;
  $: reviewChapters = getReviewQueue(conceptProgress).map(({ chapterId }) => {
    const chapter = getLocalizedLearningChapter(chapterId, locale);
    return {
      ...chapter,
      href: getLocalizedConceptCheckHref(chapterId, locale),
    };
  });
  $: firstReviewChapter = reviewChapters[0];
  $: remainingReviewChapters = reviewChapters.slice(1);
  $: hasConceptRecords = conceptProgress.results.length > 0;
  $: showReviewPanel =
    conceptProgressRead &&
    (hasConceptRecords || reviewRecordsCleared || !conceptSnapshotReadable);

  function syncLearningProgress(): void {
    const snapshot = readLearningProgress();
    progress = snapshot.progress;
    showStorageWarning = !snapshot.storageAvailable;
  }

  function syncConceptProgress(): void {
    const snapshot = readConceptCheckProgress();
    conceptProgress = snapshot.progress;
    conceptProgressRead = true;
    conceptSnapshotReadable =
      snapshot.storageAvailable && snapshot.schemaSupported;
    showConceptStorageWarning = !conceptSnapshotReadable;

    if (snapshot.progress.results.length > 0) {
      reviewRecordsCleared = false;
    }
  }

  onMount(() => {
    syncLearningProgress();
    syncConceptProgress();

    const handleLearningProgressChanged = (): void => syncLearningProgress();
    const handleConceptProgressChanged = (): void => syncConceptProgress();
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === learningProgressStorageKey) {
        syncLearningProgress();
      }
      if (event.key === null || event.key === conceptCheckProgressStorageKey) {
        syncConceptProgress();
      }
    };

    window.addEventListener(
      learningProgressChangedEventName,
      handleLearningProgressChanged,
    );
    window.addEventListener(
      conceptCheckProgressChangedEventName,
      handleConceptProgressChanged,
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        learningProgressChangedEventName,
        handleLearningProgressChanged,
      );
      window.removeEventListener(
        conceptCheckProgressChangedEventName,
        handleConceptProgressChanged,
      );
      window.removeEventListener("storage", handleStorage);
    };
  });

  function confirmReset(): void {
    const result = resetLearningProgress();

    if (!result.persisted) {
      showStorageWarning = true;
      return;
    }

    progress = result.progress;
    showStorageWarning = false;
    showResetConfirmation = false;
    dispatchLearningProgressChanged(progress);
  }

  async function openReviewClearConfirmation(): Promise<void> {
    showReviewClearConfirmation = true;
    await tick();
    confirmClearReviewButton?.focus();
  }

  async function cancelReviewClearConfirmation(): Promise<void> {
    showReviewClearConfirmation = false;
    await tick();
    clearReviewTrigger?.focus();
  }

  async function clearReviewRecords(): Promise<void> {
    const result = resetConceptCheckProgress();

    if (!result.persisted) {
      showConceptStorageWarning = true;
      return;
    }

    conceptProgress = result.progress;
    conceptSnapshotReadable = true;
    showConceptStorageWarning = false;
    showReviewClearConfirmation = false;
    reviewRecordsCleared = true;
    dispatchConceptCheckProgressChanged(conceptProgress);
    await tick();
    reviewStatus?.focus();
  }
</script>

<section class="home-learning-progress" data-testid="home-learning-progress">
  <div class="home-learning-status" aria-live="polite">
    {#if pathComplete}
      <p class="home-progress-label">{copy.pathComplete}</p>
    {:else}
      {#if completedCount > 0}
        <p class="home-progress-label">
          {copy.completedCount(completedCount, learningPath.length)}
        </p>
      {/if}
      <div class="actions home-learning-actions">
        {#if completedCount === 0}
          <a class="button primary" href={startChapter.href}>
            {copy.startLearning}
          </a>
        {:else if firstIncompleteChapter}
          <a class="button primary" href={firstIncompleteChapter.href}>
            {copy.continueLearning(firstIncompleteChapter.title)}
          </a>
        {/if}
        <a class="button" href="#learning-path">{copy.browseAllChapters}</a>
      </div>
    {/if}
  </div>

  {#if showReviewPanel}
    <section
      class="home-review-panel"
      data-testid="home-review-queue"
      aria-labelledby="home-review-heading"
    >
      <div class="home-review-heading">
        <p class="eyebrow">{copy.reviewEyebrow}</p>
        <h2 id="home-review-heading">{copy.reviewHeading}</h2>
      </div>

      {#if conceptSnapshotReadable}
        {#if reviewChapters.length > 0 && firstReviewChapter}
          <p class="home-review-status">
            {copy.reviewCount(reviewChapters.length)}
          </p>
          <p class="home-review-intro">{copy.reviewIntro}</p>
          <a class="home-review-primary" href={firstReviewChapter.href}>
            <span>
              <small
                >{copy.reviewChapterNumber(firstReviewChapter.number)}</small
              >
              <strong>{firstReviewChapter.title}</strong>
            </span>
            <span>{copy.reviewAction}</span>
          </a>

          {#if remainingReviewChapters.length > 0}
            <details class="home-review-more">
              <summary
                >{copy.reviewMore(remainingReviewChapters.length)}</summary
              >
              <ul class="home-review-list">
                {#each remainingReviewChapters as chapter}
                  <li>
                    <a href={chapter.href}>
                      <span>
                        <small>{copy.reviewChapterNumber(chapter.number)}</small
                        >
                        <strong>{chapter.title}</strong>
                      </span>
                      <span>{copy.reviewAction}</span>
                    </a>
                  </li>
                {/each}
              </ul>
            </details>
          {/if}
        {:else}
          <p
            bind:this={reviewStatus}
            class="home-review-status"
            data-testid="home-review-empty"
            role="status"
            tabindex="-1"
          >
            {reviewRecordsCleared ? copy.reviewCleared : copy.reviewEmpty}
          </p>
        {/if}

        <p class="home-review-boundary">{copy.reviewBoundary}</p>

        {#if hasConceptRecords}
          <div class="home-review-clear">
            {#if showReviewClearConfirmation}
              <span>{copy.clearReviewConfirmation}</span>
              <button
                bind:this={confirmClearReviewButton}
                class="button subtle"
                type="button"
                onclick={clearReviewRecords}
              >
                {copy.confirmClearReview}
              </button>
              <button
                class="button subtle"
                type="button"
                onclick={cancelReviewClearConfirmation}
              >
                {copy.cancelClearReview}
              </button>
            {:else}
              <button
                bind:this={clearReviewTrigger}
                class="button subtle"
                type="button"
                onclick={openReviewClearConfirmation}
              >
                {copy.clearReviewRecords}
              </button>
            {/if}
          </div>
        {/if}
      {/if}

      {#if showConceptStorageWarning}
        <p
          class="learning-warning"
          data-testid="review-storage-warning"
          aria-live="polite"
        >
          {copy.reviewStorageWarning}
        </p>
      {/if}
    </section>
  {/if}

  {#if pathComplete}
    <nav class="review-links" aria-label={copy.pathComplete}>
      {#each reviewLinks as link}
        <a href={link.href}>{link.label}</a>
      {/each}
    </nav>
  {/if}

  {#if showStorageWarning}
    <p
      class="learning-warning"
      data-testid="storage-warning"
      aria-live="polite"
    >
      {copy.storageWarning}
    </p>
  {/if}

  {#if completedCount > 0}
    {#if showResetConfirmation}
      <div class="home-reset-confirmation">
        <span>{copy.resetConfirmation}</span>
        <button
          class="home-learning-reset"
          type="button"
          onclick={confirmReset}
        >
          {copy.confirmReset}
        </button>
        <button
          class="home-learning-reset"
          type="button"
          onclick={() => (showResetConfirmation = false)}
        >
          {copy.cancelReset}
        </button>
      </div>
    {:else}
      <button
        class="home-learning-reset"
        type="button"
        onclick={() => (showResetConfirmation = true)}
      >
        {copy.resetProgress}
      </button>
    {/if}
  {/if}
</section>
