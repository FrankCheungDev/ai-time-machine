<script lang="ts">
  import { onMount, tick } from "svelte";
  import { emitLearningSignal } from "../../analytics/learningSignals";
  import {
    learningUiCopy,
    getLocalizedLearningChapter,
  } from "../../i18n/learning";
  import { toLocalizedPath, type Locale } from "../../i18n/locales";
  import {
    getFirstIncompleteChapter,
    getLearningPathContext,
    isLearningPathComplete,
    type LearningChapterId,
  } from "../../learning/learningPath";
  import {
    completeLearningChapter,
    createEmptyLearningProgress,
    dispatchLearningProgressChanged,
    learningProgressChangedEventName,
    learningProgressStorageKey,
    readLearningProgress,
  } from "../../learning/learningProgress";

  export let locale: Locale;
  export let chapterId: LearningChapterId;

  const copy = learningUiCopy[locale];
  const context = getLearningPathContext(chapterId);
  const previousChapter = context.previous
    ? getLocalizedLearningChapter(context.previous.id, locale)
    : undefined;
  const nextChapter = context.next
    ? getLocalizedLearningChapter(context.next.id, locale)
    : undefined;
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
  let hydrated = false;
  let showStorageWarning = false;
  let transientChapterComplete = false;
  let completionSubmitted = false;
  let continuationSubmitted = false;
  let completionHeading: HTMLHeadingElement | undefined;

  $: effectiveCompletedChapterIds = transientChapterComplete
    ? [...new Set([...progress.completedChapterIds, chapterId])]
    : progress.completedChapterIds;
  $: currentChapterComplete = effectiveCompletedChapterIds.includes(chapterId);
  $: pathComplete = isLearningPathComplete(effectiveCompletedChapterIds);
  $: firstIncompleteDefinition = getFirstIncompleteChapter(
    effectiveCompletedChapterIds,
  );
  $: firstIncompleteChapter = firstIncompleteDefinition
    ? getLocalizedLearningChapter(firstIncompleteDefinition.id, locale)
    : undefined;

  function syncProgress(): void {
    const snapshot = readLearningProgress();
    progress = snapshot.progress;
    showStorageWarning = !snapshot.storageAvailable;
    if (snapshot.storageAvailable) transientChapterComplete = false;
  }

  onMount(() => {
    hydrated = true;
    syncProgress();
    emitLearningSignal({
      name: "chapter_started",
      chapterId,
      locale,
    });

    const handleProgressChanged = (): void => syncProgress();
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === learningProgressStorageKey) {
        syncProgress();
      }
    };

    window.addEventListener(
      learningProgressChangedEventName,
      handleProgressChanged,
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        learningProgressChangedEventName,
        handleProgressChanged,
      );
      window.removeEventListener("storage", handleStorage);
    };
  });

  function emitCoreCompletion(): void {
    emitLearningSignal({
      name: "core_interaction_completed",
      chapterId,
      locale,
      completionSource: "chapter-journey",
    });
  }

  function emitNextChapter(nextChapterId: LearningChapterId): void {
    emitLearningSignal({
      name: "next_chapter_continued",
      chapterId,
      locale,
      nextChapterId,
    });
  }

  function continueToNextChapter(nextChapterId: LearningChapterId): void {
    if (continuationSubmitted) return;
    continuationSubmitted = true;
    emitNextChapter(nextChapterId);
  }

  async function completeChapter(): Promise<void> {
    if (currentChapterComplete || completionSubmitted) return;
    completionSubmitted = true;

    const result = completeLearningChapter(chapterId);

    if (result.persisted) {
      progress = result.progress;
      transientChapterComplete = false;
      showStorageWarning = false;
      dispatchLearningProgressChanged(progress);
    } else {
      transientChapterComplete = true;
      showStorageWarning = true;
    }

    emitCoreCompletion();
    await tick();
    completionHeading?.focus();
  }
</script>

<section class="chapter-journey" data-testid="chapter-journey">
  <div class="chapter-journey-status" aria-live="polite">
    {#if currentChapterComplete}
      <h2 bind:this={completionHeading} tabindex="-1">
        {pathComplete ? copy.pathComplete : copy.currentChapterComplete}
      </h2>
      {#if !pathComplete && !nextChapter && firstIncompleteChapter}
        <a class="button subtle" href={firstIncompleteChapter.href}>
          {copy.continueFirstIncomplete(firstIncompleteChapter.title)}
        </a>
      {/if}
    {/if}
  </div>

  {#if showStorageWarning}
    <p
      class="learning-warning"
      data-testid="storage-warning"
      aria-live="polite"
    >
      {copy.storageWarning}
    </p>
  {/if}

  <div class="chapter-journey-links">
    {#if previousChapter}
      <a class="button subtle" href={previousChapter.href}>
        {copy.previousChapter(previousChapter.title)}
      </a>
    {/if}

    {#if nextChapter}
      {#if currentChapterComplete}
        <a
          class="button primary"
          data-testid="continue-next-chapter"
          href={nextChapter.href}
          onclick={() => continueToNextChapter(nextChapter.id)}
        >
          <span>{copy.nextChapter(nextChapter.title)}</span>
        </a>
      {:else}
        <button
          class="button primary"
          data-testid="complete-chapter"
          type="button"
          disabled={!hydrated || completionSubmitted}
          onclick={completeChapter}
        >
          {copy.completeChapter}
        </button>
        <noscript>
          <a
            class="button primary"
            data-testid="continue-next-chapter"
            href={nextChapter.href}
          >
            <span>{copy.nextChapter(nextChapter.title)}</span>
          </a>
        </noscript>
      {/if}
    {:else if !currentChapterComplete}
      <button
        class="button primary"
        data-testid="complete-chapter"
        type="button"
        disabled={!hydrated || completionSubmitted}
        onclick={completeChapter}
      >
        {copy.completeChapter}
      </button>
    {/if}
  </div>

  {#if !nextChapter}
    <nav class="review-links" aria-label={copy.browseAllChapters}>
      {#each reviewLinks as link}
        <a href={link.href}>{link.label}</a>
      {/each}
    </nav>
  {/if}
</section>
