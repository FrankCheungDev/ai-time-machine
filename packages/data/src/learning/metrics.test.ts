import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { chapterRegistry } from "../chapters";
import {
  analyzeLearningMetricsExport,
  learningMetricDeviceClasses,
  LearningMetricsValidationError,
  parseLearningMetricsExport,
  renderLearningMetricsMarkdown,
  type LearningMetricCounts,
  type LearningMetricDevice,
  type LearningMetricLocale,
  type LearningMetricRow,
  type LearningMetricsExport,
} from "./metrics";

const overallCounts: LearningMetricCounts = {
  startedVisitors: 100,
  coreCompletedVisitors: 70,
  conceptCheckVisitors: 60,
  firstCorrectVisitors: 45,
  explanationOpenedVisitors: 30,
  continuedVisitors: 50,
};
const segmentCounts: LearningMetricCounts = {
  startedVisitors: 40,
  coreCompletedVisitors: 28,
  conceptCheckVisitors: 24,
  firstCorrectVisitors: 18,
  explanationOpenedVisitors: 12,
  continuedVisitors: 20,
};

function row(
  chapterId: LearningMetricRow["chapterId"],
  locale: LearningMetricLocale,
  device: LearningMetricDevice,
  counts: LearningMetricCounts,
): LearningMetricRow {
  return { chapterId, locale, device, ...counts };
}

function validExport(): LearningMetricsExport {
  return {
    schemaVersion: 2,
    site: "atlas.z-ai.cc",
    environment: "production",
    provider: {
      name: "approved-provider",
      exportedAt: "2026-08-09T01:00:00.000Z",
      queryKind: "aggregate-visitor-event-steps",
    },
    observationWindow: {
      startDate: "2026-07-26",
      endDateExclusive: "2026-08-09",
      completeDays: 14,
    },
    trafficPolicy: {
      realLearnerTrafficConfirmed: true,
      productionOnly: true,
      ciExcluded: true,
      previewExcluded: true,
      smokeExcluded: true,
      developerExcluded: true,
    },
    queryPolicy: {
      sequentialFunnels: true,
      aggregateVisitors: true,
      filtersFrozen: true,
      eventMappingVersion: 1,
    },
    dataPolicy: {
      aggregateOnly: true,
      containsRawEvents: false,
      containsPersonalData: false,
    },
    rows: chapterRegistry.flatMap(({ id }) => [
      row(id, "all", "all", overallCounts),
      row(id, "zh-CN", "all", segmentCounts),
      row(id, "en", "all", segmentCounts),
      ...learningMetricDeviceClasses.map((device) =>
        row(id, "all", device, segmentCounts),
      ),
    ]),
  };
}

describe("P2-05 aggregate learning metrics contract", () => {
  it("accepts a complete, aggregate-only, real-traffic export", () => {
    const input = validExport();
    const parsed = parseLearningMetricsExport(input);

    expect(parsed.rows).toHaveLength(chapterRegistry.length * 7);
    expect(parsed.rows).not.toBe(input.rows);
  });

  it("computes the four fixed rates without calling them a product decision", () => {
    const analysis = analyzeLearningMetricsExport(validExport());
    const overview = analysis.chapters[0];

    expect(analysis.status).toBe("eligible-for-chapter-review");
    expect(analysis.decisionEligibleChapterIds).toEqual(
      chapterRegistry.map(({ id }) => id),
    );
    expect(analysis.trafficPolicy).toMatchObject({
      realLearnerTrafficConfirmed: true,
      smokeExcluded: true,
    });
    expect(analysis.dataPolicy).toEqual({
      aggregateOnly: true,
      containsRawEvents: false,
      containsPersonalData: false,
    });
    expect(overview.overall.metrics.coreCompletionRate).toMatchObject({
      numerator: 70,
      denominator: 100,
      percentage: 70,
      usableForDecision: true,
    });
    expect(overview.overall.metrics.continuationRate.percentage).toBe(71.4);
    expect(overview.overall.metrics.firstCorrectRate.percentage).toBe(75);
    expect(overview.overall.metrics.explanationOpenRate.percentage).toBe(50);
    expect(analysis.caveat).toContain("does not prove");
  });

  it("marks low-sample chapters and segments as insufficient", () => {
    const input = validExport();
    for (const row of input.rows) {
      if (row.chapterId === "overview") {
        row.startedVisitors =
          row.locale === "all" && row.device === "all" ? 49 : 29;
        row.coreCompletedVisitors = 20;
        row.conceptCheckVisitors = 20;
        row.firstCorrectVisitors = 10;
        row.explanationOpenedVisitors = 10;
        row.continuedVisitors = 10;
      }
    }

    const analysis = analyzeLearningMetricsExport(input);
    const overview = analysis.chapters[0];

    expect(overview.decisionEligible).toBe(false);
    expect(overview.overall.metrics.coreCompletionRate.usableForDecision).toBe(
      false,
    );
    expect(
      overview.locales.every(({ sampleEligible }) => !sampleEligible),
    ).toBe(true);
    expect(analysis.insufficientChapterIds).toContain("overview");
  });

  it.each([
    [
      "obsolete query contract",
      (input: LearningMetricsExport) => {
        input.schemaVersion = 1 as 2;
        input.provider.queryKind =
          "sequential-aggregate-visitor-funnels" as "aggregate-visitor-event-steps";
      },
      /schemaVersion must be 2/,
    ],
    [
      "short observation window",
      (input: LearningMetricsExport) => {
        input.observationWindow.endDateExclusive = "2026-08-08";
        input.observationWindow.completeDays = 13;
      },
      /at least 14 complete days/,
    ],
    [
      "date-only export timestamp",
      (input: LearningMetricsExport) => {
        input.provider.exportedAt = "2026-08-09";
      },
      /exportedAt must be an ISO date-time/,
    ],
    [
      "unexcluded smoke traffic",
      (input: LearningMetricsExport) => {
        input.trafficPolicy.smokeExcluded = false as true;
      },
      /smokeExcluded must be true/,
    ],
    [
      "raw events",
      (input: LearningMetricsExport) => {
        input.dataPolicy.containsRawEvents = true as false;
      },
      /containsRawEvents must be false/,
    ],
    [
      "invalid funnel hierarchy",
      (input: LearningMetricsExport) => {
        input.rows[0].continuedVisitors = 71;
      },
      /continuedVisitors cannot exceed coreCompletedVisitors/,
    ],
    [
      "missing canonical segment",
      (input: LearningMetricsExport) => {
        input.rows.pop();
      },
      /missing required segment/,
    ],
    [
      "duplicate canonical segment",
      (input: LearningMetricsExport) => {
        input.rows[input.rows.length - 1] = structuredClone(input.rows[0]);
      },
      /duplicates segment/,
    ],
  ])("rejects %s", (_label, mutate, expected) => {
    const input = validExport();
    mutate(input);

    expect(() => parseLearningMetricsExport(input)).toThrow(expected);
  });

  it("uses the reporting timezone when checking a complete end date", () => {
    const input = validExport();
    input.provider.exportedAt = "2026-08-08T16:00:00.000Z";

    expect(() => parseLearningMetricsExport(input)).not.toThrow();

    input.provider.exportedAt = "2026-08-08T15:59:59.999Z";
    expect(() => parseLearningMetricsExport(input)).toThrow(
      /endDateExclusive in Asia\/Shanghai/,
    );
  });

  it("rejects unknown fields instead of silently retaining personal data", () => {
    const input = validExport() as LearningMetricsExport & {
      visitorId?: string;
    };
    input.visitorId = "not-allowed";

    expect(() => parseLearningMetricsExport(input)).toThrow(
      /export.visitorId is not allowed/,
    );
  });

  it("reports all validation failures for auditability", () => {
    const input = validExport();
    input.trafficPolicy.realLearnerTrafficConfirmed = false as true;
    input.queryPolicy.filtersFrozen = false as true;

    try {
      parseLearningMetricsExport(input);
      throw new Error("expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(LearningMetricsValidationError);
      expect((error as LearningMetricsValidationError).issues).toEqual(
        expect.arrayContaining([
          "export.trafficPolicy.realLearnerTrafficConfirmed must be true",
          "export.queryPolicy.filtersFrozen must be true",
        ]),
      );
    }
  });

  it("renders an auditable Markdown summary with sample gates", () => {
    const markdown = renderLearningMetricsMarkdown(
      analyzeLearningMetricsExport(validExport()),
    );

    expect(markdown).toContain("# P2-05 聚合学习指标分析");
    expect(markdown).toContain("Schema：v2");
    expect(markdown).toContain("aggregate-visitor-event-steps");
    expect(markdown).toContain("| overview | 100 | 70.0% (70/100)");
    expect(markdown).toContain("Locale：22/22 个分段达到门槛");
    expect(markdown).toContain("CI / preview / smoke / developer 均已排除");
    expect(markdown).toContain("does not prove");
  });

  it("runs the public CLI without writing an analysis artifact", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ai-history-metrics-"));
    const inputPath = join(directory, "aggregate-export.json");
    const scriptPath = fileURLToPath(
      new URL(
        "../../../../scripts/analyze-learning-metrics.ts",
        import.meta.url,
      ),
    );

    try {
      await writeFile(inputPath, JSON.stringify(validExport()), "utf8");
      const result = spawnSync(
        process.execPath,
        [scriptPath, "--", inputPath, "--format=json"],
        { encoding: "utf8" },
      );

      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(result.stdout)).toMatchObject({
        status: "eligible-for-chapter-review",
        decisionEligibleChapterIds: chapterRegistry.map(({ id }) => id),
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
