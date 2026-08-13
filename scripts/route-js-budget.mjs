import { execFile } from "node:child_process";
import { realpath, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify, isDeepStrictEqual } from "node:util";

import { init, parse } from "es-module-lexer";

export const ROUTES = Object.freeze([
  Object.freeze({ id: "home", pathname: "/" }),
  Object.freeze({ id: "search", pathname: "/chapters/search/" }),
  Object.freeze({ id: "rag", pathname: "/chapters/rag/" }),
  Object.freeze({ id: "timeline", pathname: "/timeline/" }),
  Object.freeze({ id: "lineage", pathname: "/lineage/" }),
]);

export const METHOD = Object.freeze({
  version: 1,
  htmlEntries: Object.freeze([
    "script[src]",
    "link[rel~=modulepreload]",
    "astro-island[component-url|renderer-url|before-hydration-url]",
  ]),
  imports: "es-module-lexer@2.1.0 static imports only",
  dedupe: "per-route canonical public pathname",
  gzip: "node:zlib level=9, sum of independently compressed files",
});

export const TOOLCHAIN = Object.freeze({
  node: "22.22.2",
  pnpm: "11.7.0",
  esModuleLexer: "2.1.0",
});

export const THRESHOLD = Object.freeze({
  minimumIncreaseBytes: 5000,
  ratioNumerator: 5,
  ratioDenominator: 100,
  comparison: "strictly-greater-than",
});

const BASELINE_KIND = "route-js-budget-baseline";
const REPORT_KIND = "route-js-budget-report";
const DEFAULTS = Object.freeze({
  dist: "apps/site/dist",
  baseline: "scripts/route-js-baseline.json",
  report: "artifacts/route-js-budget.json",
});
const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const execFileAsync = promisify(execFile);

function fail(message) {
  throw new Error(message);
}

function ownKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    fail(`${label} must contain exactly: ${wanted.join(", ")}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  if (!isDeepStrictEqual(actual, expected)) {
    fail(`${label} does not match the fixed analyzer contract`);
  }
}

function assertByteCount(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(`${label} must be a non-negative safe integer`);
  }
}

function parseAttributes(source) {
  const attributes = new Map();
  const pattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes.set(
      match[1].toLowerCase(),
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }
  return attributes;
}

function normalizeWebSpecifier(specifier) {
  const value = specifier.trim();
  if (!value) fail("JavaScript entry must not be empty");
  if (value.includes("\\") || value.includes("\0")) {
    fail(`unsupported JavaScript entry ${JSON.stringify(value)}`);
  }
  if (value.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(value)) {
    fail(`unsupported non-local JavaScript entry ${JSON.stringify(value)}`);
  }
  let parsed;
  try {
    parsed = new URL(value, "https://route-budget.invalid/");
  } catch {
    fail(`invalid JavaScript entry ${JSON.stringify(value)}`);
  }
  if (!/\.(?:m?js)$/i.test(parsed.pathname)) {
    fail(`unsupported non-JavaScript entry ${JSON.stringify(value)}`);
  }
  if (
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../")
  ) {
    return value.split("#", 1)[0];
  }
  return `./${value}`;
}

/** Discover local JavaScript entry specifiers referenced by generated HTML. */
export function discoverHtmlEntrySpecifiers(html) {
  if (typeof html !== "string") fail("HTML must be a string");
  const entries = new Set();
  const tags = /<(script|link|astro-island)\b([^>]*)>/gi;
  for (const match of html.matchAll(tags)) {
    const tag = match[1].toLowerCase();
    const attributes = parseAttributes(match[2]);
    const candidates = [];
    if (tag === "script" && attributes.has("src")) {
      candidates.push(attributes.get("src"));
    } else if (tag === "link") {
      const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
      if (rel.includes("modulepreload") && attributes.has("href")) {
        candidates.push(attributes.get("href"));
      }
    } else if (tag === "astro-island") {
      for (const name of [
        "component-url",
        "renderer-url",
        "before-hydration-url",
      ]) {
        if (attributes.has(name)) candidates.push(attributes.get(name));
      }
    }
    for (const candidate of candidates) {
      const normalized = normalizeWebSpecifier(candidate);
      if (normalized) entries.add(normalized);
    }
  }
  return [...entries].sort();
}

/** Return static imports/re-exports only; dynamic imports are deliberately excluded. */
export async function parseStaticImportSpecifiers(
  source,
  sourceName = "<module>",
) {
  if (typeof source !== "string") fail("JavaScript source must be a string");
  await init;
  let imports;
  try {
    [imports] = parse(source, sourceName);
  } catch (error) {
    const location = Number.isSafeInteger(error?.idx)
      ? ` at byte ${error.idx}`
      : "";
    fail(`could not parse ${sourceName}${location}: ${error.message}`);
  }
  return [
    ...new Set(
      imports
        .filter((entry) => entry.d === -1 && entry.n)
        .map((entry) => entry.n),
    ),
  ].sort();
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

async function resolveContainedFile({ distRealPath, candidate, context }) {
  const absolute = path.resolve(candidate);
  if (!isWithin(distRealPath, absolute)) {
    fail(`${context} resolves outside dist`);
  }
  let resolved;
  try {
    resolved = await realpath(absolute);
  } catch (error) {
    fail(
      `${context} is missing or unreadable (${error.code ?? error.message})`,
    );
  }
  if (!isWithin(distRealPath, resolved)) {
    fail(`${context} resolves through a symlink outside dist`);
  }
  const info = await stat(resolved);
  if (!info.isFile()) fail(`${context} is not a file`);
  return resolved;
}

function stripQueryAndHash(specifier) {
  return specifier.split(/[?#]/, 1)[0];
}

function candidateForSpecifier(specifier, importer, distRealPath) {
  if (
    typeof specifier !== "string" ||
    specifier.includes("\\") ||
    specifier.includes("\0") ||
    specifier.startsWith("//")
  ) {
    fail(
      `unsupported non-local import ${JSON.stringify(specifier)} from ${importer}`,
    );
  }
  let decoded;
  try {
    decoded = decodeURIComponent(stripQueryAndHash(specifier));
  } catch {
    fail(`invalid URL encoding in specifier ${JSON.stringify(specifier)}`);
  }
  if (/%(?:2f|5c)/i.test(stripQueryAndHash(specifier))) {
    fail(`encoded path separator in specifier ${JSON.stringify(specifier)}`);
  }
  if (!/\.(?:m?js)$/i.test(decoded)) {
    fail(
      `unsupported non-JavaScript import ${JSON.stringify(specifier)} from ${importer}`,
    );
  }
  if (decoded.startsWith("/")) {
    return path.resolve(distRealPath, `.${decoded}`);
  }
  if (decoded.startsWith("./") || decoded.startsWith("../")) {
    return path.resolve(path.dirname(importer), decoded);
  }
  const importerLabel = path
    .relative(distRealPath, importer)
    .split(path.sep)
    .join("/");
  fail(
    `unsupported non-local import ${JSON.stringify(specifier)} from ${importerLabel}`,
  );
}

function htmlPathForRoute(distDir, pathname) {
  const relative =
    pathname === "/" ? "index.html" : `${pathname.slice(1)}index.html`;
  return path.resolve(distDir, relative);
}

function normalizeCollectArguments(routeOrOptions, maybeDistDir) {
  if (typeof routeOrOptions === "object" && "route" in routeOrOptions) {
    return {
      route: routeOrOptions.route,
      distDir: routeOrOptions.distDir,
      htmlPath: routeOrOptions.htmlPath,
    };
  }
  return { route: routeOrOptions, distDir: maybeDistDir };
}

/** Build the transitive static chunk closure for one route, with each chunk once. */
export async function collectRouteChunks(routeOrOptions, maybeDistDir) {
  const options = normalizeCollectArguments(routeOrOptions, maybeDistDir);
  const route = options.route;
  if (
    !route ||
    typeof route.id !== "string" ||
    typeof route.pathname !== "string"
  ) {
    fail("collectRouteChunks requires a route with id and pathname");
  }
  const distDir = path.resolve(options.distDir ?? DEFAULTS.dist);
  let distRealPath;
  try {
    distRealPath = await realpath(distDir);
  } catch (error) {
    fail(
      `route ${route.id} dist is missing or unreadable (${error.code ?? error.message})`,
    );
  }
  const requestedHtml =
    options.htmlPath ?? htmlPathForRoute(distDir, route.pathname);
  const htmlPath = await resolveContainedFile({
    distRealPath,
    candidate: requestedHtml,
    context: `route ${route.id} HTML`,
  });
  const html = await readFile(htmlPath, "utf8");
  const entries = discoverHtmlEntrySpecifiers(html);
  if (entries.length === 0) {
    fail(`route ${route.id} HTML contains no JavaScript entries`);
  }
  const queue = [];
  for (const specifier of entries) {
    const candidate = candidateForSpecifier(specifier, htmlPath, distRealPath);
    queue.push({ candidate, importer: htmlPath, specifier });
  }

  const visited = new Map();
  while (queue.length > 0) {
    const next = queue.shift();
    const resolved = await resolveContainedFile({
      distRealPath,
      candidate: next.candidate,
      context: `route ${route.id} import ${JSON.stringify(next.specifier)} from ${path.relative(distRealPath, next.importer) || "HTML"}`,
    });
    if (visited.has(resolved)) continue;
    const buffer = await readFile(resolved);
    visited.set(resolved, buffer);
    const source = buffer.toString("utf8");
    const sourceName = path
      .relative(distRealPath, resolved)
      .split(path.sep)
      .join("/");
    for (const specifier of await parseStaticImportSpecifiers(
      source,
      sourceName,
    )) {
      const candidate = candidateForSpecifier(
        specifier,
        resolved,
        distRealPath,
      );
      queue.push({ candidate, importer: resolved, specifier });
    }
  }

  return [...visited.entries()]
    .map(([absolutePath, buffer]) => ({
      path: path.relative(distRealPath, absolutePath).split(path.sep).join("/"),
      buffer,
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
}

export function measureBuffer(buffer) {
  const value = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return {
    rawBytes: value.byteLength,
    gzipBytes: gzipSync(value, { level: 9 }).byteLength,
  };
}

export async function measureRoutes(options = {}) {
  const routes = options.routes ?? ROUTES;
  const measured = [];
  for (const route of routes) {
    const files = await collectRouteChunks({ route, distDir: options.distDir });
    const chunks = files.map((file) => ({
      path: file.path,
      ...measureBuffer(file.buffer),
    }));
    measured.push({
      id: route.id,
      pathname: route.pathname,
      rawBytes: chunks.reduce((sum, chunk) => sum + chunk.rawBytes, 0),
      gzipBytes: chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0),
      chunks,
    });
  }
  return measured;
}

export function validateBaseline(value) {
  ownKeys(
    value,
    [
      "schemaVersion",
      "kind",
      "method",
      "toolchain",
      "build",
      "threshold",
      "routes",
    ],
    "baseline",
  );
  if (value.schemaVersion !== 1) fail("baseline.schemaVersion must be 1");
  if (value.kind !== BASELINE_KIND)
    fail(`baseline.kind must be ${BASELINE_KIND}`);
  ownKeys(value.method, Object.keys(METHOD), "baseline.method");
  assertDeepEqual(value.method, METHOD, "baseline.method");
  ownKeys(value.toolchain, Object.keys(TOOLCHAIN), "baseline.toolchain");
  assertDeepEqual(value.toolchain, TOOLCHAIN, "baseline.toolchain");
  ownKeys(value.build, ["commit"], "baseline.build");
  if (
    typeof value.build.commit !== "string" ||
    !/^[0-9a-f]{40}$/i.test(value.build.commit)
  ) {
    fail("baseline.build.commit must be a 40-character hexadecimal commit");
  }
  ownKeys(value.threshold, Object.keys(THRESHOLD), "baseline.threshold");
  assertDeepEqual(value.threshold, THRESHOLD, "baseline.threshold");
  if (!Array.isArray(value.routes) || value.routes.length !== ROUTES.length) {
    fail(`baseline.routes must contain exactly ${ROUTES.length} routes`);
  }
  const byId = new Map();
  for (const route of value.routes) {
    ownKeys(
      route,
      ["id", "pathname", "rawBytes", "gzipBytes"],
      "baseline route",
    );
    if (typeof route.id !== "string" || byId.has(route.id)) {
      fail(`baseline route id must be unique: ${String(route.id)}`);
    }
    byId.set(route.id, route);
    assertByteCount(route.rawBytes, `baseline route ${route.id}.rawBytes`);
    assertByteCount(route.gzipBytes, `baseline route ${route.id}.gzipBytes`);
  }
  for (const expected of ROUTES) {
    const actual = byId.get(expected.id);
    if (!actual) fail(`baseline is missing route ${expected.id}`);
    if (actual.pathname !== expected.pathname) {
      fail(
        `baseline route ${expected.id}.pathname must be ${expected.pathname}`,
      );
    }
  }
  return value;
}

export function createBaseline(measuredRoutes, buildCommit) {
  if (typeof buildCommit !== "string" || !/^[0-9a-f]{40}$/i.test(buildCommit)) {
    fail(
      "--build-commit must be a 40-character hexadecimal commit in update mode",
    );
  }
  const byId = new Map(measuredRoutes.map((route) => [route.id, route]));
  const baseline = {
    schemaVersion: 1,
    kind: BASELINE_KIND,
    method: METHOD,
    toolchain: TOOLCHAIN,
    build: { commit: buildCommit.toLowerCase() },
    threshold: THRESHOLD,
    routes: ROUTES.map((expected) => {
      const measured = byId.get(expected.id);
      if (!measured) fail(`measurements are missing route ${expected.id}`);
      return {
        id: expected.id,
        pathname: expected.pathname,
        rawBytes: measured.rawBytes,
        gzipBytes: measured.gzipBytes,
      };
    }),
  };
  return validateBaseline(baseline);
}

export function evaluateRoute(current, baseline) {
  if (current.id !== baseline.id || current.pathname !== baseline.pathname) {
    fail(
      `cannot compare mismatched route ${current.id} with baseline ${baseline.id}`,
    );
  }
  assertByteCount(current.rawBytes, `current route ${current.id}.rawBytes`);
  assertByteCount(current.gzipBytes, `current route ${current.id}.gzipBytes`);
  assertByteCount(baseline.rawBytes, `baseline route ${baseline.id}.rawBytes`);
  assertByteCount(
    baseline.gzipBytes,
    `baseline route ${baseline.id}.gzipBytes`,
  );
  const gzipDeltaBytes = current.gzipBytes - baseline.gzipBytes;
  const exceedsAbsolute = gzipDeltaBytes > THRESHOLD.minimumIncreaseBytes;
  const exceedsRatio =
    gzipDeltaBytes * THRESHOLD.ratioDenominator >
    baseline.gzipBytes * THRESHOLD.ratioNumerator;
  return {
    id: current.id,
    pathname: current.pathname,
    passed: !(exceedsAbsolute && exceedsRatio),
    baseline: {
      rawBytes: baseline.rawBytes,
      gzipBytes: baseline.gzipBytes,
    },
    current: {
      rawBytes: current.rawBytes,
      gzipBytes: current.gzipBytes,
    },
    delta: {
      rawBytes: current.rawBytes - baseline.rawBytes,
      gzipBytes: gzipDeltaBytes,
    },
    allowedGzipIncreaseBytes: Math.max(
      THRESHOLD.minimumIncreaseBytes,
      (baseline.gzipBytes * THRESHOLD.ratioNumerator) /
        THRESHOLD.ratioDenominator,
    ),
  };
}

export function evaluateBudget(currentRoutes, baselineValue) {
  const baseline = validateBaseline(baselineValue);
  const currentById = new Map(currentRoutes.map((route) => [route.id, route]));
  if (
    currentById.size !== ROUTES.length ||
    currentRoutes.length !== ROUTES.length
  ) {
    fail(
      `current measurements must contain exactly ${ROUTES.length} unique routes`,
    );
  }
  const routes = baseline.routes.map((baselineRoute) => {
    const current = currentById.get(baselineRoute.id);
    if (!current)
      fail(`current measurements are missing route ${baselineRoute.id}`);
    return evaluateRoute(current, baselineRoute);
  });
  return { passed: routes.every((route) => route.passed), routes };
}

export function createReport({
  mode,
  status,
  routes = [],
  baseline,
  evaluation,
  errors = [],
}) {
  const report = {
    schemaVersion: 1,
    kind: REPORT_KIND,
    mode,
    status,
    method: METHOD,
    toolchain: TOOLCHAIN,
    threshold: THRESHOLD,
    routes: routes.map((route) => ({
      id: route.id,
      pathname: route.pathname,
      rawBytes: route.rawBytes,
      gzipBytes: route.gzipBytes,
      chunks: (route.chunks ?? []).map((chunk) => ({
        path: chunk.path,
        rawBytes: chunk.rawBytes,
        gzipBytes: chunk.gzipBytes,
      })),
    })),
  };
  if (baseline) report.baseline = baseline;
  if (evaluation) report.evaluation = evaluation;
  if (errors.length > 0) report.errors = errors.map(String);
  return report;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function reportSafeMessage(message) {
  const normalized = String(message).split(path.sep).join("/");
  const root = ROOT_DIR.split(path.sep).join("/");
  return normalized.replaceAll(root, ".");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, stableJson(value), "utf8");
}

function parseCliArguments(argv) {
  const args = [...argv];
  let mode = "check";
  if (args[0] === "check" || args[0] === "update") mode = args.shift();
  const options = { mode, ...DEFAULTS };
  const flags = new Map([
    ["--dist", "dist"],
    ["--baseline", "baseline"],
    ["--report", "report"],
    ["--build-commit", "buildCommit"],
  ]);
  while (args.length > 0) {
    const flag = args.shift();
    const key = flags.get(flag);
    if (!key) fail(`unknown argument: ${flag}`);
    const value = args.shift();
    if (!value || value.startsWith("--")) fail(`${flag} requires a value`);
    options[key] = value;
  }
  return options;
}

async function assertToolchain() {
  const nodeVersion = process.versions.node;
  if (nodeVersion !== TOOLCHAIN.node) {
    fail(`Node ${TOOLCHAIN.node} is required; found ${nodeVersion}`);
  }
  const userAgent = process.env.npm_config_user_agent ?? "";
  const pnpmMatch = /(?:^|\s)pnpm\/([^\s]+)/.exec(userAgent);
  if (!pnpmMatch || pnpmMatch[1] !== TOOLCHAIN.pnpm) {
    fail(
      `pnpm ${TOOLCHAIN.pnpm} is required; run this command through corepack pnpm`,
    );
  }
}

async function resolveBuildCommit(explicitCommit) {
  if (explicitCommit) return explicitCommit;
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT_DIR,
    encoding: "utf8",
  });
  return stdout.trim();
}

function formatFailures(evaluation) {
  return evaluation.routes
    .filter((route) => !route.passed)
    .map(
      (route) =>
        `${route.id} gzip grew by ${route.delta.gzipBytes} B; threshold is ${route.allowedGzipIncreaseBytes} B`,
    );
}

export async function runCli(argv = process.argv.slice(2)) {
  let options;
  let reportPath = path.resolve(ROOT_DIR, DEFAULTS.report);
  let mode = "check";
  try {
    options = parseCliArguments(argv);
    mode = options.mode;
    await assertToolchain();
    const distDir = path.resolve(ROOT_DIR, options.dist);
    const baselinePath = path.resolve(ROOT_DIR, options.baseline);
    reportPath = path.resolve(ROOT_DIR, options.report);
    const routes = await measureRoutes({ distDir });
    if (mode === "update") {
      const baseline = createBaseline(
        routes,
        await resolveBuildCommit(options.buildCommit),
      );
      await writeJson(baselinePath, baseline);
      await writeJson(
        reportPath,
        createReport({ mode, status: "pass", routes, baseline }),
      );
      process.stdout.write(
        `Updated ${path.relative(ROOT_DIR, baselinePath)} and measured ${routes.length} routes.\n`,
      );
      return 0;
    }
    const baseline = validateBaseline(
      JSON.parse(await readFile(baselinePath, "utf8")),
    );
    const evaluation = evaluateBudget(routes, baseline);
    const failures = formatFailures(evaluation);
    await writeJson(
      reportPath,
      createReport({
        mode,
        status: evaluation.passed ? "pass" : "fail",
        routes,
        baseline,
        evaluation,
        errors: failures,
      }),
    );
    if (!evaluation.passed) {
      for (const message of failures) process.stderr.write(`${message}\n`);
      return 1;
    }
    process.stdout.write(
      `Route JavaScript budget passed for ${routes.length} routes.\n`,
    );
    return 0;
  } catch (error) {
    const message = reportSafeMessage(
      error instanceof Error ? error.message : String(error),
    );
    try {
      await writeJson(
        reportPath,
        createReport({ mode, status: "error", errors: [message] }),
      );
    } catch (reportError) {
      process.stderr.write(
        `Could not write error report: ${reportError.message}\n`,
      );
    }
    process.stderr.write(`Route JavaScript budget error: ${message}\n`);
    return 2;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  process.exitCode = await runCli();
}
