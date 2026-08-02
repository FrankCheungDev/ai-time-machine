import { expect, test } from "@playwright/test";
import {
  getAiLineageNodes,
  getAiTimelineEvents,
  getCausalStories,
} from "@ai-history/data";

const stories = getCausalStories();
const englishStoriesById = new Map(
  getCausalStories("en").map((story) => [story.id, story]),
);
const eventCount = getAiTimelineEvents().length;
const lineageNodes = getAiLineageNodes();
const lineageNodeCount = lineageNodes.length;

for (const story of stories) {
  const storyEventIds = story.steps.map((step) => step.eventId);
  const storyNodeSteps = new Map<string, number[]>();

  story.steps.forEach((step, index) => {
    for (const nodeId of step.lineageNodeIds) {
      const positions = storyNodeSteps.get(nodeId) ?? [];
      positions.push(index + 1);
      storyNodeSteps.set(nodeId, positions);
    }
  });

  test(`timeline restores the ordered ${story.id} story without hiding history`, async ({
    page,
  }) => {
    await page.goto(`/timeline/?story=${story.id}#story-${story.id}`);
    await page.reload();

    const explorer = page.locator("[data-causal-timeline]");
    const storySelect = explorer.getByLabel("引导式故事");
    const storyDetail = explorer.locator(
      `[data-causal-story-detail="${story.id}"]`,
    );

    await expect(storySelect).toHaveValue(story.id);
    await expect(storyDetail).toBeVisible();
    await expect(
      storyDetail.getByRole("heading", { name: story.title }),
    ).toBeVisible();
    await expect(storyDetail.locator("[data-story-event-id]")).toHaveCount(
      story.steps.length,
    );
    await expect(explorer).toContainText(
      `故事按顺序聚焦 ${story.steps.length} / ${eventCount} 个事件`,
    );

    await expect(page.locator("[data-timeline-event]:visible")).toHaveCount(
      eventCount,
    );
    await expect(page.locator(".milestone-event.is-story-focus")).toHaveCount(
      story.steps.length,
    );
    await expect(page.locator(".milestone-event.is-story-muted")).toHaveCount(
      eventCount - story.steps.length,
    );

    const firstStep = story.steps[0]!;
    const lastStep = story.steps.at(-1)!;
    await expect(
      page.locator(`[data-timeline-event="${firstStep.eventId}"]`),
    ).toContainText(`第 1 / ${story.steps.length} 步`);
    await expect(
      page.locator(`[data-timeline-event="${lastStep.eventId}"]`),
    ).toContainText(`第 ${story.steps.length} / ${story.steps.length} 步`);

    const firstAction = story.actions[0]!;
    await expect(
      storyDetail.getByRole("link", { name: firstAction.label }),
    ).toHaveAttribute("href", firstAction.href);

    for (const eventId of storyEventIds) {
      await expect(
        page.locator(`[data-timeline-event="${eventId}"]`),
      ).toHaveClass(/is-story-focus/);
    }
  });

  test(`lineage restores the ${story.id} story and keeps every node available`, async ({
    page,
  }) => {
    await page.goto(`/lineage/?story=${story.id}#story-${story.id}`);

    const storySelect = page.getByLabel("引导式故事");
    const focusSelect = page.getByLabel("聚焦一个谱系节点");
    const storyDetail = page.locator(
      `[data-causal-story-detail="${story.id}"]`,
    );

    await expect(storySelect).toHaveValue(story.id);
    await expect(focusSelect).toHaveValue("");
    await expect(storyDetail).toBeVisible();
    await expect(storyDetail.locator("[data-story-event-id]")).toHaveCount(
      story.steps.length,
    );
    await expect(page.locator("[data-lineage-node]:visible")).toHaveCount(
      lineageNodeCount,
    );

    for (const [nodeId, positions] of storyNodeSteps) {
      const node = page.locator(`#node-${nodeId}`);
      await expect(node).toHaveClass(/is-story-focus/);
      await expect(node).toHaveAttribute(
        "data-story-step-order",
        positions.join(" "),
      );
    }

    const mutedNode = lineageNodes.find((node) => !storyNodeSteps.has(node.id));
    if (mutedNode) {
      await expect(page.locator(`#node-${mutedNode.id}`)).toHaveClass(
        /is-story-muted/,
      );
    }

    await focusSelect.selectOption("rag");
    await expect(storySelect).toHaveValue("");
    await expect(page).toHaveURL(/\/lineage\/\?lineage=rag#node-rag$/);
    await expect(page.locator("#node-rag")).toHaveClass(/is-causal-focus/);
    await expect(page.locator("[data-lineage-story-region]")).toBeHidden();

    await storySelect.selectOption(story.id);
    await expect(focusSelect).toHaveValue("");
    await expect(page).toHaveURL(
      new RegExp(`/lineage/\\?story=${story.id}#story-${story.id}$`),
    );
  });

  for (const path of ["timeline", "lineage"] as const) {
    test(`${path} language switch preserves the ${story.id} query and fragment`, async ({
      page,
    }) => {
      await page.goto(`/${path}/?story=${story.id}#story-${story.id}`);

      const languageSwitch = page.getByRole("link", { name: "English" });
      await expect(languageSwitch).toHaveAttribute(
        "href",
        `/en/${path}/?story=${story.id}#story-${story.id}`,
      );
      await languageSwitch.click();

      await expect(page).toHaveURL(
        new RegExp(`/en/${path}/\\?story=${story.id}#story-${story.id}$`),
      );
      await expect(page.getByLabel("Guided story")).toHaveValue(story.id);
      await expect(
        page.getByRole("heading", {
          name: englishStoriesById.get(story.id)!.title,
        }),
      ).toBeVisible();
    });
  }
}

test("timeline keeps story and direct filters mutually exclusive", async ({
  page,
}) => {
  const story = stories[0]!;
  await page.goto(
    "/timeline/?chapter=foundation-model&lineage=safety#milestone-instructgpt-human-feedback",
  );

  const explorer = page.locator("[data-causal-timeline]");
  const chapterSelect = explorer.getByLabel("学习章节");
  const lineageSelect = explorer.getByLabel("技术谱系");
  const storySelect = explorer.getByLabel("引导式故事");

  await storySelect.selectOption(story.id);
  await expect(chapterSelect).toHaveValue("");
  await expect(lineageSelect).toHaveValue("");
  await expect(page).toHaveURL(
    new RegExp(`/timeline/\\?story=${story.id}#story-${story.id}$`),
  );

  await chapterSelect.selectOption("reinforcement-learning");
  await expect(storySelect).toHaveValue("");
  await expect(page).toHaveURL(/\/timeline\/\?chapter=reinforcement-learning$/);
  await expect(page.locator("[data-timeline-story-region]")).toBeHidden();

  await storySelect.selectOption(story.id);
  await lineageSelect.selectOption("reinforcement-learning");
  await expect(storySelect).toHaveValue("");
  await expect(chapterSelect).toHaveValue("");
  await expect(page).toHaveURL(/\/timeline\/\?lineage=reinforcement-learning$/);
});

test("invalid story ids are removed and safely restore the complete views", async ({
  page,
}) => {
  await page.goto("/timeline/?story=not-a-story#story-not-a-story");

  await expect(page).toHaveURL(/\/timeline\/$/);
  await expect(page.getByLabel("引导式故事")).toHaveValue("");
  await expect(page.locator("[data-timeline-event]:visible")).toHaveCount(
    eventCount,
  );
  await expect(page.locator(".milestone-event.is-story-muted")).toHaveCount(0);
  await expect(page.locator("[data-language-switch]")).toHaveAttribute(
    "href",
    "/en/timeline/",
  );

  await page.goto("/lineage/?story=not-a-story#story-not-a-story");

  await expect(page).toHaveURL(/\/lineage\/$/);
  await expect(page.getByLabel("引导式故事")).toHaveValue("");
  await expect(page.locator("[data-lineage-node]:visible")).toHaveCount(
    lineageNodeCount,
  );
  await expect(page.locator(".lineage-node.is-story-muted")).toHaveCount(0);
});

test("no-JavaScript fallback keeps every story, event, source, and chapter action accessible", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const story = stories[0]!;

  await page.goto(`/timeline/?story=${story.id}#story-${story.id}`);
  await expect(page.locator("[data-causal-timeline]")).toBeVisible();
  await expect(page.locator("[data-timeline-event]:visible")).toHaveCount(
    eventCount,
  );
  await expect(page.locator("[data-timeline-event][hidden]")).toHaveCount(0);
  await expect(
    page.locator(
      "[data-timeline-story-region] [data-causal-story-detail]:visible",
    ),
  ).toHaveCount(stories.length);

  for (const candidate of stories) {
    const detail = page.locator(
      `[data-timeline-story-region] [data-causal-story-detail="${candidate.id}"]`,
    );
    await expect(
      detail.getByRole("heading", { name: candidate.title }),
    ).toBeVisible();
    const action = candidate.actions[0]!;
    await expect(
      detail.getByRole("link", { name: action.label }),
    ).toHaveAttribute("href", action.href);
  }

  const sourceEvent = page.locator('[data-timeline-event="q-learning"]');
  await expect(sourceEvent).toBeVisible();
  await expect(sourceEvent.locator(".milestone-sources a")).not.toHaveCount(0);

  await page.goto(`/lineage/?story=${story.id}#story-${story.id}`);
  await expect(page.locator("[data-lineage-node]:visible")).toHaveCount(
    lineageNodeCount,
  );
  await expect(
    page.locator(
      "[data-lineage-story-region] [data-causal-story-detail]:visible",
    ),
  ).toHaveCount(stories.length);
  await expect(
    page.locator(
      '[data-lineage-panel] a[href="/chapters/reinforcement-learning/"]',
    ),
  ).toHaveCount(1);

  await context.close();
});
