<script lang="ts">
  import { onMount, tick } from "svelte";
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
  let showStorageWarning = false;
  let continueWithoutSaving = false;
  let finalCompletionHeading: HTMLHeadingElement | undefined;

  $: currentChapterComplete = progress.completedChapterIds.includes(chapterId);
  $: pathComplete = isLearningPathComplete(progress.completedChapterIds);
  $: firstIncompleteDefinition = getFirstIncompleteChapter(
    progress.completedChapterIds,
  );
  $: firstIncompleteChapter = firstIncompleteDefinition
    ? getLocalizedLearningChapter(firstIncompleteDefinition.id, locale)
    : undefined;

  function syncProgress(): void {
    const snapshot = readLearningProgress();
    progress = snapshot.progress;
    showStorageWarning = !snapshot.storageAvailable;
    continueWithoutSaving = !snapshot.storageAvailable;
  }

  onMount(() => {
    syncProgress();

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

  function completeBeforeNavigation(event: MouseEvent): void {
    const result = completeLearningChapter(chapterId);

    if (!result.persisted) {
      event.preventDefault();
      showStorageWarning = true;
      continueWithoutSaving = true;
      return;
    }

    progress = result.progress;
    showStorageWarning = false;
    dispatchLearningProgressChanged(progress);
  }

  async function completeFinalChapter(): Promise<void> {
    const result = completeLearningChapter(chapterId);

    if (!result.persisted) {
      showStorageWarning = true;
      return;
    }

    progress = result.progress;
    showStorageWarning = false;
    dispatchLearningProgressChanged(progress);
    await tick();
    finalCompletionHeading?.focus();
  }
</script>

<section class="chapter-journey" data-testid="chapter-journey">
  <div class="chapter-journey-status" aria-live="polite">
    {#if currentChapterComplete}
      <h2 bind:this={finalCompletionHeading} tabindex="-1">
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
      {#if continueWithoutSaving}
        <a
          class="button primary"
          data-testid="complete-and-continue"
          href={nextChapter.href}
        >
          <span>{copy.continueWithoutSaving}</span>
          <small>{copy.nextChapter(nextChapter.title)}</small>
        </a>
      {:else}
        <a
          class="button primary"
          data-testid="complete-and-continue"
          href={nextChapter.href}
          onclick={completeBeforeNavigation}
        >
          <span>{copy.completeAndContinue}</span>
          <small>{copy.nextChapter(nextChapter.title)}</small>
        </a>
      {/if}
    {:else}
      <button
        class="button primary"
        data-testid="complete-and-continue"
        type="button"
        onclick={completeFinalChapter}
      >
        {copy.completeAndContinue}
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
