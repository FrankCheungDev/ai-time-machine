import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLearningMetricsExportFromPlausible,
  createPlausibleStatsQueryPlan,
  assertCanonicalPlausibleStatsQueryPlan,
  plausibleStatsEndpoint,
  type PlausibleMetricsAttestation,
  type PlausibleStatsQueryPlan,
} from "../packages/data/src/learning/plausible-metrics.ts";

const statsApiKeyEnvironmentVariable = "PLAUSIBLE_STATS_API_KEY";

export interface PlausibleExportArguments {
  startDate: string;
  endDateExclusive: string;
  dryRun: boolean;
  attestRealLearnerTraffic: boolean;
  attestProductionDashboardVerified: boolean;
  attestExclusions: boolean;
  attestFiltersFrozen: boolean;
}

interface JsonFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type PlausibleStatsFetch = (
  input: string,
  init: RequestInit,
) => Promise<JsonFetchResponse>;

function usage(): string {
  return [
    "Usage:",
    "  pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --dry-run",
    "  pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --attest-real-learner-traffic --attest-production-dashboard-verified --attest-ci-preview-smoke-developer-excluded --attest-filters-frozen",
    "",
    `The live export reads ${statsApiKeyEnvironmentVariable} from the process environment.`,
    "There is deliberately no command-line API-key option. JSON is written to stdout.",
  ].join("\n");
}

function optionValue(argument: string, prefix: string): string | null {
  return argument.startsWith(prefix) ? argument.slice(prefix.length) : null;
}

export function parsePlausibleExportArguments(
  args: string[],
): PlausibleExportArguments | { help: true } {
  if (args.includes("--help") || args.includes("-h")) return { help: true };

  let startDate: string | undefined;
  let endDateExclusive: string | undefined;
  let dryRun = false;
  let attestRealLearnerTraffic = false;
  let attestProductionDashboardVerified = false;
  let attestExclusions = false;
  let attestFiltersFrozen = false;

  for (const argument of args) {
    if (argument === "--") continue;

    const startDateValue = optionValue(argument, "--start-date=");
    if (startDateValue !== null) {
      if (startDate !== undefined)
        throw new Error("--start-date is duplicated");
      startDate = startDateValue;
      continue;
    }

    const endDateValue = optionValue(argument, "--end-date-exclusive=");
    if (endDateValue !== null) {
      if (endDateExclusive !== undefined) {
        throw new Error("--end-date-exclusive is duplicated");
      }
      endDateExclusive = endDateValue;
      continue;
    }

    switch (argument) {
      case "--dry-run":
        dryRun = true;
        break;
      case "--attest-real-learner-traffic":
        attestRealLearnerTraffic = true;
        break;
      case "--attest-production-dashboard-verified":
        attestProductionDashboardVerified = true;
        break;
      case "--attest-ci-preview-smoke-developer-excluded":
        attestExclusions = true;
        break;
      case "--attest-filters-frozen":
        attestFiltersFrozen = true;
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!startDate || !endDateExclusive) {
    throw new Error(`Both observation dates are required.\n\n${usage()}`);
  }

  return {
    startDate,
    endDateExclusive,
    dryRun,
    attestRealLearnerTraffic,
    attestProductionDashboardVerified,
    attestExclusions,
    attestFiltersFrozen,
  };
}

function reportingDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function requireLiveAttestations(args: PlausibleExportArguments): void {
  const missing = [
    [args.attestRealLearnerTraffic, "--attest-real-learner-traffic"],
    [
      args.attestProductionDashboardVerified,
      "--attest-production-dashboard-verified",
    ],
    [args.attestExclusions, "--attest-ci-preview-smoke-developer-excluded"],
    [args.attestFiltersFrozen, "--attest-filters-frozen"],
  ]
    .filter(([present]) => !present)
    .map(([, flag]) => flag);

  if (missing.length > 0) {
    throw new Error(
      `Live export requires explicit operator attestations: ${missing.join(", ")}`,
    );
  }
}

export async function fetchPlausibleStatsResponses(
  plan: PlausibleStatsQueryPlan,
  apiKey: string,
  send: PlausibleStatsFetch = globalThis.fetch,
): Promise<Record<string, unknown>> {
  assertCanonicalPlausibleStatsQueryPlan(plan);
  const normalizedApiKey = apiKey.trim();
  if (normalizedApiKey === "") {
    throw new Error(`${statsApiKeyEnvironmentVariable} is empty`);
  }

  const responses: Record<string, unknown> = {};
  for (const definition of plan.queries) {
    let response: JsonFetchResponse;
    try {
      response = await send(plausibleStatsEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${normalizedApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(definition.query),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new Error(
        `Plausible Stats API query ${definition.id} failed before a response`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `Plausible Stats API query ${definition.id} failed with HTTP ${response.status}`,
      );
    }

    try {
      responses[definition.id] = await response.json();
    } catch {
      throw new Error(
        `Plausible Stats API query ${definition.id} returned invalid JSON`,
      );
    }
  }

  return responses;
}

function createAttestation(): PlausibleMetricsAttestation {
  return {
    realLearnerTrafficConfirmed: true,
    productionVerified: true,
    sequentialFunnelsVerified: true,
    ciExcluded: true,
    previewExcluded: true,
    smokeExcluded: true,
    developerExcluded: true,
    filtersFrozen: true,
  };
}

export async function runPlausibleExport(
  args: string[],
  environment: NodeJS.ProcessEnv = process.env,
  now = new Date(),
  send: PlausibleStatsFetch = globalThis.fetch,
): Promise<string> {
  const parsed = parsePlausibleExportArguments(args);
  if ("help" in parsed) return usage();

  const plan = createPlausibleStatsQueryPlan(
    parsed.startDate,
    parsed.endDateExclusive,
  );
  if (parsed.dryRun) return JSON.stringify(plan, null, 2);

  requireLiveAttestations(parsed);
  const currentReportingDate = reportingDate(now);
  if (parsed.endDateExclusive > currentReportingDate) {
    throw new Error(
      `endDateExclusive must be no later than ${currentReportingDate} in Asia/Shanghai`,
    );
  }

  const apiKey = environment[statsApiKeyEnvironmentVariable]?.trim();
  if (environment === process.env) {
    delete process.env[statsApiKeyEnvironmentVariable];
  }
  if (!apiKey) {
    throw new Error(
      `${statsApiKeyEnvironmentVariable} must be injected by the operator's secret manager`,
    );
  }

  const responses = await fetchPlausibleStatsResponses(plan, apiKey, send);
  const exported = buildLearningMetricsExportFromPlausible(
    plan,
    responses,
    now.toISOString(),
    createAttestation(),
  );
  return JSON.stringify(exported, null, 2);
}

async function main(): Promise<void> {
  console.log(await runPlausibleExport(process.argv.slice(2)));
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (entryPath === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
