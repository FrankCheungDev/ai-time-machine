import { chapterRegistry, isChapterId, type ChapterId } from "../chapters.ts";
import { supportedLocales, type Locale } from "../locales.ts";

export const learningMetricsSchemaVersion = 3 as const;
export const learningMetricsReportingTimezone = "Asia/Shanghai" as const;
export const learningMetricsFunnelEvidenceSchemaVersion = 1 as const;
export const learningMetricsFunnelCapturePlanVersion = 1 as const;
export const learningMetricsFunnelEvidenceSource =
  "operator-supplied-plausible-dashboard" as const;
export const minimumObservationDays = 14;
export const minimumChapterVisitors = 50;
export const minimumSegmentVisitors = 30;

export const learningMetricDeviceClasses = [
  "desktop",
  "laptop",
  "tablet",
  "mobile",
] as const;

export const learningMetricSequentialFunnels = [
  {
    id: "started-to-core",
    steps: ["chapter_started", "core_interaction_completed"],
    allowOtherActivityBetweenSteps: true,
  },
  {
    id: "core-to-continued",
    steps: ["core_interaction_completed", "next_chapter_continued"],
    allowOtherActivityBetweenSteps: true,
  },
] as const;
export const learningMetricsTerminalChapterId =
  chapterRegistry[chapterRegistry.length - 1].id;

export type LearningMetricDeviceClass =
  (typeof learningMetricDeviceClasses)[number];
export type LearningMetricLocale = Locale | "all";
export type LearningMetricDevice = LearningMetricDeviceClass | "all";

export interface LearningMetricCounts {
  startedToCoreEnteredVisitors: number;
  startedToCoreConvertedVisitors: number;
  coreToContinuedEnteredVisitors: number | null;
  coreToContinuedConvertedVisitors: number | null;
  conceptCheckVisitors: number;
  conceptCheckFirstAttemptVisitors: number;
  firstCorrectVisitors: number;
  explanationOpenedVisitors: number;
}

export interface LearningMetricRow extends LearningMetricCounts {
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
  startedToCoreEvidenceRef: string;
  coreToContinuedEvidenceRef: string | null;
}

export interface LearningMetricsExport {
  schemaVersion: typeof learningMetricsSchemaVersion;
  site: "atlas.z-ai.cc";
  environment: "production";
  provider: {
    name: string;
    exportedAt: string;
    queryKind: "canonical-stats-with-operator-sequential-funnels";
  };
  observationWindow: {
    startDate: string;
    endDateExclusive: string;
    completeDays: number;
  };
  funnelEvidence: {
    schemaVersion: typeof learningMetricsFunnelEvidenceSchemaVersion;
    capturePlanVersion: typeof learningMetricsFunnelCapturePlanVersion;
    source: typeof learningMetricsFunnelEvidenceSource;
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
    funnelEvidenceSource: typeof learningMetricsFunnelEvidenceSource;
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
  numerator: number | null;
  denominator: number | null;
  value: number | null;
  percentage: number | null;
  usableForDecision: boolean;
}

export interface LearningMetricSegmentAnalysis {
  chapterId: ChapterId;
  locale: LearningMetricLocale;
  device: LearningMetricDevice;
  startedToCoreEnteredVisitors: number;
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
  funnelEvidence: LearningMetricsExport["funnelEvidence"];
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
  "funnelEvidence",
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
const funnelEvidenceKeys = [
  "schemaVersion",
  "capturePlanVersion",
  "source",
  "capturedAt",
  "evidenceBundleSha256",
  "operatorAttestation",
  "reviewerAttestation",
  "reportingTimezone",
  "observationWindow",
  "funnels",
] as const;
const operatorAttestationKeys = [
  "dashboardCountsTranscribed",
  "aggregateOnlyConfirmed",
] as const;
const reviewerAttestationKeys = [
  "independentlyReviewed",
  "capturePlanMatched",
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
  "funnelEvidenceSource",
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
  "startedToCoreEvidenceRef",
  "coreToContinuedEvidenceRef",
  "startedToCoreEnteredVisitors",
  "startedToCoreConvertedVisitors",
  "coreToContinuedEnteredVisitors",
  "coreToContinuedConvertedVisitors",
  "conceptCheckVisitors",
  "conceptCheckFirstAttemptVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
] as const;
const countKeys = [
  "startedToCoreEnteredVisitors",
  "startedToCoreConvertedVisitors",
  "coreToContinuedEnteredVisitors",
  "coreToContinuedConvertedVisitors",
  "conceptCheckVisitors",
  "conceptCheckFirstAttemptVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
] as const satisfies readonly (keyof LearningMetricCounts)[];
const requiredIntegerCountKeys = [
  "startedToCoreEnteredVisitors",
  "startedToCoreConvertedVisitors",
  "conceptCheckVisitors",
  "conceptCheckFirstAttemptVisitors",
  "firstCorrectVisitors",
  "explanationOpenedVisitors",
] as const satisfies readonly (keyof LearningMetricCounts)[];
const terminalNullableCountKeys = [
  "coreToContinuedEnteredVisitors",
  "coreToContinuedConvertedVisitors",
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

export function isSafeLearningMetricEvidenceRef(
  value: unknown,
): value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 200 ||
    value.startsWith("/") ||
    value.endsWith("/") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)
  ) {
    return false;
  }

  const segments = value.split("/");
  return segments.every(
    (segment) =>
      segment !== "" &&
      segment !== "." &&
      segment !== ".." &&
      /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment),
  );
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
  if (
    provider.queryKind !== "canonical-stats-with-operator-sequential-funnels"
  ) {
    issues.push(
      'export.provider.queryKind must be "canonical-stats-with-operator-sequential-funnels"',
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
  let reportingTimezoneEndTimestamp: number | null = null;
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
    reportingTimezoneEndTimestamp = Date.parse(
      `${observationWindow.endDateExclusive}T00:00:00+08:00`,
    );
    if (exportedAt !== null && exportedAt < reportingTimezoneEndTimestamp) {
      issues.push(
        `export.provider.exportedAt must be on or after endDateExclusive in ${learningMetricsReportingTimezone}`,
      );
    }
  }

  const funnelEvidence = checkRequiredRecord(
    root.funnelEvidence,
    funnelEvidenceKeys,
    "export.funnelEvidence",
    issues,
  );
  if (
    funnelEvidence.schemaVersion !== learningMetricsFunnelEvidenceSchemaVersion
  ) {
    issues.push(
      `export.funnelEvidence.schemaVersion must be ${learningMetricsFunnelEvidenceSchemaVersion}`,
    );
  }
  if (
    funnelEvidence.capturePlanVersion !==
    learningMetricsFunnelCapturePlanVersion
  ) {
    issues.push(
      `export.funnelEvidence.capturePlanVersion must be ${learningMetricsFunnelCapturePlanVersion}`,
    );
  }
  if (funnelEvidence.source !== learningMetricsFunnelEvidenceSource) {
    issues.push(
      `export.funnelEvidence.source must be "${learningMetricsFunnelEvidenceSource}"`,
    );
  }
  if (funnelEvidence.reportingTimezone !== learningMetricsReportingTimezone) {
    issues.push(
      `export.funnelEvidence.reportingTimezone must be "${learningMetricsReportingTimezone}"`,
    );
  }
  if (
    typeof funnelEvidence.evidenceBundleSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(funnelEvidence.evidenceBundleSha256)
  ) {
    issues.push(
      "export.funnelEvidence.evidenceBundleSha256 must be a lowercase SHA-256 digest",
    );
  }
  const operatorAttestation = checkRequiredRecord(
    funnelEvidence.operatorAttestation,
    operatorAttestationKeys,
    "export.funnelEvidence.operatorAttestation",
    issues,
  );
  for (const key of operatorAttestationKeys) {
    if (operatorAttestation[key] !== true) {
      issues.push(
        `export.funnelEvidence.operatorAttestation.${key} must be true`,
      );
    }
  }
  const reviewerAttestation = checkRequiredRecord(
    funnelEvidence.reviewerAttestation,
    reviewerAttestationKeys,
    "export.funnelEvidence.reviewerAttestation",
    issues,
  );
  for (const key of reviewerAttestationKeys) {
    if (reviewerAttestation[key] !== true) {
      issues.push(
        `export.funnelEvidence.reviewerAttestation.${key} must be true`,
      );
    }
  }
  const funnelEvidenceCapturedAt = parseIsoDateTime(funnelEvidence.capturedAt);
  if (funnelEvidenceCapturedAt === null) {
    issues.push("export.funnelEvidence.capturedAt must be an ISO date-time");
  } else {
    if (
      reportingTimezoneEndTimestamp !== null &&
      funnelEvidenceCapturedAt < reportingTimezoneEndTimestamp
    ) {
      issues.push(
        `export.funnelEvidence.capturedAt must be on or after endDateExclusive in ${learningMetricsReportingTimezone}`,
      );
    }
    if (exportedAt !== null && funnelEvidenceCapturedAt > exportedAt) {
      issues.push(
        "export.funnelEvidence.capturedAt cannot be after export.provider.exportedAt",
      );
    }
  }
  const funnelEvidenceWindow = checkRequiredRecord(
    funnelEvidence.observationWindow,
    observationWindowKeys,
    "export.funnelEvidence.observationWindow",
    issues,
  );
  for (const key of observationWindowKeys) {
    if (funnelEvidenceWindow[key] !== observationWindow[key]) {
      issues.push(
        `export.funnelEvidence.observationWindow.${key} must match export.observationWindow.${key}`,
      );
    }
  }
  if (
    JSON.stringify(funnelEvidence.funnels) !==
    JSON.stringify(learningMetricSequentialFunnels)
  ) {
    issues.push(
      "export.funnelEvidence.funnels must match the two canonical sequential funnel definitions",
    );
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
  if (
    queryPolicy.funnelEvidenceSource !== learningMetricsFunnelEvidenceSource
  ) {
    issues.push(
      `export.queryPolicy.funnelEvidenceSource must be "${learningMetricsFunnelEvidenceSource}"`,
    );
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
  const evidenceRefs = new Set<string>();
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

    let refsValid = true;
    if (!isSafeLearningMetricEvidenceRef(row.startedToCoreEvidenceRef)) {
      issues.push(
        `${path}.startedToCoreEvidenceRef must be a safe relative artifact path`,
      );
      refsValid = false;
    } else if (evidenceRefs.has(row.startedToCoreEvidenceRef)) {
      issues.push(`${path}.startedToCoreEvidenceRef must be unique`);
      refsValid = false;
    } else {
      evidenceRefs.add(row.startedToCoreEvidenceRef);
    }
    if (chapterId === learningMetricsTerminalChapterId) {
      if (row.coreToContinuedEvidenceRef !== null) {
        issues.push(
          `${path}.coreToContinuedEvidenceRef must be null for the terminal chapter`,
        );
        refsValid = false;
      }
    } else if (
      !isSafeLearningMetricEvidenceRef(row.coreToContinuedEvidenceRef)
    ) {
      issues.push(
        `${path}.coreToContinuedEvidenceRef must be a safe relative artifact path`,
      );
      refsValid = false;
    } else if (evidenceRefs.has(row.coreToContinuedEvidenceRef)) {
      issues.push(`${path}.coreToContinuedEvidenceRef must be unique`);
      refsValid = false;
    } else {
      evidenceRefs.add(row.coreToContinuedEvidenceRef);
    }

    let countsValid = true;
    for (const key of requiredIntegerCountKeys) {
      if (!isNonNegativeInteger(row[key])) {
        issues.push(`${path}.${key} must be a non-negative integer`);
        countsValid = false;
      }
    }
    for (const key of terminalNullableCountKeys) {
      if (chapterId === learningMetricsTerminalChapterId) {
        if (row[key] !== null) {
          issues.push(`${path}.${key} must be null for the terminal chapter`);
          countsValid = false;
        }
      } else if (!isNonNegativeInteger(row[key])) {
        issues.push(`${path}.${key} must be a non-negative integer`);
        countsValid = false;
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
      countsValid &&
      refsValid
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
          startedToCoreEvidenceRef: row.startedToCoreEvidenceRef as string,
          coreToContinuedEvidenceRef: row.coreToContinuedEvidenceRef as
            string | null,
          startedToCoreEnteredVisitors:
            row.startedToCoreEnteredVisitors as number,
          startedToCoreConvertedVisitors:
            row.startedToCoreConvertedVisitors as number,
          coreToContinuedEnteredVisitors: row.coreToContinuedEnteredVisitors as
            number | null,
          coreToContinuedConvertedVisitors:
            row.coreToContinuedConvertedVisitors as number | null,
          conceptCheckVisitors: row.conceptCheckVisitors as number,
          conceptCheckFirstAttemptVisitors:
            row.conceptCheckFirstAttemptVisitors as number,
          firstCorrectVisitors: row.firstCorrectVisitors as number,
          explanationOpenedVisitors: row.explanationOpenedVisitors as number,
        };
        rowsBySegment.set(key, parsedRow);

        if (
          parsedRow.startedToCoreConvertedVisitors >
          parsedRow.startedToCoreEnteredVisitors
        ) {
          issues.push(
            `${path}.startedToCoreConvertedVisitors cannot exceed startedToCoreEnteredVisitors`,
          );
        }
        if (
          parsedRow.coreToContinuedConvertedVisitors !== null &&
          parsedRow.coreToContinuedEnteredVisitors !== null &&
          parsedRow.coreToContinuedConvertedVisitors >
            parsedRow.coreToContinuedEnteredVisitors
        ) {
          issues.push(
            `${path}.coreToContinuedConvertedVisitors cannot exceed coreToContinuedEnteredVisitors`,
          );
        }
        if (
          parsedRow.coreToContinuedEnteredVisitors !== null &&
          parsedRow.startedToCoreConvertedVisitors >
            parsedRow.coreToContinuedEnteredVisitors
        ) {
          issues.push(
            `${path}.startedToCoreConvertedVisitors cannot exceed coreToContinuedEnteredVisitors`,
          );
        }
        if (
          parsedRow.conceptCheckFirstAttemptVisitors >
          parsedRow.conceptCheckVisitors
        ) {
          issues.push(
            `${path}.conceptCheckFirstAttemptVisitors cannot exceed conceptCheckVisitors`,
          );
        }
        if (
          parsedRow.firstCorrectVisitors >
          parsedRow.conceptCheckFirstAttemptVisitors
        ) {
          issues.push(
            `${path}.firstCorrectVisitors cannot exceed conceptCheckFirstAttemptVisitors`,
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
          const segmentCount = row[countKey];
          const overallCount = overall[countKey];
          if (
            segmentCount !== null &&
            overallCount !== null &&
            segmentCount > overallCount
          ) {
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
  numerator: number | null,
  denominator: number | null,
  sampleThreshold: number,
): LearningMetricRate {
  const value =
    numerator === null || denominator === null || denominator === 0
      ? null
      : numerator / denominator;

  return {
    numerator,
    denominator,
    value: value === null ? null : rounded(value, 4),
    percentage: value === null ? null : rounded(value * 100, 1),
    usableForDecision:
      numerator !== null &&
      denominator !== null &&
      denominator >= sampleThreshold,
  };
}

function analyzeSegment(
  row: LearningMetricRow,
  sampleThreshold: number,
): LearningMetricSegmentAnalysis {
  const metrics = {
    coreCompletionRate: metricRate(
      row.startedToCoreConvertedVisitors,
      row.startedToCoreEnteredVisitors,
      sampleThreshold,
    ),
    continuationRate: metricRate(
      row.coreToContinuedConvertedVisitors,
      row.coreToContinuedEnteredVisitors,
      sampleThreshold,
    ),
    firstCorrectRate: metricRate(
      row.firstCorrectVisitors,
      row.conceptCheckFirstAttemptVisitors,
      sampleThreshold,
    ),
    explanationOpenRate: metricRate(
      row.explanationOpenedVisitors,
      row.conceptCheckVisitors,
      sampleThreshold,
    ),
  };
  const applicableRates = Object.values(metrics).filter(
    ({ denominator }) => denominator !== null,
  );
  const sampleEligible = applicableRates.every(
    ({ usableForDecision }) => usableForDecision,
  );

  return {
    chapterId: row.chapterId,
    locale: row.locale,
    device: row.device,
    startedToCoreEnteredVisitors: row.startedToCoreEnteredVisitors,
    sampleThreshold,
    sampleEligible,
    metrics,
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
    funnelEvidence: structuredClone(parsed.funnelEvidence),
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
      "This validates aggregate evidence and per-rate denominator gates only; it does not prove the traffic attestation or complete P2-05 by itself. Explanation-opened and concept-check-attempted are independent event visitor counts, not a cohort or sequential funnel, so explanation-open rate may exceed 100% at an observation-window boundary.",
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
    `- Schema：v${analysis.schemaVersion}`,
    `- 状态：${analysis.status}`,
    `- Provider：${analysis.provider.name}`,
    `- 查询契约：${analysis.provider.queryKind}`,
    `- 漏斗证据：${analysis.funnelEvidence.source}；采集于 ${analysis.funnelEvidence.capturedAt}`,
    `- 观察窗口：${analysis.observationWindow.startDate} → ${analysis.observationWindow.endDateExclusive}（${analysis.observationWindow.completeDays} 个完整自然日）`,
    "- 流量证明：production-only、真实学习者，CI / preview / smoke / developer 均已排除（外部 attestation）",
    "- 数据边界：aggregate-only、无 raw events、无 personal data",
    `- 比率证据门槛：每个比率按自身 denominator；总体 ${analysis.thresholds.minimumChapterVisitors}，locale / device ${analysis.thresholds.minimumSegmentVisitors}`,
    "",
    "| Chapter | Started→core entered | Core completion | Continuation | First correct | Explanation open | Evidence |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
  ];

  for (const chapter of analysis.chapters) {
    lines.push(
      `| ${chapter.chapterId} | ${chapter.overall.startedToCoreEnteredVisitors} | ${displayRate(chapter.overall.metrics.coreCompletionRate)} | ${displayRate(chapter.overall.metrics.continuationRate)} | ${displayRate(chapter.overall.metrics.firstCorrectRate)} | ${displayRate(chapter.overall.metrics.explanationOpenRate)} | ${chapter.decisionEligible ? "eligible" : "insufficient"} |`,
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
