import { expect, test } from "@playwright/test";
import { getCausalStories } from "@ai-history/data";
import type { Locale } from "@ai-history/data/locales";

const localeCases = [
  { locale: "zh-CN", route: "/" },
  { locale: "en", route: "/en/" },
] as const satisfies readonly { locale: Locale; route: string }[];

function localizeStoryHref(href: string, locale: Locale): string {
  return locale === "en" ? `/en${href}` : href;
}

for (const { locale, route } of localeCases) {
  test(`${locale} home derives guided-story cards and links from the manifest`, async ({
    page,
  }) => {
    const stories = getCausalStories(locale);
    await page.goto(route);

    const region = page.locator("[data-guided-stories]");
    const cards = region.locator("[data-guided-story-card]");

    await expect(region).toBeVisible();
    await expect(cards).toHaveCount(stories.length);
    expect(
      await cards.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-story-id")),
      ),
    ).toEqual(stories.map(({ id }) => id));

    for (const story of stories) {
      const card = region.locator(`[data-story-id="${story.id}"]`);

      await expect(
        card.getByRole("heading", { name: story.title }),
      ).toBeVisible();
      await expect(card).toContainText(story.coreQuestion);
      await expect(card).toContainText(String(story.steps.length));
      await expect(card.getByRole("link").first()).toHaveAttribute(
        "href",
        localizeStoryHref(story.returnLinks.timeline.href, locale),
      );
      await expect(card.getByRole("link").last()).toHaveAttribute(
        "href",
        localizeStoryHref(story.returnLinks.lineage.href, locale),
      );
    }
  });
}

test("guided stories sit between progress and the chapter learning path", async ({
  page,
}) => {
  await page.goto("/");

  const order = await page.locator("main").evaluate((main) => {
    const progress = main.querySelector(
      '[data-testid="home-learning-progress"]',
    );
    const stories = main.querySelector("[data-guided-stories]");
    const legacyAnchor = main.querySelector("#mvp");
    const learningPath = main.querySelector("#learning-path");

    if (!progress || !stories || !legacyAnchor || !learningPath) return null;

    const follows = (later: Element, earlier: Element) =>
      Boolean(
        earlier.compareDocumentPosition(later) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      );

    return {
      storiesFollowProgress: follows(stories, progress),
      legacyFollowsStories: follows(legacyAnchor, stories),
      pathFollowsLegacy: follows(learningPath, legacyAnchor),
    };
  });

  expect(order).toEqual({
    storiesFollowProgress: true,
    legacyFollowsStories: true,
    pathFollowsLegacy: true,
  });
});

test("new and legacy anchors both locate the chapter learning path", async ({
  page,
}) => {
  await page.goto("/#learning-path");
  await expect(page.locator("#learning-path")).toBeInViewport();

  await page.goto("/#mvp");
  await expect(page.locator("#learning-path")).toBeInViewport();
});

for (const width of [375, 390, 768]) {
  test(`${width}px guided-story cards fit and expose 44px keyboard actions`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/");

    const region = page.locator("[data-guided-stories]");
    const actions = region.locator("[data-guided-story-card] a.button");
    const firstPrimaryAction = actions.first();
    const firstSecondaryAction = actions.nth(1);

    expect(
      await region.evaluate(
        (element) => element.scrollWidth - element.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);

    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    await firstPrimaryAction.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(firstPrimaryAction).toBeFocused();
    expect(
      await firstPrimaryAction.evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      ),
    ).not.toBe("none");
    await page.keyboard.press("Tab");
    await expect(firstSecondaryAction).toBeFocused();
  });
}
