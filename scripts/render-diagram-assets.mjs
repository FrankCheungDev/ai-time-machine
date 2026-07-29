import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const diagramDir = path.join(root, "apps/site/public/diagrams");
const previewDir = path.join(diagramDir, "previews");

const sharedStyles = `
  .title { fill: #17201d; font: 800 28px system-ui, sans-serif; }
  .subtitle { fill: #5f6864; font: 14px system-ui, sans-serif; }
  .label { fill: #17201d; font: 750 16px system-ui, sans-serif; }
  .small { fill: #5f6864; font: 12px system-ui, sans-serif; }
  .tiny { fill: #5f6864; font: 11px system-ui, sans-serif; }
  .node { fill: #ffffff; stroke: #d7ddd7; stroke-width: 2; }
  .active { fill: #eaf6ef; stroke: #2f7d5b; stroke-width: 3; }
  .risk { fill: #fff1ed; stroke: #c6543f; stroke-width: 3; }
  .fixed { fill: #f6eff9; stroke: #8a5a9d; stroke-width: 3; }
  .arrow { fill: none; stroke: #9ba9a1; stroke-width: 3; marker-end: url(#arrowhead); }
  .arrow-active { fill: none; stroke: #2f7d5b; stroke-width: 4; marker-end: url(#arrowhead-active); }
  .pill { fill: #eef4fb; stroke: #3469a6; stroke-width: 1.5; }
`;

function canvas({
  id,
  title,
  subtitle,
  state,
  note,
  body,
  version = "1.1.0",
  updatedAt = "2026-07-25",
}) {
  return `<svg id="diagram-${id}" data-state="${state}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 560" role="img" aria-labelledby="title-${id} desc-${id}">
  <title id="title-${id}">${title}</title>
  <desc id="desc-${id}">${subtitle}. Representative state: ${state}. ${note}</desc>
  <defs>
    <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ba9a1" /></marker>
    <marker id="arrowhead-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2f7d5b" /></marker>
    <style>${sharedStyles}</style>
  </defs>
  <rect id="background-canvas" width="1040" height="560" rx="8" fill="#fbfbf8" />
  <text id="label-title" x="44" y="52" class="title">${title}</text>
  <text id="label-subtitle" x="44" y="78" class="subtitle">${subtitle}</text>
  ${body.trim()}
  <rect x="44" y="478" width="952" height="48" rx="8" fill="#f7faf8" stroke="#d7ddd7" />
  <text x="62" y="499" class="tiny">STATE · ${state}</text>
  <text x="62" y="517" class="tiny">${note}</text>
  <text x="996" y="544" text-anchor="end" class="tiny">v${version} · ${updatedAt} · MIT</text>
</svg>`;
}

const assets = [
  {
    id: "search-tree",
    title: "Search Tree · A* Goal Route",
    subtitle: "Heuristic cost guides the active frontier toward Goal",
    state: "astar-goal-route",
    note: "Fixed tree and unit edge costs teach expansion order, not real search scale.",
    body: `
      <path id="arrow-start-b" class="arrow-active" d="M 188 276 L 300 334" />
      <path id="arrow-b-c" class="arrow-active" d="M 398 334 H 514" />
      <path id="arrow-c-goal" class="arrow-active" d="M 612 334 L 748 276" />
      <path class="arrow" d="M 188 256 L 300 178" />
      <g id="node-start"><rect class="active" x="74" y="230" width="114" height="82" rx="8" /><text class="label" x="131" y="266" text-anchor="middle">Start</text><text class="small" x="131" y="289" text-anchor="middle">h = 2</text></g>
      <g id="node-a"><rect class="node" x="300" y="136" width="98" height="82" rx="8" /><text class="label" x="349" y="172" text-anchor="middle">A</text><text class="small" x="349" y="195" text-anchor="middle">h = 4</text></g>
      <g id="node-b"><rect class="active" x="300" y="292" width="98" height="82" rx="8" /><text class="label" x="349" y="328" text-anchor="middle">B</text><text class="small" x="349" y="351" text-anchor="middle">h = 3</text></g>
      <g id="node-c"><rect class="active" x="514" y="292" width="98" height="82" rx="8" /><text class="label" x="563" y="328" text-anchor="middle">C</text><text class="small" x="563" y="351" text-anchor="middle">h = 1</text></g>
      <g id="node-goal"><rect class="active" x="748" y="230" width="130" height="82" rx="8" /><text class="label" x="813" y="266" text-anchor="middle">Goal</text><text class="small" x="813" y="289" text-anchor="middle">h = 0</text></g>
      <rect class="pill" x="812" y="136" width="150" height="42" rx="21" /><text class="small" x="887" y="162" text-anchor="middle">Lowest f-score</text>`,
  },
  {
    id: "expert-system",
    title: "Expert System · Rule Conflict",
    subtitle: "One fact set activates incompatible if-then conclusions",
    state: "rule-conflict",
    note: "Rules and facts are scripted teaching examples, not real decisions.",
    body: `
      <g id="node-facts"><rect class="active" x="70" y="190" width="200" height="150" rx="8" /><text class="label" x="170" y="225" text-anchor="middle">Facts</text><text class="small" x="92" y="260">temperature = high</text><text class="small" x="92" y="286">pressure = unstable</text><text class="small" x="92" y="312">override = true</text></g>
      <path id="arrow-facts-rules" class="arrow-active" d="M 270 265 H 350" />
      <g id="node-rule-a"><rect class="node" x="350" y="142" width="250" height="96" rx="8" /><text class="label" x="475" y="178" text-anchor="middle">Rule A</text><text class="small" x="475" y="204" text-anchor="middle">high temp → stop</text></g>
      <g id="node-rule-b"><rect class="node" x="350" y="292" width="250" height="96" rx="8" /><text class="label" x="475" y="328" text-anchor="middle">Rule B</text><text class="small" x="475" y="354" text-anchor="middle">override → continue</text></g>
      <path id="arrow-rules-conflict" class="arrow-active" d="M 600 190 C 680 190 680 264 742 264 M 600 340 C 680 340 680 264 742 264" />
      <g id="node-conflict"><rect class="risk" x="742" y="211" width="222" height="108" rx="8" /><text class="label" x="853" y="250" text-anchor="middle">Conflict</text><text class="small" x="853" y="276" text-anchor="middle">STOP ≠ CONTINUE</text><text class="small" x="853" y="298" text-anchor="middle">needs resolution</text></g>`,
  },
  {
    id: "bayes-update",
    title: "Bayesian Update · Evidence Changes Belief",
    subtitle: "A 30% prior becomes a 70% posterior after supporting evidence",
    state: "posterior-raised",
    note: "Simplified percentages show direction, not a complete probabilistic model.",
    body: `
      <g id="node-prior"><rect class="node" x="70" y="164" width="220" height="220" rx="8" /><text class="label" x="180" y="202" text-anchor="middle">Prior belief</text><rect x="112" y="232" width="48" height="110" rx="6" fill="#eef4fb" /><rect x="112" y="309" width="48" height="33" rx="6" fill="#3469a6" /><text class="label" x="214" y="298" text-anchor="middle">30%</text></g>
      <path id="arrow-prior-update" class="arrow-active" d="M 290 274 H 398" />
      <g id="node-evidence"><rect class="active" x="398" y="192" width="220" height="164" rx="8" /><text class="label" x="508" y="232" text-anchor="middle">Evidence</text><text class="small" x="508" y="267" text-anchor="middle">supports hypothesis</text><rect class="pill" x="438" y="289" width="140" height="38" rx="19" /><text class="small" x="508" y="313" text-anchor="middle">likelihood ↑</text></g>
      <path id="arrow-evidence-update" class="arrow-active" d="M 618 274 H 726" />
      <g id="node-posterior"><rect class="active" x="726" y="164" width="238" height="220" rx="8" /><text class="label" x="845" y="202" text-anchor="middle">Posterior belief</text><rect x="768" y="232" width="48" height="110" rx="6" fill="#eaf6ef" /><rect x="768" y="265" width="48" height="77" rx="6" fill="#2f7d5b" /><text class="label" x="876" y="298" text-anchor="middle">70%</text></g>`,
  },
  {
    id: "decision-boundary",
    title: "Decision Boundary · Nonlinear Separation",
    subtitle:
      "A curved boundary separates two sample groups without chasing one outlier",
    state: "nonlinear-boundary",
    note: "Hand-authored 2D points illustrate model shape, not a training run.",
    body: `
      <rect x="84" y="126" width="872" height="320" rx="8" fill="#ffffff" stroke="#d7ddd7" />
      <g id="node-negative-cluster" fill="#3469a6"><circle cx="222" cy="236" r="12" /><circle cx="278" cy="188" r="12" /><circle cx="316" cy="270" r="12" /><circle cx="242" cy="330" r="12" /><circle cx="365" cy="212" r="12" /></g>
      <g id="node-positive-cluster" fill="#c6543f"><circle cx="646" cy="208" r="12" /><circle cx="716" cy="174" r="12" /><circle cx="760" cy="250" r="12" /><circle cx="680" cy="316" r="12" /><circle cx="826" cy="342" r="12" /></g>
      <g id="node-outlier"><circle cx="468" cy="188" r="14" fill="#c6543f" stroke="#ffffff" stroke-width="4" /><text class="tiny" x="468" y="160" text-anchor="middle">outlier</text></g>
      <path id="highlight-boundary" d="M 504 140 C 430 220 574 256 498 426" fill="none" stroke="#2f7d5b" stroke-width="7" stroke-linecap="round" />
      <path id="arrow-data-boundary" class="arrow-active" d="M 518 106 V 148" />
      <rect class="pill" x="420" y="86" width="196" height="42" rx="21" /><text class="small" x="518" y="112" text-anchor="middle">nonlinear boundary</text>`,
  },
  {
    id: "cnn-kernel",
    title: "CNN Kernel · Local Edge Response",
    subtitle:
      "A 3×3 edge detector scans one window and contributes to a feature map",
    state: "edge-kernel-center",
    note: "One channel and fixed weights omit training, bias, and deeper layers.",
    body: `
      <g id="node-image-grid" transform="translate(76 154)"><rect class="node" width="244" height="244" rx="8" /><text class="label" x="122" y="-18" text-anchor="middle">5×5 image</text>${Array.from(
        { length: 25 },
        (_, index) => {
          const x = 22 + (index % 5) * 40;
          const y = 22 + Math.floor(index / 5) * 40;
          const fill = index % 5 < 2 ? "#eef4fb" : "#9fc3e8";
          return `<rect x="${x}" y="${y}" width="34" height="34" rx="4" fill="${fill}" stroke="#ffffff" /><text class="tiny" x="${x + 17}" y="${y + 22}" text-anchor="middle">${index % 5 < 2 ? 0 : 1}</text>`;
        },
      ).join(
        "",
      )}<rect x="98" y="98" width="114" height="114" rx="6" fill="none" stroke="#c6543f" stroke-width="4" /></g>
      <path id="arrow-image-kernel" class="arrow-active" d="M 320 276 H 398" />
      <g id="node-edge-kernel" transform="translate(398 194)"><rect class="active" width="212" height="164" rx="8" /><text class="label" x="106" y="34" text-anchor="middle">3×3 edge kernel</text>${[
        -1, 0, 1, -1, 0, 1, -1, 0, 1,
      ]
        .map((value, index) => {
          const x = 52 + (index % 3) * 42;
          const y = 54 + Math.floor(index / 3) * 34;
          return `<rect x="${x}" y="${y}" width="36" height="28" rx="3" fill="#ffffff" stroke="#d7ddd7" /><text class="tiny" x="${x + 18}" y="${y + 19}" text-anchor="middle">${value}</text>`;
        })
        .join("")}</g>
      <path id="arrow-kernel-feature" class="arrow-active" d="M 610 276 H 688" />
      <g id="node-feature-map" transform="translate(688 154)"><rect class="node" width="276" height="244" rx="8" /><text class="label" x="138" y="34" text-anchor="middle">3×3 feature map</text>${[
        4, 4, 0, 4, 4, 0, 4, 4, 0,
      ]
        .map((value, index) => {
          const x = 62 + (index % 3) * 52;
          const y = 62 + Math.floor(index / 3) * 48;
          return `<rect x="${x}" y="${y}" width="44" height="40" rx="4" fill="${value ? "#2f7d5b" : "#eef4fb"}" /><text x="${x + 22}" y="${y + 26}" text-anchor="middle" style="fill:${value ? "#fff" : "#17201d"};font:700 12px system-ui">${value}</text>`;
        })
        .join("")}</g>`,
  },
  {
    id: "attention-map",
    title: "Attention Map · Direct Token Links",
    subtitle:
      "The selected token connects directly to relevant context instead of passing state step by step",
    state: "selected-token-links",
    note: "Scripted line weights teach information paths, not real model attention.",
    body: `
      <path id="arrow-model-directly" d="M 278 276 C 410 130 572 130 704 276" fill="none" stroke="#2f7d5b" stroke-width="9" opacity=".82" marker-end="url(#arrowhead-active)" />
      <path id="arrow-model-context" d="M 278 286 C 430 454 690 454 842 391" fill="none" stroke="#3469a6" stroke-width="5" opacity=".72" marker-end="url(#arrowhead)" />
      <g id="node-token-model"><rect class="active" x="126" y="238" width="152" height="82" rx="8" /><text class="label" x="202" y="274" text-anchor="middle">model</text><text class="small" x="202" y="298" text-anchor="middle">selected</text></g>
      <g id="node-token-directly"><rect class="active" x="704" y="238" width="154" height="82" rx="8" /><text class="label" x="781" y="274" text-anchor="middle">directly</text><text class="small" x="781" y="298" text-anchor="middle">weight .82</text></g>
      <g id="node-token-context"><rect class="node" x="842" y="350" width="154" height="82" rx="8" /><text class="label" x="919" y="386" text-anchor="middle">context</text><text class="small" x="919" y="410" text-anchor="middle">weight .46</text></g>
      <rect class="pill" x="390" y="208" width="236" height="42" rx="21" /><text class="small" x="508" y="234" text-anchor="middle">direct information path</text>`,
  },
  {
    id: "llm-system",
    title: "LLM System · Task-Specific Boundaries",
    subtitle:
      "A resumed task uses memory and a controlled tool while retrieval stays optional",
    state: "verified-action-path",
    note: "Components and outcomes are scripted; no real model, memory, tool, or evaluator runs.",
    version: "1.3.0",
    updatedAt: "2026-07-29",
    body: `
      <path id="arrow-task-context" class="arrow-active" d="M 160 262 H 190" />
      <path id="arrow-memory-context" class="arrow-active" d="M 256 188 V 220" />
      <path id="arrow-retrieval-context" class="arrow" d="M 256 352 V 304" />
      <path id="arrow-context-model" class="arrow-active" d="M 322 262 H 356" />
      <path id="arrow-model-eval" class="arrow" d="M 488 262 H 704" />
      <path id="arrow-model-tools" class="arrow-active" d="M 488 262 C 542 262 590 316 590 352" />
      <path id="arrow-tools-eval" class="arrow-active" d="M 590 352 C 590 318 770 338 770 304" />
      <path id="arrow-eval-result" class="arrow-active" d="M 836 262 H 866" />
      <g id="node-task"><rect class="active" x="44" y="220" width="116" height="84" rx="8" /><text class="label" x="102" y="256" text-anchor="middle">Task</text><text class="small" x="102" y="280" text-anchor="middle">resume claim</text></g>
      <g id="node-context"><rect class="active" x="190" y="220" width="132" height="84" rx="8" /><text class="label" x="256" y="256" text-anchor="middle">Context</text><text class="small" x="256" y="280" text-anchor="middle">current input</text></g>
      <g id="node-model"><rect class="active" x="356" y="220" width="132" height="84" rx="8" /><text class="label" x="422" y="256" text-anchor="middle">Base Model</text><text class="small" x="422" y="280" text-anchor="middle">propose action</text></g>
      <g id="node-memory"><rect class="active" x="190" y="104" width="132" height="84" rx="8" /><text class="label" x="256" y="140" text-anchor="middle">Memory</text><text class="small" x="256" y="164" text-anchor="middle">restore state</text></g>
      <g id="node-retrieval"><rect class="node" x="190" y="352" width="132" height="84" rx="8" /><text class="label" x="256" y="388" text-anchor="middle">Retrieval</text><text class="small" x="256" y="412" text-anchor="middle">not needed</text></g>
      <g id="node-tools"><rect class="active" x="524" y="352" width="132" height="84" rx="8" /><text class="label" x="590" y="388" text-anchor="middle">Tools</text><text class="small" x="590" y="412" text-anchor="middle">submit claim</text></g>
      <g id="node-eval"><rect class="active" x="704" y="220" width="132" height="84" rx="8" /><text class="label" x="770" y="256" text-anchor="middle">Eval</text><text class="small" x="770" y="280" text-anchor="middle">check receipt</text></g>
      <g id="node-result"><rect class="active" x="866" y="220" width="130" height="84" rx="8" /><text class="label" x="931" y="256" text-anchor="middle">Result</text><text class="small" x="931" y="280" text-anchor="middle">verified</text></g>`,
  },
  {
    id: "rag-pipeline",
    title: "RAG Pipeline · Grounded Answer",
    subtitle:
      "Retrieved evidence is reranked, composed into context, and preserved with the answer",
    state: "grounded-answer",
    note: "All nodes and outputs are scripted; no vector database or model is called.",
    body: `
      <path id="arrow-query-embedding" class="arrow-active" d="M 172 220 H 208" />
      <path id="arrow-embedding-vector-db" class="arrow-active" d="M 336 220 H 372" />
      <path id="arrow-vector-db-reranker" class="arrow-active" d="M 500 220 H 536" />
      <path id="arrow-reranker-prompt" class="arrow-active" d="M 664 220 H 700" />
      <path id="arrow-prompt-llm" class="arrow-active" d="M 828 220 H 864" />
      <path id="arrow-llm-answer" class="arrow-active" d="M 928 260 C 928 350 760 370 664 370" />
      ${[
        ["query", "Query", "question", 44],
        ["embedding", "Embedding", "vector", 208],
        ["vector-db", "Vector DB", "chunks", 372],
        ["reranker", "Reranker", "evidence", 536],
        ["prompt", "Prompt", "context", 700],
        ["llm", "LLM", "generate", 864],
      ]
        .map(
          ([id, label, note, x]) =>
            `<g id="node-${id}"><rect class="${id === "vector-db" || id === "reranker" ? "active" : "node"}" x="${x}" y="178" width="128" height="84" rx="8" /><text class="label" x="${Number(x) + 64}" y="214" text-anchor="middle">${label}</text><text class="small" x="${Number(x) + 64}" y="238" text-anchor="middle">${note}</text></g>`,
        )
        .join("")}
      <g id="node-answer"><rect class="active" x="430" y="328" width="234" height="90" rx="8" /><text class="label" x="547" y="364" text-anchor="middle">Answer</text><text class="small" x="547" y="390" text-anchor="middle">claim + citation [1]</text></g>`,
  },
  {
    id: "agent-loop",
    title: "Agent Loop · Recovering From Tool Failure",
    subtitle: "A failed observation revises the plan before another tool call",
    state: "retry-after-tool-failure",
    note: "Tool results and retry paths are scripted; no external action runs.",
    body: `
      <path id="arrow-plan-tool" class="arrow" d="M 220 218 H 292" />
      <path id="arrow-tool-observe" class="arrow-active" d="M 432 218 H 504" />
      <path id="arrow-observe-revise" class="arrow-active" d="M 574 260 V 338 H 474" />
      <path id="arrow-revise-tool" class="arrow-active" d="M 404 338 H 362 V 260" />
      <path id="arrow-observe-final" class="arrow" d="M 644 218 H 748" />
      <g id="node-plan"><rect class="node" x="80" y="176" width="140" height="84" rx="8" /><text class="label" x="150" y="212" text-anchor="middle">Plan</text><text class="small" x="150" y="236" text-anchor="middle">set steps</text></g>
      <g id="node-tool"><rect class="active" x="292" y="176" width="140" height="84" rx="8" /><text class="label" x="362" y="212" text-anchor="middle">Tool Call</text><text class="small" x="362" y="236" text-anchor="middle">retry</text></g>
      <g id="node-observe"><rect class="risk" x="504" y="176" width="140" height="84" rx="8" /><text class="label" x="574" y="212" text-anchor="middle">Observation</text><text class="small" x="574" y="236" text-anchor="middle">failed</text></g>
      <g id="node-revise"><rect class="active" x="334" y="338" width="140" height="84" rx="8" /><text class="label" x="404" y="374" text-anchor="middle">Revise</text><text class="small" x="404" y="398" text-anchor="middle">change query</text></g>
      <g id="node-final"><rect class="node" x="748" y="176" width="164" height="84" rx="8" /><text class="label" x="830" y="212" text-anchor="middle">Final Answer</text><text class="small" x="830" y="236" text-anchor="middle">after evidence</text></g>`,
  },
  {
    id: "safety-eval",
    title: "Safety / Eval · Regression Release Gate",
    subtitle:
      "A prompt-injection failure becomes RT-017 and blocks the old version",
    state: "risk-fixed-regression",
    note: "One scripted case illustrates feedback; passing it does not eliminate all risk.",
    body: `
      <path id="arrow-red-team-guardrail" class="arrow-active" d="M 180 254 H 198" />
      <path id="arrow-guardrail-permission" class="arrow-active" d="M 342 254 H 360" />
      <path id="arrow-permission-review" class="arrow-active" d="M 504 254 H 522" />
      <path id="arrow-review-regression" class="arrow-active" d="M 666 254 H 684" />
      <path id="arrow-regression-release" class="arrow-active" d="M 828 254 H 846" />
      ${[
        ["red-team", "Red Team", "failure found", 36, "risk"],
        ["guardrail", "Guardrail", "risk flagged", 198, "active"],
        ["permission", "Permission", "send blocked", 360, "active"],
        ["review", "Review", "confirmed", 522, "node"],
        ["regression", "Regression", "RT-017 fixed", 684, "fixed"],
        ["release", "Release Gate", "fix passed", 846, "active"],
      ]
        .map(
          ([id, label, note, x, klass]) =>
            `<g id="node-${id}"><rect class="${klass}" x="${x}" y="208" width="144" height="92" rx="8" /><text class="label" x="${Number(x) + 72}" y="246" text-anchor="middle">${label}</text><text class="small" x="${Number(x) + 72}" y="273" text-anchor="middle">${note}</text></g>`,
        )
        .join("")}
      <rect class="pill" x="684" y="336" width="306" height="54" rx="8" /><text class="label" x="837" y="359" text-anchor="middle">Old build ✕  ·  Fixed build ✓</text><text class="tiny" x="837" y="378" text-anchor="middle">quality + safety + robustness + cost</text>`,
  },
];

await mkdir(previewDir, { recursive: true });

for (const asset of assets) {
  const svg = canvas(asset);
  const svgPath = path.join(diagramDir, `${asset.id}.svg`);
  const pngPath = path.join(previewDir, `${asset.id}.png`);

  await writeFile(svgPath, `${svg}\n`, "utf8");
  await sharp(Buffer.from(svg)).resize({ width: 1200 }).png().toFile(pngPath);
}

console.log(`Rendered ${assets.length} SVG and PNG diagram pairs.`);
