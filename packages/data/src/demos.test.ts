import { describe, expect, it } from "vitest";
import {
  agentLoopDemo,
  aiLineageEdges,
  aiLineageNodes,
  aiTimelineEntries,
  attentionMapDemo,
  bayesUpdateDemo,
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
  getDecisionBoundaryDemo,
  getExpertSystemDemo,
  getLlmSystemConnections,
  getLlmSystemLayers,
  getRagPipelineDemo,
  getSearchTreeDemo,
  llmSystemConnections,
  llmSystemLayers,
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

describe("localized data accessors", () => {
  it("keeps Chinese default exports backward-compatible", () => {
    expect(getRagPipelineDemo().title).toBe("RAG：大模型如何连接外部知识？");

    expect(getRagPipelineDemo()).toEqual(ragPipelineDemo);
    expect(getAttentionMapDemo()).toEqual(attentionMapDemo);
    expect(getAgentLoopDemo()).toEqual(agentLoopDemo);
    expect(getSearchTreeDemo()).toEqual(searchTreeDemo);
    expect(getExpertSystemDemo()).toEqual(expertSystemDemo);
    expect(getBayesUpdateDemo()).toEqual(bayesUpdateDemo);
    expect(getDecisionBoundaryDemo()).toEqual(decisionBoundaryDemo);
    expect(getCnnKernelDemo()).toEqual(cnnKernelDemo);
    expect(getAiTimelineEntries()).toEqual(aiTimelineEntries);
    expect(getAiLineageNodes()).toEqual(aiLineageNodes);
    expect(getAiLineageEdges()).toEqual(aiLineageEdges);
    expect(getLlmSystemLayers()).toEqual(llmSystemLayers);
    expect(getLlmSystemConnections()).toEqual(llmSystemConnections);
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
    expect(getAiTimelineEntries("en")[0]?.demoLabel).toBe(
      "View Demo 01: Search",
    );
    expect(getAiLineageNodes("en")[0]?.label).toBe("Symbolic AI");
    expect(getAiLineageNodes("en")[0]?.group).toBe("symbolic");
  });

  it("provides complete English copy without Chinese text", () => {
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

    expect(JSON.stringify(englishValues)).not.toMatch(/[\u3400-\u9fff]/u);
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
      entries.map(({ id, year, demoHref }) => ({ id, year, demoHref }));
    expect(projectTimeline(getAiTimelineEntries("en"))).toEqual(
      projectTimeline(getAiTimelineEntries("zh-CN")),
    );

    const projectNodes = (nodes: typeof aiLineageNodes) =>
      nodes.map(({ id, group, x, y, href }) => ({ id, group, x, y, href }));
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
    expect(getLlmSystemConnections("en").map(({ id }) => id)).toEqual(
      getLlmSystemConnections("zh-CN").map(({ id }) => id),
    );
  });
});
