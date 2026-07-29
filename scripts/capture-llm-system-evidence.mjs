import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4331";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

async function capture({ name, route, locale, viewport, prepare }) {
  const page = await browser.newPage({ locale, viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseUrl}${route}`);
  const demo = page.locator(".demo-shell[data-demo-ready='true']");
  await demo.waitFor({ state: "visible" });
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });
  await prepare(demo);
  await demo.screenshot({
    animations: "disabled",
    path: path.join(outputDir, `${name}.png`),
  });
  await page.close();
}

await capture({
  name: "llm-system-policy-gap-desktop",
  route: "/chapters/llm-system/",
  locale: "zh-CN",
  viewport: { width: 1440, height: 1100 },
  prepare: async (demo) => {
    await demo.getByRole("button", { name: "下一步" }).click();
  },
});

await capture({
  name: "llm-system-action-english-mobile",
  route: "/en/chapters/llm-system/",
  locale: "en-US",
  viewport: { width: 390, height: 844 },
  prepare: async (demo) => {
    await demo.getByRole("button", { name: "Resume and submit" }).click();
    const next = demo.getByRole("button", { name: "Next" });
    for (let index = 0; index < 5; index += 1) {
      await next.click();
    }
  },
});

await browser.close();
console.log(`Captured LLM system evidence in ${outputDir}.`);
