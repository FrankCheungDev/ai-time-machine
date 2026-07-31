import { describe, expect, it } from "vitest";
import { getFeedbackLearningDemo } from "./index";

describe("feedback learning demo contract", () => {
  it("defines the fixed six-step training and runtime sequence", () => {
    const demo = getFeedbackLearningDemo();

    expect(demo.steps.map(({ id, stage }) => ({ id, stage }))).toEqual([
      { id: "read-state", stage: "training" },
      { id: "run-baseline", stage: "training" },
      { id: "run-exploration", stage: "training" },
      { id: "compare-returns", stage: "training" },
      { id: "update-policy", stage: "training" },
      { id: "compare-runtime", stage: "runtime" },
    ]);
    expect(demo.steps.at(-1)).toMatchObject({
      findingTone: "boundary",
      policySnapshotId: "updated",
    });
    expect(demo.defaultBoundaryViewId).toBe("training");
  });

  it("keeps every topology reference valid and unique", () => {
    const demo = getFeedbackLearningDemo();
    const nodeIds = new Set(demo.nodes.map(({ id }) => id));
    const edgeIds = new Set(demo.edges.map(({ id }) => id));

    expect(nodeIds.size).toBe(demo.nodes.length);
    expect(edgeIds.size).toBe(demo.edges.length);

    for (const edge of demo.edges) {
      expect(nodeIds, `${edge.id}:from`).toContain(edge.from);
      expect(nodeIds, `${edge.id}:to`).toContain(edge.to);
    }

    for (const step of demo.steps) {
      expect(nodeIds, `${step.id}:node`).toContain(step.nodeId);
      for (const nodeId of step.activeNodeIds) {
        expect(nodeIds, `${step.id}:${nodeId}`).toContain(nodeId);
      }
      for (const edgeId of step.activeEdgeIds) {
        expect(edgeIds, `${step.id}:${edgeId}`).toContain(edgeId);
      }
    }

    for (const view of demo.boundaryViews) {
      for (const nodeId of view.activeNodeIds) {
        expect(nodeIds, `${view.id}:${nodeId}`).toContain(nodeId);
      }
      for (const edgeId of view.activeEdgeIds) {
        expect(edgeIds, `${view.id}:${edgeId}`).toContain(edgeId);
      }
    }
  });

  it("uses exactly two scripted episodes and updates only after return comparison", () => {
    const demo = getFeedbackLearningDemo();
    const transitions = new Map(
      demo.transitions.map((transition) => [transition.id, transition]),
    );

    expect(demo.episodes.map(({ id }) => id)).toEqual([
      "baseline",
      "exploration",
    ]);

    for (const episode of demo.episodes) {
      const episodeTransitions = episode.transitionIds.map((transitionId) => {
        const transition = transitions.get(transitionId);
        expect(transition, `${episode.id}:${transitionId}`).toBeDefined();
        expect(transition?.episodeId).toBe(episode.id);
        return transition!;
      });

      expect(episodeTransitions.map(({ actionId }) => actionId)).toEqual(
        episode.actionIds,
      );
      expect(episodeTransitions.map(({ reward }) => reward)).toEqual(
        episode.rewards,
      );
      expect(episode.rewards.reduce((sum, reward) => sum + reward, 0)).toBe(
        episode.returnValue,
      );
    }

    expect(demo.policySnapshots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "initial",
          leftProbability: 0.7,
          rightProbability: 0.3,
        }),
        expect.objectContaining({
          id: "updated",
          leftProbability: 0.4,
          rightProbability: 0.6,
        }),
      ]),
    );
    for (const policy of demo.policySnapshots) {
      expect(policy.leftProbability + policy.rightProbability).toBe(1);
    }
  });

  it("keeps four feedback signals and the runtime weight boundary explicit", () => {
    const demo = getFeedbackLearningDemo();

    expect(demo.signalComparisons.map(({ id }) => id)).toEqual([
      "target-label",
      "reward-return",
      "preference-comparison",
      "runtime-observation",
    ]);
    expect(
      demo.boundaryViews.find(({ id }) => id === "runtime")?.weightStatus,
    ).toContain("保持不变");
    expect(
      demo.signalComparisons.find(({ id }) => id === "runtime-observation")
        ?.boundary,
    ).toContain("不自动");
  });
});
