import type { DemoChapterId } from "../chapters";
import { cloneData, defaultLocale, type Locale } from "../locales";

const diagramAssetDefinitions = [
  {
    id: "search-tree",
    chapterId: "search",
    stateId: "astar-goal-route",
    nodeIds: ["node-start", "node-a", "node-b", "node-c", "node-goal"],
    arrowIds: ["arrow-start-b", "arrow-b-c", "arrow-c-goal"],
  },
  {
    id: "expert-system",
    chapterId: "expert-system",
    stateId: "rule-conflict",
    nodeIds: ["node-facts", "node-rule-a", "node-rule-b", "node-conflict"],
    arrowIds: ["arrow-facts-rules", "arrow-rules-conflict"],
  },
  {
    id: "bayes-update",
    chapterId: "bayes",
    stateId: "posterior-raised",
    nodeIds: ["node-prior", "node-evidence", "node-posterior"],
    arrowIds: ["arrow-prior-update", "arrow-evidence-update"],
  },
  {
    id: "decision-boundary",
    chapterId: "decision-boundary",
    stateId: "nonlinear-boundary",
    nodeIds: ["node-negative-cluster", "node-positive-cluster", "node-outlier"],
    arrowIds: ["arrow-data-boundary"],
  },
  {
    id: "cnn-kernel",
    chapterId: "cnn",
    stateId: "edge-kernel-center",
    nodeIds: ["node-image-grid", "node-edge-kernel", "node-feature-map"],
    arrowIds: ["arrow-image-kernel", "arrow-kernel-feature"],
  },
  {
    id: "attention-map",
    chapterId: "attention",
    stateId: "selected-token-links",
    nodeIds: ["node-token-model", "node-token-directly", "node-token-context"],
    arrowIds: ["arrow-model-directly", "arrow-model-context"],
  },
  {
    id: "llm-system",
    chapterId: "llm-system",
    stateId: "verified-action-path",
    nodeIds: [
      "node-task",
      "node-context",
      "node-model",
      "node-memory",
      "node-retrieval",
      "node-tools",
      "node-eval",
      "node-result",
    ],
    arrowIds: [
      "arrow-task-context",
      "arrow-memory-context",
      "arrow-retrieval-context",
      "arrow-context-model",
      "arrow-model-eval",
      "arrow-model-tools",
      "arrow-tools-eval",
      "arrow-eval-result",
    ],
  },
  {
    id: "rag-pipeline",
    chapterId: "rag",
    stateId: "grounded-answer",
    nodeIds: [
      "node-query",
      "node-embedding",
      "node-vector-db",
      "node-reranker",
      "node-prompt",
      "node-llm",
      "node-answer",
    ],
    arrowIds: [
      "arrow-query-embedding",
      "arrow-embedding-vector-db",
      "arrow-vector-db-reranker",
      "arrow-reranker-prompt",
      "arrow-prompt-llm",
      "arrow-llm-answer",
    ],
  },
  {
    id: "agent-loop",
    chapterId: "agent",
    stateId: "retry-after-tool-failure",
    nodeIds: [
      "node-plan",
      "node-tool",
      "node-observe",
      "node-revise",
      "node-final",
    ],
    arrowIds: [
      "arrow-plan-tool",
      "arrow-tool-observe",
      "arrow-observe-revise",
      "arrow-revise-tool",
      "arrow-observe-final",
    ],
  },
  {
    id: "safety-eval",
    chapterId: "safety",
    stateId: "risk-fixed-regression",
    nodeIds: [
      "node-red-team",
      "node-guardrail",
      "node-permission",
      "node-review",
      "node-regression",
      "node-release",
    ],
    arrowIds: [
      "arrow-red-team-guardrail",
      "arrow-guardrail-permission",
      "arrow-permission-review",
      "arrow-review-regression",
      "arrow-regression-release",
    ],
  },
] as const satisfies readonly {
  id: string;
  chapterId: DemoChapterId;
  stateId: string;
  nodeIds: readonly `node-${string}`[];
  arrowIds: readonly `arrow-${string}`[];
}[];

export type DiagramAssetId = (typeof diagramAssetDefinitions)[number]["id"];

interface DiagramAssetCopy {
  title: string;
  stateLabel: string;
  simplificationNote: string;
}

const localizedDiagramAssetCopy = {
  "zh-CN": {
    "search-tree": {
      title: "搜索树：A* 找到目标路径",
      stateLabel: "A* 以启发式代价选择通往 Goal 的 frontier",
      simplificationNote:
        "只展示一棵固定小树和单位边成本，用于比较展开顺序，不代表真实搜索空间规模。",
    },
    "expert-system": {
      title: "专家系统：规则冲突",
      stateLabel: "同一组事实同时触发两个互斥结论",
      simplificationNote:
        "规则、事实与冲突均为教学预设，不包含真实医疗或业务决策。",
    },
    "bayes-update": {
      title: "Bayes：证据提高后验信念",
      stateLabel: "支持性证据把后验从 30% 推高到 70%",
      simplificationNote: "百分比经过简化，只解释先验、证据与后验的方向关系。",
    },
    "decision-boundary": {
      title: "决策边界：非线性分隔",
      stateLabel: "曲线边界适应两组样本并避开离群点",
      simplificationNote:
        "二维点和边界是手工绘制的示意，不来自训练过程或真实数据。",
    },
    "cnn-kernel": {
      title: "CNN：边缘卷积核生成特征图",
      stateLabel: "3×3 edge kernel 扫描中心窗口",
      simplificationNote:
        "使用单通道 5×5 网格和一个固定卷积核，省略训练、偏置与多层组合。",
    },
    "attention-map": {
      title: "Attention：token 直接连接",
      stateLabel: "选中 model，显示它对 directly 与 context 的权重",
      simplificationNote:
        "连线粗细是预设权重，只解释直接信息路径，不是模型真实 attention。",
    },
    "llm-system": {
      title: "LLM 系统：按任务组合外部边界",
      stateLabel: "恢复任务状态后，经受控工具执行并由 Eval 核验结果",
      simplificationNote:
        "组件、状态、动作和检查结果均为预设；图解不调用真实模型、记忆、工具或评估服务。",
    },
    "rag-pipeline": {
      title: "RAG：从查询到可追溯答案",
      stateLabel: "检索证据经过重排并进入带引用的回答",
      simplificationNote:
        "流程节点与答案均为预设，不调用向量数据库、重排器或大模型。",
    },
    "agent-loop": {
      title: "Agent：工具失败后的修正循环",
      stateLabel: "Observation 失败后进入 Revise，再次调用工具",
      simplificationNote:
        "工具结果和重试路径均为脚本化状态，不执行真实外部动作。",
    },
    "safety-eval": {
      title: "Safety / Eval：失败进入回归发布门",
      stateLabel: "RT-017 修复后通过，旧版本继续被阻断",
      simplificationNote:
        "只展示一个间接提示注入案例；通过该回归用例不代表系统消除了全部风险。",
    },
  },
  en: {
    "search-tree": {
      title: "Search Tree: A* Reaches The Goal",
      stateLabel: "A* uses heuristic cost to choose the frontier toward Goal",
      simplificationNote:
        "A fixed small tree with unit edge costs illustrates expansion order, not the scale of a real search space.",
    },
    "expert-system": {
      title: "Expert System: Rule Conflict",
      stateLabel: "The same facts trigger two incompatible conclusions",
      simplificationNote:
        "Rules, facts, and the conflict are scripted for teaching and do not represent a real medical or business decision.",
    },
    "bayes-update": {
      title: "Bayes: Evidence Raises The Posterior",
      stateLabel:
        "Supporting evidence moves belief from a 30% prior to a 70% posterior",
      simplificationNote:
        "The percentages are simplified to explain the direction among prior, evidence, and posterior.",
    },
    "decision-boundary": {
      title: "Decision Boundary: Nonlinear Separation",
      stateLabel: "A curved boundary fits two groups while avoiding an outlier",
      simplificationNote:
        "The two-dimensional points and boundary are hand-authored, not produced by training on real data.",
    },
    "cnn-kernel": {
      title: "CNN: An Edge Kernel Produces A Feature Map",
      stateLabel: "A 3×3 edge kernel scans the center window",
      simplificationNote:
        "A single-channel 5×5 grid and fixed kernel omit training, bias, and deeper layers.",
    },
    "attention-map": {
      title: "Attention: Direct Token Connections",
      stateLabel: "Selecting model reveals weights to directly and context",
      simplificationNote:
        "Line thickness uses scripted weights to explain direct information paths, not real model attention.",
    },
    "llm-system": {
      title: "LLM System: Compose External Boundaries By Task",
      stateLabel:
        "Restored task state flows through a controlled tool and result evaluation",
      simplificationNote:
        "Components, state, actions, and checks are scripted; no real model, memory, tool, or evaluator is called.",
    },
    "rag-pipeline": {
      title: "RAG: From Query To Traceable Answer",
      stateLabel:
        "Retrieved evidence is reranked and enters an answer with citations",
      simplificationNote:
        "The nodes and answer are scripted; no vector database, reranker, or model is called.",
    },
    "agent-loop": {
      title: "Agent: Revising After A Tool Failure",
      stateLabel: "A failed observation enters Revise before the tool retry",
      simplificationNote:
        "Tool results and retry paths are scripted, with no real external action.",
    },
    "safety-eval": {
      title: "Safety / Eval: A Failure Enters The Release Gate",
      stateLabel: "The RT-017 fix passes while the old version remains blocked",
      simplificationNote:
        "One indirect prompt-injection case is shown; passing it does not prove that every system risk is gone.",
    },
  },
} satisfies Record<Locale, Record<DiagramAssetId, DiagramAssetCopy>>;

export interface DiagramAsset {
  id: DiagramAssetId;
  chapterId: DemoChapterId;
  title: string;
  stateId: string;
  stateLabel: string;
  svgPath: `/diagrams/${string}.svg`;
  pngPath: `/diagrams/previews/${string}.png`;
  stableIds: {
    nodes: string[];
    arrows: string[];
  };
  version: string;
  updatedAt: string;
  license: "MIT";
  simplificationNote: string;
}

export function getDiagramAssets(
  locale: Locale = defaultLocale,
): DiagramAsset[] {
  const copy =
    localizedDiagramAssetCopy[locale] ??
    localizedDiagramAssetCopy[defaultLocale];

  return cloneData(
    diagramAssetDefinitions.map((asset) => ({
      id: asset.id,
      chapterId: asset.chapterId,
      title: copy[asset.id].title,
      stateId: asset.stateId,
      stateLabel: copy[asset.id].stateLabel,
      svgPath: `/diagrams/${asset.id}.svg` as const,
      pngPath: `/diagrams/previews/${asset.id}.png` as const,
      stableIds: {
        nodes: [...asset.nodeIds],
        arrows: [...asset.arrowIds],
      },
      version: asset.id === "llm-system" ? "1.3.0" : "1.1.0",
      updatedAt: asset.id === "llm-system" ? "2026-07-29" : "2026-07-25",
      license: "MIT" as const,
      simplificationNote: copy[asset.id].simplificationNote,
    })),
  );
}

export const diagramAssets = getDiagramAssets();
