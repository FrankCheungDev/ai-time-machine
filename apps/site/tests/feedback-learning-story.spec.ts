import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  getAiLineageNodes,
  getAiTimelineEvents,
  getCausalStories,
} from "@ai-history/data";

const stories = getCausalStories();
const englishStories = getCausalStories("en");
const englishStoriesById = new Map(
  englishStories.map((story) => [story.id, story]),
);
const eventCount = getAiTimelineEvents().length;
const lineageNodes = getAiLineageNodes();
const lineageNodeCount = lineageNodes.length;
type Story = ReturnType<typeof getCausalStories>[number];

async function expectOnlyStoryDetailVisible(
  page: Page,
  regionSelector: string,
  activeStory: Story,
  localizedStories: Story[],
) {
  const region = page.locator(regionSelector);
  const activeDetail = region.locator(
    `[data-causal-story-detail="${activeStory.id}"]`,
  );

  await expect(activeDetail).toBeVisible();
  await expect(
    region.locator("[data-causal-story-detail]:visible"),
  ).toHaveCount(1);
  await expect(
    region.locator("[data-causal-story-detail][hidden]"),
  ).toHaveCount(localizedStories.length - 1);

  const inactiveDisplays = await region
    .locator("[data-causal-story-detail][hidden]")
    .evaluateAll((details) =>
      details.map((detail) => getComputedStyle(detail).display),
    );
  expect(inactiveDisplays).toEqual(
    Array(localizedStories.length - 1).fill("none"),
  );

  for (const story of localizedStories) {
    const expectedHeadingCount = story.id === activeStory.id ? 1 : 0;
    await expect(
      region.getByRole("heading", { name: story.title, exact: true }),
    ).toHaveCount(expectedHeadingCount);
  }
}

async function expectStoryHeadingClearsStickyHeader(heading: Locator) {
  await expect
    .poll(() =>
      heading.evaluate((element) => {
        const header = document.querySelector<HTMLElement>(".site-header");
        if (!header) {
          return {
            clearsHeader: false,
            insideViewport: false,
            scrolled: false,
          };
        }

        const headingBounds = element.getBoundingClientRect();
        const headerBottom = header.getBoundingClientRect().bottom;

        return {
          clearsHeader: headingBounds.top >= headerBottom + 12,
          insideViewport: headingBounds.bottom <= window.innerHeight,
          scrolled: window.scrollY > 0,
        };
      }),
    )
    .toEqual({
      clearsHeader: true,
      insideViewport: true,
      scrolled: true,
    });
}

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
    const storyHeading = storyDetail.getByRole("heading", {
      name: story.title,
    });

    await expect(storySelect).toHaveValue(story.id);
    await expectOnlyStoryDetailVisible(
      page,
      "[data-timeline-story-region]",
      story,
      stories,
    );
    await expect(storyHeading).toBeVisible();
    await expectStoryHeadingClearsStickyHeader(storyHeading);
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

    if (story.id === stories.at(-1)!.id) {
      const resetButton = explorer.locator("[data-timeline-filter-reset]");
      await resetButton.focus();
      await page.keyboard.press("Tab");
      await expect(storyDetail.getByRole("link").first()).toBeFocused();
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
    const storyHeading = storyDetail.getByRole("heading", {
      name: story.title,
    });

    await expect(storySelect).toHaveValue(story.id);
    await expect(focusSelect).toHaveValue("");
    await expectOnlyStoryDetailVisible(
      page,
      "[data-lineage-story-region]",
      story,
      stories,
    );
    await expectStoryHeadingClearsStickyHeader(storyHeading);
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

    if (story.id === stories.at(-1)!.id) {
      const lastLineageLink = page.locator("[data-lineage-panel] a").last();
      await lastLineageLink.focus();
      await page.keyboard.press("Tab");
      await expect(storyDetail.getByRole("link").first()).toBeFocused();
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
    await expectOnlyStoryDetailVisible(
      page,
      "[data-lineage-story-region]",
      story,
      stories,
    );
  });

  for (const path of ["timeline", "lineage"] as const) {
    test(`${path} language switch preserves the ${story.id} query and fragment`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${path}/?story=${story.id}#story-${story.id}`);

      const regionSelector = `[data-${path}-story-region]`;
      const chineseHeading = page
        .locator(`${regionSelector} [data-causal-story-detail="${story.id}"]`)
        .getByRole("heading", { name: story.title });
      await expectOnlyStoryDetailVisible(page, regionSelector, story, stories);
      await expectStoryHeadingClearsStickyHeader(chineseHeading);

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
      const englishStory = englishStoriesById.get(story.id)!;
      const englishHeading = page
        .locator(`${regionSelector} [data-causal-story-detail="${story.id}"]`)
        .getByRole("heading", { name: englishStory.title });
      await expectOnlyStoryDetailVisible(
        page,
        regionSelector,
        englishStory,
        englishStories,
      );
      await expect(englishHeading).toBeVisible();
      await expectStoryHeadingClearsStickyHeader(englishHeading);
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
