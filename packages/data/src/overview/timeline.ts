export interface TimelineEntry {
  id: string;
  era: string;
  year: string;
  title: string;
  summary: string;
  demoHref?: string;
  demoLabel?: string;
}

export const aiTimelineEntries: TimelineEntry[] = [
  {
    id: "symbolic-search",
    era: "规则与搜索",
    year: "1950s-1960s",
    title: "符号主义与搜索",
    summary: "早期 AI 把智能看作在明确规则空间中搜索解答，奠定了规划、博弈和路径搜索的基础。",
    demoHref: "/chapters/search/",
    demoLabel: "查看搜索 demo"
  },
  {
    id: "expert-systems",
    era: "知识工程",
    year: "1970s-1980s",
    title: "专家系统",
    summary: "专家知识被写成 if-then 规则，系统可解释，但知识获取和例外维护成为瓶颈。",
    demoHref: "/chapters/expert-system/",
    demoLabel: "查看专家系统 demo"
  },
  {
    id: "bayes-statistics",
    era: "概率与统计",
    year: "1980s-1990s",
    title: "Bayes 与统计学习",
    summary: "AI 从确定规则转向不确定性建模，用证据更新信念，并逐步走向数据驱动学习。",
    demoHref: "/chapters/bayes/",
    demoLabel: "查看 Bayes demo"
  },
  {
    id: "deep-cnn",
    era: "深度学习",
    year: "1990s-2010s",
    title: "CNN 与深度视觉",
    summary: "卷积网络通过局部感受野和参数共享，从边缘、纹理到形状逐层组合视觉特征。",
    demoHref: "/chapters/cnn/",
    demoLabel: "查看 CNN demo"
  },
  {
    id: "transformer",
    era: "基础模型前夜",
    year: "2017",
    title: "Transformer",
    summary: "Attention 让 token 之间建立直接连接，成为大规模语言模型和多模态模型的关键架构。",
    demoHref: "/chapters/attention/",
    demoLabel: "查看 Attention demo"
  },
  {
    id: "llm-rag",
    era: "现代 AI 系统",
    year: "2020s",
    title: "LLM 与 RAG",
    summary: "大模型具备强生成能力，但仍需要外部知识、检索和引用来提升事实性与可更新性。",
    demoHref: "/chapters/rag/",
    demoLabel: "查看 RAG demo"
  },
  {
    id: "agent-loop",
    era: "Agentic AI",
    year: "2020s",
    title: "Agent",
    summary: "LLM 被放进计划、工具调用、观察和修正循环，开始执行多步任务而不只是一次性回答。",
    demoHref: "/chapters/agent/",
    demoLabel: "查看 Agent demo"
  }
];
