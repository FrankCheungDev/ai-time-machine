import { expect, test } from "@playwright/test";
import {
  getAiLineageNodes,
  getAiTimelineEvents,
  getCausalStory,
} from "@ai-history/data";

const story = getCausalStory("feedback-learning");
const storyEventIds = story.steps.map((step) => step.eventId);
const eventCount = getAiTimelineEvents().length;
const lineageNodeCount = getAiLineageNodes().length;

test("timeline restores the ordered feedback-learning story without hiding history", async ({
  page,
}) => {
  await page.goto("/timeline/?story=feedback-learning#story-feedback-learning");
  await page.reload();

  const explorer = page.locator("[data-causal-timeline]");
  const storySelect = explorer.getByLabel("引导式故事");
  const storyDetail = explorer.locator(
    '[data-causal-story-detail="feedback-learning"]',
  );

  await expect(storySelect).toHaveValue("feedback-learning");
  await expect(storyDetail).toBeVisible();
  await expect(
    storyDetail.getByRole("heading", { name: "从经验更新到反馈闭环" }),
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
  await expect(
    page.locator('[data-timeline-event="samuel-checkers"]'),
  ).toContainText(`第 1 / ${story.steps.length} 步`);
  await expect(
    page.locator('[data-timeline-event="react-agent-loop"]'),
  ).toContainText(`第 ${story.steps.length} / ${story.steps.length} 步`);
  await expect(
    storyDetail.getByRole("link", { name: "进入反馈学习章节" }),
  ).toHaveAttribute("href", "/chapters/reinforcement-learning/");

  for (const eventId of storyEventIds) {
    await expect(
      page.locator(`[data-timeline-event="${eventId}"]`),
    ).toHaveClass(/is-story-focus/);
  }
});

test("timeline keeps story and direct filters mutually exclusive", async ({
  page,
}) => {
  await page.goto(
    "/timeline/?chapter=foundation-model&lineage=safety#milestone-instructgpt-human-feedback",
  );

  const explorer = page.locator("[data-causal-timeline]");
  const chapterSelect = explorer.getByLabel("学习章节");
  const lineageSelect = explorer.getByLabel("技术谱系");
  const storySelect = explorer.getByLabel("引导式故事");

  await storySelect.selectOption("feedback-learning");
  await expect(chapterSelect).toHaveValue("");
  await expect(lineageSelect).toHaveValue("");
  await expect(page).toHaveURL(
    /\/timeline\/\?story=feedback-learning#story-feedback-learning$/,
  );

  await chapterSelect.selectOption("reinforcement-learning");
  await expect(storySelect).toHaveValue("");
  await expect(page).toHaveURL(/\/timeline\/\?chapter=reinforcement-learning$/);
  await expect(page.locator("[data-timeline-story-region]")).toBeHidden();

  await storySelect.selectOption("feedback-learning");
  await lineageSelect.selectOption("reinforcement-learning");
  await expect(storySelect).toHaveValue("");
  await expect(chapterSelect).toHaveValue("");
  await expect(page).toHaveURL(/\/timeline\/\?lineage=reinforcement-learning$/);
});

test("lineage restores the story sequence and keeps every node available", async ({
  page,
}) => {
  await page.goto("/lineage/?story=feedback-learning#story-feedback-learning");

  const storySelect = page.getByLabel("引导式故事");
  const focusSelect = page.getByLabel("聚焦一个谱系节点");
  const storyDetail = page.locator(
    '[data-causal-story-detail="feedback-learning"]',
  );

  await expect(storySelect).toHaveValue("feedback-learning");
  await expect(focusSelect).toHaveValue("");
  await expect(storyDetail).toBeVisible();
  await expect(storyDetail.locator("[data-story-event-id]")).toHaveCount(
    story.steps.length,
  );
  await expect(page.locator("[data-lineage-node]:visible")).toHaveCount(
    lineageNodeCount,
  );
  await expect(page.locator("#node-reinforcement-learning")).toHaveAttribute(
    "data-story-step-order",
    "1 2 3 4 5",
  );
  await expect(page.locator("#node-agent")).toHaveAttribute(
    "data-story-step-order",
    "6",
  );
  await expect(page.locator("#node-rag")).toHaveClass(/is-story-muted/);

  await focusSelect.selectOption("rag");
  await expect(storySelect).toHaveValue("");
  await expect(page).toHaveURL(/\/lineage\/\?lineage=rag#node-rag$/);
  await expect(page.locator("#node-rag")).toHaveClass(/is-causal-focus/);
  await expect(page.locator("[data-lineage-story-region]")).toBeHidden();

  await storySelect.selectOption("feedback-learning");
  await expect(focusSelect).toHaveValue("");
  await expect(page).toHaveURL(
    /\/lineage\/\?story=feedback-learning#story-feedback-learning$/,
  );
});

for (const path of ["timeline", "lineage"] as const) {
  test(`${path} language switch preserves the story query and fragment`, async ({
    page,
  }) => {
    await page.goto(
      `/${path}/?story=feedback-learning#story-feedback-learning`,
    );

    const languageSwitch = page.getByRole("link", { name: "English" });
    await expect(languageSwitch).toHaveAttribute(
      "href",
      `/en/${path}/?story=feedback-learning#story-feedback-learning`,
    );
    await languageSwitch.click();

    await expect(page).toHaveURL(
      new RegExp(
        `/en/${path}/\\?story=feedback-learning#story-feedback-learning$`,
      ),
    );
    await expect(page.getByLabel("Guided story")).toHaveValue(
      "feedback-learning",
    );
    await expect(
      page.getByRole("heading", {
        name: "From Experience Updates To Feedback Loops",
      }),
    ).toBeVisible();
  });
}

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

test("no-JavaScript fallback keeps timeline evidence and lineage chapters accessible", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/timeline/?story=feedback-learning#story-feedback-learning");
  await expect(page.locator("[data-causal-timeline]")).toBeHidden();
  await expect(page.locator("[data-timeline-event]:visible")).toHaveCount(
    eventCount,
  );
  await expect(page.locator("[data-timeline-event][hidden]")).toHaveCount(0);
  const qLearning = page.locator('[data-timeline-event="q-learning"]');
  await expect(qLearning).toBeVisible();
  await expect(
    qLearning.locator('a[href="/chapters/reinforcement-learning/"]'),
  ).toHaveAttribute("href", "/chapters/reinforcement-learning/");
  await expect(qLearning.locator(".milestone-sources a")).not.toHaveCount(0);

  await page.goto("/lineage/?story=feedback-learning#story-feedback-learning");
  await expect(page.locator("[data-lineage-node]:visible")).toHaveCount(
    lineageNodeCount,
  );
  await expect(page.locator("[data-lineage-story-region]")).toBeHidden();
  await expect(
    page.locator(
      '[data-lineage-panel] a[href="/chapters/reinforcement-learning/"]',
    ),
  ).toHaveCount(1);

  await context.close();
});
