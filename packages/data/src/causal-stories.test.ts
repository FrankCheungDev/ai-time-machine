import { describe, expect, it } from "vitest";
import {
  causalStories,
  chapterRegistry,
  getAiLineageNodes,
  getAiTimelineEvents,
  getCausalStories,
  getCausalStory,
  isCausalStoryId,
} from "./index";

describe("causal story manifest", () => {
  it("ships exactly three reviewed paths with stable ordered events", () => {
    const stories = getCausalStories();

    const expectedEventIds = {
      "feedback-learning": [
        "samuel-checkers",
        "q-learning",
        "dqn-atari",
        "alphago",
        "instructgpt-human-feedback",
        "react-agent-loop",
      ],
      "rules-to-representations": [
        "astar-formalized",
        "mycin-consultation",
        "bayesian-networks",
        "support-vector-networks",
        "lenet-document-recognition",
        "imagenet-dataset",
        "alexnet-gpu-scale",
      ],
      "scaled-models-to-reliable-systems": [
        "transformer",
        "language-model-scaling-laws",
        "gpt3-few-shot",
        "rag",
        "instructgpt-human-feedback",
        "react-agent-loop",
        "nist-generative-ai-profile",
      ],
    } as const;

    expect(stories).toHaveLength(3);
    expect(stories.map(({ id }) => id)).toEqual(Object.keys(expectedEventIds));

    for (const story of stories) {
      expect(story.steps.length, story.id).toBeGreaterThanOrEqual(5);
      expect(story.steps.length, story.id).toBeLessThanOrEqual(7);
      expect(story.steps.map(({ eventId }) => eventId)).toEqual(
        expectedEventIds[story.id],
      );
      expect(isCausalStoryId(story.id)).toBe(true);
    }

    expect(isCausalStoryId("unknown-story")).toBe(false);
  });

  it("keeps every story, step, action, and return-link ID globally unique", () => {
    const stories = getCausalStories();
    const allIds = stories.flatMap((story) => [
      story.id,
      ...story.steps.map(({ id }) => id),
      ...story.actions.map(({ id }) => id),
      story.returnLinks.timeline.id,
      story.returnLinks.lineage.id,
    ]);

    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("resolves every event, source, lineage node, chapter, and action target", () => {
    const eventById = new Map(
      getAiTimelineEvents().map((event) => [event.id, event]),
    );
    const lineageNodeIds = new Set(getAiLineageNodes().map(({ id }) => id));
    const chapterIds = new Set(chapterRegistry.map(({ id }) => id));

    for (const story of getCausalStories()) {
      expect(story.steps.length, `${story.id}:steps`).toBeGreaterThan(0);

      for (const step of story.steps) {
        const event = eventById.get(step.eventId);
        expect(event, `${story.id}:${step.eventId}`).toBeDefined();
        expect(
          event?.sources.length,
          `${story.id}:${step.eventId}:sources`,
        ).toBeGreaterThan(0);
        expect(
          step.lineageNodeIds.length,
          `${story.id}:${step.id}:lineage`,
        ).toBeGreaterThan(0);
        expect(
          step.chapterIds.length,
          `${story.id}:${step.id}:chapters`,
        ).toBeGreaterThan(0);

        for (const nodeId of step.lineageNodeIds) {
          expect(lineageNodeIds, `${step.id}:${nodeId}`).toContain(nodeId);
        }
        for (const chapterId of step.chapterIds) {
          expect(chapterIds, `${step.id}:${chapterId}`).toContain(chapterId);
        }

        expect(step.title.trim()).not.toBe("");
        expect(step.inherited.trim()).not.toBe("");
        expect(step.solved.trim()).not.toBe("");
        expect(step.missing.trim()).not.toBe("");
      }

      expect(story.title.trim()).not.toBe("");
      expect(story.coreQuestion.trim()).not.toBe("");
      expect(story.simplificationNote.trim()).not.toBe("");
      expect(story.actions.length).toBeGreaterThan(0);
      for (const action of story.actions) {
        expect(action.kind).toBe("chapter");
        expect(action.label.trim()).not.toBe("");
        expect(action.chapterId).toBeDefined();
        expect(chapterIds).toContain(action.chapterId);
        expect(action.href).toBe(
          chapterRegistry.find(({ id }) => id === action.chapterId)?.route,
        );
      }
      expect(story.returnLinks.timeline.href).toBe(
        `/timeline/?story=${story.id}#story-${story.id}`,
      );
      expect(story.returnLinks.timeline.kind).toBe("timeline");
      expect(story.returnLinks.timeline.label.trim()).not.toBe("");
      expect(story.returnLinks.lineage.href).toBe(
        `/lineage/?story=${story.id}#story-${story.id}`,
      );
      expect(story.returnLinks.lineage.kind).toBe("lineage");
      expect(story.returnLinks.lineage.label.trim()).not.toBe("");
    }
  });

  it("localizes copy without changing story identity or references", () => {
    const project = (locale: "zh-CN" | "en") =>
      getCausalStories(locale).map((story) => ({
        id: story.id,
        steps: story.steps.map(
          ({ id, eventId, lineageNodeIds, chapterIds }) => ({
            id,
            eventId,
            lineageNodeIds,
            chapterIds,
          }),
        ),
        actions: story.actions.map(({ id, kind, href, chapterId }) => ({
          id,
          kind,
          href,
          chapterId,
        })),
        returnLinks: {
          timeline: {
            id: story.returnLinks.timeline.id,
            kind: story.returnLinks.timeline.kind,
            href: story.returnLinks.timeline.href,
          },
          lineage: {
            id: story.returnLinks.lineage.id,
            kind: story.returnLinks.lineage.kind,
            href: story.returnLinks.lineage.href,
          },
        },
      }));

    expect(project("en")).toEqual(project("zh-CN"));

    for (const story of getCausalStories()) {
      expect(getCausalStory(story.id, "en").title).not.toBe(
        getCausalStory(story.id, "zh-CN").title,
      );
    }

    expect(JSON.stringify(getCausalStories("en"))).not.toMatch(
      /[\u3400-\u9fff，。；！？：、“”‘’（）【】《》]/u,
    );
  });

  it("returns defensive deep copies", () => {
    for (const story of getCausalStories()) {
      const returned = getCausalStory(story.id);
      returned.steps[0]!.lineageNodeIds[0] = "mutated";
      returned.steps[0]!.inherited = "mutated";
      returned.actions[0]!.label = "mutated";
      returned.returnLinks.timeline.label = "mutated";

      const fresh = getCausalStory(story.id);
      expect(fresh.steps[0]?.lineageNodeIds[0]).not.toBe("mutated");
      expect(fresh.steps[0]?.inherited).not.toBe("mutated");
      expect(fresh.actions[0]?.label).not.toBe("mutated");
      expect(fresh.returnLinks.timeline.label).not.toBe("mutated");
      expect(
        causalStories.find(({ id }) => id === story.id)?.steps[0]?.inherited,
      ).not.toBe("mutated");
    }
  });
});
