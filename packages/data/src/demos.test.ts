import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { legacyZhBaseline } from "./fixtures/legacy-zh-baseline";
import {
  agentLoopDemo,
  aiLineageEdges,
  aiLineageNodes,
  aiTimelineEntries,
  attentionMapDemo,
  bayesUpdateDemo,
  chapterRegistry,
  cnnKernelDemo,
  decisionBoundaryDemo,
  expertSystemDemo,
  getAgentLoopDemo,
  getAiLineageEdges,
  getAiLineageNodes,
  getAiTimelineEntries,
  getAttentionMapDemo,
  getBayesUpdateDemo,
  getCnnKernelDemo,
  getChapterDefinition,
  getDecisionBoundaryDemo,
  getExpertSystemDemo,
  getLlmSystemConnections,
  getLlmSystemLayers,
  getRagPipelineDemo,
  getSearchTreeDemo,
  llmSystemConnections,
  llmSystemLayers,
  isChapterId,
  ragPipelineDemo,
  searchTreeDemo,
} from "./index";

const demos = [
  ragPipelineDemo,
  attentionMapDemo,
  agentLoopDemo,
  searchTreeDemo,
  expertSystemDemo,
  bayesUpdateDemo,
  decisionBoundaryDemo,
  cnnKernelDemo,
];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }

  return value;
}

function contentHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function withoutEndpointIds(
  connections: typeof llmSystemConnections,
): Record<string, unknown>[] {
  return connections.map((connection) => {
    const legacyConnection = {
      ...connection,
    } as Record<string, unknown>;
    delete legacyConnection.fromId;
    delete legacyConnection.toId;
    return legacyConnection;
  });
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function expectMutationIsolation<T, Selected>(
  getValue: () => T,
  legacyValue: T,
  select: (value: T) => Selected,
  mutate: (value: T) => void,
): void {
  const expected = structuredClone(select(legacyValue));
  const returned = getValue();

  mutate(returned);

  expect.soft(select(getValue())).toEqual(expected);
  expect.soft(select(legacyValue)).toEqual(expected);
}

describe("demo acceptance metadata", () => {
  it("gives every MVP demo concrete learning goals", () => {
    for (const demo of demos) {
      const learningGoals = (demo as { learningGoals?: string[] })
        .learningGoals;

      expect(learningGoals, demo.title).toEqual(expect.any(Array));
      expect(learningGoals?.length, demo.title).toBeGreaterThanOrEqual(2);
      expect(
        learningGoals?.every((goal) => goal.trim().length > 0),
        demo.title,
      ).toBe(true);
    }
  });
});

describe("chapter registry", () => {
  it("keeps ten unique chapters in the 00-09 learning order", () => {
    expect(
      chapterRegistry.map(({ id, route, kind, number }) => ({
        id,
        route,
        kind,
        number,
      })),
    ).toEqual([
      {
        id: "overview",
        route: "/chapters/overview/",
        kind: "chapter",
        number: "00",
      },
      {
        id: "search",
        route: "/chapters/search/",
        kind: "demo",
        number: "01",
      },
      {
        id: "expert-system",
        route: "/chapters/expert-system/",
        kind: "demo",
        number: "02",
      },
      {
        id: "bayes",
        route: "/chapters/bayes/",
        kind: "demo",
        number: "03",
      },
      {
        id: "decision-boundary",
        route: "/chapters/decision-boundary/",
        kind: "demo",
        number: "04",
      },
      {
        id: "cnn",
        route: "/chapters/cnn/",
        kind: "demo",
        number: "05",
      },
      {
        id: "attention",
        route: "/chapters/attention/",
        kind: "demo",
        number: "06",
      },
      {
        id: "llm-system",
        route: "/chapters/llm-system/",
        kind: "chapter",
        number: "07",
      },
      {
        id: "rag",
        route: "/chapters/rag/",
        kind: "demo",
        number: "08",
      },
      {
        id: "agent",
        route: "/chapters/agent/",
        kind: "demo",
        number: "09",
      },
    ]);
    expect(new Set(chapterRegistry.map(({ id }) => id)).size).toBe(10);
    expect(new Set(chapterRegistry.map(({ route }) => route)).size).toBe(10);
    expect(new Set(chapterRegistry.map(({ number }) => number)).size).toBe(10);
  });

  it("links every non-overview chapter to timeline and lineage IDs", () => {
    const linkedChapters = chapterRegistry.filter(
      (chapter) => "timelineId" in chapter || "lineageNodeId" in chapter,
    );

    expect(linkedChapters).toHaveLength(9);
    expect(
      linkedChapters.every(
        (chapter) => "timelineId" in chapter && Boolean(chapter.timelineId),
      ),
    ).toBe(true);
    expect(
      linkedChapters.every(
        (chapter) =>
          "lineageNodeId" in chapter && Boolean(chapter.lineageNodeId),
      ),
    ).toBe(true);
    expect(
      new Set(
        linkedChapters.map((chapter) =>
          "timelineId" in chapter ? chapter.timelineId : undefined,
        ),
      ).size,
    ).toBe(9);
    expect(
      new Set(
        linkedChapters.map((chapter) =>
          "lineageNodeId" in chapter ? chapter.lineageNodeId : undefined,
        ),
      ).size,
    ).toBe(9);
  });

  it("looks up and validates stable chapter IDs", () => {
    expect(getChapterDefinition("attention").shortTitle["zh-CN"]).toBe(
      "注意力机制",
    );
    expect(isChapterId("decision-boundary")).toBe(true);
    expect(isChapterId("safety")).toBe(false);
  });
});

describe("localized data accessors", () => {
  it("matches all Chinese defaults to the independent pre-task baseline", () => {
    expect(legacyZhBaseline.sourceCommit).toBe(
      "c4e94360770e10e274dad8b60134b788a69ce372",
    );

    const currentLegacyExports = {
      agentLoopDemo,
      attentionMapDemo,
      bayesUpdateDemo,
      cnnKernelDemo,
      decisionBoundaryDemo,
      expertSystemDemo,
      ragPipelineDemo,
      searchTreeDemo,
      llmSystemLayers,
      llmSystemConnections: withoutEndpointIds(llmSystemConnections),
    };
    const currentHashes = Object.fromEntries(
      Object.entries(currentLegacyExports).map(([name, value]) => [
        name,
        contentHash(value),
      ]),
    );

    const expectedHashes = Object.fromEntries(
      Object.keys(currentLegacyExports).map((name) => [
        name,
        legacyZhBaseline.hashes[name as keyof typeof legacyZhBaseline.hashes],
      ]),
    );

    expect(currentHashes).toEqual(expectedHashes);
  });

  it("returns English demo copy while preserving stable graph IDs", () => {
    const zh = getRagPipelineDemo("zh-CN");
    const en = getRagPipelineDemo("en");

    expect(en.title).toBe(
      "RAG: How do large language models connect to external knowledge?",
    );
    expect(en.question).toBe(
      "Why are model parameters alone not enough for answering questions?",
    );
    expect(en.nodes.map((node) => node.id)).toEqual(
      zh.nodes.map((node) => node.id),
    );
    expect(en.edges.map((edge) => edge.id)).toEqual(
      zh.edges.map((edge) => edge.id),
    );
  });

  it("returns every required English demo title", () => {
    expect(getSearchTreeDemo("en").title).toBe(
      "Symbolic AI And Search: Can machines act intelligent by searching?",
    );
    expect(getExpertSystemDemo("en").title).toBe(
      "Expert Systems: Can expert knowledge be written as if-then rules?",
    );
    expect(getBayesUpdateDemo("en").title).toBe(
      "Probabilistic Reasoning: How do machines handle uncertainty?",
    );
    expect(getDecisionBoundaryDemo("en").title).toBe(
      "Classic Machine Learning: How do machines learn decision boundaries from data?",
    );
    expect(getCnnKernelDemo("en").title).toBe(
      "Deep Learning And CNNs: How do machines learn local visual features?",
    );
    expect(getAttentionMapDemo("en").title).toBe(
      "Attention And Transformers: Why can tokens directly attend to each other?",
    );
    expect(getAgentLoopDemo("en").title).toBe(
      "Agents: How do large language models execute multi-step tasks?",
    );
  });

  it("returns English overview data for timeline and lineage", () => {
    expect(getAiTimelineEntries("en")[0]?.title).toBe("Symbolic AI And Search");
    expect(getAiTimelineEntries("en")[0]?.era).toBe("Rules And Search");
    expect(getAiTimelineEntries("en")[0]?.chapterId).toBe("search");
    expect(getAiTimelineEntries("en")[3]?.chapterId).toBe("decision-boundary");
    expect(getAiLineageNodes("en")[0]?.label).toBe("Symbolic AI");
    expect(getAiLineageNodes("en")[0]?.group).toBe("symbolic");
  });

  it("provides complete English copy without Chinese text or punctuation", () => {
    const englishValues = [
      getRagPipelineDemo("en"),
      getAttentionMapDemo("en"),
      getAgentLoopDemo("en"),
      getSearchTreeDemo("en"),
      getExpertSystemDemo("en"),
      getBayesUpdateDemo("en"),
      getDecisionBoundaryDemo("en"),
      getCnnKernelDemo("en"),
      getAiTimelineEntries("en"),
      getAiLineageNodes("en"),
      getAiLineageEdges("en"),
      getLlmSystemLayers("en"),
      getLlmSystemConnections("en"),
    ];

    const invalidStrings = collectStrings(englishValues).filter(
      (value) =>
        value.trim().length === 0 ||
        /[\u3400-\u9fff，。；！？：、“”‘’（）【】《》]/u.test(value),
    );

    expect(invalidStrings).toEqual([]);
  });
});

describe("localized topology parity", () => {
  it("preserves RAG pipeline topology and scripted behavior", () => {
    const project = (demo: ReturnType<typeof getRagPipelineDemo>) => ({
      nodeIds: demo.nodes.map(({ id }) => id),
      edges: demo.edges,
      steps: demo.steps.map(({ id, activeNodeIds, activeEdgeIds }) => ({
        id,
        activeNodeIds,
        activeEdgeIds,
      })),
      scenarioIds: demo.scenarios?.map(({ id }) => id),
    });

    expect(project(getRagPipelineDemo("en"))).toEqual(
      project(getRagPipelineDemo("zh-CN")),
    );
  });

  it("preserves attention, agent, and search topology", () => {
    const zhAttention = getAttentionMapDemo("zh-CN");
    const enAttention = getAttentionMapDemo("en");
    expect(enAttention.tokens.map(({ id, x, y }) => ({ id, x, y }))).toEqual(
      zhAttention.tokens.map(({ id, x, y }) => ({ id, x, y })),
    );
    expect(enAttention.links).toEqual(zhAttention.links);

    const projectAgent = (demo: ReturnType<typeof getAgentLoopDemo>) => ({
      steps: demo.steps.map(({ id, activeNodeIds, activeEdgeIds }) => ({
        id,
        activeNodeIds,
        activeEdgeIds,
      })),
      branches: demo.branchOptions.map(({ id, targetStepId }) => ({
        id,
        targetStepId,
      })),
    });
    expect(projectAgent(getAgentLoopDemo("en"))).toEqual(
      projectAgent(getAgentLoopDemo("zh-CN")),
    );

    const projectSearch = (demo: ReturnType<typeof getSearchTreeDemo>) => ({
      nodes: demo.nodes.map(({ id, x, y }) => ({ id, x, y })),
      edges: demo.edges,
      strategies: demo.strategies.map(
        ({ id, activeNodeIds, activeEdgeIds }) => ({
          id,
          activeNodeIds,
          activeEdgeIds,
        }),
      ),
    });
    expect(projectSearch(getSearchTreeDemo("en"))).toEqual(
      projectSearch(getSearchTreeDemo("zh-CN")),
    );
  });

  it("preserves expert, Bayes, decision-boundary, and CNN behavior", () => {
    const projectExpert = (demo: ReturnType<typeof getExpertSystemDemo>) => ({
      conditions: demo.conditions.map(({ id, defaultSelected }) => ({
        id,
        defaultSelected,
      })),
      exception: {
        id: demo.exceptionCondition.id,
        defaultSelected: demo.exceptionCondition.defaultSelected,
      },
      rules: demo.rules.map(({ id, ifAll }) => ({ id, ifAll })),
    });
    expect(projectExpert(getExpertSystemDemo("en"))).toEqual(
      projectExpert(getExpertSystemDemo("zh-CN")),
    );

    const zhBayes = getBayesUpdateDemo("zh-CN");
    const enBayes = getBayesUpdateDemo("en");
    expect([enBayes.priorDefault, enBayes.evidenceDefault]).toEqual([
      zhBayes.priorDefault,
      zhBayes.evidenceDefault,
    ]);

    const projectBoundary = (
      demo: ReturnType<typeof getDecisionBoundaryDemo>,
    ) => ({
      points: demo.points,
      modes: demo.modes.map(({ id, path }) => ({ id, path })),
    });
    expect(projectBoundary(getDecisionBoundaryDemo("en"))).toEqual(
      projectBoundary(getDecisionBoundaryDemo("zh-CN")),
    );

    const projectCnn = (demo: ReturnType<typeof getCnnKernelDemo>) => ({
      imageGrid: demo.imageGrid,
      kernels: demo.kernels.map(({ id, matrix }) => ({ id, matrix })),
      scanSteps: demo.scanSteps.map(({ id, x, y }) => ({ id, x, y })),
    });
    expect(projectCnn(getCnnKernelDemo("en"))).toEqual(
      projectCnn(getCnnKernelDemo("zh-CN")),
    );
  });

  it("preserves overview IDs, geometry, links, and ordering", () => {
    const projectTimeline = (entries: typeof aiTimelineEntries) =>
      entries.map(({ id, year, chapterId }) => ({ id, year, chapterId }));
    expect(projectTimeline(getAiTimelineEntries("en"))).toEqual(
      projectTimeline(getAiTimelineEntries("zh-CN")),
    );

    const projectNodes = (nodes: typeof aiLineageNodes) =>
      nodes.map(({ id, group, x, y, chapterId }) => ({
        id,
        group,
        x,
        y,
        chapterId,
      }));
    expect(projectNodes(getAiLineageNodes("en"))).toEqual(
      projectNodes(getAiLineageNodes("zh-CN")),
    );
    expect(
      getAiLineageEdges("en").map(({ id, from, to }) => ({ id, from, to })),
    ).toEqual(
      getAiLineageEdges("zh-CN").map(({ id, from, to }) => ({ id, from, to })),
    );
    expect(getLlmSystemLayers("en").map(({ id }) => id)).toEqual(
      getLlmSystemLayers("zh-CN").map(({ id }) => id),
    );
    const projectConnections = (
      connections: ReturnType<typeof getLlmSystemConnections>,
    ) => connections.map(({ id, fromId, toId }) => ({ id, fromId, toId }));
    const expectedConnections = [
      {
        id: "model-context",
        fromId: "base-model",
        toId: "context-window",
      },
      {
        id: "retrieval-context",
        fromId: "retrieval",
        toId: "context-window",
      },
      { id: "model-tools", fromId: "base-model", toId: "tools" },
      {
        id: "memory-context",
        fromId: "memory",
        toId: "context-window",
      },
      { id: "eval-system", fromId: "eval", toId: "whole-system" },
    ];

    expect(projectConnections(getLlmSystemConnections("zh-CN"))).toEqual(
      expectedConnections,
    );
    expect(projectConnections(getLlmSystemConnections("en"))).toEqual(
      projectConnections(getLlmSystemConnections("zh-CN")),
    );
  });
});

describe("getter mutation isolation", () => {
  it("returns defensive deep copies without mutating later reads or defaults", () => {
    expectMutationIsolation(
      () => getRagPipelineDemo("zh-CN"),
      ragPipelineDemo,
      (demo) => ({
        description: demo.nodes[0]?.description,
        edgeTo: demo.edges[0]?.to,
      }),
      (demo) => {
        demo.nodes[0]!.description = "mutated";
        demo.edges[0]!.to = "mutated";
      },
    );
    expectMutationIsolation(
      () => getAttentionMapDemo("zh-CN"),
      attentionMapDemo,
      (demo) => ({
        description: demo.tokens[0]?.focusDescription,
        weight: demo.links[0]?.weight,
      }),
      (demo) => {
        demo.tokens[0]!.focusDescription = "mutated";
        demo.links[0]!.weight = -1;
      },
    );
    expectMutationIsolation(
      () => getAgentLoopDemo("zh-CN"),
      agentLoopDemo,
      (demo) => ({
        description: demo.steps[0]?.description,
        activeNodeId: demo.steps[0]?.activeNodeIds[0],
      }),
      (demo) => {
        demo.steps[0]!.description = "mutated";
        demo.steps[0]!.activeNodeIds[0] = "mutated";
      },
    );
    expectMutationIsolation(
      () => getSearchTreeDemo("zh-CN"),
      searchTreeDemo,
      (demo) => ({
        description: demo.strategies[0]?.description,
        nodeX: demo.nodes[0]?.x,
        edgeTo: demo.edges[0]?.to,
      }),
      (demo) => {
        demo.strategies[0]!.description = "mutated";
        demo.nodes[0]!.x = -1;
        demo.edges[0]!.to = "mutated";
      },
    );
    expectMutationIsolation(
      () => getExpertSystemDemo("zh-CN"),
      expertSystemDemo,
      (demo) => demo.conditions[0]?.label,
      (demo) => {
        demo.conditions[0]!.label = "mutated";
      },
    );
    expectMutationIsolation(
      () => getBayesUpdateDemo("zh-CN"),
      bayesUpdateDemo,
      (demo) => demo.learningGoals[0],
      (demo) => {
        demo.learningGoals[0] = "mutated";
      },
    );
    expectMutationIsolation(
      () => getDecisionBoundaryDemo("zh-CN"),
      decisionBoundaryDemo,
      (demo) => ({
        description: demo.modes[0]?.description,
        path: demo.modes[0]?.path,
        pointX: demo.points[0]?.x,
      }),
      (demo) => {
        demo.modes[0]!.description = "mutated";
        demo.modes[0]!.path = "mutated";
        demo.points[0]!.x = -1;
      },
    );
    expectMutationIsolation(
      () => getCnnKernelDemo("zh-CN"),
      cnnKernelDemo,
      (demo) => ({
        matrixValue: demo.kernels[0]?.matrix[0]?.[0],
        gridValue: demo.imageGrid[0]?.[0],
        scanX: demo.scanSteps[0]?.x,
      }),
      (demo) => {
        demo.kernels[0]!.matrix[0]![0] = 99;
        demo.imageGrid[0]![0] = 99;
        demo.scanSteps[0]!.x = 99;
      },
    );
    expectMutationIsolation(
      () => getAiTimelineEntries("zh-CN"),
      aiTimelineEntries,
      (entries) => entries[0]?.summary,
      (entries) => {
        entries[0]!.summary = "mutated";
      },
    );
    expectMutationIsolation(
      () => getAiLineageNodes("zh-CN"),
      aiLineageNodes,
      (nodes) => nodes[0]?.description,
      (nodes) => {
        nodes[0]!.description = "mutated";
      },
    );
    expectMutationIsolation(
      () => getAiLineageEdges("zh-CN"),
      aiLineageEdges,
      (edges) => edges[0]?.label,
      (edges) => {
        edges[0]!.label = "mutated";
      },
    );
    expectMutationIsolation(
      () => getLlmSystemLayers("zh-CN"),
      llmSystemLayers,
      (layers) => layers[0]?.role,
      (layers) => {
        layers[0]!.role = "mutated";
      },
    );
    expectMutationIsolation(
      () => getLlmSystemConnections("zh-CN"),
      llmSystemConnections,
      (connections) => connections[0]?.label,
      (connections) => {
        connections[0]!.label = "mutated";
      },
    );
  });
});
