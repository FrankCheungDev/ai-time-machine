import type { Locale } from "../locales";

export const overviewChapterCopy = {
  "zh-CN": {
    title: "总览：AI 为什么不是突然变成大模型的？",
    description:
      "沿着规则搜索、知识工程、概率统计、深度学习、Transformer、基础模型训练、RAG 与 Agent，理解现代 AI 系统如何逐步形成。",
    eyebrow: "Chapter 00",
    heading: "总览：AI 为什么不是突然变成大模型的？",
    lede: "AI 的主线不是一个模型突然出现，而是规则搜索、知识工程、概率统计、表示学习、Transformer、预训练与后训练、RAG 与 Agent 不断回应前一阶段瓶颈的结果。",
    question: "AI 为什么不是突然变成大模型的？",
    spineEyebrow: "历史主线",
    spineHeading: "从规则到系统",
    readingEyebrow: "阅读方式",
    readingHeading: "每章看四件事",
    simplificationHeading: "这是一张学习地图，不是完整 AI 百科",
    simplificationBody:
      "总览章节刻意保留主线和代表性技术，省略大量分支、人物、论文和工程细节。后续章节会用交互 demo 展开每个阶段的一个核心机制直觉。",
  },
  en: {
    title: "Overview: Why did AI not suddenly become large models?",
    description:
      "Follow rules and search, knowledge engineering, probability, deep learning, Transformers, foundation-model training, RAG, and agents to see how modern AI systems emerged.",
    eyebrow: "Chapter 00",
    heading: "Overview: Why did AI not suddenly become large models?",
    lede: "AI's main thread is not the sudden appearance of one model. It is the result of rules and search, knowledge engineering, probability and statistics, representation learning, Transformer, pretraining and post-training, RAG, and agents repeatedly addressing earlier bottlenecks.",
    question: "Why did AI not suddenly become large models?",
    spineEyebrow: "Historical Spine",
    spineHeading: "From Rules To Systems",
    readingEyebrow: "How To Read",
    readingHeading: "Four Things To Notice In Every Chapter",
    simplificationHeading:
      "This Is A Learning Map, Not A Complete AI Encyclopedia",
    simplificationBody:
      "The overview deliberately keeps the main thread and representative technologies while omitting many branches, people, papers, and engineering details. Later chapters use interactive demos to develop one core mechanism intuition for each era.",
  },
} satisfies Record<Locale, Record<string, string>>;

interface OverviewSpineCard {
  label: string;
  title: string;
  description: string;
}

export const overviewSpineCards = {
  "zh-CN": [
    {
      label: "规则与知识",
      title: "可解释，但难扩展",
      description:
        "搜索和专家系统证明规则能表达推理，也暴露出组合爆炸和例外维护问题。",
    },
    {
      label: "数据与表示",
      title: "能学习，但依赖样本",
      description:
        "统计学习和神经网络把问题转向数据、特征和表示，让模型从样本中归纳。",
    },
    {
      label: "基础模型与系统",
      title: "能力强，但需要外部结构",
      description:
        "Transformer 支撑规模化预训练，后训练塑造协作行为；RAG、工具、记忆和评估再把模型组织成现代 AI 系统。",
    },
  ],
  en: [
    {
      label: "Rules And Knowledge",
      title: "Explainable, But Hard To Scale",
      description:
        "Search and expert systems showed that rules can express reasoning, while exposing combinatorial explosion and the cost of maintaining exceptions.",
    },
    {
      label: "Data And Representation",
      title: "Able To Learn, But Dependent On Examples",
      description:
        "Statistical learning and neural networks shifted the problem toward data, features, and representations, allowing models to generalize from examples.",
    },
    {
      label: "Foundation Models And Systems",
      title: "Powerful, But In Need Of External Structure",
      description:
        "Transformers support scaled pretraining and post-training shapes cooperative behavior; RAG, tools, memory, and evaluation then organize models into modern AI systems.",
    },
  ],
} satisfies Record<Locale, OverviewSpineCard[]>;

interface OverviewReadingItem {
  label: string;
  title: string;
  description: string;
}

export const overviewReadingItems = {
  "zh-CN": [
    {
      label: "之前的问题",
      title: "上一阶段为什么不够用？",
      description: "先理解瓶颈，再看新技术为什么出现。",
    },
    {
      label: "交互图解",
      title: "用一个动作拿到一个直觉",
      description:
        "每个 demo 都只讲一个核心 aha moment，避免把真实系统复杂度塞进入门解释。",
    },
    {
      label: "遗留问题",
      title: "新技术解决了什么，又留下什么？",
      description:
        "RAG、Agent 和评估不是终点，而是继续回应事实性、可控性和可靠性问题。",
    },
  ],
  en: [
    {
      label: "Earlier Problem",
      title: "Why Was The Previous Stage Not Enough?",
      description:
        "Understand the bottleneck first, then see why a new technology appeared.",
    },
    {
      label: "Interactive Diagram",
      title: "Use One Action To Gain One Intuition",
      description:
        "Each demo teaches one core aha moment instead of packing real-system complexity into an introductory explanation.",
    },
    {
      label: "Remaining Problem",
      title: "What Did The New Technology Solve And Leave Behind?",
      description:
        "RAG, agents, and evaluation are not endpoints. They continue to address factuality, controllability, and reliability.",
    },
  ],
} satisfies Record<Locale, OverviewReadingItem[]>;

export const overviewReferences = [
  {
    href: "https://aima.cs.berkeley.edu/",
    label: "Artificial Intelligence: A Modern Approach",
  },
  {
    href: "https://www.deeplearningbook.org/",
    label: "Deep Learning",
  },
  {
    href: "https://arxiv.org/abs/1706.03762",
    label: "Attention Is All You Need",
  },
] as const;
