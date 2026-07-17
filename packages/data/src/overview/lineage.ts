import {
  chapterRegistry,
  type ChapterDefinition,
  type ChapterId,
} from "../chapters";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

type LineageChapterId = Exclude<ChapterId, "overview">;

export interface LineageNode {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  description: string;
  chapterId?: LineageChapterId;
}

export interface LineageEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

type LineageNodeCopy = Omit<LineageNode, "id" | "chapterId">;

const localizedLineageChapterNodeCopy = {
  "zh-CN": {
    search: {
      label: "符号主义",
      group: "symbolic",
      x: 40,
      y: 90,
      description: "规则、逻辑、搜索和规划把智能看作可操作的符号结构。",
    },
    "expert-system": {
      label: "专家系统",
      group: "symbolic",
      x: 210,
      y: 90,
      description: "把领域知识写成规则库，强调可解释推理。",
    },
    bayes: {
      label: "统计学习",
      group: "statistical",
      x: 210,
      y: 300,
      description: "用概率和数据描述不确定性，并从样本中学习规律。",
    },
    "decision-boundary": {
      label: "经典机器学习",
      group: "statistical",
      x: 390,
      y: 300,
      description: "用特征、目标函数和样本学习可泛化的决策边界。",
    },
    cnn: {
      label: "神经网络",
      group: "neural",
      x: 570,
      y: 300,
      description: "用可学习表示和多层组合处理感知任务。",
    },
    attention: {
      label: "Transformer",
      group: "foundation",
      x: 750,
      y: 190,
      description: "Attention 让 token 直接互相关注，支撑基础模型扩展。",
    },
    "llm-system": {
      label: "LLM 系统",
      group: "foundation",
      x: 930,
      y: 280,
      description: "把模型、上下文、工具、记忆和评估组合成现代 AI 应用。",
    },
    rag: {
      label: "RAG",
      group: "foundation",
      x: 930,
      y: 80,
      description: "把外部知识检索进上下文，提高事实性与可更新性。",
    },
    agent: {
      label: "Agent",
      group: "agent",
      x: 1090,
      y: 280,
      description: "把模型放进计划、工具、观察和修正循环。",
    },
  },
  en: {
    search: {
      label: "Symbolic AI",
      group: "symbolic",
      x: 40,
      y: 90,
      description:
        "Rules, logic, search, and planning treat intelligence as manipulable symbolic structures.",
    },
    "expert-system": {
      label: "Expert Systems",
      group: "symbolic",
      x: 210,
      y: 90,
      description:
        "Domain knowledge is written as a rule base with an emphasis on explainable reasoning.",
    },
    bayes: {
      label: "Statistical Learning",
      group: "statistical",
      x: 210,
      y: 300,
      description:
        "Probability and data describe uncertainty, and patterns are learned from examples.",
    },
    "decision-boundary": {
      label: "Classical ML",
      group: "statistical",
      x: 390,
      y: 300,
      description:
        "Features, objectives, and examples are used to learn decision boundaries that generalize.",
    },
    cnn: {
      label: "Neural Networks",
      group: "neural",
      x: 570,
      y: 300,
      description:
        "Learned representations and layered composition handle perception tasks.",
    },
    attention: {
      label: "Transformer",
      group: "foundation",
      x: 750,
      y: 190,
      description:
        "Attention lets tokens attend to each other directly, supporting the scaling of foundation models.",
    },
    "llm-system": {
      label: "LLM Systems",
      group: "foundation",
      x: 930,
      y: 280,
      description:
        "Models, context, tools, memory, and evaluation combine into modern AI applications.",
    },
    rag: {
      label: "RAG",
      group: "foundation",
      x: 930,
      y: 80,
      description:
        "External knowledge is retrieved into context to improve factuality and freshness.",
    },
    agent: {
      label: "Agent",
      group: "agent",
      x: 1090,
      y: 280,
      description:
        "The model enters a loop of planning, tools, observation, and revision.",
    },
  },
} satisfies Record<Locale, Record<LineageChapterId, LineageNodeCopy>>;

const localizedSafetyNode = {
  "zh-CN": {
    id: "safety",
    label: "Safety / Eval",
    group: "safety",
    x: 750,
    y: 430,
    description: "评估可靠性、偏差、工具安全和多步任务风险。",
  },
  en: {
    id: "safety",
    label: "Safety / Eval",
    group: "safety",
    x: 750,
    y: 430,
    description:
      "Evaluation covers reliability, bias, tool safety, and risks in multi-step tasks.",
  },
} satisfies Record<Locale, LineageNode>;

const localizedLineageEdges = {
  "zh-CN": [
    {
      id: "symbolic-expert",
      from: "symbolic",
      to: "expert",
      label: "知识工程",
    },
    {
      id: "symbolic-statistical",
      from: "symbolic",
      to: "statistical",
      label: "从规则到数据",
    },
    {
      id: "statistical-neural",
      from: "statistical",
      to: "classical-ml",
      label: "学习决策边界",
    },
    {
      id: "classical-ml-neural",
      from: "classical-ml",
      to: "neural",
      label: "表示学习",
    },
    {
      id: "neural-transformer",
      from: "neural",
      to: "transformer",
      label: "序列建模",
    },
    {
      id: "transformer-llm-system",
      from: "transformer",
      to: "llm-system",
      label: "基础模型应用化",
    },
    {
      id: "llm-system-rag",
      from: "llm-system",
      to: "rag",
      label: "连接外部知识",
    },
    {
      id: "llm-system-agent",
      from: "llm-system",
      to: "agent",
      label: "工具与循环",
    },
    {
      id: "agent-safety",
      from: "agent",
      to: "safety",
      label: "可靠性评估",
    },
  ],
  en: [
    {
      id: "symbolic-expert",
      from: "symbolic",
      to: "expert",
      label: "Knowledge engineering",
    },
    {
      id: "symbolic-statistical",
      from: "symbolic",
      to: "statistical",
      label: "From rules to data",
    },
    {
      id: "statistical-neural",
      from: "statistical",
      to: "classical-ml",
      label: "Learning boundaries",
    },
    {
      id: "classical-ml-neural",
      from: "classical-ml",
      to: "neural",
      label: "Representation learning",
    },
    {
      id: "neural-transformer",
      from: "neural",
      to: "transformer",
      label: "Sequence modeling",
    },
    {
      id: "transformer-llm-system",
      from: "transformer",
      to: "llm-system",
      label: "Foundation model applications",
    },
    {
      id: "llm-system-rag",
      from: "llm-system",
      to: "rag",
      label: "Connecting external knowledge",
    },
    {
      id: "llm-system-agent",
      from: "llm-system",
      to: "agent",
      label: "Tools and loops",
    },
    {
      id: "agent-safety",
      from: "agent",
      to: "safety",
      label: "Reliability evaluation",
    },
  ],
} satisfies Record<Locale, LineageEdge[]>;

function hasLineageNode(
  chapter: ChapterDefinition,
): chapter is ChapterDefinition & {
  id: LineageChapterId;
  lineageNodeId: string;
} {
  return chapter.id !== "overview" && Boolean(chapter.lineageNodeId);
}

export function getAiLineageNodes(
  locale: Locale = defaultLocale,
): LineageNode[] {
  const localizedCopy = getLocalizedValue(
    localizedLineageChapterNodeCopy,
    locale,
  );
  const chapterNodes = chapterRegistry
    .filter(hasLineageNode)
    .map((chapter): LineageNode => ({
      id: chapter.lineageNodeId,
      chapterId: chapter.id,
      ...localizedCopy[chapter.id],
    }));

  return [...chapterNodes, getLocalizedValue(localizedSafetyNode, locale)];
}

export function getAiLineageEdges(
  locale: Locale = defaultLocale,
): LineageEdge[] {
  return getLocalizedValue(localizedLineageEdges, locale);
}

export const aiLineageNodes = getAiLineageNodes();
export const aiLineageEdges = getAiLineageEdges();
