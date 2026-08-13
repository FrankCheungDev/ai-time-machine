import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

import {
  METHOD,
  ROUTES,
  THRESHOLD,
  TOOLCHAIN,
  collectRouteChunks,
  createBaseline,
  discoverHtmlEntrySpecifiers,
  evaluateRoute,
  measureBuffer,
  measureRoutes,
  parseStaticImportSpecifiers,
  validateBaseline,
} from "./route-js-budget.mjs";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";

async function makeFixture(t, files = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "route-js-budget-test-"));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
  });
  const distDir = path.join(root, "dist");
  await mkdir(distDir, { recursive: true });
  for (const [relativePath, contents] of Object.entries(files)) {
    const target = path.join(distDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  return {
    distDir: await realpath(distDir),
    root: await realpath(root),
  };
}

function measurements(overrides = {}) {
  return ROUTES.map((route, index) => ({
    ...route,
    rawBytes: 10_000 + index,
    gzipBytes: 4_000 + index,
    ...overrides[route.id],
  }));
}

function validBaseline() {
  return createBaseline(measurements(), COMMIT);
}

function clone(value) {
  return structuredClone(value);
}

test("discovers all five HTML entry attributes across syntax variants and deduplicates them", () => {
  const html = `
    <SCRIPT defer SRC='/assets/app.js?build=1#ignored'></SCRIPT>
    <link href="/assets/preload.js" crossorigin rel="stylesheet MODULEPRELOAD preload">
    <astro-island
      renderer-url='/assets/renderer.js'
      component-url="/assets/component.js"
      before-hydration-url=/assets/before.js
    ></astro-island>
    <script src="/assets/app.js?build=1"></script>
    <link rel="modulepreload" href='/assets/preload.js'>
    <link rel="stylesheet" href="/assets/not-an-entry.js">
  `;

  assert.deepEqual(discoverHtmlEntrySpecifiers(html), [
    "/assets/app.js?build=1",
    "/assets/before.js",
    "/assets/component.js",
    "/assets/preload.js",
    "/assets/renderer.js",
  ]);
});

for (const [label, entry, pattern] of [
  [
    "external URL",
    "https://cdn.example.com/external.js",
    /unsupported non-local JavaScript entry/,
  ],
  [
    "protocol-relative URL",
    "//cdn.example.com/external.js",
    /unsupported non-local JavaScript entry/,
  ],
  ["fragment-only URL", "#fragment-only", /unsupported non-JavaScript entry/],
  [
    "non-JavaScript URL",
    "/assets/styles.css",
    /unsupported non-JavaScript entry/,
  ],
]) {
  test(`rejects an HTML ${label} instead of silently undercounting it`, () => {
    assert.throws(
      () => discoverHtmlEntrySpecifiers(`<script src="${entry}"></script>`),
      pattern,
    );
  });
}

test("rejects non-string HTML", () => {
  assert.throws(
    () => discoverHtmlEntrySpecifiers(Buffer.from("<script></script>")),
    /HTML must be a string/,
  );
});

test("parses static imports and re-exports while excluding dynamic imports", async () => {
  const source = `
    import defaultValue from "./default.js";
    import "./side-effect.js";
    export * from "./star.js";
    export { named } from "./named.js";
    import("./dynamic.js");
    const selected = "./computed.js";
    import(selected);
    console.log(import.meta.url, defaultValue);
  `;

  assert.deepEqual(await parseStaticImportSpecifiers(source), [
    "./default.js",
    "./named.js",
    "./side-effect.js",
    "./star.js",
  ]);
});

test("collects a recursive static closure once across sharing and cycles", async (t) => {
  const files = {
    "index.html": `
      <script type="module" src="/assets/main.js"></script>
      <link href="/assets/shared.js" rel="modulepreload">
    `,
    "assets/main.js": `
      import "./shared.js";
      import { feature } from "./feature.js";
      export { sharedAgain } from "./reexport.js";
      import("./dynamic-missing.js");
      console.log(feature);
    `,
    "assets/shared.js": "export const sharedAgain = 1;\n",
    "assets/feature.js": `
      export * from "./cycle-a.js";
      export const feature = true;
    `,
    "assets/reexport.js": `export { sharedAgain } from "./shared.js";\n`,
    "assets/cycle-a.js": `import "./cycle-b.js"; export const a = 1;\n`,
    "assets/cycle-b.js": `import "./cycle-a.js"; export const b = 2;\n`,
  };
  const { distDir } = await makeFixture(t, files);

  const chunks = await collectRouteChunks({
    route: { id: "fixture", pathname: "/" },
    distDir,
  });

  assert.deepEqual(
    chunks.map((chunk) => chunk.path),
    [
      "assets/cycle-a.js",
      "assets/cycle-b.js",
      "assets/feature.js",
      "assets/main.js",
      "assets/reexport.js",
      "assets/shared.js",
    ],
  );
  assert.equal(
    chunks.filter((chunk) => chunk.path === "assets/shared.js").length,
    1,
  );
  assert.equal(
    chunks.some((chunk) => chunk.path.includes("dynamic")),
    false,
  );
});

test("measures raw and gzip bytes per chunk before summing a route", async (t) => {
  const files = {
    "index.html": `
      <script src="/assets/alpha.js"></script>
      <script src="/assets/beta.js"></script>
    `,
    "assets/alpha.js": "export const greeting = '你好，世界';\n",
    "assets/beta.js": "export const repeated = 'aaaaaaaaaaaaaaaaaaaaaaaa';\n",
  };
  const { distDir } = await makeFixture(t, files);
  const [route] = await measureRoutes({
    distDir,
    routes: [{ id: "fixture", pathname: "/" }],
  });

  const expectedChunks = ["assets/alpha.js", "assets/beta.js"].map(
    (chunkPath) => {
      const contents = Buffer.from(files[chunkPath]);
      return {
        path: chunkPath,
        rawBytes: contents.byteLength,
        gzipBytes: gzipSync(contents, { level: 9 }).byteLength,
      };
    },
  );
  assert.deepEqual(route.chunks, expectedChunks);
  assert.equal(
    route.rawBytes,
    expectedChunks.reduce((sum, chunk) => sum + chunk.rawBytes, 0),
  );
  assert.equal(
    route.gzipBytes,
    expectedChunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0),
  );
});

test("measureBuffer counts Unicode bytes rather than JavaScript characters", () => {
  const source = "A你🙂";
  const expected = Buffer.from(source);
  assert.equal(source.length, 4);
  assert.deepEqual(measureBuffer(source), {
    rawBytes: expected.byteLength,
    gzipBytes: gzipSync(expected, { level: 9 }).byteLength,
  });
  assert.equal(expected.byteLength, 8);
});

test("reports a missing imported chunk", async (t) => {
  const { distDir } = await makeFixture(t, {
    "index.html": '<script src="/assets/main.js"></script>',
    "assets/main.js": 'import "./missing.js";\n',
  });

  await assert.rejects(
    collectRouteChunks({
      route: { id: "missing", pathname: "/" },
      distDir,
    }),
    /missing\.js.*missing or unreadable/,
  );
});

test("rejects a relative import that resolves outside dist", async (t) => {
  const { distDir } = await makeFixture(t, {
    "index.html": '<script src="/assets/main.js"></script>',
    "assets/main.js": 'import "../../outside.js";\n',
  });

  await assert.rejects(
    collectRouteChunks({
      route: { id: "traversal", pathname: "/" },
      distDir,
    }),
    /outside dist/,
  );
});

for (const [label, specifier] of [
  ["external URL", "https://cdn.example.com/library.js"],
  ["bare package", "some-package"],
]) {
  test(`rejects an unsupported ${label} static import`, async (t) => {
    const { distDir } = await makeFixture(t, {
      "index.html": '<script src="/assets/main.js"></script>',
      "assets/main.js": `import ${JSON.stringify(specifier)};\n`,
    });

    await assert.rejects(
      collectRouteChunks({
        route: { id: "non-local", pathname: "/" },
        distDir,
      }),
      /unsupported (?:non-local|non-JavaScript) import/,
    );
  });
}

test("rejects an in-dist symlink whose target escapes dist", async (t) => {
  const { distDir, root } = await makeFixture(t, {
    "index.html": '<script src="/assets/escape.js"></script>',
  });
  const outside = path.join(root, "outside.js");
  await writeFile(outside, "export const escaped = true;\n");
  await mkdir(path.join(distDir, "assets"), { recursive: true });
  await symlink(outside, path.join(distDir, "assets", "escape.js"));

  await assert.rejects(
    collectRouteChunks({
      route: { id: "symlink", pathname: "/" },
      distDir,
    }),
    /symlink outside dist/,
  );
});

function routeMeasurement(gzipBytes, rawBytes = gzipBytes) {
  return { id: "home", pathname: "/", rawBytes, gzipBytes };
}

test("uses a strict gzip-only 5000-byte budget threshold", () => {
  const baseline = routeMeasurement(1_000, 10);
  for (const [label, delta, expected] of [
    ["below", THRESHOLD.minimumIncreaseBytes - 1, true],
    ["equal", THRESHOLD.minimumIncreaseBytes, true],
    ["above", THRESHOLD.minimumIncreaseBytes + 1, false],
  ]) {
    const result = evaluateRoute(
      routeMeasurement(baseline.gzipBytes + delta, 1_000_000),
      baseline,
    );
    assert.equal(result.passed, expected, `${label} absolute threshold`);
    assert.equal(result.delta.gzipBytes, delta, `${label} gzip attribution`);
  }
});

test("uses a strict gzip-only five-percent budget threshold", () => {
  const baseline = routeMeasurement(200_000, 10);
  const fivePercent =
    (baseline.gzipBytes * THRESHOLD.ratioNumerator) /
    THRESHOLD.ratioDenominator;
  assert.ok(fivePercent > THRESHOLD.minimumIncreaseBytes);
  for (const [label, delta, expected] of [
    ["below", fivePercent - 1, true],
    ["equal", fivePercent, true],
    ["above", fivePercent + 1, false],
  ]) {
    const result = evaluateRoute(
      routeMeasurement(baseline.gzipBytes + delta, 1_000_000),
      baseline,
    );
    assert.equal(result.passed, expected, `${label} relative threshold`);
    assert.equal(result.delta.gzipBytes, delta, `${label} gzip attribution`);
  }
});

test("retains raw growth for attribution without letting it fail the gate", () => {
  const baseline = routeMeasurement(1_000, 100);
  const result = evaluateRoute(routeMeasurement(1_000, 1_000_000), baseline);
  assert.equal(result.delta.rawBytes, 999_900);
  assert.equal(result.passed, true);
});

test("accepts the exact fixed baseline schema and five canonical routes", () => {
  const baseline = validBaseline();
  assert.equal(validateBaseline(baseline), baseline);
  assert.deepEqual(baseline.method, METHOD);
  assert.deepEqual(baseline.toolchain, TOOLCHAIN);
  assert.deepEqual(baseline.threshold, THRESHOLD);
  assert.deepEqual(
    baseline.routes.map(({ id, pathname }) => ({ id, pathname })),
    ROUTES,
  );
});

for (const mutation of [
  {
    name: "extra top-level field",
    pattern: /baseline must contain exactly/,
    apply(value) {
      value.extra = true;
    },
  },
  {
    name: "missing top-level field",
    pattern: /baseline must contain exactly/,
    apply(value) {
      delete value.build;
    },
  },
  {
    name: "wrong schema version",
    pattern: /schemaVersion must be 1/,
    apply(value) {
      value.schemaVersion = 2;
    },
  },
  {
    name: "wrong kind",
    pattern: /baseline\.kind must be/,
    apply(value) {
      value.kind = "other-kind";
    },
  },
  {
    name: "extra method field",
    pattern: /baseline\.method must contain exactly/,
    apply(value) {
      value.method.extra = true;
    },
  },
  {
    name: "missing method field",
    pattern: /baseline\.method must contain exactly/,
    apply(value) {
      delete value.method[Object.keys(METHOD)[0]];
    },
  },
  {
    name: "wrong method field",
    pattern: /baseline\.method does not match/,
    apply(value) {
      value.method.imports = "another parser";
    },
  },
  {
    name: "extra toolchain field",
    pattern: /baseline\.toolchain must contain exactly/,
    apply(value) {
      value.toolchain.extra = "1";
    },
  },
  {
    name: "missing toolchain field",
    pattern: /baseline\.toolchain must contain exactly/,
    apply(value) {
      delete value.toolchain.node;
    },
  },
  {
    name: "wrong toolchain field",
    pattern: /baseline\.toolchain does not match/,
    apply(value) {
      value.toolchain.pnpm = "0.0.0";
    },
  },
  {
    name: "extra threshold field",
    pattern: /baseline\.threshold must contain exactly/,
    apply(value) {
      value.threshold.extra = 1;
    },
  },
  {
    name: "missing threshold field",
    pattern: /baseline\.threshold must contain exactly/,
    apply(value) {
      delete value.threshold[Object.keys(THRESHOLD)[0]];
    },
  },
  {
    name: "wrong threshold field",
    pattern: /baseline\.threshold does not match/,
    apply(value) {
      value.threshold.minimumIncreaseBytes += 1;
    },
  },
  {
    name: "extra build field",
    pattern: /baseline\.build must contain exactly/,
    apply(value) {
      value.build.extra = true;
    },
  },
  {
    name: "missing build field",
    pattern: /baseline\.build must contain exactly/,
    apply(value) {
      delete value.build.commit;
    },
  },
  {
    name: "wrong commit",
    pattern: /40-character hexadecimal commit/,
    apply(value) {
      value.build.commit = "not-a-commit";
    },
  },
  {
    name: "extra route field",
    pattern: /baseline route must contain exactly/,
    apply(value) {
      value.routes[0].chunks = [];
    },
  },
  {
    name: "missing route field",
    pattern: /baseline route must contain exactly/,
    apply(value) {
      delete value.routes[0].gzipBytes;
    },
  },
  {
    name: "wrong route pathname",
    pattern: /baseline route home\.pathname must be/,
    apply(value) {
      value.routes[0].pathname = "/wrong/";
    },
  },
  {
    name: "wrong route byte field",
    pattern: /rawBytes must be a non-negative safe integer/,
    apply(value) {
      value.routes[0].rawBytes = -1;
    },
  },
]) {
  test(`rejects a baseline with ${mutation.name}`, () => {
    const baseline = clone(validBaseline());
    mutation.apply(baseline);
    assert.throws(() => validateBaseline(baseline), mutation.pattern);
  });
}

test("requires exactly the five canonical baseline routes", () => {
  const missing = clone(validBaseline());
  missing.routes.pop();
  assert.throws(
    () => validateBaseline(missing),
    /baseline\.routes must contain exactly 5 routes/,
  );

  const duplicate = clone(validBaseline());
  duplicate.routes[4].id = duplicate.routes[0].id;
  assert.throws(
    () => validateBaseline(duplicate),
    /baseline route id must be unique/,
  );
});

test("createBaseline round-trips through JSON and canonicalizes route order", () => {
  const input = measurements()
    .reverse()
    .map((route) => ({
      ...route,
      chunks: [{ path: "ignored.js", rawBytes: 1, gzipBytes: 1 }],
    }));
  const baseline = createBaseline(input, COMMIT.toUpperCase());
  const roundTripped = JSON.parse(JSON.stringify(baseline));

  assert.deepEqual(validateBaseline(roundTripped), baseline);
  assert.equal(baseline.build.commit, COMMIT);
  assert.deepEqual(
    baseline.routes.map(({ id, pathname }) => ({ id, pathname })),
    ROUTES,
  );
  assert.equal(
    baseline.routes.some((route) => Object.hasOwn(route, "chunks")),
    false,
  );
});
