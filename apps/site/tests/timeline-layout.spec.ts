import { expect, test } from "@playwright/test";

test("timeline entries keep metadata, content, and action in stable desktop columns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/timeline/");

  const entries = page.locator(".timeline-entry");
  await expect(entries).toHaveCount(8);

  const layout = await entries.evaluateAll((items) =>
    items.map((item) => {
      const meta = item.querySelector(".timeline-entry-meta");
      const content = item.querySelector(".timeline-entry-content");
      const action = item.querySelector(".timeline-entry-action");
      const year = meta?.querySelector(".timeline-entry-year");
      const era = meta?.querySelector(".timeline-entry-era");
      const title = content?.querySelector("h2");
      const summary = content?.querySelector("p");

      if (!(meta && content && action && year && era && title && summary)) {
        throw new Error("Timeline entry is missing a layout region");
      }

      const itemBox = item.getBoundingClientRect();
      const metaBox = meta.getBoundingClientRect();
      const contentBox = content.getBoundingClientRect();
      const actionBox = action.getBoundingClientRect();
      const yearBox = year.getBoundingClientRect();
      const eraBox = era.getBoundingClientRect();
      const titleBox = title.getBoundingClientRect();
      const summaryBox = summary.getBoundingClientRect();

      return {
        itemTop: itemBox.top,
        itemBottom: itemBox.bottom,
        metaLeft: metaBox.left,
        metaTop: metaBox.top,
        contentLeft: contentBox.left,
        contentTop: contentBox.top,
        actionLeft: actionBox.left,
        actionRight: actionBox.right,
        actionTop: actionBox.top,
        actionBottom: actionBox.bottom,
        yearBottom: yearBox.bottom,
        eraTop: eraBox.top,
        titleBottom: titleBox.bottom,
        summaryTop: summaryBox.top,
      };
    }),
  );

  for (const entry of layout) {
    expect(entry.metaLeft).toBeLessThan(entry.contentLeft);
    expect(entry.contentLeft).toBeLessThan(entry.actionLeft);
    expect(Math.abs(entry.metaTop - entry.contentTop)).toBeLessThanOrEqual(1);
    expect(entry.actionTop).toBeGreaterThanOrEqual(entry.itemTop);
    expect(entry.actionBottom).toBeLessThanOrEqual(entry.itemBottom);
    expect(entry.yearBottom).toBeLessThan(entry.eraTop);
    expect(entry.titleBottom).toBeLessThan(entry.summaryTop);
  }

  const first = layout[0];
  for (const entry of layout.slice(1)) {
    expect(Math.abs(entry.metaLeft - first.metaLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(entry.contentLeft - first.contentLeft)).toBeLessThanOrEqual(
      1,
    );
    expect(Math.abs(entry.actionRight - first.actionRight)).toBeLessThanOrEqual(
      1,
    );
  }
});

test("timeline entries stack metadata, content, and action on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/timeline/");

  const firstEntry = page.locator(".timeline-entry").first();
  await expect(firstEntry).toBeVisible();

  const layout = await firstEntry.evaluate((item) => {
    const meta = item.querySelector(".timeline-entry-meta");
    const content = item.querySelector(".timeline-entry-content");
    const action = item.querySelector(".timeline-entry-action");

    if (!(meta && content && action)) {
      throw new Error("Timeline entry is missing a layout region");
    }

    const itemBox = item.getBoundingClientRect();
    const metaBox = meta.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const actionBox = action.getBoundingClientRect();

    return {
      itemLeft: itemBox.left,
      itemRight: itemBox.right,
      metaTop: metaBox.top,
      metaBottom: metaBox.bottom,
      contentTop: contentBox.top,
      contentBottom: contentBox.bottom,
      actionTop: actionBox.top,
      actionLeft: actionBox.left,
      actionRight: actionBox.right,
    };
  });

  expect(layout.metaBottom).toBeLessThan(layout.contentTop);
  expect(layout.contentBottom).toBeLessThan(layout.actionTop);
  expect(layout.actionLeft).toBeGreaterThanOrEqual(layout.itemLeft);
  expect(layout.actionRight).toBeLessThanOrEqual(layout.itemRight);
});
