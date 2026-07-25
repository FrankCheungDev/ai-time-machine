import { expect, test } from "@playwright/test";
import { getAiTimelineEvents } from "@ai-history/data";

const eventCount = getAiTimelineEvents().length;

test("Chinese timeline renders source-backed event contracts", async ({
  page,
}) => {
  await page.goto("/timeline/");

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: `${eventCount} 个事件解释关键转折`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "10 个阶段构成学习主线",
    }),
  ).toBeVisible();

  const events = page.locator("[data-timeline-event]");
  await expect(events).toHaveCount(eventCount);
  await expect(events.first()).toHaveAttribute(
    "data-timeline-event",
    "turing-imitation-game",
  );
  await expect(events.last()).toHaveAttribute(
    "data-timeline-event",
    "nist-generative-ai-profile",
  );

  const winter = page.locator('[data-timeline-event="lighthill-report"]');
  await expect(winter).toContainText("第一次 AI 寒冬背景");
  await expect(winter).toContainText("不是全球衰退的单一原因");
  await expect(
    winter.getByRole("link", {
      name: "Artificial Intelligence: A General Survey",
    }),
  ).toHaveAttribute(
    "href",
    "https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf",
  );

  const rag = page.locator('[data-timeline-event="rag"]');
  await expect(rag).toHaveAttribute("data-lineage-node-ids", "rag");
  await expect(
    rag.getByRole("link", { name: "RAG Pipeline", exact: true }),
  ).toHaveAttribute("href", "/chapters/rag/");
  await expect(
    rag.getByRole("link", { name: "RAG", exact: true }),
  ).toHaveAttribute("href", "/lineage/#node-rag");

  const sourceHrefs = await events
    .locator(".milestone-sources a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(sourceHrefs).toHaveLength(eventCount);
  expect(sourceHrefs.every((href) => href?.startsWith("https://"))).toBe(true);
});

test("English timeline keeps event identity while localizing teaching copy", async ({
  page,
}) => {
  await page.goto("/en/timeline/");

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: `${eventCount} Events Explain The Turning Points`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "10 Stages Form The Learning Path",
    }),
  ).toBeVisible();
  await expect(page.locator("[data-timeline-event]")).toHaveCount(eventCount);

  const transformer = page.locator('[data-timeline-event="transformer"]');
  await expect(transformer).toContainText(
    "The Transformer Replaced the Recurrent Sequence Backbone with Attention",
  );
  await expect(
    transformer.getByRole("link", { name: "Attention", exact: true }),
  ).toHaveAttribute("href", "/en/chapters/attention/");
  await expect(
    transformer.getByRole("link", { name: "Attention Is All You Need" }),
  ).toHaveAttribute(
    "href",
    "https://papers.nips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html",
  );
});

test("milestone cards form one mobile column without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/timeline/");

  const first = page.locator("[data-timeline-event]").first();
  const second = page.locator("[data-timeline-event]").nth(1);
  await expect(first).toBeVisible();

  const layout = await page.evaluate(() => {
    const events = Array.from(
      document.querySelectorAll<HTMLElement>("[data-timeline-event]"),
    );
    return {
      firstLeft: events[0]?.getBoundingClientRect().left,
      secondLeft: events[1]?.getBoundingClientRect().left,
      firstBottom: events[0]?.getBoundingClientRect().bottom,
      secondTop: events[1]?.getBoundingClientRect().top,
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    };
  });

  expect(await first.count()).toBe(1);
  expect(await second.count()).toBe(1);
  expect(Math.abs(layout.firstLeft - layout.secondLeft)).toBeLessThanOrEqual(1);
  expect(layout.firstBottom).toBeLessThan(layout.secondTop);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport);
});
