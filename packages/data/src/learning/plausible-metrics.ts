import { chapterRegistry, isChapterId, type ChapterId } from "../chapters.ts";
import { supportedLocales, type Locale } from "../locales.ts";
import {
  learningMetricDeviceClasses,
  learningMetricSequentialFunnels,
  learningMetricsFunnelCapturePlanVersion,
  learningMetricsFunnelEvidenceSchemaVersion,
  learningMetricsFunnelEvidenceSource,
  learningMetricsReportingTimezone,
  learningMetricsSchemaVersion,
  learningMetricsTerminalChapterId,
  isSafeLearningMetricEvidenceRef,
  minimumObservationDays,
  parseLearningMetricsExport,
  type LearningMetricCounts,
  type LearningMetricDevice,
  type LearningMetricDeviceClass,
  type LearningMetricLocale,
  type LearningMetricRow,
  type LearningMetricsExport,
} from "./metrics.ts";

export const plausibleStatsEndpoint = "https://plausible.io/api/v2/query";
export const plausibleStatsSiteId = "atlas.z-ai.cc" as const;
export const plausibleStatsQueryPlanVersion = 2 as const;

export const plausibleLearningMetricCountKeys = [
  "conceptCheckVisitors",
  "conceptCheckFirstAttemptVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
] as const satisfies readonly (keyof LearningMetricCounts)[];

export type PlausibleLearningMetricCountKey =
  (typeof plausibleLearningMetricCountKeys)[number];
export type PlausibleStatsSegmentKind = "overall" | "locale" | "device";

type PlausibleStatsFilter = [
  operator: "is",
  dimension: string,
  clauses: string[],
];

export interface PlausibleStatsQuery {
  site_id: typeof plausibleStatsSiteId;
  metrics: ["visitors"];
  date_range: [startDate: string, inclusiveEndDate: string];
  filters: PlausibleStatsFilter[];
  dimensions: string[];
  order_by: Array<[dimension: string, direction: "asc"]>;
  include: {
    imports: false;
    total_rows: true;
  };
  pagination: {
    limit: 10_000;
    offset: 0;
  };
}

export interface PlausibleStatsQueryDefinition {
  id: `${PlausibleLearningMetricCountKey}:${PlausibleStatsSegmentKind}`;
  countKey: PlausibleLearningMetricCountKey;
  segmentKind: PlausibleStatsSegmentKind;
  query: PlausibleStatsQuery;
}

export interface PlausibleStatsQueryPlan {
  version: typeof plausibleStatsQueryPlanVersion;
  provider: "Plausible Hosted Business";
  endpoint: typeof plausibleStatsEndpoint;
  site: typeof plausibleStatsSiteId;
  reportingTimezone: typeof learningMetricsReportingTimezone;
  eventMappingVersion: 1;
  startDate: string;
  endDateExclusive: string;
  completeDays: number;
  apiDateRange: [startDate: string, inclusiveEndDate: string];
  requiredFunnelEvidence: {
    schemaVersion: typeof learningMetricsFunnelEvidenceSchemaVersion;
    capturePlanVersion: typeof learningMetricsFunnelCapturePlanVersion;
    source: typeof learningMetricsFunnelEvidenceSource;
    funnels: typeof learningMetricSequentialFunnels;
    captureCount: number;
    captureTasks: PlausibleSequentialFunnelCaptureTask[];
  };
  queryCount: number;
  queries: PlausibleStatsQueryDefinition[];
}

export type PlausibleSequentialFunnelId =
  (typeof learningMetricSequentialFunnels)[number]["id"];

export interface PlausibleSequentialFunnelCaptureTask {
  captureId: `${PlausibleSequentialFunnelId}:${ChapterId}:${LearningMetricLocale}:${LearningMetricDevice}`;
  funnelId: PlausibleSequentialFunnelId;
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
}

export interface PlausibleSequentialFunnelCapture extends PlausibleSequentialFunnelCaptureTask {
  enteredVisitors: number;
  convertedVisitors: number;
  evidenceRef: string;
}

export interface PlausibleSequentialFunnelEvidence {
  schemaVersion: typeof learningMetricsFunnelEvidenceSchemaVersion;
  capturePlanVersion: typeof learningMetricsFunnelCapturePlanVersion;
  source: typeof learningMetricsFunnelEvidenceSource;
  site: typeof plausibleStatsSiteId;
  capturedAt: string;
  evidenceBundleSha256: string;
  operatorAttestation: {
    dashboardCountsTranscribed: true;
    aggregateOnlyConfirmed: true;
  };
  reviewerAttestation: {
    independentlyReviewed: true;
    capturePlanMatched: true;
  };
  reportingTimezone: typeof learningMetricsReportingTimezone;
  observationWindow: {
    startDate: string;
    endDateExclusive: string;
    completeDays: number;
  };
  funnels: typeof learningMetricSequentialFunnels;
  captures: PlausibleSequentialFunnelCapture[];
}

export interface PlausibleMetricsAttestation {
  realLearnerTrafficConfirmed: boolean;
  productionVerified: boolean;
  sequentialFunnelsVerified: boolean;
  ciExcluded: boolean;
  previewExcluded: boolean;
  smokeExcluded: boolean;
  developerExcluded: boolean;
  filtersFrozen: boolean;
}

interface MetricQuerySpec {
  countKey: PlausibleLearningMetricCountKey;
  filters: PlausibleStatsFilter[];
}

interface SegmentQuerySpec {
  segmentKind: PlausibleStatsSegmentKind;
  dimensions: string[];
}

const metricQuerySpecs: MetricQuerySpec[] = [
  {
    countKey: "conceptCheckVisitors",
    filters: [["is", "event:name", ["concept_check_completed"]]],
  },
  {
    countKey: "conceptCheckFirstAttemptVisitors",
    filters: [
      ["is", "event:name", ["concept_check_completed"]],
      ["is", "event:props:attempt", ["first"]],
    ],
  },
  {
    countKey: "firstCorrectVisitors",
    filters: [
      ["is", "event:name", ["concept_check_completed"]],
      ["is", "event:props:correct", ["true"]],
      ["is", "event:props:attempt", ["first"]],
    ],
  },
  {
    countKey: "explanationOpenedVisitors",
    filters: [["is", "event:name", ["concept_explanation_opened"]]],
  },
];

const segmentQuerySpecs: SegmentQuerySpec[] = [
  {
    segmentKind: "overall",
    dimensions: ["event:props:chapterId"],
  },
  {
    segmentKind: "locale",
    dimensions: ["event:props:chapterId", "event:props:locale"],
  },
  {
    segmentKind: "device",
    dimensions: ["event:props:chapterId", "visit:device"],
  },
];

const plausibleDeviceClasses = {
  Desktop: "desktop",
  Laptop: "laptop",
  Tablet: "tablet",
  Mobile: "mobile",
} as const satisfies Record<string, LearningMetricDeviceClass>;

function parseDateOnly(value: string, label: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${label} must be a valid calendar date`);
  }

  return timestamp;
}

function formatDateOnly(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function segmentKey(
  chapterId: ChapterId,
  locale: LearningMetricLocale,
  device: LearningMetricDevice,
): string {
  return `${chapterId}|${locale}|${device}`;
}

function createRequiredRows(): LearningMetricRow[] {
  return chapterRegistry.flatMap(({ id }) => {
    const emptyCounts: LearningMetricCounts = {
      startedToCoreEnteredVisitors: 0,
      startedToCoreConvertedVisitors: 0,
      coreToContinuedEnteredVisitors:
        id === learningMetricsTerminalChapterId ? null : 0,
      coreToContinuedConvertedVisitors:
        id === learningMetricsTerminalChapterId ? null : 0,
      conceptCheckVisitors: 0,
      conceptCheckFirstAttemptVisitors: 0,
      firstCorrectVisitors: 0,
      explanationOpenedVisitors: 0,
    };

    return [
      {
        chapterId: id,
        locale: "all",
        device: "all",
        startedToCoreEvidenceRef: "",
        coreToContinuedEvidenceRef: null,
        ...emptyCounts,
      },
      ...supportedLocales.map((locale): LearningMetricRow => ({
        chapterId: id,
        locale,
        device: "all",
        startedToCoreEvidenceRef: "",
        coreToContinuedEvidenceRef: null,
        ...emptyCounts,
      })),
      ...learningMetricDeviceClasses.map((device): LearningMetricRow => ({
        chapterId: id,
        locale: "all",
        device,
        startedToCoreEvidenceRef: "",
        coreToContinuedEvidenceRef: null,
        ...emptyCounts,
      })),
    ];
  });
}

function captureTask(
  funnelId: PlausibleSequentialFunnelId,
  row: LearningMetricRow,
): PlausibleSequentialFunnelCaptureTask {
  const captureId =
    `${funnelId}:${row.chapterId}:${row.locale}:${row.device}` as PlausibleSequentialFunnelCaptureTask["captureId"];
  return {
    captureId,
    funnelId,
    chapterId: row.chapterId,
    locale: row.locale,
    device: row.device,
  };
}

export function createPlausibleSequentialFunnelCaptureTasks(): PlausibleSequentialFunnelCaptureTask[] {
  const rows = createRequiredRows();
  return [
    ...rows.map((row) => captureTask("started-to-core", row)),
    ...rows
      .filter(({ chapterId }) => chapterId !== learningMetricsTerminalChapterId)
      .map((row) => captureTask("core-to-continued", row)),
  ];
}

export function createPlausibleStatsQueryPlan(
  startDate: string,
  endDateExclusive: string,
): PlausibleStatsQueryPlan {
  const startTimestamp = parseDateOnly(startDate, "startDate");
  const endTimestamp = parseDateOnly(endDateExclusive, "endDateExclusive");
  const completeDays = (endTimestamp - startTimestamp) / 86_400_000;

  if (!Number.isInteger(completeDays) || completeDays <= 0) {
    throw new Error("observation window must have a positive day range");
  }
  if (completeDays < minimumObservationDays) {
    throw new Error(
      `observation window must contain at least ${minimumObservationDays} complete days`,
    );
  }

  const inclusiveEndDate = formatDateOnly(endTimestamp - 86_400_000);
  const apiDateRange: [string, string] = [startDate, inclusiveEndDate];
  const queries = metricQuerySpecs.flatMap(
    ({ countKey, filters }): PlausibleStatsQueryDefinition[] =>
      segmentQuerySpecs.map(({ segmentKind, dimensions }) => ({
        id: `${countKey}:${segmentKind}`,
        countKey,
        segmentKind,
        query: {
          site_id: plausibleStatsSiteId,
          metrics: ["visitors"],
          date_range: [...apiDateRange],
          filters: [
            ["is", "event:hostname", [plausibleStatsSiteId]],
            ...filters.map(
              ([operator, dimension, clauses]): PlausibleStatsFilter => [
                operator,
                dimension,
                [...clauses],
              ],
            ),
          ],
          dimensions: [...dimensions],
          order_by: dimensions.map((dimension) => [dimension, "asc"]),
          include: { imports: false, total_rows: true },
          pagination: { limit: 10_000, offset: 0 },
        },
      })),
  );
  const captureTasks = createPlausibleSequentialFunnelCaptureTasks();

  return {
    version: plausibleStatsQueryPlanVersion,
    provider: "Plausible Hosted Business",
    endpoint: plausibleStatsEndpoint,
    site: plausibleStatsSiteId,
    reportingTimezone: learningMetricsReportingTimezone,
    eventMappingVersion: 1,
    startDate,
    endDateExclusive,
    completeDays,
    apiDateRange,
    requiredFunnelEvidence: {
      schemaVersion: learningMetricsFunnelEvidenceSchemaVersion,
      capturePlanVersion: learningMetricsFunnelCapturePlanVersion,
      source: learningMetricsFunnelEvidenceSource,
      funnels: learningMetricSequentialFunnels,
      captureCount: captureTasks.length,
      captureTasks,
    },
    queryCount: queries.length,
    queries,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const funnelEvidenceRootKeys = [
  "schemaVersion",
  "capturePlanVersion",
  "source",
  "site",
  "capturedAt",
  "evidenceBundleSha256",
  "operatorAttestation",
  "reviewerAttestation",
  "reportingTimezone",
  "observationWindow",
  "funnels",
  "captures",
] as const;
const funnelEvidenceWindowKeys = [
  "startDate",
  "endDateExclusive",
  "completeDays",
] as const;
const funnelEvidenceCaptureKeys = [
  "captureId",
  "funnelId",
  "chapterId",
  "locale",
  "device",
  "enteredVisitors",
  "convertedVisitors",
  "evidenceRef",
] as const;
const operatorAttestationKeys = [
  "dashboardCountsTranscribed",
  "aggregateOnlyConfirmed",
] as const;
const reviewerAttestationKeys = [
  "independentlyReviewed",
  "capturePlanMatched",
] as const;

function assertExactRecord(
  value: unknown,
  expectedKeys: readonly string[],
  path: string,
): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${path} must be an object`);

  const expected = new Set(expectedKeys);
  const missing = expectedKeys.filter((key) => !(key in value));
  if (missing.length > 0) {
    throw new Error(`${path} is missing fields: ${missing.join(", ")}`);
  }
  const unknown = Object.keys(value).filter((key) => !expected.has(key));
  if (unknown.length > 0) {
    throw new Error(`${path} contains unknown fields: ${unknown.join(", ")}`);
  }
  return value;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isIsoDateTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) &&
    Number.isFinite(Date.parse(value))
  );
}

export function parsePlausibleSequentialFunnelEvidence(
  plan: PlausibleStatsQueryPlan,
  value: unknown,
): PlausibleSequentialFunnelEvidence {
  assertCanonicalPlausibleStatsQueryPlan(plan);
  const root = assertExactRecord(
    value,
    funnelEvidenceRootKeys,
    "funnel evidence",
  );

  if (root.schemaVersion !== learningMetricsFunnelEvidenceSchemaVersion) {
    throw new Error(
      `funnel evidence schemaVersion must be ${learningMetricsFunnelEvidenceSchemaVersion}`,
    );
  }
  if (root.capturePlanVersion !== learningMetricsFunnelCapturePlanVersion) {
    throw new Error(
      `funnel evidence capturePlanVersion must be ${learningMetricsFunnelCapturePlanVersion}`,
    );
  }
  if (root.source !== learningMetricsFunnelEvidenceSource) {
    throw new Error(
      `funnel evidence source must be "${learningMetricsFunnelEvidenceSource}"`,
    );
  }
  if (root.site !== plausibleStatsSiteId) {
    throw new Error(`funnel evidence site must be "${plausibleStatsSiteId}"`);
  }
  if (root.reportingTimezone !== learningMetricsReportingTimezone) {
    throw new Error(
      `funnel evidence reportingTimezone must be "${learningMetricsReportingTimezone}"`,
    );
  }
  if (
    typeof root.evidenceBundleSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(root.evidenceBundleSha256)
  ) {
    throw new Error(
      "funnel evidence evidenceBundleSha256 must be a lowercase SHA-256 digest",
    );
  }
  const operatorAttestation = assertExactRecord(
    root.operatorAttestation,
    operatorAttestationKeys,
    "funnel evidence operatorAttestation",
  );
  for (const key of operatorAttestationKeys) {
    if (operatorAttestation[key] !== true) {
      throw new Error(
        `funnel evidence operatorAttestation.${key} must be true`,
      );
    }
  }
  const reviewerAttestation = assertExactRecord(
    root.reviewerAttestation,
    reviewerAttestationKeys,
    "funnel evidence reviewerAttestation",
  );
  for (const key of reviewerAttestationKeys) {
    if (reviewerAttestation[key] !== true) {
      throw new Error(
        `funnel evidence reviewerAttestation.${key} must be true`,
      );
    }
  }
  if (!isIsoDateTime(root.capturedAt)) {
    throw new Error("funnel evidence capturedAt must be an ISO date-time");
  }
  const reportingWindowEnd = Date.parse(
    `${plan.endDateExclusive}T00:00:00+08:00`,
  );
  if (Date.parse(root.capturedAt) < reportingWindowEnd) {
    throw new Error(
      `funnel evidence capturedAt must be on or after endDateExclusive in ${learningMetricsReportingTimezone}`,
    );
  }

  const evidenceWindow = assertExactRecord(
    root.observationWindow,
    funnelEvidenceWindowKeys,
    "funnel evidence observationWindow",
  );
  const expectedWindow = {
    startDate: plan.startDate,
    endDateExclusive: plan.endDateExclusive,
    completeDays: plan.completeDays,
  };
  for (const key of funnelEvidenceWindowKeys) {
    if (evidenceWindow[key] !== expectedWindow[key]) {
      throw new Error(
        `funnel evidence observationWindow.${key} does not match the Stats query plan`,
      );
    }
  }
  if (
    JSON.stringify(root.funnels) !==
    JSON.stringify(learningMetricSequentialFunnels)
  ) {
    throw new Error(
      "funnel evidence definitions do not match the two canonical sequential funnels",
    );
  }
  if (!Array.isArray(root.captures)) {
    throw new Error("funnel evidence captures must be an array");
  }

  const expectedTasks = plan.requiredFunnelEvidence.captureTasks;
  if (root.captures.length !== expectedTasks.length) {
    throw new Error(
      `funnel evidence captures must contain exactly ${expectedTasks.length} captures`,
    );
  }
  const expectedById = new Map<string, PlausibleSequentialFunnelCaptureTask>(
    expectedTasks.map((task) => [task.captureId, task]),
  );
  const capturesById = new Map<string, PlausibleSequentialFunnelCapture>();
  const evidenceRefs = new Set<string>();
  for (const [index, candidate] of root.captures.entries()) {
    const path = `funnel evidence captures[${index}]`;
    const capture = assertExactRecord(
      candidate,
      funnelEvidenceCaptureKeys,
      path,
    );
    if (typeof capture.captureId !== "string") {
      throw new Error(`${path}.captureId must be a string`);
    }
    const expected = expectedById.get(capture.captureId);
    if (!expected) {
      throw new Error(`${path}.captureId is not in the canonical capture plan`);
    }
    for (const key of ["funnelId", "chapterId", "locale", "device"] as const) {
      if (capture[key] !== expected[key]) {
        throw new Error(`${path}.${key} does not match its captureId`);
      }
    }
    if (capturesById.has(expected.captureId)) {
      throw new Error(`${path} duplicates capture ${expected.captureId}`);
    }
    if (!isNonNegativeInteger(capture.enteredVisitors)) {
      throw new Error(`${path}.enteredVisitors must be a non-negative integer`);
    }
    if (!isNonNegativeInteger(capture.convertedVisitors)) {
      throw new Error(
        `${path}.convertedVisitors must be a non-negative integer`,
      );
    }
    if (capture.convertedVisitors > capture.enteredVisitors) {
      throw new Error(
        `${path}.convertedVisitors cannot exceed enteredVisitors`,
      );
    }
    if (!isSafeLearningMetricEvidenceRef(capture.evidenceRef)) {
      throw new Error(
        `${path}.evidenceRef must be a safe relative artifact path`,
      );
    }
    if (evidenceRefs.has(capture.evidenceRef)) {
      throw new Error(`${path}.evidenceRef must be unique`);
    }
    evidenceRefs.add(capture.evidenceRef);
    capturesById.set(expected.captureId, {
      ...expected,
      enteredVisitors: capture.enteredVisitors,
      convertedVisitors: capture.convertedVisitors,
      evidenceRef: capture.evidenceRef,
    });
  }
  for (const task of expectedTasks) {
    if (!capturesById.has(task.captureId)) {
      throw new Error(
        `funnel evidence is missing required capture ${task.captureId}`,
      );
    }
  }

  for (const capture of capturesById.values()) {
    const overallId = `${capture.funnelId}:${capture.chapterId}:all:all`;
    const overall = capturesById.get(overallId)!;
    if (capture !== overall) {
      if (capture.enteredVisitors > overall.enteredVisitors) {
        throw new Error(
          `${capture.captureId}.enteredVisitors cannot exceed its overall capture`,
        );
      }
      if (capture.convertedVisitors > overall.convertedVisitors) {
        throw new Error(
          `${capture.captureId}.convertedVisitors cannot exceed its overall capture`,
        );
      }
    }
    if (
      capture.funnelId === "started-to-core" &&
      capture.chapterId !== learningMetricsTerminalChapterId
    ) {
      const nextId = `core-to-continued:${capture.chapterId}:${capture.locale}:${capture.device}`;
      const nextCapture = capturesById.get(nextId)!;
      if (capture.convertedVisitors > nextCapture.enteredVisitors) {
        throw new Error(
          `${capture.captureId}.convertedVisitors cannot exceed ${nextId}.enteredVisitors`,
        );
      }
    }
  }

  const captures = expectedTasks.map(({ captureId }) =>
    capturesById.get(captureId)!,
  );

  return {
    schemaVersion: learningMetricsFunnelEvidenceSchemaVersion,
    capturePlanVersion: learningMetricsFunnelCapturePlanVersion,
    source: learningMetricsFunnelEvidenceSource,
    site: plausibleStatsSiteId,
    capturedAt: root.capturedAt,
    evidenceBundleSha256: root.evidenceBundleSha256,
    operatorAttestation: {
      dashboardCountsTranscribed: true,
      aggregateOnlyConfirmed: true,
    },
    reviewerAttestation: {
      independentlyReviewed: true,
      capturePlanMatched: true,
    },
    reportingTimezone: learningMetricsReportingTimezone,
    observationWindow: expectedWindow,
    funnels: learningMetricSequentialFunnels,
    captures,
  };
}

function parseResponseRows(
  definition: PlausibleStatsQueryDefinition,
  value: unknown,
): Array<{ dimensions: string[]; visitors: number }> {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new Error(`${definition.id} returned an invalid response root`);
  }
  const unknownRootKeys = Object.keys(value).filter(
    (key) => key !== "results" && key !== "meta" && key !== "query",
  );
  if (unknownRootKeys.length > 0) {
    throw new Error(
      `${definition.id} response contains unknown fields: ${unknownRootKeys.join(", ")}`,
    );
  }
  if (!isRecord(value.meta)) {
    throw new Error(`${definition.id} response meta must be an object`);
  }
  const totalRows = value.meta.total_rows;
  if (
    typeof totalRows !== "number" ||
    !Number.isSafeInteger(totalRows) ||
    totalRows < 0
  ) {
    throw new Error(`${definition.id} response meta.total_rows is invalid`);
  }
  if (totalRows !== value.results.length) {
    throw new Error(
      `${definition.id} response is incomplete: ${value.results.length}/${totalRows} rows`,
    );
  }

  return value.results.map((candidate, index) => {
    const path = `${definition.id}.results[${index}]`;
    if (!isRecord(candidate)) {
      throw new Error(`${path} must be an object`);
    }
    const unknownKeys = Object.keys(candidate).filter(
      (key) => key !== "dimensions" && key !== "metrics",
    );
    if (unknownKeys.length > 0) {
      throw new Error(
        `${path} contains unknown fields: ${unknownKeys.join(", ")}`,
      );
    }
    if (
      !Array.isArray(candidate.dimensions) ||
      candidate.dimensions.length !== definition.query.dimensions.length ||
      !candidate.dimensions.every((dimension) => typeof dimension === "string")
    ) {
      throw new Error(`${path}.dimensions does not match its query`);
    }
    if (
      !Array.isArray(candidate.metrics) ||
      candidate.metrics.length !== 1 ||
      !Number.isSafeInteger(candidate.metrics[0]) ||
      candidate.metrics[0] < 0
    ) {
      throw new Error(`${path}.metrics must contain one non-negative integer`);
    }

    return {
      dimensions: candidate.dimensions as string[],
      visitors: candidate.metrics[0] as number,
    };
  });
}

function resolveResponseSegment(
  definition: PlausibleStatsQueryDefinition,
  dimensions: string[],
): {
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
} {
  const chapterId = dimensions[0];
  if (!isChapterId(chapterId)) {
    throw new Error(`${definition.id} returned unknown chapterId ${chapterId}`);
  }

  if (definition.segmentKind === "overall") {
    return { chapterId, locale: "all", device: "all" };
  }
  if (definition.segmentKind === "locale") {
    const locale = dimensions[1];
    if (!supportedLocales.includes(locale as Locale)) {
      throw new Error(`${definition.id} returned unknown locale ${locale}`);
    }
    return { chapterId, locale: locale as Locale, device: "all" };
  }

  const providerDevice = dimensions[1];
  if (!(providerDevice in plausibleDeviceClasses)) {
    throw new Error(
      `${definition.id} returned unsupported device ${providerDevice}`,
    );
  }
  return {
    chapterId,
    locale: "all",
    device:
      plausibleDeviceClasses[
        providerDevice as keyof typeof plausibleDeviceClasses
      ],
  };
}

export function assertCanonicalPlausibleStatsQueryPlan(
  plan: PlausibleStatsQueryPlan,
): void {
  const canonical = createPlausibleStatsQueryPlan(
    plan.startDate,
    plan.endDateExclusive,
  );
  if (JSON.stringify(plan) !== JSON.stringify(canonical)) {
    throw new Error(
      "Plausible query plan does not match the canonical contract",
    );
  }
}

export function buildLearningMetricsExportFromPlausible(
  plan: PlausibleStatsQueryPlan,
  responses: Readonly<Record<string, unknown>>,
  funnelEvidence: unknown,
  exportedAt: string,
  attestation: PlausibleMetricsAttestation,
): LearningMetricsExport {
  assertCanonicalPlausibleStatsQueryPlan(plan);
  const parsedFunnelEvidence = parsePlausibleSequentialFunnelEvidence(
    plan,
    funnelEvidence,
  );

  const expectedIds = new Set<string>(plan.queries.map(({ id }) => id));
  const extraIds = Object.keys(responses).filter((id) => !expectedIds.has(id));
  if (extraIds.length > 0) {
    throw new Error(`unexpected Plausible responses: ${extraIds.join(", ")}`);
  }

  const rows = createRequiredRows();
  const rowsBySegment = new Map(
    rows.map((row) => [segmentKey(row.chapterId, row.locale, row.device), row]),
  );

  for (const capture of parsedFunnelEvidence.captures) {
    const target = rowsBySegment.get(
      segmentKey(capture.chapterId, capture.locale, capture.device),
    )!;
    if (capture.funnelId === "started-to-core") {
      target.startedToCoreEnteredVisitors = capture.enteredVisitors;
      target.startedToCoreConvertedVisitors = capture.convertedVisitors;
      target.startedToCoreEvidenceRef = capture.evidenceRef;
    } else {
      target.coreToContinuedEnteredVisitors = capture.enteredVisitors;
      target.coreToContinuedConvertedVisitors = capture.convertedVisitors;
      target.coreToContinuedEvidenceRef = capture.evidenceRef;
    }
  }

  for (const definition of plan.queries) {
    if (!Object.hasOwn(responses, definition.id)) {
      throw new Error(`missing Plausible response ${definition.id}`);
    }

    const assignedSegments = new Set<string>();
    for (const result of parseResponseRows(
      definition,
      responses[definition.id],
    )) {
      const segment = resolveResponseSegment(definition, result.dimensions);
      const key = segmentKey(segment.chapterId, segment.locale, segment.device);
      if (assignedSegments.has(key)) {
        throw new Error(`${definition.id} duplicates segment ${key}`);
      }
      assignedSegments.add(key);

      const target = rowsBySegment.get(key);
      if (!target) {
        throw new Error(
          `${definition.id} returned non-canonical segment ${key}`,
        );
      }
      target[definition.countKey] = result.visitors;
    }
  }

  return parseLearningMetricsExport({
    schemaVersion: learningMetricsSchemaVersion,
    site: plausibleStatsSiteId,
    environment: "production",
    provider: {
      name: "Plausible Hosted Business",
      exportedAt,
      queryKind: "canonical-stats-with-operator-sequential-funnels",
    },
    observationWindow: {
      startDate: plan.startDate,
      endDateExclusive: plan.endDateExclusive,
      completeDays: plan.completeDays,
    },
    funnelEvidence: {
      schemaVersion: parsedFunnelEvidence.schemaVersion,
      capturePlanVersion: parsedFunnelEvidence.capturePlanVersion,
      source: parsedFunnelEvidence.source,
      capturedAt: parsedFunnelEvidence.capturedAt,
      evidenceBundleSha256: parsedFunnelEvidence.evidenceBundleSha256,
      operatorAttestation: parsedFunnelEvidence.operatorAttestation,
      reviewerAttestation: parsedFunnelEvidence.reviewerAttestation,
      reportingTimezone: parsedFunnelEvidence.reportingTimezone,
      observationWindow: parsedFunnelEvidence.observationWindow,
      funnels: parsedFunnelEvidence.funnels,
    },
    trafficPolicy: {
      realLearnerTrafficConfirmed: attestation.realLearnerTrafficConfirmed,
      productionOnly: attestation.productionVerified,
      ciExcluded: attestation.ciExcluded,
      previewExcluded: attestation.previewExcluded,
      smokeExcluded: attestation.smokeExcluded,
      developerExcluded: attestation.developerExcluded,
    },
    queryPolicy: {
      sequentialFunnels: attestation.sequentialFunnelsVerified,
      funnelEvidenceSource: learningMetricsFunnelEvidenceSource,
      aggregateVisitors: true,
      filtersFrozen: attestation.filtersFrozen,
      eventMappingVersion: 1,
    },
    dataPolicy: {
      aggregateOnly: true,
      containsRawEvents: false,
      containsPersonalData: false,
    },
    rows,
  });
}
