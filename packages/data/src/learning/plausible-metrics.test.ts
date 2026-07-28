import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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
  createPlausibleSequentialFunnelCaptureTasks,
  createPlausibleStatsQueryPlan,
  parsePlausibleSequentialFunnelEvidence,
  type PlausibleLearningMetricCountKey,
  type PlausibleMetricsAttestation,
  type PlausibleSequentialFunnelEvidence,
  type PlausibleStatsQueryDefinition,
  type PlausibleStatsQueryPlan,
  type PlausibleStatsSegmentKind,
} from "./plausible-metrics";

const providerDevices = ["Desktop", "Laptop", "Tablet", "Mobile"] as const;

const countsByMetric = {
  conceptCheckVisitors: { overall: 60, locale: 35, device: 15 },
  conceptCheckFirstAttemptVisitors: { overall: 50, locale: 32, device: 14 },
  firstCorrectVisitors: { overall: 45, locale: 18, device: 9 },
  explanationOpenedVisitors: { overall: 30, locale: 12, device: 6 },
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

function segmentKind(
  locale: string,
  device: string,
): PlausibleStatsSegmentKind {
  if (locale !== "all") return "locale";
  if (device !== "all") return "device";
  return "overall";
}

function funnelEvidenceFor(
  plan: PlausibleStatsQueryPlan,
): PlausibleSequentialFunnelEvidence {
  return {
    schemaVersion: 1,
    capturePlanVersion: 1,
    source: "operator-supplied-plausible-dashboard",
    site: "atlas.z-ai.cc",
    capturedAt: "2026-08-09T00:30:00.000Z",
    evidenceBundleSha256: "b".repeat(64),
    operatorAttestation: {
      dashboardCountsTranscribed: true,
      aggregateOnlyConfirmed: true,
    },
    reviewerAttestation: {
      independentlyReviewed: true,
      capturePlanMatched: true,
    },
    reportingTimezone: "Asia/Shanghai",
    observationWindow: {
      startDate: plan.startDate,
      endDateExclusive: plan.endDateExclusive,
      completeDays: plan.completeDays,
    },
    funnels: plan.requiredFunnelEvidence.funnels,
    captures: plan.requiredFunnelEvidence.captureTasks.map((task) => {
      const kind = segmentKind(task.locale, task.device);
      const counts =
        task.funnelId === "started-to-core"
          ? {
              overall: { entered: 100, converted: 70 },
              locale: { entered: 40, converted: 28 },
              device: { entered: 20, converted: 14 },
            }[kind]
          : {
              overall: { entered: 75, converted: 50 },
              locale: { entered: 35, converted: 20 },
              device: { entered: 18, converted: 10 },
            }[kind];
      return {
        ...task,
        enteredVisitors: counts.entered,
        convertedVisitors: counts.converted,
        evidenceRef: `captures/${task.captureId.replaceAll(":", "--")}.png`,
      };
    }),
  };
}

describe("Plausible aggregate learning metrics export", () => {
  it("builds 12 self-check queries and 147 separate funnel captures", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const firstCorrectDevices = plan.queries.find(
      ({ id }) => id === "firstCorrectVisitors:device",
    );

    expect(plan).toMatchObject({
      version: 2,
      site: "atlas.z-ai.cc",
      reportingTimezone: "Asia/Shanghai",
      completeDays: 14,
      apiDateRange: ["2026-07-26", "2026-08-08"],
      queryCount: 12,
      requiredFunnelEvidence: {
        capturePlanVersion: 1,
        captureCount: 147,
      },
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
    expect(createPlausibleSequentialFunnelCaptureTasks()).toHaveLength(147);
    expect(
      plan.requiredFunnelEvidence.captureTasks.filter(
        ({ funnelId }) => funnelId === "started-to-core",
      ),
    ).toHaveLength(77);
    expect(
      plan.requiredFunnelEvidence.captureTasks.filter(
        ({ funnelId }) => funnelId === "core-to-continued",
      ),
    ).toHaveLength(70);
    expect(JSON.stringify(plan.queries)).not.toContain("chapter_started");
    expect(JSON.stringify(plan.queries)).not.toContain(
      "core_interaction_completed",
    );
    expect(JSON.stringify(plan.queries)).not.toContain(
      "next_chapter_continued",
    );
  });

  it("converts only canonical aggregate dimensions into the 77-row contract", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const exported = buildLearningMetricsExportFromPlausible(
      plan,
      responsesFor(plan),
      funnelEvidenceFor(plan),
      "2026-08-09T01:00:00.000Z",
      validAttestation,
    );

    expect(exported).toMatchObject({
      schemaVersion: 3,
      provider: {
        name: "Plausible Hosted Business",
        queryKind: "canonical-stats-with-operator-sequential-funnels",
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
      startedToCoreEvidenceRef:
        "captures/started-to-core--overview--all--all.png",
      coreToContinuedEvidenceRef:
        "captures/core-to-continued--overview--all--all.png",
      startedToCoreEnteredVisitors: 100,
      startedToCoreConvertedVisitors: 70,
      coreToContinuedEnteredVisitors: 75,
      coreToContinuedConvertedVisitors: 50,
      conceptCheckVisitors: 60,
      conceptCheckFirstAttemptVisitors: 50,
      firstCorrectVisitors: 45,
      explanationOpenedVisitors: 30,
    });
    expect(
      exported.rows.find(
        ({ chapterId, locale, device }) =>
          chapterId === "overview" && locale === "en" && device === "all",
      ),
    ).toMatchObject({
      startedToCoreEnteredVisitors: 40,
      startedToCoreConvertedVisitors: 28,
      coreToContinuedEnteredVisitors: 35,
    });
    expect(
      exported.rows.find(
        ({ chapterId, locale, device }) =>
          chapterId === "overview" && locale === "all" && device === "mobile",
      ),
    ).toMatchObject({
      startedToCoreEnteredVisitors: 20,
      startedToCoreConvertedVisitors: 14,
      coreToContinuedEnteredVisitors: 18,
    });
    expect(exported.rows.at(-1)).toMatchObject({
      chapterId: "safety",
      coreToContinuedEvidenceRef: null,
      coreToContinuedEnteredVisitors: null,
      coreToContinuedConvertedVisitors: null,
    });
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
      funnelEvidenceFor(plan),
      "2026-08-09T01:00:00.000Z",
      validAttestation,
    );

    expect(exported.rows).toHaveLength(77);
    expect(
      exported.rows.every(
        (row) =>
          row.conceptCheckVisitors === 0 &&
          row.conceptCheckFirstAttemptVisitors === 0 &&
          row.firstCorrectVisitors === 0 &&
          row.explanationOpenedVisitors === 0,
      ),
    ).toBe(true);
    expect(exported.rows[0]).toMatchObject({
      startedToCoreEnteredVisitors: 100,
      coreToContinuedEnteredVisitors: 75,
    });
  });

  it.each([
    ["2026-07-26", "2026-08-08", /at least 14 complete days/],
    ["2026-02-30", "2026-03-20", /valid calendar date/],
    ["2026/07/26", "2026-08-09", /must use YYYY-MM-DD/],
  ])("rejects an invalid plan window %#", (start, end, expected) => {
    expect(() => createPlausibleStatsQueryPlan(start, end)).toThrow(expected);
  });

  it("accepts reviewed 147-capture evidence without equating funnel cohorts", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const parsed = parsePlausibleSequentialFunnelEvidence(
      plan,
      funnelEvidenceFor(plan),
    );
    const started = parsed.captures.find(
      ({ captureId }) => captureId === "started-to-core:overview:all:all",
    )!;
    const continued = parsed.captures.find(
      ({ captureId }) => captureId === "core-to-continued:overview:all:all",
    )!;

    expect(parsed.captures).toHaveLength(147);
    expect(started.convertedVisitors).toBe(70);
    expect(continued.enteredVisitors).toBe(75);
    expect(
      new Set(parsed.captures.map(({ evidenceRef }) => evidenceRef)).size,
    ).toBe(147);
  });

  it("fails closed on missing, mismatched, or unreviewed funnel evidence", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");

    const missing = funnelEvidenceFor(plan);
    missing.captures.pop();
    expect(() => parsePlausibleSequentialFunnelEvidence(plan, missing)).toThrow(
      /exactly 147 captures/,
    );

    const wrongWindow = funnelEvidenceFor(plan);
    wrongWindow.observationWindow.startDate = "2026-07-27";
    expect(() =>
      parsePlausibleSequentialFunnelEvidence(plan, wrongWindow),
    ).toThrow(/does not match the Stats query plan/);

    const unreviewed = funnelEvidenceFor(plan);
    unreviewed.reviewerAttestation.independentlyReviewed = false as true;
    expect(() =>
      parsePlausibleSequentialFunnelEvidence(plan, unreviewed),
    ).toThrow(/independentlyReviewed must be true/);

    const duplicateRef = funnelEvidenceFor(plan);
    duplicateRef.captures[1].evidenceRef = duplicateRef.captures[0].evidenceRef;
    expect(() =>
      parsePlausibleSequentialFunnelEvidence(plan, duplicateRef),
    ).toThrow(/evidenceRef must be unique/);

    const impossibleHandoff = funnelEvidenceFor(plan);
    const continued = impossibleHandoff.captures.find(
      ({ captureId }) => captureId === "core-to-continued:overview:all:all",
    )!;
    continued.enteredVisitors = 69;
    expect(() =>
      parsePlausibleSequentialFunnelEvidence(plan, impossibleHandoff),
    ).toThrow(/convertedVisitors cannot exceed .*enteredVisitors/);

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responsesFor(plan),
        undefined,
        "2026-08-09T01:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/funnel evidence must be an object/);
  });

  it.each([
    "../secret.png",
    "captures/../secret.png",
    "/captures/secret.png",
    "captures\\secret.png",
    "https://example.test/capture.png",
    "captures/capture.png?token=secret",
    "captures/capture.png#fragment",
    "captures/",
    "captures//capture.png",
    "./captures/capture.png",
  ])("rejects unsafe operator evidence ref %s", (evidenceRef) => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const evidence = funnelEvidenceFor(plan);
    evidence.captures[0].evidenceRef = evidenceRef;

    expect(() =>
      parsePlausibleSequentialFunnelEvidence(plan, evidence),
    ).toThrow(/safe relative artifact path/);
  });

  it("rejects missing, extra, truncated, and non-canonical responses", () => {
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const responses = responsesFor(plan);
    delete responses[plan.queries[0].id];
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responses,
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/missing Plausible response/);

    const extraResponses = responsesFor(plan);
    extraResponses.unreviewed = {};
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        extraResponses,
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
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
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/response is incomplete/);

    const unknownLocale = responsesFor(plan);
    const localeId = "conceptCheckVisitors:locale";
    (
      unknownLocale[localeId] as {
        results: Array<{ dimensions: string[] }>;
      }
    ).results[0].dimensions[1] = "fr";
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        unknownLocale,
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/unknown locale fr/);

    const unexpectedRootField = responsesFor(plan);
    (unexpectedRootField[firstId] as Record<string, unknown>).raw_events = [];
    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        unexpectedRootField,
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
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
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
        validAttestation,
      ),
    ).toThrow(/does not match the canonical contract/);

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responsesFor(plan),
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
        { ...validAttestation, developerExcluded: false },
      ),
    ).toThrow(/developerExcluded must be true/);

    expect(() =>
      buildLearningMetricsExportFromPlausible(
        plan,
        responsesFor(plan),
        funnelEvidenceFor(plan),
        "2026-08-09T01:00:00.000Z",
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

    expect(JSON.parse(output)).toMatchObject({
      queryCount: 12,
      requiredFunnelEvidence: { captureCount: 147 },
    });
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

    expect(calls).toHaveLength(12);
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
    expect(Object.keys(responses)).toHaveLength(12);
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
    const directory = await mkdtemp(join(tmpdir(), "plausible-funnels-"));
    const evidencePath = join(directory, "funnel-evidence.json");
    const bundlePath = join(directory, "reviewed-evidence-bundle.zip");
    const bundle = Buffer.from("reviewed dashboard evidence bundle\n");
    const bundleSha256 = createHash("sha256").update(bundle).digest("hex");
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    const evidence = funnelEvidenceFor(plan);
    evidence.evidenceBundleSha256 = bundleSha256;
    await Promise.all([
      writeFile(evidencePath, JSON.stringify(evidence), "utf8"),
      writeFile(bundlePath, bundle),
    ]);
    const send = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [], meta: { total_rows: 0 } }),
    }));
    try {
      const output = await runPlausibleExport(
        [
          "--start-date=2026-07-26",
          "--end-date-exclusive=2026-08-09",
          `--dashboard-funnel-evidence=${evidencePath}`,
          `--dashboard-funnel-evidence-bundle=${bundlePath}`,
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
        schemaVersion: 3,
        environment: "production",
        funnelEvidence: {
          capturePlanVersion: 1,
          evidenceBundleSha256: bundleSha256,
        },
        trafficPolicy: { realLearnerTrafficConfirmed: true },
        rows: expect.any(Array),
      });
      expect(output).not.toContain("stats-secret");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("requires funnel evidence before reading the Stats API key", async () => {
    const send = vi.fn();
    await expect(
      runPlausibleExport(
        [
          "--start-date=2026-07-26",
          "--end-date-exclusive=2026-08-09",
          "--attest-real-learner-traffic",
          "--attest-production-dashboard-verified",
          "--attest-ci-preview-smoke-developer-excluded",
          "--attest-filters-frozen",
        ],
        { PLAUSIBLE_STATS_API_KEY: "must-not-appear" },
        new Date("2026-08-10T00:00:00.000Z"),
        send,
      ),
    ).rejects.toThrow(/requires --dashboard-funnel-evidence=PATH/);
    expect(send).not.toHaveBeenCalled();
  });

  it("requires a bundle and verifies its raw-byte digest before key access or fetch", async () => {
    const directory = await mkdtemp(join(tmpdir(), "plausible-funnels-"));
    const evidencePath = join(directory, "funnel-evidence.json");
    const bundlePath = join(directory, "secret-bundle-name.zip");
    const bundleSecret = "secret bundle content must not appear";
    const plan = createPlausibleStatsQueryPlan("2026-07-26", "2026-08-09");
    await Promise.all([
      writeFile(evidencePath, JSON.stringify(funnelEvidenceFor(plan)), "utf8"),
      writeFile(bundlePath, bundleSecret, "utf8"),
    ]);
    let keyRead = false;
    const environment = {} as NodeJS.ProcessEnv;
    Object.defineProperty(environment, "PLAUSIBLE_STATS_API_KEY", {
      enumerable: true,
      get() {
        keyRead = true;
        return "must-not-appear";
      },
    });
    const send = vi.fn();

    try {
      await expect(
        runPlausibleExport(
          [
            "--start-date=2026-07-26",
            "--end-date-exclusive=2026-08-09",
            `--dashboard-funnel-evidence=${evidencePath}`,
            `--dashboard-funnel-evidence-bundle=${bundlePath}`,
            "--attest-real-learner-traffic",
            "--attest-production-dashboard-verified",
            "--attest-ci-preview-smoke-developer-excluded",
            "--attest-filters-frozen",
          ],
          environment,
          new Date("2026-08-10T00:00:00.000Z"),
          send,
        ),
      ).rejects.toThrow(
        /dashboard funnel evidence bundle digest does not match evidence metadata/,
      );
      try {
        await runPlausibleExport(
          [
            "--start-date=2026-07-26",
            "--end-date-exclusive=2026-08-09",
            `--dashboard-funnel-evidence=${evidencePath}`,
            `--dashboard-funnel-evidence-bundle=${bundlePath}`,
            "--attest-real-learner-traffic",
            "--attest-production-dashboard-verified",
            "--attest-ci-preview-smoke-developer-excluded",
            "--attest-filters-frozen",
          ],
          environment,
          new Date("2026-08-10T00:00:00.000Z"),
          send,
        );
        throw new Error("expected bundle digest mismatch");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).not.toContain(bundlePath);
        expect(message).not.toContain(bundleSecret);
        expect(message).not.toContain("must-not-appear");
      }
      expect(keyRead).toBe(false);
      expect(send).not.toHaveBeenCalled();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("fails on a missing bundle flag before key access or fetch", async () => {
    let keyRead = false;
    const environment = {} as NodeJS.ProcessEnv;
    Object.defineProperty(environment, "PLAUSIBLE_STATS_API_KEY", {
      get() {
        keyRead = true;
        return "must-not-appear";
      },
    });
    const send = vi.fn();

    await expect(
      runPlausibleExport(
        [
          "--start-date=2026-07-26",
          "--end-date-exclusive=2026-08-09",
          "--dashboard-funnel-evidence=controlled/evidence.json",
          "--attest-real-learner-traffic",
          "--attest-production-dashboard-verified",
          "--attest-ci-preview-smoke-developer-excluded",
          "--attest-filters-frozen",
        ],
        environment,
        new Date("2026-08-10T00:00:00.000Z"),
        send,
      ),
    ).rejects.toThrow(/requires --dashboard-funnel-evidence-bundle=PATH/);
    expect(keyRead).toBe(false);
    expect(send).not.toHaveBeenCalled();
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
    expect(() =>
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        "--dashboard-funnel-evidence=one.json",
        "--dashboard-funnel-evidence=two.json",
      ]),
    ).toThrow(/dashboard-funnel-evidence is duplicated/);
    expect(() =>
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        "--dashboard-funnel-evidence-bundle=one.zip",
        "--dashboard-funnel-evidence-bundle=two.zip",
      ]),
    ).toThrow(/dashboard-funnel-evidence-bundle is duplicated/);
  });

  it("never echoes an unknown option's value in errors or CLI stderr", () => {
    const secret = "do-not-print-this-api-secret";
    let message = "";
    try {
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        `--api-key=${secret}`,
      ]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("--api-key");
    expect(message).not.toContain(secret);

    const scriptPath = fileURLToPath(
      new URL(
        "../../../../scripts/export-plausible-learning-metrics.ts",
        import.meta.url,
      ),
    );
    const result = spawnSync(
      process.execPath,
      [
        scriptPath,
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        `--cookie=${secret}`,
      ],
      { encoding: "utf8" },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("--cookie");
    expect(result.stderr).not.toContain(secret);
  });

  it.each([
    "--funnel-evidence=legacy.json",
    "--cookie=forbidden",
    "--session=forbidden",
    "--internal-endpoint=https://example.invalid",
  ])("rejects non-contract live input %s", (argument) => {
    expect(() =>
      parsePlausibleExportArguments([
        "--start-date=2026-07-26",
        "--end-date-exclusive=2026-08-09",
        argument,
      ]),
    ).toThrow(/Unknown argument/);
  });
});
