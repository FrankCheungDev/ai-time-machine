import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const headers = readFileSync(new URL("../public/_headers", import.meta.url), {
  encoding: "utf8",
});

describe("production privacy response policy", () => {
  it("blocks external scripts and every browser-initiated connection", () => {
    expect(headers).toContain("script-src 'self' 'unsafe-inline'");
    expect(headers).toContain("connect-src 'none'");
    expect(headers).not.toContain("static.cloudflareinsights.com");
  });

  it.each([
    "/",
    "/404.html",
    "/chapters/*",
    "/diagrams/",
    "/en/",
    "/en/chapters/*",
    "/en/diagrams/",
    "/en/lineage/",
    "/en/privacy/",
    "/en/timeline/",
    "/lineage/",
    "/privacy/",
    "/timeline/",
  ])("prevents edge transformation of HTML route %s", (routePattern) => {
    expect(headers).toContain(
      `${routePattern}\n  Cache-Control: public, max-age=0, must-revalidate, no-transform`,
    );
  });
});
