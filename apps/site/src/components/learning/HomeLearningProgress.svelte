<script lang="ts">
  import { onMount } from "svelte";
  import {
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
    createEmptyLearningProgress,
    dispatchLearningProgressChanged,
    learningProgressChangedEventName,
    learningProgressStorageKey,
    readLearningProgress,
    resetLearningProgress,
  } from "../../learning/learningProgress";

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
  let showStorageWarning = false;
  let showResetConfirmation = false;

  $: completedCount = progress.completedChapterIds.length;
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
</script>

<section class="home-learning-progress" data-testid="home-learning-progress">
  <div class="home-learning-status" aria-live="polite">
    {#if pathComplete}
      <p class="home-progress-label">{copy.pathComplete}</p>
      <nav class="review-links" aria-label={copy.pathComplete}>
        {#each reviewLinks as link}
          <a href={link.href}>{link.label}</a>
        {/each}
      </nav>
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
        <a class="button" href="#mvp">{copy.browseAllChapters}</a>
      </div>
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
