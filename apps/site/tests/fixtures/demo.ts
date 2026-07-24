import { expect, type Page } from "@playwright/test";

export async function waitForDemoReady(page: Page): Promise<void> {
  await expect(
    page.locator(".demo-shell[data-demo-ready='true']").first(),
  ).toBeVisible();
}

export function firstDurationMs(durationList: string): number {
  const firstDuration = durationList.split(",")[0]?.trim() ?? "0s";

  if (firstDuration.endsWith("ms")) {
    return Number.parseFloat(firstDuration);
  }

  if (firstDuration.endsWith("s")) {
    return Number.parseFloat(firstDuration) * 1000;
  }

  return Number.parseFloat(firstDuration);
}
