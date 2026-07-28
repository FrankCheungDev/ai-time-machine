import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const deploymentHeaders = readFileSync(
  new URL("../public/_headers", import.meta.url),
  "utf8",
);
const contentSecurityPolicy = deploymentHeaders.match(
  /^\s*Content-Security-Policy:\s*(.+)$/m,
)?.[1];

if (!contentSecurityPolicy) {
  throw new Error("Missing Content-Security-Policy in public/_headers");
}

test("privacy pages disclose production-only Plausible processing in both languages", async ({
  page,
}) => {
  const cases = [
    {
      route: "/privacy/",
      heading: "隐私与本地学习记录",
      analytics: "匿名学习指标仅在正式域名启用",
      provider: "Plausible 如何处理请求",
      excluded: "明确排除的数据",
      nav: "隐私",
      canonicalUrlDisclosure:
        "正式域名上的严格适配器不会复制浏览器当前或原始完整 URL、query 或 hash；它会重建并发送正式域名 https://atlas.z-ai.cc 上的规范绝对章节 URL（canonical absolute chapter URL），以及对应的白名单属性：",
      receiptTimeDisclosure:
        "项目不会生成或主动发送精确事件时间戳；Plausible 会记录每个事件到达其服务的接收时间。",
      excludedUrlDisclosure:
        "访客 id、项目设备指纹、项目生成的精确事件时间戳、浏览器当前或原始完整 URL、query、hash、referrer 或跨站标识符。",
    },
    {
      route: "/en/privacy/",
      heading: "Privacy And Local Learning Records",
      analytics: "Anonymous Learning Metrics Run Only On Production",
      provider: "How Plausible Processes A Request",
      excluded: "Explicitly Excluded Data",
      nav: "Privacy",
      canonicalUrlDisclosure:
        "The production adapter does not copy the browser's current or original full URL, query, or hash. It reconstructs and sends a canonical absolute chapter URL on the production domain https://atlas.z-ai.cc, together with only its allowed properties:",
      receiptTimeDisclosure:
        "The project does not generate or actively send a precise event timestamp; Plausible records the receipt time when each event reaches its service.",
      excludedUrlDisclosure:
        "Visitor IDs, project device fingerprints, project-generated precise event timestamps, the browser's current or original full URL, query, hash, referrer, or cross-site identifiers.",
    },
  ];

  for (const entry of cases) {
    await page.goto(entry.route);
    await expect(
      page.getByRole("heading", { level: 1, name: entry.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: entry.analytics }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: entry.provider }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: entry.excluded }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: entry.nav, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByText(entry.canonicalUrlDisclosure, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(entry.receiptTimeDisclosure, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(entry.excludedUrlDisclosure, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/visitor id|访客 id/i).first()).toBeVisible();
    await expect(
      page.getByText(/daily identifier|每日.*匿名标识/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/plausible_ignore/i)).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Plausible Events API reference",
      }),
    ).toHaveAttribute("href", "https://plausible.io/docs/events-api");
    await expect(
      page.getByRole("link", {
        name: "Plausible data policy and daily anonymous identifier",
      }),
    ).toHaveAttribute("href", "https://plausible.io/data-policy");
    await expect(
      page.getByRole("link", {
        name: "Cloudflare Web Analytics: privacy-first analytics overview",
      }),
    ).toHaveAttribute(
      "href",
      "https://developers.cloudflare.com/web-analytics/about/",
    );
    await expect(
      page.getByRole("link", {
        name: "Cloudflare Web Analytics: automatic setup and disable controls",
      }),
    ).toHaveAttribute(
      "href",
      "https://developers.cloudflare.com/web-analytics/get-started/",
    );
  }
});

test("privacy routes expose bilingual SEO alternates and enter the sitemap", async ({
  page,
  request,
}) => {
  await page.goto("/privacy/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://atlas.z-ai.cc/privacy/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://atlas.z-ai.cc/en/privacy/");

  const sitemap = await request.get("/sitemap-0.xml");
  const text = await sitemap.text();
  expect(text).toContain("<loc>https://atlas.z-ai.cc/privacy/</loc>");
  expect(text).toContain("<loc>https://atlas.z-ai.cc/en/privacy/</loc>");
});

test("the narrow Plausible CSP preserves self-check hydration and continuation", async ({
  page,
}) => {
  expect(contentSecurityPolicy).toContain(
    "connect-src https://plausible.io/api/event;",
  );
  expect(contentSecurityPolicy).not.toContain("cloudflareinsights");

  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy": contentSecurityPolicy,
      },
    });
  });

  const forbiddenRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /cloudflareinsights|\/cdn-cgi\/rum|plausible\.io/i.test(request.url())
    ) {
      forbiddenRequests.push(request.url());
    }
  });

  await page.goto("/chapters/search/");
  const check = page.getByTestId("concept-check");
  await check
    .getByRole("radio", {
      name: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
    })
    .check();
  await check.getByRole("button", { name: "提交答案" }).click();
  await expect(
    check.getByRole("heading", { level: 3, name: "回答正确" }),
  ).toBeVisible();
  await page.getByTestId("complete-chapter").click();
  await expect(page).toHaveURL(/\/chapters\/search\/$/);
  await page.waitForTimeout(50);
  expect(forbiddenRequests).toEqual([]);
  await page.getByTestId("continue-next-chapter").click();
  await expect(page).toHaveURL(/\/chapters\/expert-system\/$/);
  expect(forbiddenRequests).toEqual([]);
});
