import { expect, test } from "@playwright/test";

test("Chinese routes expose zh-CN document language and an English switch", async ({
  page,
}) => {
  await page.goto("/chapters/rag/");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");

  const englishSwitch = page.getByRole("link", { name: "English" });
  await expect(englishSwitch).toBeVisible();
  await expect(englishSwitch).toHaveAttribute("href", "/en/chapters/rag/");

  const chapterNavigation = page.getByRole("link", { name: "章节主线" });
  await expect(chapterNavigation).toHaveAttribute("href", "/#mvp");
});

test("English primary routes render localized page chrome and content", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Interactive Illustrated AI History",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "中文" })).toHaveAttribute(
    "href",
    "/",
  );

  await page.goto("/en/timeline/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "AI Evolution Timeline",
    }),
  ).toBeVisible();

  await page.goto("/en/lineage/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "AI Technical Lineage",
    }),
  ).toBeVisible();

  await page.goto("/en/diagrams/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Diagram Sources And Exports",
    }),
  ).toBeVisible();

  await page.goto("/en/chapters/overview/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Overview: Why did AI not suddenly become large models?",
    }),
  ).toBeVisible();
});

test("English lineage labels fit the preserved diagram geometry", async ({
  page,
}) => {
  await page.goto("/en/lineage/");

  const layout = await page.evaluate(() => {
    const nodeRects = Array.from(
      document.querySelectorAll(".lineage-node rect"),
    ).map((rect) => rect.getBoundingClientRect());
    const overflowingNodeLabels = Array.from(
      document.querySelectorAll(".lineage-node"),
    ).flatMap((node) => {
      const rect = node.querySelector("rect")?.getBoundingClientRect();
      const label = node.querySelector("text")?.getBoundingClientRect();

      if (
        !rect ||
        !label ||
        (label.left >= rect.left && label.right <= rect.right)
      ) {
        return [];
      }

      return [node.id];
    });
    const overlappingEdgeLabels = Array.from(
      document.querySelectorAll(".edge-label"),
    ).flatMap((label) => {
      const box = label.getBoundingClientRect();
      const overlapsNode = nodeRects.some(
        (rect) =>
          box.left < rect.right &&
          box.right > rect.left &&
          box.top < rect.bottom &&
          box.bottom > rect.top,
      );

      return overlapsNode ? [label.textContent] : [];
    });

    return { overflowingNodeLabels, overlappingEdgeLabels };
  });

  expect(layout).toEqual({
    overflowingNodeLabels: [],
    overlappingEdgeLabels: [],
  });
});
