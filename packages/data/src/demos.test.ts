import { describe, expect, it } from "vitest";
import {
  agentLoopDemo,
  attentionMapDemo,
  bayesUpdateDemo,
  cnnKernelDemo,
  decisionBoundaryDemo,
  expertSystemDemo,
  ragPipelineDemo,
  searchTreeDemo,
} from "./index";

const demos = [
  ragPipelineDemo,
  attentionMapDemo,
  agentLoopDemo,
  searchTreeDemo,
  expertSystemDemo,
  bayesUpdateDemo,
  decisionBoundaryDemo,
  cnnKernelDemo,
];

describe("demo acceptance metadata", () => {
  it("gives every MVP demo concrete learning goals", () => {
    for (const demo of demos) {
      const learningGoals = (demo as { learningGoals?: string[] })
        .learningGoals;

      expect(learningGoals, demo.title).toEqual(expect.any(Array));
      expect(learningGoals?.length, demo.title).toBeGreaterThanOrEqual(2);
      expect(
        learningGoals?.every((goal) => goal.trim().length > 0),
        demo.title,
      ).toBe(true);
    }
  });
});
