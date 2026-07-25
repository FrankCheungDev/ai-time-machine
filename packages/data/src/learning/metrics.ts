import { chapterRegistry, isChapterId, type ChapterId } from "../chapters.ts";
import { supportedLocales, type Locale } from "../locales.ts";

export const learningMetricsSchemaVersion = 1 as const;
export const minimumObservationDays = 14;
export const minimumChapterVisitors = 50;
export const minimumSegmentVisitors = 30;

export const learningMetricDeviceClasses = [
  "desktop",
  "laptop",
  "tablet",
  "mobile",
] as const;

export type LearningMetricDeviceClass =
  (typeof learningMetricDeviceClasses)[number];
export type LearningMetricLocale = Locale | "all";
export type LearningMetricDevice = LearningMetricDeviceClass | "all";

export interface LearningMetricCounts {
  startedVisitors: number;
  coreCompletedVisitors: number;
  conceptCheckVisitors: number;
  firstCorrectVisitors: number;
  explanationOpenedVisitors: number;
  continuedVisitors: number;
}

export interface LearningMetricRow extends LearningMetricCounts {
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
}

export interface LearningMetricsExport {
  schemaVersion: typeof learningMetricsSchemaVersion;
  site: "atlas.z-ai.cc";
  environment: "production";
  provider: {
    name: string;
    exportedAt: string;
    queryKind: "sequential-aggregate-visitor-funnels";
  };
  observationWindow: {
    startDate: string;
    endDateExclusive: string;
    completeDays: number;
  };
  trafficPolicy: {
    realLearnerTrafficConfirmed: true;
    productionOnly: true;
    ciExcluded: true;
    previewExcluded: true;
    smokeExcluded: true;
    developerExcluded: true;
  };
  queryPolicy: {
    sequentialFunnels: true;
    aggregateVisitors: true;
    filtersFrozen: true;
    eventMappingVersion: 1;
  };
  dataPolicy: {
    aggregateOnly: true;
    containsRawEvents: false;
    containsPersonalData: false;
  };
  rows: LearningMetricRow[];
}

export interface LearningMetricRate {
  numerator: number;
  denominator: number;
  value: number | null;
  percentage: number | null;
  usableForDecision: boolean;
}

export interface LearningMetricSegmentAnalysis {
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
  startedVisitors: number;
  sampleThreshold: number;
  sampleEligible: boolean;
  metrics: {
    coreCompletionRate: LearningMetricRate;
    continuationRate: LearningMetricRate;
    firstCorrectRate: LearningMetricRate;
    explanationOpenRate: LearningMetricRate;
  };
}

export interface LearningMetricChapterAnalysis {
  chapterId: ChapterId;
  decisionEligible: boolean;
  overall: LearningMetricSegmentAnalysis;
  locales: LearningMetricSegmentAnalysis[];
  devices: LearningMetricSegmentAnalysis[];
}

export interface LearningMetricsAnalysis {
  schemaVersion: typeof learningMetricsSchemaVersion;
  status: "eligible-for-chapter-review" | "insufficient-evidence";
  site: LearningMetricsExport["site"];
  provider: LearningMetricsExport["provider"];
  observationWindow: LearningMetricsExport["observationWindow"];
  trafficPolicy: LearningMetricsExport["trafficPolicy"];
  queryPolicy: LearningMetricsExport["queryPolicy"];
  dataPolicy: LearningMetricsExport["dataPolicy"];
  thresholds: {
    minimumObservationDays: number;
    minimumChapterVisitors: number;
    minimumSegmentVisitors: number;
  };
  decisionEligibleChapterIds: ChapterId[];
  insufficientChapterIds: ChapterId[];
  chapters: LearningMetricChapterAnalysis[];
  caveat: string;
}

export class LearningMetricsValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid learning metrics export:\n- ${issues.join("\n- ")}`);
    this.name = "LearningMetricsValidationError";
    this.issues = [...issues];
  }
}

const rootKeys = [
  "schemaVersion",
  "site",
  "environment",
  "provider",
  "observationWindow",
  "trafficPolicy",
  "queryPolicy",
  "dataPolicy",
  "rows",
] as const;
const providerKeys = ["name", "exportedAt", "queryKind"] as const;
const observationWindowKeys = [
  "startDate",
  "endDateExclusive",
  "completeDays",
] as const;
const trafficPolicyKeys = [
  "realLearnerTrafficConfirmed",
  "productionOnly",
  "ciExcluded",
  "previewExcluded",
  "smokeExcluded",
  "developerExcluded",
] as const;
const queryPolicyKeys = [
  "sequentialFunnels",
  "aggregateVisitors",
  "filtersFrozen",
  "eventMappingVersion",
] as const;
const dataPolicyKeys = [
  "aggregateOnly",
  "containsRawEvents",
  "containsPersonalData",
] as const;
const rowKeys = [
  "chapterId",
  "locale",
  "device",
  "startedVisitors",
  "coreCompletedVisitors",
  "conceptCheckVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
  "continuedVisitors",
] as const;
const countKeys = [
  "startedVisitors",
  "coreCompletedVisitors",
  "conceptCheckVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
  "continuedVisitors",
] as const satisfies readonly (keyof LearningMetricCounts)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function checkExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  path: string,
  issues: string[],
): void {
  const expectedSet = new Set(expected);

  for (const key of expected) {
    if (!(key in value)) issues.push(`${path}.${key} is required`);
  }
  for (const key of Object.keys(value)) {
    if (!expectedSet.has(key)) issues.push(`${path}.${key} is not allowed`);
  }
}

function checkRequiredRecord(
  value: unknown,
  expectedKeys: readonly string[],
  path: string,
  issues: string[],
): Record<string, unknown> {
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return {};
  }

  checkExactKeys(value, expectedKeys, path, issues);
  return value;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parseUtcDate(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp
    : null;
}

function parseIsoDateTime(value: unknown): number | null {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function segmentKey(
  chapterId: ChapterId,
  locale: LearningMetricLocale,
  device: LearningMetricDevice,
): string {
  return `${chapterId}|${locale}|${device}`;
}

function requiredSegments(): Array<{
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
}> {
  return [
    { locale: "all", device: "all" },
    ...supportedLocales.map((locale) => ({ locale, device: "all" as const })),
    ...learningMetricDeviceClasses.map((device) => ({
      locale: "all" as const,
      device,
    })),
  ];
}

export function parseLearningMetricsExport(
  value: unknown,
): LearningMetricsExport {
  const issues: string[] = [];
  const root = checkRequiredRecord(value, rootKeys, "export", issues);

  if (root.schemaVersion !== learningMetricsSchemaVersion) {
    issues.push(`export.schemaVersion must be ${learningMetricsSchemaVersion}`);
  }
  if (root.site !== "atlas.z-ai.cc") {
    issues.push('export.site must be "atlas.z-ai.cc"');
  }
  if (root.environment !== "production") {
    issues.push('export.environment must be "production"');
  }

  const provider = checkRequiredRecord(
    root.provider,
    providerKeys,
    "export.provider",
    issues,
  );
  if (typeof provider.name !== "string" || provider.name.trim() === "") {
    issues.push("export.provider.name must be a non-empty string");
  }
  if (provider.queryKind !== "sequential-aggregate-visitor-funnels") {
    issues.push(
      'export.provider.queryKind must be "sequential-aggregate-visitor-funnels"',
    );
  }
  const exportedAt = parseIsoDateTime(provider.exportedAt);
  if (exportedAt === null) {
    issues.push("export.provider.exportedAt must be an ISO date-time");
  }

  const observationWindow = checkRequiredRecord(
    root.observationWindow,
    observationWindowKeys,
    "export.observationWindow",
    issues,
  );
  const startTimestamp = parseUtcDate(observationWindow.startDate);
  const endTimestamp = parseUtcDate(observationWindow.endDateExclusive);
  if (startTimestamp === null) {
    issues.push(
      "export.observationWindow.startDate must be a valid YYYY-MM-DD date",
    );
  }
  if (endTimestamp === null) {
    issues.push(
      "export.observationWindow.endDateExclusive must be a valid YYYY-MM-DD date",
    );
  }
  if (!isNonNegativeInteger(observationWindow.completeDays)) {
    issues.push(
      "export.observationWindow.completeDays must be a non-negative integer",
    );
  }
  if (startTimestamp !== null && endTimestamp !== null) {
    const calculatedDays = (endTimestamp - startTimestamp) / 86_400_000;
    if (calculatedDays <= 0 || !Number.isInteger(calculatedDays)) {
      issues.push("export.observationWindow must have a positive day range");
    }
    if (observationWindow.completeDays !== calculatedDays) {
      issues.push(
        `export.observationWindow.completeDays must equal ${calculatedDays}`,
      );
    }
    if (calculatedDays < minimumObservationDays) {
      issues.push(
        `export.observationWindow must contain at least ${minimumObservationDays} complete days`,
      );
    }
    if (exportedAt !== null && exportedAt < endTimestamp) {
      issues.push(
        "export.provider.exportedAt must be on or after endDateExclusive",
      );
    }
  }

  const trafficPolicy = checkRequiredRecord(
    root.trafficPolicy,
    trafficPolicyKeys,
    "export.trafficPolicy",
    issues,
  );
  for (const key of trafficPolicyKeys) {
    if (trafficPolicy[key] !== true) {
      issues.push(`export.trafficPolicy.${key} must be true`);
    }
  }

  const queryPolicy = checkRequiredRecord(
    root.queryPolicy,
    queryPolicyKeys,
    "export.queryPolicy",
    issues,
  );
  for (const key of [
    "sequentialFunnels",
    "aggregateVisitors",
    "filtersFrozen",
  ] as const) {
    if (queryPolicy[key] !== true) {
      issues.push(`export.queryPolicy.${key} must be true`);
    }
  }
  if (queryPolicy.eventMappingVersion !== 1) {
    issues.push("export.queryPolicy.eventMappingVersion must be 1");
  }

  const dataPolicy = checkRequiredRecord(
    root.dataPolicy,
    dataPolicyKeys,
    "export.dataPolicy",
    issues,
  );
  if (dataPolicy.aggregateOnly !== true) {
    issues.push("export.dataPolicy.aggregateOnly must be true");
  }
  if (dataPolicy.containsRawEvents !== false) {
    issues.push("export.dataPolicy.containsRawEvents must be false");
  }
  if (dataPolicy.containsPersonalData !== false) {
    issues.push("export.dataPolicy.containsPersonalData must be false");
  }

  if (!Array.isArray(root.rows)) {
    issues.push("export.rows must be an array");
  }

  const rowsBySegment = new Map<string, LearningMetricRow>();
  const rows = Array.isArray(root.rows) ? root.rows : [];
  for (const [index, candidate] of rows.entries()) {
    const path = `export.rows[${index}]`;
    const row = checkRequiredRecord(candidate, rowKeys, path, issues);
    const chapterId = row.chapterId;
    const locale = row.locale;
    const device = row.device;

    if (!isChapterId(chapterId)) {
      issues.push(`${path}.chapterId must be a known chapter id`);
    }
    if (locale !== "all" && !supportedLocales.includes(locale as Locale)) {
      issues.push(`${path}.locale must be all, zh-CN, or en`);
    }
    if (
      device !== "all" &&
      !learningMetricDeviceClasses.includes(device as LearningMetricDeviceClass)
    ) {
      issues.push(
        `${path}.device must be all, desktop, laptop, tablet, or mobile`,
      );
    }
    if (locale !== "all" && device !== "all") {
      issues.push(
        `${path} must be an overall, locale-only, or device-only segment`,
      );
    }

    const counts = {} as Record<keyof LearningMetricCounts, number>;
    let countsValid = true;
    for (const key of countKeys) {
      if (!isNonNegativeInteger(row[key])) {
        issues.push(`${path}.${key} must be a non-negative integer`);
        countsValid = false;
      } else {
        counts[key] = row[key];
      }
    }

    if (
      isChapterId(chapterId) &&
      (locale === "all" || supportedLocales.includes(locale as Locale)) &&
      (device === "all" ||
        learningMetricDeviceClasses.includes(
          device as LearningMetricDeviceClass,
        )) &&
      !(locale !== "all" && device !== "all") &&
      countsValid
    ) {
      const typedLocale = locale as LearningMetricLocale;
      const typedDevice = device as LearningMetricDevice;
      const key = segmentKey(chapterId, typedLocale, typedDevice);
      if (rowsBySegment.has(key)) {
        issues.push(`${path} duplicates segment ${key}`);
      } else {
        const parsedRow: LearningMetricRow = {
          chapterId,
          locale: typedLocale,
          device: typedDevice,
          ...counts,
        };
        rowsBySegment.set(key, parsedRow);

        if (parsedRow.coreCompletedVisitors > parsedRow.startedVisitors) {
          issues.push(
            `${path}.coreCompletedVisitors cannot exceed startedVisitors`,
          );
        }
        if (parsedRow.conceptCheckVisitors > parsedRow.startedVisitors) {
          issues.push(
            `${path}.conceptCheckVisitors cannot exceed startedVisitors`,
          );
        }
        if (parsedRow.firstCorrectVisitors > parsedRow.conceptCheckVisitors) {
          issues.push(
            `${path}.firstCorrectVisitors cannot exceed conceptCheckVisitors`,
          );
        }
        if (
          parsedRow.explanationOpenedVisitors > parsedRow.conceptCheckVisitors
        ) {
          issues.push(
            `${path}.explanationOpenedVisitors cannot exceed conceptCheckVisitors`,
          );
        }
        if (parsedRow.continuedVisitors > parsedRow.coreCompletedVisitors) {
          issues.push(
            `${path}.continuedVisitors cannot exceed coreCompletedVisitors`,
          );
        }
      }
    }
  }

  const expectedSegments = requiredSegments();
  for (const chapter of chapterRegistry) {
    const overall = rowsBySegment.get(segmentKey(chapter.id, "all", "all"));

    for (const segment of expectedSegments) {
      const key = segmentKey(chapter.id, segment.locale, segment.device);
      const row = rowsBySegment.get(key);
      if (!row) {
        issues.push(`export.rows is missing required segment ${key}`);
        continue;
      }

      if (overall && row !== overall) {
        for (const countKey of countKeys) {
          if (row[countKey] > overall[countKey]) {
            issues.push(
              `${key}.${countKey} cannot exceed overall chapter count`,
            );
          }
        }
      }
    }
  }

  const expectedRowCount = chapterRegistry.length * expectedSegments.length;
  if (rows.length !== expectedRowCount) {
    issues.push(`export.rows must contain exactly ${expectedRowCount} rows`);
  }

  if (issues.length > 0) throw new LearningMetricsValidationError(issues);
  return structuredClone(value) as LearningMetricsExport;
}

function rounded(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function metricRate(
  numerator: number,
  denominator: number,
  sampleEligible: boolean,
): LearningMetricRate {
  const value = denominator === 0 ? null : numerator / denominator;

  return {
    numerator,
    denominator,
    value: value === null ? null : rounded(value, 4),
    percentage: value === null ? null : rounded(value * 100, 1),
    usableForDecision: sampleEligible && denominator > 0,
  };
}

function analyzeSegment(
  row: LearningMetricRow,
  sampleThreshold: number,
): LearningMetricSegmentAnalysis {
  const sampleEligible = row.startedVisitors >= sampleThreshold;

  return {
    chapterId: row.chapterId,
    locale: row.locale,
    device: row.device,
    startedVisitors: row.startedVisitors,
    sampleThreshold,
    sampleEligible,
    metrics: {
      coreCompletionRate: metricRate(
        row.coreCompletedVisitors,
        row.startedVisitors,
        sampleEligible,
      ),
      continuationRate: metricRate(
        row.continuedVisitors,
        row.coreCompletedVisitors,
        sampleEligible,
      ),
      firstCorrectRate: metricRate(
        row.firstCorrectVisitors,
        row.conceptCheckVisitors,
        sampleEligible,
      ),
      explanationOpenRate: metricRate(
        row.explanationOpenedVisitors,
        row.conceptCheckVisitors,
        sampleEligible,
      ),
    },
  };
}

export function analyzeLearningMetricsExport(
  value: unknown,
): LearningMetricsAnalysis {
  const parsed = parseLearningMetricsExport(value);
  const rowsBySegment = new Map(
    parsed.rows.map((row) => [
      segmentKey(row.chapterId, row.locale, row.device),
      row,
    ]),
  );

  const chapters = chapterRegistry.map(
    (chapter): LearningMetricChapterAnalysis => {
      const overall = analyzeSegment(
        rowsBySegment.get(segmentKey(chapter.id, "all", "all"))!,
        minimumChapterVisitors,
      );
      const locales = supportedLocales.map((locale) =>
        analyzeSegment(
          rowsBySegment.get(segmentKey(chapter.id, locale, "all"))!,
          minimumSegmentVisitors,
        ),
      );
      const devices = learningMetricDeviceClasses.map((device) =>
        analyzeSegment(
          rowsBySegment.get(segmentKey(chapter.id, "all", device))!,
          minimumSegmentVisitors,
        ),
      );

      return {
        chapterId: chapter.id,
        decisionEligible: overall.sampleEligible,
        overall,
        locales,
        devices,
      };
    },
  );
  const decisionEligibleChapterIds = chapters
    .filter(({ decisionEligible }) => decisionEligible)
    .map(({ chapterId }) => chapterId);
  const insufficientChapterIds = chapters
    .filter(({ decisionEligible }) => !decisionEligible)
    .map(({ chapterId }) => chapterId);

  return {
    schemaVersion: learningMetricsSchemaVersion,
    status:
      decisionEligibleChapterIds.length > 0
        ? "eligible-for-chapter-review"
        : "insufficient-evidence",
    site: parsed.site,
    provider: { ...parsed.provider },
    observationWindow: { ...parsed.observationWindow },
    trafficPolicy: { ...parsed.trafficPolicy },
    queryPolicy: { ...parsed.queryPolicy },
    dataPolicy: { ...parsed.dataPolicy },
    thresholds: {
      minimumObservationDays,
      minimumChapterVisitors,
      minimumSegmentVisitors,
    },
    decisionEligibleChapterIds,
    insufficientChapterIds,
    chapters,
    caveat:
      "This validates aggregate evidence and sample gates only; it does not prove the traffic attestation or complete P2-05 by itself.",
  };
}

function displayRate(rate: LearningMetricRate): string {
  return rate.percentage === null
    ? "—"
    : `${rate.percentage.toFixed(1)}% (${rate.numerator}/${rate.denominator})`;
}

export function renderLearningMetricsMarkdown(
  analysis: LearningMetricsAnalysis,
): string {
  const lines = [
    "# P2-05 聚合学习指标分析",
    "",
    `- 状态：${analysis.status}`,
    `- Provider：${analysis.provider.name}`,
    `- 观察窗口：${analysis.observationWindow.startDate} → ${analysis.observationWindow.endDateExclusive}（${analysis.observationWindow.completeDays} 个完整自然日）`,
    "- 流量证明：production-only、真实学习者，CI / preview / smoke / developer 均已排除（外部 attestation）",
    "- 数据边界：aggregate-only、无 raw events、无 personal data",
    `- 章节决策门槛：${analysis.thresholds.minimumChapterVisitors} 个 started visitors`,
    `- 分段比较门槛：${analysis.thresholds.minimumSegmentVisitors} 个 started visitors`,
    "",
    "| Chapter | Started | Core completion | Continuation | First correct | Explanation open | Evidence |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
  ];

  for (const chapter of analysis.chapters) {
    lines.push(
      `| ${chapter.chapterId} | ${chapter.overall.startedVisitors} | ${displayRate(chapter.overall.metrics.coreCompletionRate)} | ${displayRate(chapter.overall.metrics.continuationRate)} | ${displayRate(chapter.overall.metrics.firstCorrectRate)} | ${displayRate(chapter.overall.metrics.explanationOpenRate)} | ${chapter.decisionEligible ? "eligible" : "insufficient"} |`,
    );
  }

  const eligibleLocaleSegments = analysis.chapters.flatMap(({ locales }) =>
    locales.filter(({ sampleEligible }) => sampleEligible),
  ).length;
  const totalLocaleSegments =
    analysis.chapters.length * supportedLocales.length;
  const eligibleDeviceSegments = analysis.chapters.flatMap(({ devices }) =>
    devices.filter(({ sampleEligible }) => sampleEligible),
  ).length;
  const totalDeviceSegments =
    analysis.chapters.length * learningMetricDeviceClasses.length;

  lines.push(
    "",
    "## 分段证据",
    "",
    `- Locale：${eligibleLocaleSegments}/${totalLocaleSegments} 个分段达到门槛`,
    `- Device：${eligibleDeviceSegments}/${totalDeviceSegments} 个分段达到门槛`,
    "",
    `> ${analysis.caveat}`,
    "",
  );

  return lines.join("\n");
}
