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
    },
    {
      route: "/en/privacy/",
      heading: "Privacy And Local Learning Records",
      analytics: "Anonymous Learning Metrics Run Only On Production",
      provider: "How Plausible Processes A Request",
      excluded: "Explicitly Excluded Data",
      nav: "Privacy",
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
  await page.getByTestId("complete-and-continue").click();
  await expect(page).toHaveURL(/\/chapters\/expert-system\/$/);
  expect(forbiddenRequests).toEqual([]);
});
