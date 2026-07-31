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
  it("ships one reviewed feedback-learning path with stable ordered events", () => {
    const stories = getCausalStories();

    expect(stories).toHaveLength(1);
    expect(stories[0]?.id).toBe("feedback-learning");
    expect(stories[0]?.steps.map(({ eventId }) => eventId)).toEqual([
      "samuel-checkers",
      "q-learning",
      "dqn-atari",
      "alphago",
      "instructgpt-human-feedback",
      "react-agent-loop",
    ]);
    expect(isCausalStoryId("feedback-learning")).toBe(true);
    expect(isCausalStoryId("unknown-story")).toBe(false);
  });

  it("keeps story, step, action, and return-link IDs unique", () => {
    const stories = getCausalStories();

    expect(new Set(stories.map(({ id }) => id)).size).toBe(stories.length);

    for (const story of stories) {
      expect(new Set(story.steps.map(({ id }) => id)).size).toBe(
        story.steps.length,
      );

      const links = [
        ...story.actions,
        story.returnLinks.timeline,
        story.returnLinks.lineage,
      ];
      expect(new Set(links.map(({ id }) => id)).size).toBe(links.length);
    }
  });

  it("resolves every event, source, lineage node, chapter, and action target", () => {
    const eventById = new Map(
      getAiTimelineEvents().map((event) => [event.id, event]),
    );
    const lineageNodeIds = new Set(getAiLineageNodes().map(({ id }) => id));
    const chapterIds = new Set(chapterRegistry.map(({ id }) => id));

    for (const story of getCausalStories()) {
      for (const step of story.steps) {
        const event = eventById.get(step.eventId);
        expect(event, `${story.id}:${step.eventId}`).toBeDefined();
        expect(
          event?.sources.length,
          `${story.id}:${step.eventId}:sources`,
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

      expect(story.actions.length).toBeGreaterThan(0);
      for (const action of story.actions) {
        expect(action.kind).toBe("chapter");
        expect(action.chapterId).toBeDefined();
        expect(chapterIds).toContain(action.chapterId);
        expect(action.href).toBe(
          chapterRegistry.find(({ id }) => id === action.chapterId)?.route,
        );
      }
      expect(story.returnLinks.timeline.href).toBe(
        `/timeline/?story=${story.id}#story-${story.id}`,
      );
      expect(story.returnLinks.lineage.href).toBe(
        `/lineage/?story=${story.id}#story-${story.id}`,
      );
    }
  });

  it("localizes copy without changing story identity or references", () => {
    const project = (locale: "zh-CN" | "en") => {
      const story = getCausalStory("feedback-learning", locale);
      return {
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
      };
    };

    expect(project("en")).toEqual(project("zh-CN"));
    expect(getCausalStory("feedback-learning", "en").title).not.toBe(
      getCausalStory("feedback-learning", "zh-CN").title,
    );
    expect(
      JSON.stringify(getCausalStory("feedback-learning", "en")),
    ).not.toMatch(/[\u3400-\u9fff，。；！？：、“”‘’（）【】《》]/u);
  });

  it("returns defensive deep copies", () => {
    const returned = getCausalStory("feedback-learning");
    returned.steps[0]!.lineageNodeIds[0] = "mutated";
    returned.steps[0]!.inherited = "mutated";
    returned.actions[0]!.label = "mutated";
    returned.returnLinks.timeline.label = "mutated";

    const fresh = getCausalStory("feedback-learning");
    expect(fresh.steps[0]?.lineageNodeIds[0]).not.toBe("mutated");
    expect(fresh.steps[0]?.inherited).not.toBe("mutated");
    expect(fresh.actions[0]?.label).not.toBe("mutated");
    expect(fresh.returnLinks.timeline.label).not.toBe("mutated");
    expect(causalStories[0]?.steps[0]?.inherited).not.toBe("mutated");
  });
});
