import { expect, test } from "@playwright/test";
import { chapterRegistry } from "@ai-history/data/chapters";

const productionOrigin = "https://atlas.z-ai.cc";

test("Chinese pages expose canonical, language, and sharing metadata", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${productionOrigin}/`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh-CN"]'),
  ).toHaveAttribute("href", `${productionOrigin}/`);
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", `${productionOrigin}/en/`);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", `${productionOrigin}/`);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "zh_CN",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${productionOrigin}/social-card.png`,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("English chapter metadata points to the matching bilingual routes", async ({
  page,
}) => {
  await page.goto("/en/chapters/rag/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${productionOrigin}/en/chapters/rag/`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh-CN"]'),
  ).toHaveAttribute("href", `${productionOrigin}/chapters/rag/`);
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", `${productionOrigin}/en/chapters/rag/`);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", `${productionOrigin}/chapters/rag/`);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    `${productionOrigin}/en/chapters/rag/`,
  );
});

test("not-found responses are bilingual and excluded from indexing", async ({
  page,
}) => {
  const response = await page.goto("/route-that-does-not-exist/");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "页面未找到 / Page Not Found",
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Switch language to English",
      exact: true,
    }),
  ).toHaveAttribute("href", "/en/");
});

test("robots, sitemap, and social assets expose the production discovery surface", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toMatch(
    new RegExp(
      `Sitemap: ${productionOrigin.replaceAll(".", "\\.")}/sitemap-index\\.xml`,
    ),
  );

  const sitemapIndex = await request.get("/sitemap-index.xml");
  expect(sitemapIndex.ok()).toBe(true);
  expect(await sitemapIndex.text()).toMatch(
    new RegExp(`${productionOrigin.replaceAll(".", "\\.")}/sitemap-0\\.xml`),
  );

  const sitemap = await request.get("/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).not.toContain("/404/");
  for (const chapter of chapterRegistry) {
    expect(sitemapText).toContain(
      `<loc>${productionOrigin}${chapter.route}</loc>`,
    );
    expect(sitemapText).toContain(
      `<loc>${productionOrigin}/en${chapter.route}</loc>`,
    );
  }

  const socialCard = await request.get("/social-card.png");
  expect(socialCard.ok()).toBe(true);
  expect(socialCard.headers()["content-type"]).toContain("image/png");
});
