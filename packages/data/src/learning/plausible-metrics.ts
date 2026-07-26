import { chapterRegistry, isChapterId, type ChapterId } from "../chapters.ts";
import { supportedLocales, type Locale } from "../locales.ts";
import {
  learningMetricDeviceClasses,
  learningMetricsReportingTimezone,
  learningMetricsSchemaVersion,
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
export const plausibleStatsQueryPlanVersion = 1 as const;

export const plausibleLearningMetricCountKeys = [
  "startedVisitors",
  "coreCompletedVisitors",
  "conceptCheckVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
  "continuedVisitors",
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
  queryCount: number;
  queries: PlausibleStatsQueryDefinition[];
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
    countKey: "startedVisitors",
    filters: [["is", "event:name", ["chapter_started"]]],
  },
  {
    countKey: "coreCompletedVisitors",
    filters: [["is", "event:name", ["core_interaction_completed"]]],
  },
  {
    countKey: "conceptCheckVisitors",
    filters: [["is", "event:name", ["concept_check_completed"]]],
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
  {
    countKey: "continuedVisitors",
    filters: [["is", "event:name", ["next_chapter_continued"]]],
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
  const emptyCounts: LearningMetricCounts = {
    startedVisitors: 0,
    coreCompletedVisitors: 0,
    conceptCheckVisitors: 0,
    firstCorrectVisitors: 0,
    explanationOpenedVisitors: 0,
    continuedVisitors: 0,
  };

  return chapterRegistry.flatMap(({ id }) => [
    { chapterId: id, locale: "all", device: "all", ...emptyCounts },
    ...supportedLocales.map((locale): LearningMetricRow => ({
      chapterId: id,
      locale,
      device: "all",
      ...emptyCounts,
    })),
    ...learningMetricDeviceClasses.map((device): LearningMetricRow => ({
      chapterId: id,
      locale: "all",
      device,
      ...emptyCounts,
    })),
  ]);
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
    queryCount: queries.length,
    queries,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
  exportedAt: string,
  attestation: PlausibleMetricsAttestation,
): LearningMetricsExport {
  assertCanonicalPlausibleStatsQueryPlan(plan);

  const expectedIds = new Set<string>(plan.queries.map(({ id }) => id));
  const extraIds = Object.keys(responses).filter((id) => !expectedIds.has(id));
  if (extraIds.length > 0) {
    throw new Error(`unexpected Plausible responses: ${extraIds.join(", ")}`);
  }

  const rows = createRequiredRows();
  const rowsBySegment = new Map(
    rows.map((row) => [segmentKey(row.chapterId, row.locale, row.device), row]),
  );

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
      queryKind: "aggregate-visitor-event-steps",
    },
    observationWindow: {
      startDate: plan.startDate,
      endDateExclusive: plan.endDateExclusive,
      completeDays: plan.completeDays,
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
