import { expect, test } from "@playwright/test";

test("privacy pages explain local records and disabled analytics in both languages", async ({
  page,
}) => {
  const cases = [
    {
      route: "/privacy/",
      heading: "隐私与本地学习记录",
      analytics: "生产分析当前保持禁用",
      excluded: "明确排除的数据",
      nav: "隐私",
    },
    {
      route: "/en/privacy/",
      heading: "Privacy And Local Learning Records",
      analytics: "Production Analytics Remain Disabled",
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
      page.getByRole("heading", { level: 2, name: entry.excluded }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: entry.nav, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByText(/visitor id|访客 id/i)).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Cloudflare Web Analytics: privacy-first analytics overview",
      }),
    ).toHaveAttribute(
      "href",
      "https://developers.cloudflare.com/web-analytics/about/",
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
