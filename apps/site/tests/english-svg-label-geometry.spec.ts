import { expect, test } from "@playwright/test";

const diagrams = [
  {
    name: "RAG",
    nodeCount: 7,
    route: "/en/chapters/rag/",
    shapeSelector: 'g[id^="node-"][data-role="node"] > rect',
    shapeType: "rect",
  },
  {
    name: "Agent",
    nodeCount: 5,
    route: "/en/chapters/agent/",
    shapeSelector: 'rect[id^="agent-node-"]',
    shapeType: "rect",
  },
  {
    name: "Attention",
    nodeCount: 6,
    route: "/en/chapters/attention/",
    shapeSelector: 'circle[id^="token-"]',
    shapeType: "circle",
  },
] as const;

const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 375, height: 812 },
] as const;

test.describe("English SVG label geometry", () => {
  for (const viewport of viewports) {
    for (const diagram of diagrams) {
      test(`${diagram.name} labels stay inside nodes at ${viewport.name} width`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(diagram.route);
        await expect(
          page.locator(".demo-shell[data-demo-ready='true']"),
        ).toHaveCount(1);
        await expect(page.locator(diagram.shapeSelector)).toHaveCount(
          diagram.nodeCount,
        );
        await page.evaluate(() => document.fonts.ready.then(() => undefined));

        const violations = await page.evaluate(
          ({ shapeSelector, shapeType }) => {
            const tolerance = 1;
            const round = (value: number) => Math.round(value * 100) / 100;
            const toBox = (rect: DOMRect) => ({
              left: round(rect.left),
              right: round(rect.right),
              top: round(rect.top),
              bottom: round(rect.bottom),
              width: round(rect.width),
              height: round(rect.height),
            });
            const shapes = Array.from(
              document.querySelectorAll<SVGGraphicsElement>(shapeSelector),
            );
            const shapeEntries = shapes.map((shape) => ({
              box: shape.getBoundingClientRect(),
              id: shape.id || shape.parentElement?.id || "unknown-node",
              shape,
            }));

            return shapeEntries.flatMap((entry) => {
              const labels = Array.from(
                entry.shape.parentElement?.querySelectorAll<SVGTextElement>(
                  ":scope > text",
                ) ?? [],
              );

              return labels.flatMap((label, labelIndex) => {
                const labelBox = label.getBoundingClientRect();
                const rectangularOverflow = {
                  left: round(Math.max(0, entry.box.left - labelBox.left)),
                  right: round(Math.max(0, labelBox.right - entry.box.right)),
                  top: round(Math.max(0, entry.box.top - labelBox.top)),
                  bottom: round(
                    Math.max(0, labelBox.bottom - entry.box.bottom),
                  ),
                };
                const insideRect =
                  labelBox.left >= entry.box.left - tolerance &&
                  labelBox.right <= entry.box.right + tolerance &&
                  labelBox.top >= entry.box.top - tolerance &&
                  labelBox.bottom <= entry.box.bottom + tolerance;

                let circleOverflow = 0;
                let contained = insideRect;

                if (shapeType === "circle") {
                  const centerX = entry.box.left + entry.box.width / 2;
                  const centerY = entry.box.top + entry.box.height / 2;
                  const radiusX = entry.box.width / 2 + tolerance;
                  const radiusY = entry.box.height / 2 + tolerance;
                  const corners = [
                    [labelBox.left, labelBox.top],
                    [labelBox.right, labelBox.top],
                    [labelBox.left, labelBox.bottom],
                    [labelBox.right, labelBox.bottom],
                  ];
                  const farthestNormalizedDistance = Math.max(
                    ...corners.map(([x, y]) =>
                      Math.sqrt(
                        ((x - centerX) / radiusX) ** 2 +
                          ((y - centerY) / radiusY) ** 2,
                      ),
                    ),
                  );

                  const rawCircleOverflow = Math.max(
                    0,
                    farthestNormalizedDistance - 1,
                  );

                  circleOverflow = round(rawCircleOverflow);
                  contained = rawCircleOverflow === 0;
                }

                const intersectingNodeIds = shapeEntries.flatMap((neighbor) => {
                  if (neighbor.shape === entry.shape) return [];

                  const intersects =
                    labelBox.left < neighbor.box.right &&
                    labelBox.right > neighbor.box.left &&
                    labelBox.top < neighbor.box.bottom &&
                    labelBox.bottom > neighbor.box.top;

                  return intersects ? [neighbor.id] : [];
                });

                if (contained && intersectingNodeIds.length === 0) return [];

                return [
                  {
                    nodeId: entry.id,
                    labelIndex,
                    text: label.textContent?.trim().replace(/\s+/g, " ") ?? "",
                    textBox: toBox(labelBox),
                    shapeBox: toBox(entry.box),
                    rectangularOverflow,
                    circleOverflow,
                    intersectingNodeIds,
                  },
                ];
              });
            });
          },
          {
            shapeSelector: diagram.shapeSelector,
            shapeType: diagram.shapeType,
          },
        );

        expect(
          violations,
          `${diagram.name} ${viewport.width}px label violations:\n${JSON.stringify(violations, null, 2)}`,
        ).toEqual([]);
      });
    }
  }
});
