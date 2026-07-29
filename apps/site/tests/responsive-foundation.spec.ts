import { expect, test } from "@playwright/test";
import type { ChapterId } from "@ai-history/data/chapters";
import {
  chapterRoutes,
  localizedChapterRoute,
  primaryRoutes,
} from "./fixtures/chapters";
import { firstDurationMs, waitForDemoReady } from "./fixtures/demo";

const svgSceneChapterIds = [
  "search",
  "decision-boundary",
  "attention",
  "llm-system",
  "rag",
  "agent",
] satisfies readonly ChapterId[];
const svgSceneRoutes = svgSceneChapterIds.map((id) =>
  localizedChapterRoute(id),
);
const scrollSceneRoutes = [...svgSceneRoutes, "/lineage/"];
const stepperDemoRoutes = (
  ["llm-system", "rag", "agent"] satisfies readonly ChapterId[]
).map((id) => localizedChapterRoute(id));

test("RAG step changes keep the explanation and diagram visible together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/chapters/rag/");
  await waitForDemoReady(page);

  await page
    .locator(".demo-shell")
    .first()
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(
    page.getByRole("heading", { level: 3, name: "把问题转换为向量" }),
  ).toBeVisible();
  await expect(page.locator("#arrow-query-embedding")).toHaveAttribute(
    "data-motion",
    "draw-in",
  );

  const layout = await page.evaluate(() => {
    const scene = document.querySelector(".demo-shell .svg-scene");
    const content = document.querySelector(".demo-shell .step-content");

    const rect = (element: Element | null) => {
      const box = element?.getBoundingClientRect();

      return box
        ? { bottom: box.bottom, top: box.top }
        : { bottom: 0, top: Number.POSITIVE_INFINITY };
    };

    return {
      content: rect(content),
      scene: rect(scene),
      viewportHeight: window.innerHeight,
    };
  });

  expect(layout.content.top).toBeLessThan(layout.viewportHeight);
  expect(layout.content.bottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.scene.top).toBeLessThan(layout.viewportHeight);
  expect(layout.scene.bottom).toBeGreaterThan(0);
});

test("Reduced motion preference collapses decorative transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionDuration = await page
    .locator(".demo-card")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);

  expect(firstDurationMs(transitionDuration)).toBeLessThanOrEqual(1);
});

test("Demo controls keep mobile-safe touch target height", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });

  const demoRoutes = chapterRoutes.filter(
    (route) => route !== "/chapters/overview/",
  );

  for (const route of demoRoutes) {
    await page.goto(route);

    const controlHeights = await page
      .locator("main button, main .svg-scene-controls label")
      .evaluateAll((controls) =>
        controls.map((control) => control.getBoundingClientRect().height),
      );

    for (const height of controlHeights) {
      expect(height, `${route} control height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test.describe("Mobile responsive foundation", () => {
  for (const width of [375, 390, 768]) {
    test(`keeps primary routes within the ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const route of primaryRoutes) {
        await page.goto(route);

        const layout = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
        }));

        expect(
          layout.scrollWidth,
          `${route} document width`,
        ).toBeLessThanOrEqual(layout.viewportWidth);
        expect(
          layout.bodyScrollWidth,
          `${route} body width`,
        ).toBeLessThanOrEqual(layout.viewportWidth);
      }
    });
  }

  test("keeps header navigation targets comfortable on phones", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");

    const navTargetHeights = await page
      .locator(".site-header a")
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height),
      );

    for (const height of navTargetHeights) {
      expect(height, "header link height").toBeGreaterThanOrEqual(44);
    }
  });

  test("keeps long chapter titles compact on phones", async ({ page }) => {
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 667 });
      await page.goto("/chapters/search/");

      const titleMetrics = await page
        .locator(".page-title")
        .evaluate((title) => {
          const rect = title.getBoundingClientRect();
          const style = getComputedStyle(title);

          return {
            fontSize: Number.parseFloat(style.fontSize),
            height: rect.height,
          };
        });

      expect(titleMetrics.fontSize, `${width}px font size`).toBeLessThanOrEqual(
        42,
      );
      expect(titleMetrics.height, `${width}px title height`).toBeLessThan(150);
    }
  });

  test("marks scrollable diagrams as mobile scroll scenes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });

    for (const route of scrollSceneRoutes) {
      await page.goto(route);

      const scene = page.locator("[data-mobile-scroll-scene]").first();
      await expect(scene, `${route} scroll scene`).toBeVisible();
      await expect(scene, `${route} scroll scene`).toHaveAttribute(
        "tabindex",
        "0",
      );
      await expect(scene, `${route} scroll scene`).toHaveAttribute(
        "aria-label",
        /横向滚动/,
      );
    }
  });

  test("fits the lineage map first and keeps detail zoom available", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/lineage/");

    const fitButton = page.getByRole("button", { name: "适配屏幕" });
    const detailButton = page.getByRole("button", { name: "放大查看" });

    await expect(fitButton).toBeVisible();
    await expect(detailButton).toBeVisible();

    const fitLayout = await page.evaluate(() => {
      const panel = document.querySelector("[data-lineage-panel]");
      const svg = panel?.querySelector("svg");

      return {
        panelClientWidth: panel?.clientWidth ?? 0,
        panelScrollWidth: panel?.scrollWidth ?? 0,
        svgWidth: svg?.getBoundingClientRect().width ?? 0,
        view: panel instanceof HTMLElement ? panel.dataset.view : "",
      };
    });

    expect(fitLayout.view).toBe("fit");
    expect(fitLayout.panelScrollWidth).toBeLessThanOrEqual(
      fitLayout.panelClientWidth + 1,
    );
    expect(fitLayout.svgWidth).toBeLessThanOrEqual(fitLayout.panelClientWidth);

    await detailButton.click();

    const detailLayout = await page.evaluate(() => {
      const panel = document.querySelector("[data-lineage-panel]");

      return {
        panelClientWidth: panel?.clientWidth ?? 0,
        panelScrollWidth: panel?.scrollWidth ?? 0,
        view: panel instanceof HTMLElement ? panel.dataset.view : "",
      };
    });

    await expect(detailButton).toHaveAttribute("aria-pressed", "true");
    expect(detailLayout.view).toBe("detail");
    expect(detailLayout.panelScrollWidth).toBeGreaterThan(
      detailLayout.panelClientWidth,
    );
  });

  test("fits SVG demo scenes first and keeps detail zoom available", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    for (const route of svgSceneRoutes) {
      await page.goto(route);

      const fitOption = page.getByRole("radio", { name: "适配屏幕" });
      const detailOption = page.getByRole("radio", { name: "放大查看" });

      await expect(fitOption, `${route} fit option`).toBeChecked();
      await expect(detailOption, `${route} detail option`).not.toBeChecked();

      const fitLayout = await page.evaluate(() => {
        const scene = document.querySelector(
          ".demo-shell [data-mobile-scroll-scene]",
        );
        const svg = scene?.querySelector("svg");

        return {
          sceneClientWidth: scene?.clientWidth ?? 0,
          sceneScrollWidth: scene?.scrollWidth ?? 0,
          svgWidth: svg?.getBoundingClientRect().width ?? 0,
        };
      });

      expect(
        fitLayout.sceneScrollWidth,
        `${route} fit scene width`,
      ).toBeLessThanOrEqual(fitLayout.sceneClientWidth + 1);
      expect(fitLayout.svgWidth, `${route} fit svg width`).toBeLessThanOrEqual(
        fitLayout.sceneClientWidth,
      );

      await page.getByText("放大查看", { exact: true }).click();

      const detailLayout = await page.evaluate(() => {
        const scene = document.querySelector(
          ".demo-shell [data-mobile-scroll-scene]",
        );

        return {
          sceneClientWidth: scene?.clientWidth ?? 0,
          sceneScrollWidth: scene?.scrollWidth ?? 0,
        };
      });

      await expect(detailOption, `${route} detail checked`).toBeChecked();
      expect(
        detailLayout.sceneScrollWidth,
        `${route} detail scene width`,
      ).toBeGreaterThan(detailLayout.sceneClientWidth);
    }
  });

  test("keeps stacked mobile demo controls separated", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chapters/search/");

    const spacing = await page.evaluate(() => {
      const strategyControls = document.querySelector(".strategy-buttons");
      const sceneControls = document.querySelector(".svg-scene-controls");
      const strategyRect = strategyControls?.getBoundingClientRect();
      const sceneRect = sceneControls?.getBoundingClientRect();

      return strategyRect && sceneRect
        ? sceneRect.top - strategyRect.bottom
        : 0;
    });

    expect(spacing).toBeGreaterThanOrEqual(12);
  });

  test("shows the mobile diagram before its explanation and controls", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      for (const route of stepperDemoRoutes) {
        await page.goto(route);

        const stepper = page.locator(".stepper").first();
        await stepper.evaluate((element) =>
          element.scrollIntoView({ block: "start" }),
        );

        const layout = await stepper.evaluate((element) => {
          const rect = (selector: string) => {
            const target = element.querySelector(selector);
            if (!target) {
              return null;
            }

            const { bottom, top } = target.getBoundingClientRect();
            return { bottom, top };
          };

          return {
            scene: rect(".step-scene"),
            heading: rect(".step-content h3"),
            control: rect(".controls button:last-child:not(:disabled)"),
            viewportHeight: window.innerHeight,
          };
        });

        expect(
          layout.scene,
          `${route} scene at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.heading,
          `${route} heading at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.control,
          `${route} next control at ${viewport.width}px`,
        ).not.toBeNull();
        expect(
          layout.scene!.top,
          `${route} scene before heading at ${viewport.width}px`,
        ).toBeLessThan(layout.heading!.top);
        expect(
          layout.heading!.top,
          `${route} heading before controls at ${viewport.width}px`,
        ).toBeLessThan(layout.control!.top);

        if (viewport.width === 390) {
          for (const [label, box] of [
            ["scene", layout.scene],
            ["heading", layout.heading],
            ["next control", layout.control],
          ] as const) {
            expect(
              box!.bottom,
              `${route} ${label} below viewport top`,
            ).toBeGreaterThan(0);
            expect(
              box!.top,
              `${route} ${label} above viewport bottom`,
            ).toBeLessThan(layout.viewportHeight);
          }
        }
      }
    }
  });
});
