import { describe, expect, it, vi } from "vitest";
import {
  fetchPlausibleStatsResponses,
  parsePlausibleExportArguments,
  runPlausibleExport,
} from "../../../../scripts/export-plausible-learning-metrics.ts";
import { chapterRegistry } from "../chapters";
import { supportedLocales } from "../locales";
import {
  buildLearningMetricsExportFromPlausible,
  createPlausibleStatsQueryPlan,
  type PlausibleLearningMetricCountKey,
  type PlausibleMetricsAttestation,
  type PlausibleStatsQueryDefinition,
  type PlausibleStatsQueryPlan,
  type PlausibleStatsSegmentKind,
} from "./plausible-metrics";

const providerDevices = ["Desktop", "Laptop", "Tablet", "Mobile"] as const;

const countsByMetric = {
  startedVisitors: { overall: 100, locale: 40, device: 20 },
  coreCompletedVisitors: { overall: 70, locale: 28, device: 14 },
  conceptCheckVisitors: { overall: 60, locale: 24, device: 12 },
  firstCorrectVisitors: { overall: 45, locale: 18, device: 9 },
  explanationOpenedVisitors: { overall: 30, locale: 12, device: 6 },
  continuedVisitors: { overall: 50, locale: 20, device: 10 },
} satisfies Record<
  PlausibleLearningMetricCountKey,
  Record<PlausibleStatsSegmentKind, number>
>;

const validAttestation: PlausibleMetricsAttestation = {
  realLearnerTrafficConfirmed: true,
  productionVerified: true,
  sequentialFunnelsVerified: true,
  ciExcluded: true,
  previewExcluded: true,
  smokeExcluded: true,
  developerExcluded: true,
  filtersFrozen: true,
};

function responseFor(definition: PlausibleStatsQueryDefinition): unknown {
  const visitors = countsByMetric[definition.countKey][definition.segmentKind];
  const results: Array<{ dimensions: string[]; metrics: number[] }> = [];
  for (const { id } of chapterRegistry) {
    switch (definition.segmentKind) {
      case "overall":
        results.push({ dimensions: [id], metrics: [visitors] });
        break;
      case "locale":
        for (const locale of supportedLocales) {
          results.push({ dimensions: [id, locale], metrics: [visitors] });
        }
        break;
      case "device":
        for (const device of providerDevices) {
          results.push({ dimensions: [id, device], metrics: [visitors] });
        }
        break;
    }
  }

  return {
    results,
    meta: { total_rows: results.length },
    query: definition.query,
  };
}

function responsesFor(plan: PlausibleStatsQueryPlan): Record<string, unknown> {
  return Object.fromEntries(
    plan.queries.map((definition) => [definition.id, responseFor(definition)]),
  );
}

describe("Plausible aggregate learning metrics export", () => {
  it("builds 18 aggregate-only Stats API queries for an exclusive window", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const firstCorrectDevices = plan.queries.find(
      ({ id }) => id === "firstCorrectVisitors:device",
    );

    expect(plan).toMatchObject({
      version: 1,
      site: "atlas.z-ai.cc",
      reportingTimezone: "Asia/Shanghai",
      completeDays: 14,
      apiDateRange: ["2026-07-26", "2026-08-08"],
      queryCount: 18,
    });
    expect(firstCorrectDevices?.query).toEqual({
      site_id: "atlas.z-ai.cc",
      metrics: ["visitors"],
      date_range: ["2026-07-26", "2026-08-08"],
      filters: [
        ["is", "event:hostname", ["atlas.z-ai.cc"]],
        ["is", "event:name", ["concept_check_completed"]],
        ["is", "event:props:correct", ["true"]],
        ["is", "event:props:attempt", ["first"]],
      ],
      dimensions: ["event:props:chapterId", "visit:device"],
      order_by: [
        ["event:props:chapterId", "asc"],
        ["visit:device", "asc"],
      ],
      include: { imports: false, total_rows: true },
      pagination: { limit: 10_000, offset: 0 },
    });
    expect(JSON.stringify(plan)).not.toContain("Authorization");
    expect(JSON.stringify(plan)).not.toContain("has_done");
  });

  it("converts only canonical aggregate dimensions into the 77-row contract", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const exported = buildLearningMetricsExportFromPlausible(
      plan,
      responsesFor(plan),
      "2026-08-08T16:00:00.000Z",
      validAttestation,
    );

    expect(exported).toMatchObject({
      schemaVersion: 2,
      provider: {
        name: "Plausible Hosted Business",
        queryKind: "aggregate-visitor-event-steps",
      },
      observationWindow: {
        startDate: "2026-07-26",
        endDateExclusive: "2026-08-09",
        completeDays: 14,
      },
      trafficPolicy: {
        realLearnerTrafficConfirmed: true,
        developerExcluded: true,
      },
    });
    expect(exported.rows).toHaveLength(chapterRegistry.length * 7);
    expect(exported.rows[0]).toEqual({
      chapterId: "overview",
      locale: "all",
      device: "all",
      startedVisitors: 100,
      coreCompletedVisitors: 70,
      conceptCheckVisitors: 60,
      firstCorrectVisitors: 45,
      explanationOpenedVisitors: 30,
      continuedVisitors: 50,
    });
    expect(
      exported.rows.find(
        ({ chapterId, locale, device }) =>
          chapterId === "overview" && locale === "en" && device === "all",
      ),
    ).toMatchObject({ startedVisitors: 40, coreCompletedVisitors: 28 });
    expect(
      exported.rows.find(
        ({ chapterId, locale, device }) =>
          chapterId === "overview" && locale === "all" && device === "mobile",
      ),
    ).toMatchObject({ startedVisitors: 20, coreCompletedVisitors: 14 });
  });

  it("fills absent zero-count aggregate segments without fabricating visitors", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const responses = Object.fromEntries(
      plan.queries.map(({ id }) => [
        id,
        { results: [], meta: { total_rows: 0 } },
      ]),
    );
    const exported = buildLearningMetricsExportFromPlausible(
      plan,
      responses,
      "2026-08-08T16:00:00.000Z",
      validAttestation,
    );

    expect(exported.rows).toHaveLength(77);
    expect(
      exported.rows.every((row) =>
        Object.entries(row)
          .filter(([key]) => key.endsWith("Visitors"))
          .every(([, value]) => value === 0),
      ),
    ).toBe(true);
  });

  it.each([
    ["2026-07-26", "2026-08-08", /at least 14 complete days/],
    ["2026-02-30", "2026-03-20", /valid calendar date/],
    ["2026/07/26", "2026-08-09", /must use YYYY-MM-DD/],
  ])("rejects an invalid plan window %#", (start, end, expected) => {
    expect(() => createPlausibleStatsQueryPlan(start, end)).toThrow(expected);
  });

  it("rejects missing, extra, truncated, and non-canonical responses", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const responses = responsesFor(plan);
    delete responses[plan.queries[0].id];
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responses,
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/missing Plausible response/);

    const extraResponses = responsesFor(plan);
    extraResponses.unreviewed = {};
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        extraResponses,
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/unexpected Plausible responses/);

    const truncated = responsesFor(plan);
    const firstId = plan.queries[0].id;
    (truncated[firstId] as { meta: { total_rows: number } }).meta.total_rows +=
      1;
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        truncated,
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/response is incomplete/);

    const unknownLocale = responsesFor(plan);
    const localeId = "startedVisitors:locale";
    (
      unknownLocale[localeId] as {
        results: Array<{ dimensions: string[] }>;
      }
    ).results[0].dimensions[1] = "fr";
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        unknownLocale,
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/unknown locale fr/);

    const unexpectedRootField = responsesFor(plan);
    (unexpectedRootField[firstId] as Record<string, unknown>).raw_events = [];
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        unexpectedRootField,
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/response contains unknown fields: raw_events/);
  });

  it("rejects a modified query plan and a false external attestation", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const modified = structuredClone(plan);
    modified.queries[0].query.filters = [];

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        modified,
        responsesFor(plan),
        "2026-08-08T16:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/does not match the canonical contract/);

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responsesFor(plan),
        "2026-08-08T16:00:00.000Z",
        { ...validAttestation, developerExcluded: false },
      ),
    ).toThrow(/developerExcluded must be true/);

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responsesFor(plan),
        "2026-08-08T16:00:00.000Z",
        { ...validAttestation, sequentialFunnelsVerified: false },
      ),
    ).toThrow(/sequentialFunnels must be true/);
  });

  it("prints a key-free dry-run plan without contacting Plausible", async () => {
    const send = vi.fn();
    const output = await runPlausibleExport(
      [
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        "--dry-run",
      ],
      {},
      new Date("2026-08-10T00:00:00.000Z"),
      send,
    );

    expect(JSON.parse(output)).toMatchObject({ queryCount: 18 });
    expect(output).not.toContain("Authorization");
    expect(send).not.toHaveBeenCalled();
  });

  it("requires explicit live attestations before reading a key", async () => {
    await expect(
      runPlausibleExport(
        ["--start-date=2026-07-26", "--end-date-exclusive=2026-08-09"],
        { PLAUSIBLE_STATS_API_KEY: "must-not-appear" },
        new Date("2026-08-10T00:00:00.000Z"),
        vi.fn(),
      ),
    ).rejects.toThrow(/requires explicit operator attestations/);
  });

  it("sends only the canonical aggregate queries with the key in one header", async () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const calls: Array<[string, RequestInit]> = [];
    const send = async (input: string, init: RequestInit) => {
      calls.push([input, init]);
      return {
        ok: true,
        status: 200,
        json: async () => ({ results: [], meta: { total_rows: 0 } }),
      };
    };
    const responses = await fetchPlausibleStatsResponses(
      plan,
      "stats-secret",
      send,
    );

    expect(calls).toHaveLength(18);
    const [endpoint, init] = calls[0];
    expect(endpoint).toBe("https://plausible.io/api/v2/query");
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer stats-secret",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      redirect: "error",
    });
    expect(String(init.body)).not.toContain("stats-secret");
    expect(Object.keys(responses)).toHaveLength(18);
  });

  it("rejects a modified network plan and masks transport failures", async () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const modified = structuredClone(plan);
    modified.queries[0].query.filters = [];
    const send = vi.fn();

    await expect(
      fetchPlausibleStatsResponses(modified, "stats-secret", send),
    ).rejects.toThrow(/does not match the canonical contract/);
    expect(send).not.toHaveBeenCalled();

    try {
      await fetchPlausibleStatsResponses(plan, "stats-secret", async () => {
        throw new Error("transport accidentally included stats-secret");
      });
      throw new Error("expected transport failure");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/failed before a response/);
      expect((error as Error).message).not.toContain("stats-secret");
    }
  });

  it("builds a validated live export without retaining the Stats API key", async () => {
    const send = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [], meta: { total_rows: 0 } }),
    }));
    const output = await runPlausibleExport(
      [
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        "--attest-real-learner-traffic",
        "--attest-production-dashboard-verified",
        "--attest-ci-preview-smoke-developer-excluded",
        "--attest-filters-frozen",
      ],
      { PLAUSIBLE_STATS_API_KEY: "stats-secret" },
      new Date("2026-08-10T00:00:00.000Z"),
      send,
    );

    expect(JSON.parse(output)).toMatchObject({
      schemaVersion: 2,
      environment: "production",
      trafficPolicy: { realLearnerTrafficConfirmed: true },
      rows: expect.any(Array),
    });
    expect(output).not.toContain("stats-secret");
  });

  it("rejects unknown and duplicate CLI options", () => {
    expect(() =>
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--start-date=2026-07-27",
        "--end-date-exclusive=2026-08-09",
      ]),
    ).toThrow(/start-date is duplicated/);
    expect(() =>
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        "--api-key=forbidden",
      ]),
    ).toThrow(/Unknown argument/);
  });
});
