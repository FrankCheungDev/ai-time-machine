import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = new URL(process.env.SITE_URL ?? "http://127.0.0.1:4330");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

async function openPage(route, viewport, locale = "zh-CN") {
  const page = await browser.newPage({ locale, viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(new URL(route, baseUrl).href);
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });
  return page;
}

async function captureCompletedChapter({
  route,
  viewport,
  locale,
  completionHeading,
  nextHref,
  outputName,
}) {
  const page = await openPage(route, viewport, locale);

  try {
    const journey = page.getByTestId("chapter-journey");
    const completionButton = journey.getByTestId("complete-chapter");
    const continuationLink = journey.getByTestId("continue-next-chapter");
    const routeBeforeCompletion = new URL(page.url()).pathname;

    await completionButton.waitFor({ state: "visible" });
    if ((await continuationLink.count()) !== 0) {
      throw new Error(
        `Next-chapter link was visible before completion on ${route}`,
      );
    }
    await page.evaluate(() => {
      window.__p2CaptureSignals = [];
      window.addEventListener("ai-history:learning-signal", (event) => {
        window.__p2CaptureSignals.push(event.detail);
      });
    });
    await completionButton.click();

    await journey
      .getByRole("heading", { name: completionHeading, exact: true })
      .waitFor({ state: "visible" });

    await continuationLink.waitFor({ state: "visible" });

    const completionSignalNames = await page.evaluate(() =>
      window.__p2CaptureSignals.map((signal) => signal.name),
    );
    const coreCompletionCount = completionSignalNames.filter(
      (name) => name === "core_interaction_completed",
    ).length;
    const prematureContinuationCount = completionSignalNames.filter(
      (name) => name === "next_chapter_continued",
    ).length;
    if (coreCompletionCount !== 1 || prematureContinuationCount !== 0) {
      throw new Error(
        `Completion emitted core=${coreCompletionCount}, continuation=${prematureContinuationCount} on ${route}`,
      );
    }

    const routeAfterCompletion = new URL(page.url()).pathname;
    if (
      routeBeforeCompletion !== route ||
      routeAfterCompletion !== routeBeforeCompletion
    ) {
      throw new Error(
        `Chapter completion navigated unexpectedly: ${routeBeforeCompletion} -> ${routeAfterCompletion}`,
      );
    }

    const continuationHref = await continuationLink.getAttribute("href");
    if (continuationHref !== nextHref) {
      throw new Error(
        `Unexpected next chapter href: expected ${nextHref}, received ${continuationHref}`,
      );
    }

    await journey.scrollIntoViewIfNeeded();
    await journey.screenshot({
      animations: "disabled",
      path: path.join(outputDir, outputName),
    });
  } finally {
    await page.close();
  }
}

const timelinePage = await openPage("/timeline/", {
  width: 1440,
  height: 1100,
});
const timelineEvent = timelinePage.locator(
  '[data-timeline-event="lighthill-report"]',
);
await timelineEvent.waitFor({ state: "visible" });
await timelineEvent.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-timeline-event-desktop.png"),
});
await timelinePage.close();

const mobileCheckPage = await openPage("/chapters/search/", {
  width: 390,
  height: 844,
});
const mobileCheck = mobileCheckPage.getByTestId("concept-check");
await mobileCheck.waitFor({ state: "visible" });
await mobileCheck
  .getByRole("radio", { name: "只看离目标的估计距离 h" })
  .check();
await mobileCheck.getByRole("button", { name: "提交答案" }).click();
await mobileCheck.getByRole("button", { name: "查看为什么" }).click();
await mobileCheck.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-concept-check-mobile.png"),
});
await mobileCheckPage.close();

const englishCheckPage = await openPage(
  "/en/chapters/safety/",
  { width: 1440, height: 1100 },
  "en-US",
);
const englishCheck = englishCheckPage.getByTestId("concept-check");
await englishCheck.waitFor({ state: "visible" });
await englishCheck
  .getByRole("radio", {
    name: "This known failure now has repeatable evidence, while other risks still need ongoing discovery and evaluation",
  })
  .check();
await englishCheck.getByRole("button", { name: "Submit answer" }).click();
await englishCheck.getByRole("button", { name: "See why" }).click();
await englishCheck.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-concept-check-english.png"),
});
await englishCheckPage.close();

await captureCompletedChapter({
  route: "/chapters/rag/",
  viewport: { width: 1440, height: 900 },
  locale: "zh-CN",
  completionHeading: "本章已完成",
  nextHref: "/chapters/agent/",
  outputName: "p2-completion-next-chinese.png",
});

await captureCompletedChapter({
  route: "/en/chapters/rag/",
  viewport: { width: 390, height: 844 },
  locale: "en-US",
  completionHeading: "Chapter complete",
  nextHref: "/en/chapters/agent/",
  outputName: "p2-completion-next-english-mobile.png",
});

const chinesePrivacyPage = await openPage("/privacy/", {
  width: 1440,
  height: 1900,
});
await chinesePrivacyPage
  .getByRole("heading", { name: "匿名学习指标仅在正式域名启用" })
  .waitFor({ state: "visible" });
await chinesePrivacyPage.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-plausible-privacy-chinese.png"),
});
await chinesePrivacyPage.close();

const englishPrivacyPage = await openPage(
  "/en/privacy/",
  { width: 1440, height: 1900 },
  "en-US",
);
await englishPrivacyPage
  .getByRole("heading", {
    name: "Anonymous Learning Metrics Run Only On Production",
  })
  .waitFor({ state: "visible" });
await englishPrivacyPage.screenshot({
  animations: "disabled",
  path: path.join(outputDir, "p2-plausible-privacy-english.png"),
});
await englishPrivacyPage.close();

await browser.close();
console.log(`Captured P2 evidence in ${outputDir}.`);
