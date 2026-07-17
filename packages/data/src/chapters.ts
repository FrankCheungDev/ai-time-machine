import type { Locale } from "./locales";

export type ChapterKind = "chapter" | "demo";

interface ChapterDefinitionSource {
  id: string;
  route: `/chapters/${string}/`;
  kind: ChapterKind;
  number: `${number}`;
  shortTitle: Readonly<Record<Locale, string>>;
  timelineId?: string;
  lineageNodeId?: string;
}

const definitions = [
  {
    id: "overview",
    route: "/chapters/overview/",
    kind: "chapter",
    number: "00",
    shortTitle: { "zh-CN": "总览", en: "Overview" },
  },
  {
    id: "search",
    route: "/chapters/search/",
    kind: "demo",
    number: "01",
    shortTitle: { "zh-CN": "搜索树 / A*", en: "Search Trees / A*" },
    timelineId: "symbolic-search",
    lineageNodeId: "symbolic",
  },
  {
    id: "expert-system",
    route: "/chapters/expert-system/",
    kind: "demo",
    number: "02",
    shortTitle: {
      "zh-CN": "专家系统规则推理",
      en: "Expert System Rule Reasoning",
    },
    timelineId: "expert-systems",
    lineageNodeId: "expert",
  },
  {
    id: "bayes",
    route: "/chapters/bayes/",
    kind: "demo",
    number: "03",
    shortTitle: { "zh-CN": "贝叶斯更新", en: "Bayesian Updating" },
    timelineId: "bayes-statistics",
    lineageNodeId: "statistical",
  },
  {
    id: "decision-boundary",
    route: "/chapters/decision-boundary/",
    kind: "demo",
    number: "04",
    shortTitle: { "zh-CN": "决策边界", en: "Decision Boundaries" },
    timelineId: "classical-ml",
    lineageNodeId: "classical-ml",
  },
  {
    id: "cnn",
    route: "/chapters/cnn/",
    kind: "demo",
    number: "05",
    shortTitle: { "zh-CN": "CNN 卷积核", en: "CNN Kernels" },
    timelineId: "deep-cnn",
    lineageNodeId: "neural",
  },
  {
    id: "attention",
    route: "/chapters/attention/",
    kind: "demo",
    number: "06",
    shortTitle: { "zh-CN": "注意力机制", en: "Attention" },
    timelineId: "transformer",
    lineageNodeId: "transformer",
  },
  {
    id: "llm-system",
    route: "/chapters/llm-system/",
    kind: "chapter",
    number: "07",
    shortTitle: { "zh-CN": "LLM 系统地图", en: "LLM System Map" },
    timelineId: "llm-system",
    lineageNodeId: "llm-system",
  },
  {
    id: "rag",
    route: "/chapters/rag/",
    kind: "demo",
    number: "08",
    shortTitle: { "zh-CN": "RAG Pipeline", en: "RAG Pipeline" },
    timelineId: "rag",
    lineageNodeId: "rag",
  },
  {
    id: "agent",
    route: "/chapters/agent/",
    kind: "demo",
    number: "09",
    shortTitle: { "zh-CN": "Agent Loop", en: "Agent Loop" },
    timelineId: "agent-loop",
    lineageNodeId: "agent",
  },
] as const satisfies readonly ChapterDefinitionSource[];

export type ChapterId = (typeof definitions)[number]["id"];
export type DemoChapterId = Extract<
  (typeof definitions)[number],
  { kind: "demo" }
>["id"];
export type ChapterDefinition = (typeof definitions)[number];

export const chapterRegistry = Object.freeze(
  definitions.map((chapter) =>
    Object.freeze({
      ...chapter,
      shortTitle: Object.freeze({ ...chapter.shortTitle }),
    }),
  ),
) as readonly ChapterDefinition[];

const chaptersById = new Map<ChapterId, ChapterDefinition>(
  chapterRegistry.map((chapter) => [chapter.id, chapter]),
);

const chapterIds = new Set<string>(
  chapterRegistry.map((chapter) => chapter.id),
);

export function getChapterDefinition<Id extends ChapterId>(
  id: Id,
): Extract<ChapterDefinition, { id: Id }> {
  const chapter = chaptersById.get(id);

  if (!chapter) {
    throw new Error(`Unknown chapter: ${id}`);
  }

  return chapter as Extract<ChapterDefinition, { id: Id }>;
}

export function isChapterId(value: unknown): value is ChapterId {
  return typeof value === "string" && chapterIds.has(value);
}
