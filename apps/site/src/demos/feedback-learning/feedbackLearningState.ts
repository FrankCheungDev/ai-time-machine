export type FeedbackLearningMode = "training" | "runtime";

export interface FeedbackLearningViewState {
  currentIndex: number;
  mode: FeedbackLearningMode;
}

export type EpisodeStatus = "pending" | "active" | "complete";

export const initialFeedbackLearningState: FeedbackLearningViewState = {
  currentIndex: 0,
  mode: "training",
};

export function getPreviousFeedbackLearningState(
  state: FeedbackLearningViewState,
): FeedbackLearningViewState {
  const currentIndex = Math.max(0, state.currentIndex - 1);

  return {
    currentIndex,
    mode:
      currentIndex < state.currentIndex && state.mode === "runtime"
        ? "training"
        : state.mode,
  };
}

export function getNextFeedbackLearningState(
  state: FeedbackLearningViewState,
  stepCount: number,
): FeedbackLearningViewState {
  const lastIndex = Math.max(0, stepCount - 1);
  const currentIndex = Math.min(lastIndex, state.currentIndex + 1);

  return {
    currentIndex,
    mode: currentIndex === lastIndex ? "runtime" : state.mode,
  };
}

export function setFeedbackLearningMode(
  _state: FeedbackLearningViewState,
  mode: FeedbackLearningMode,
  stepCount: number,
): FeedbackLearningViewState {
  const runtimeIndex = Math.max(0, stepCount - 1);

  return {
    currentIndex:
      mode === "runtime" ? runtimeIndex : Math.max(0, runtimeIndex - 1),
    mode,
  };
}

export function resetFeedbackLearningState(): FeedbackLearningViewState {
  return { ...initialFeedbackLearningState };
}

export function getEpisodeStatus(
  currentIndex: number,
  episodeId: "baseline" | "exploration",
): EpisodeStatus {
  const activeIndex = episodeId === "baseline" ? 1 : 2;

  if (currentIndex < activeIndex) return "pending";
  if (currentIndex === activeIndex) return "active";
  return "complete";
}

export function getPolicySnapshotId(
  currentIndex: number,
): "initial" | "updated" {
  return currentIndex >= 4 ? "updated" : "initial";
}
