import { expect, test } from "@playwright/test";
import { primaryRoutes } from "./fixtures/chapters";

const productionOrigin = "https://atlas.z-ai.cc";
const expectedReleaseDocumentCount = 32;
const releaseDocumentRoutes = [
  ...primaryRoutes,
  ...primaryRoutes.map((route) => (route === "/" ? "/en/" : `/en${route}`)),
];

test("every release document exposes the reviewed learning-metrics build mode and canonical", async ({
  request,
}) => {
  expect(releaseDocumentRoutes).toHaveLength(expectedReleaseDocumentCount);
  expect(new Set(releaseDocumentRoutes).size).toBe(
    expectedReleaseDocumentCount,
  );

  for (const route of releaseDocumentRoutes) {
    const response = await request.get(route);
    expect(response.ok(), `${route} should load`).toBe(true);
    const body = await response.text();
    expect(
      body.match(/data-learning-signal-collection="plausible-production"/g),
      `${route} collection mode`,
    ).toHaveLength(1);

    const canonicalTags =
      body.match(/<link\b[^>]*\brel="canonical"[^>]*>/gi) ?? [];
    expect(canonicalTags, `${route} canonical count`).toHaveLength(1);
    expect(
      canonicalTags[0]?.match(/\bhref="([^"]+)"/i)?.[1],
      `${route} canonical href`,
    ).toBe(new URL(route, productionOrigin).href);
  }
});
