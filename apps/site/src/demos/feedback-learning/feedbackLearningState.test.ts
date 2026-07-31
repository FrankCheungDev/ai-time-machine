import { describe, expect, it } from "vitest";
import {
  getEpisodeStatus,
  getNextFeedbackLearningState,
  getPolicySnapshotId,
  getPreviousFeedbackLearningState,
  initialFeedbackLearningState,
  resetFeedbackLearningState,
  setFeedbackLearningMode,
} from "./feedbackLearningState";

describe("feedback learning view state", () => {
  it("walks six deterministic steps and enters runtime at the boundary step", () => {
    let state = resetFeedbackLearningState();

    for (let index = 0; index < 5; index += 1) {
      state = getNextFeedbackLearningState(state, 6);
    }

    expect(state).toEqual({ currentIndex: 5, mode: "runtime" });
    expect(getNextFeedbackLearningState(state, 6)).toEqual(state);
  });

  it("returns to the training view when leaving the runtime boundary step", () => {
    const previous = getPreviousFeedbackLearningState({
      currentIndex: 5,
      mode: "runtime",
    });

    expect(previous).toEqual({ currentIndex: 4, mode: "training" });
    expect(
      getPreviousFeedbackLearningState(initialFeedbackLearningState),
    ).toEqual(initialFeedbackLearningState);
  });

  it("keeps the comparison switch aligned with the training and runtime steps", () => {
    const runtime = setFeedbackLearningMode(
      { currentIndex: 2, mode: "training" },
      "runtime",
      6,
    );

    expect(runtime).toEqual({ currentIndex: 5, mode: "runtime" });
    expect(setFeedbackLearningMode(runtime, "training", 6)).toEqual({
      currentIndex: 4,
      mode: "training",
    });
  });

  it("resets both the walkthrough and the boundary comparison", () => {
    const reset = resetFeedbackLearningState();

    expect(reset).toEqual(initialFeedbackLearningState);
    expect(reset).not.toBe(initialFeedbackLearningState);
  });

  it("derives episode progress and the illustrative policy boundary", () => {
    expect(getEpisodeStatus(0, "baseline")).toBe("pending");
    expect(getEpisodeStatus(1, "baseline")).toBe("active");
    expect(getEpisodeStatus(2, "baseline")).toBe("complete");
    expect(getEpisodeStatus(1, "exploration")).toBe("pending");
    expect(getEpisodeStatus(2, "exploration")).toBe("active");
    expect(getEpisodeStatus(3, "exploration")).toBe("complete");
    expect(getPolicySnapshotId(3)).toBe("initial");
    expect(getPolicySnapshotId(4)).toBe("updated");
  });
});
