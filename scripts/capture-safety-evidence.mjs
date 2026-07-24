import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs/visual-evidence");
const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4330";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

async function capture({ name, viewport, prepare }) {
  const page = await browser.newPage({ locale: "zh-CN", viewport });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseUrl}/chapters/safety/`);
  const demo = page.locator(".demo-shell[data-demo-ready='true']");
  await demo.waitFor({ state: "visible" });
  await page.addStyleTag({
    content: ".site-header { display: none !important; }",
  });
  await prepare?.(demo);
  await demo.screenshot({
    animations: "disabled",
    path: path.join(outputDir, `${name}.png`),
  });
  await page.close();
}

await capture({
  name: "safety-normal-desktop",
  viewport: { width: 1440, height: 1100 },
});

await capture({
  name: "safety-risk-mobile",
  viewport: { width: 390, height: 844 },
  prepare: async (demo) => {
    await demo.getByRole("button", { name: "风险请求" }).click();
    const next = demo.locator(".stepper .controls button").last();
    await next.click();
    await next.click();
  },
});

await capture({
  name: "safety-fixed-desktop",
  viewport: { width: 1440, height: 1100 },
  prepare: async (demo) => {
    await demo.getByRole("button", { name: "风险请求" }).click();
    const next = demo.locator(".stepper .controls button").last();
    for (let index = 0; index < 5; index += 1) {
      await next.click();
    }
  },
});

await browser.close();
console.log(`Captured Safety / Eval evidence in ${outputDir}.`);
