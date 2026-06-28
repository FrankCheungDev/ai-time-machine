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

export const aiLineageNodes: LineageNode[] = [
  {
    id: "symbolic",
    label: "符号主义",
    group: "symbolic",
    x: 86,
    y: 92,
    description: "规则、逻辑、搜索和规划把智能看作可操作的符号结构。",
    href: "/chapters/search/"
  },
  {
    id: "expert",
    label: "专家系统",
    group: "symbolic",
    x: 258,
    y: 92,
    description: "把领域知识写成规则库，强调可解释推理。",
    href: "/chapters/expert-system/"
  },
  {
    id: "statistical",
    label: "统计学习",
    group: "statistical",
    x: 258,
    y: 226,
    description: "用概率和数据描述不确定性，从样本中学习边界。",
    href: "/chapters/bayes/"
  },
  {
    id: "neural",
    label: "神经网络",
    group: "neural",
    x: 442,
    y: 226,
    description: "用可学习表示和多层组合处理感知任务。",
    href: "/chapters/cnn/"
  },
  {
    id: "transformer",
    label: "Transformer",
    group: "foundation",
    x: 626,
    y: 146,
    description: "Attention 让 token 直接互相关注，支撑基础模型扩展。",
    href: "/chapters/attention/"
  },
  {
    id: "rag",
    label: "RAG",
    group: "foundation",
    x: 802,
    y: 92,
    description: "把外部知识检索进上下文，提高事实性与可更新性。",
    href: "/chapters/rag/"
  },
  {
    id: "llm-system",
    label: "LLM 系统",
    group: "foundation",
    x: 708,
    y: 198,
    description: "把模型、上下文、工具、记忆和评估组合成现代 AI 应用。",
    href: "/chapters/llm-system/"
  },
  {
    id: "agent",
    label: "Agent",
    group: "agent",
    x: 884,
    y: 258,
    description: "把模型放进计划、工具、观察和修正循环。",
    href: "/chapters/agent/"
  },
  {
    id: "safety",
    label: "Safety / Eval",
    group: "safety",
    x: 626,
    y: 320,
    description: "评估可靠性、偏差、工具安全和多步任务风险。"
  }
];

export const aiLineageEdges: LineageEdge[] = [
  { id: "symbolic-expert", from: "symbolic", to: "expert", label: "知识工程" },
  { id: "symbolic-statistical", from: "symbolic", to: "statistical", label: "从规则到数据" },
  { id: "statistical-neural", from: "statistical", to: "neural", label: "表示学习" },
  { id: "neural-transformer", from: "neural", to: "transformer", label: "序列建模" },
  { id: "transformer-llm-system", from: "transformer", to: "llm-system", label: "基础模型应用化" },
  { id: "llm-system-rag", from: "llm-system", to: "rag", label: "连接外部知识" },
  { id: "llm-system-agent", from: "llm-system", to: "agent", label: "工具与循环" },
  { id: "agent-safety", from: "agent", to: "safety", label: "可靠性评估" }
];
