import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

export interface LineageNode {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  description: string;
  href?: string;
}

export interface LineageEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

const localizedLineageNodes = {
  "zh-CN": [
    {
      id: "symbolic",
      label: "符号主义",
      group: "symbolic",
      x: 60,
      y: 110,
      description: "规则、逻辑、搜索和规划把智能看作可操作的符号结构。",
      href: "/chapters/search/",
    },
    {
      id: "expert",
      label: "专家系统",
      group: "symbolic",
      x: 245,
      y: 110,
      description: "把领域知识写成规则库，强调可解释推理。",
      href: "/chapters/expert-system/",
    },
    {
      id: "statistical",
      label: "统计学习",
      group: "statistical",
      x: 245,
      y: 285,
      description: "用概率和数据描述不确定性，从样本中学习边界。",
      href: "/chapters/bayes/",
    },
    {
      id: "neural",
      label: "神经网络",
      group: "neural",
      x: 430,
      y: 285,
      description: "用可学习表示和多层组合处理感知任务。",
      href: "/chapters/cnn/",
    },
    {
      id: "transformer",
      label: "Transformer",
      group: "foundation",
      x: 615,
      y: 185,
      description: "Attention 让 token 直接互相关注，支撑基础模型扩展。",
      href: "/chapters/attention/",
    },
    {
      id: "rag",
      label: "RAG",
      group: "foundation",
      x: 800,
      y: 90,
      description: "把外部知识检索进上下文，提高事实性与可更新性。",
      href: "/chapters/rag/",
    },
    {
      id: "llm-system",
      label: "LLM 系统",
      group: "foundation",
      x: 800,
      y: 265,
      description: "把模型、上下文、工具、记忆和评估组合成现代 AI 应用。",
      href: "/chapters/llm-system/",
    },
    {
      id: "agent",
      label: "Agent",
      group: "agent",
      x: 970,
      y: 265,
      description: "把模型放进计划、工具、观察和修正循环。",
      href: "/chapters/agent/",
    },
    {
      id: "safety",
      label: "Safety / Eval",
      group: "safety",
      x: 615,
      y: 380,
      description: "评估可靠性、偏差、工具安全和多步任务风险。",
    },
  ],
  en: [
    {
      id: "symbolic",
      label: "Symbolic AI",
      group: "symbolic",
      x: 60,
      y: 110,
      description:
        "Rules, logic, search, and planning treat intelligence as manipulable symbolic structures.",
      href: "/chapters/search/",
    },
    {
      id: "expert",
      label: "Expert Systems",
      group: "symbolic",
      x: 245,
      y: 110,
      description:
        "Domain knowledge is written as a rule base with an emphasis on explainable reasoning.",
      href: "/chapters/expert-system/",
    },
    {
      id: "statistical",
      label: "Statistical Learning",
      group: "statistical",
      x: 245,
      y: 285,
      description:
        "Probability and data describe uncertainty, and boundaries are learned from examples.",
      href: "/chapters/bayes/",
    },
    {
      id: "neural",
      label: "Neural Networks",
      group: "neural",
      x: 430,
      y: 285,
      description:
        "Learned representations and layered composition handle perception tasks.",
      href: "/chapters/cnn/",
    },
    {
      id: "transformer",
      label: "Transformer",
      group: "foundation",
      x: 615,
      y: 185,
      description:
        "Attention lets tokens attend to each other directly, supporting the scaling of foundation models.",
      href: "/chapters/attention/",
    },
    {
      id: "rag",
      label: "RAG",
      group: "foundation",
      x: 800,
      y: 90,
      description:
        "External knowledge is retrieved into context to improve factuality and freshness.",
      href: "/chapters/rag/",
    },
    {
      id: "llm-system",
      label: "LLM Systems",
      group: "foundation",
      x: 800,
      y: 265,
      description:
        "Models, context, tools, memory, and evaluation combine into modern AI applications.",
      href: "/chapters/llm-system/",
    },
    {
      id: "agent",
      label: "Agent",
      group: "agent",
      x: 970,
      y: 265,
      description:
        "The model enters a loop of planning, tools, observation, and revision.",
      href: "/chapters/agent/",
    },
    {
      id: "safety",
      label: "Safety / Eval",
      group: "safety",
      x: 615,
      y: 380,
      description:
        "Evaluation covers reliability, bias, tool safety, and risks in multi-step tasks.",
    },
  ],
} satisfies Record<Locale, LineageNode[]>;

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

export function getAiLineageNodes(
  locale: Locale = defaultLocale,
): LineageNode[] {
  return getLocalizedValue(localizedLineageNodes, locale);
}

export function getAiLineageEdges(
  locale: Locale = defaultLocale,
): LineageEdge[] {
  return getLocalizedValue(localizedLineageEdges, locale);
}

export const aiLineageNodes = getAiLineageNodes();
export const aiLineageEdges = getAiLineageEdges();
