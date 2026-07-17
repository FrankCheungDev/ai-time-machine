import { expect, test } from "@playwright/test";

async function waitForDemoReady(page: import("@playwright/test").Page) {
  await expect(
    page.locator(".demo-shell[data-demo-ready='true']").first(),
  ).toBeVisible();
}

test.describe("Demo control accessibility", () => {
  test("desktop tab order skips hidden SVG view radios", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/chapters/search/");
    await waitForDemoReady(page);

    const strategyGroup = page.getByRole("group", { name: "搜索策略" });
    const strategyButtons = strategyGroup.getByRole("button");
    const scene = page.locator(".demo-shell [data-mobile-scroll-scene]");

    await strategyButtons.last().focus();
    await page.keyboard.press("Tab");

    await expect(scene).toBeFocused();
    await expect(page.getByRole("radio", { name: "适配屏幕" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "放大查看" })).toHaveCount(0);
  });

  test("mobile SVG view radios remain keyboard operable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/chapters/search/");
    await waitForDemoReady(page);

    const fitOption = page.getByRole("radio", { name: "适配屏幕" });
    const detailOption = page.getByRole("radio", { name: "放大查看" });

    await expect(fitOption).toBeChecked();
    await fitOption.focus();
    await page.keyboard.press("ArrowRight");

    await expect(detailOption).toBeFocused();
    await expect(detailOption).toBeChecked();
  });

  test("CNN matrices expose table semantics and dynamic names", async ({
    page,
  }) => {
    await page.goto("/chapters/cnn/");
    await waitForDemoReady(page);

    const imageGrid = page.getByRole("table", {
      name: /输入图像网格，5 行 5 列；扫描步骤 1 \/ 9/,
    });
    const kernelMatrix = page.getByRole("table", {
      name: /边缘检测卷积核矩阵，3 行 3 列/,
    });
    const featureMap = page.getByRole("table", {
      name: /特征图，3 行 3 列；已计算 1 \/ 9 个位置/,
    });

    await expect(imageGrid.getByRole("cell")).toHaveCount(25);
    await expect(kernelMatrix.getByRole("cell")).toHaveCount(9);
    await expect(featureMap.getByRole("cell")).toHaveCount(9);
    await expect(featureMap.getByRole("cell").first()).toHaveAttribute(
      "aria-current",
      "step",
    );

    await page.getByRole("button", { name: "下一步" }).click();
    await expect(
      page.getByRole("table", {
        name: /特征图，3 行 3 列；已计算 2 \/ 9 个位置/,
      }),
    ).toBeVisible();
  });

  const selectionGroups = [
    {
      route: "/chapters/search/",
      groupName: "搜索策略",
      initialButton: "BFS 广度优先",
      nextButton: "DFS 深度优先",
    },
    {
      route: "/chapters/decision-boundary/",
      groupName: "边界模式",
      initialButton: "线性边界",
      nextButton: "非线性边界",
    },
    {
      route: "/chapters/attention/",
      groupName: "模式切换",
      initialButton: "Attention 模式",
      nextButton: "RNN 模式",
    },
    {
      route: "/chapters/attention/",
      groupName: "选择 token",
      initialButton: "模型",
      nextButton: "外部知识",
    },
    {
      route: "/chapters/cnn/",
      groupName: "卷积核选择",
      initialButton: "边缘检测",
      nextButton: "平滑卷积",
    },
  ] as const;

  for (const selection of selectionGroups) {
    test(`${selection.groupName} exposes and updates its selected state`, async ({
      page,
    }) => {
      await page.goto(selection.route);
      await waitForDemoReady(page);

      const group = page.getByRole("group", { name: selection.groupName });
      const initialButton = group.getByRole("button", {
        name: selection.initialButton,
        exact: true,
      });
      const nextButton = group.getByRole("button", {
        name: selection.nextButton,
        exact: true,
      });

      await expect(initialButton).toHaveAttribute("aria-pressed", "true");
      await expect(nextButton).toHaveAttribute("aria-pressed", "false");

      await nextButton.click();

      await expect(initialButton).toHaveAttribute("aria-pressed", "false");
      await expect(nextButton).toHaveAttribute("aria-pressed", "true");
    });
  }
});
