import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const skipLinkCases = [
  {
    locale: "zh-CN",
    label: "跳到主要内容",
    route: "/",
    viewport: { width: 1280, height: 720 },
  },
  {
    locale: "zh-CN",
    label: "跳到主要内容",
    route: "/",
    viewport: { width: 390, height: 844 },
  },
  {
    locale: "en",
    label: "Skip to main content",
    route: "/en/",
    viewport: { width: 1280, height: 720 },
  },
  {
    locale: "en",
    label: "Skip to main content",
    route: "/en/",
    viewport: { width: 390, height: 844 },
  },
] as const;

for (const skipLinkCase of skipLinkCases) {
  test(`${skipLinkCase.locale} skip link is the first Tab stop at ${skipLinkCase.viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(skipLinkCase.viewport);
    await page.goto(skipLinkCase.route);

    const skipLink = page.getByRole("link", {
      name: skipLinkCase.label,
      exact: true,
    });
    const main = page.locator("#main-content");

    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(main).toHaveAttribute("tabindex", "-1");
    expect(
      await skipLink.evaluate(
        (element) => element.getBoundingClientRect().bottom,
      ),
    ).toBeLessThanOrEqual(0);

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect
      .poll(() =>
        skipLink.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeGreaterThanOrEqual(0);

    const focusedGeometry = await skipLink.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        bottom: bounds.bottom,
        outlineStyle: style.outlineStyle,
        top: bounds.top,
      };
    });
    expect(focusedGeometry.top).toBeGreaterThanOrEqual(0);
    expect(focusedGeometry.bottom).toBeLessThanOrEqual(
      skipLinkCase.viewport.height,
    );
    expect(focusedGeometry.outlineStyle).not.toBe("none");

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(main).toBeFocused();
    await expectMainToClearStickyHeader(page);
  });
}

const axeCases = [
  { name: "Chinese home", route: "/", readySelector: "#main-content" },
  { name: "English home", route: "/en/", readySelector: "#main-content" },
  {
    name: "Chinese representative demo",
    route: "/chapters/rag/",
    readySelector: ".demo-shell[data-demo-ready='true']",
  },
  {
    name: "English representative demo",
    route: "/en/chapters/rag/",
    readySelector: ".demo-shell[data-demo-ready='true']",
  },
  {
    name: "Chinese timeline story",
    route: "/timeline/?story=feedback-learning#story-feedback-learning",
    readySelector:
      '[data-timeline-story-region] [data-causal-story-detail="feedback-learning"]',
  },
  {
    name: "English timeline story",
    route: "/en/timeline/?story=feedback-learning#story-feedback-learning",
    readySelector:
      '[data-timeline-story-region] [data-causal-story-detail="feedback-learning"]',
  },
  {
    name: "Chinese lineage story",
    route: "/lineage/?story=feedback-learning#story-feedback-learning",
    readySelector:
      '[data-lineage-story-region] [data-causal-story-detail="feedback-learning"]',
  },
  {
    name: "English lineage story",
    route: "/en/lineage/?story=feedback-learning#story-feedback-learning",
    readySelector:
      '[data-lineage-story-region] [data-causal-story-detail="feedback-learning"]',
  },
  {
    name: "Chinese privacy",
    route: "/privacy/",
    readySelector: "#main-content",
  },
  {
    name: "English privacy",
    route: "/en/privacy/",
    readySelector: "#main-content",
  },
] as const;

test.describe("axe critical and serious baseline", () => {
  for (const axeCase of axeCases) {
    test(`${axeCase.name} has no critical or serious axe violations`, async ({
      page,
    }) => {
      await page.goto(axeCase.route);
      await expect(page.locator(axeCase.readySelector)).toBeVisible();
      await expect(page.locator("astro-island[ssr]")).toHaveCount(0);

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations.filter(
        ({ impact }) => impact === "critical" || impact === "serious",
      );
      const details = blockingViolations
        .flatMap((violation) =>
          violation.nodes.map((node) =>
            [
              `route: ${axeCase.route}`,
              `rule: ${violation.id}`,
              `impact: ${violation.impact ?? "unknown"}`,
              `target: ${node.target.join(" ")}`,
              `html: ${node.html}`,
              `failure: ${node.failureSummary ?? "No failure summary"}`,
            ].join("\n"),
          ),
        )
        .join("\n\n");

      expect(
        blockingViolations.length,
        details || `route: ${axeCase.route}\nNo blocking axe violations`,
      ).toBe(0);
    });
  }
});

async function expectMainToClearStickyHeader(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const header = document.querySelector<HTMLElement>(".site-header");
        const main = document.querySelector<HTMLElement>("#main-content");

        if (!header || !main) return false;

        return (
          main.getBoundingClientRect().top >=
          header.getBoundingClientRect().bottom - 1
        );
      }),
    )
    .toBe(true);
}
