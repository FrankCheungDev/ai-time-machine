import type { Locale } from "../locales";

export const timelinePageCopy = {
  "zh-CN": {
    title: "AI 技术演化总览时间线",
    description: "按时间理解 AI 技术从符号主义到 Agent 的演化脉络。",
    eyebrow: "Overview",
    heading: "AI 技术演化总览时间线",
    lede: "这条时间线不是论文清单，而是把每个阶段的核心问题、技术转向和对应 demo 放在一条主线上。",
    listAriaLabel: "AI 技术演化事件",
  },
  en: {
    title: "AI Evolution Timeline",
    description:
      "Understand how AI evolved from symbolic systems to agents over time.",
    eyebrow: "Overview",
    heading: "AI Evolution Timeline",
    lede: "This timeline is not a paper list. It places each era's core problem, technical shift, and matching demo on one learning path.",
    listAriaLabel: "AI technical evolution events",
  },
} satisfies Record<Locale, Record<string, string>>;

export const timelineActionLabel = {
  "zh-CN": (chapterLabel: string, chapterTitle: string) =>
    `查看 ${chapterLabel}：${chapterTitle}`,
  en: (chapterLabel: string, chapterTitle: string) =>
    `View ${chapterLabel}: ${chapterTitle}`,
} satisfies Record<
  Locale,
  (chapterLabel: string, chapterTitle: string) => string
>;

export const lineagePageCopy = {
  "zh-CN": {
    title: "AI 技术谱系图",
    description:
      "按范式理解符号主义、统计学习、神经网络、基础模型、RAG 与 Agent 的关系。",
    eyebrow: "Paradigm Map",
    heading: "AI 技术谱系图",
    lede: "同一项技术往往不是突然出现，而是在旧问题和新约束之间迁移。谱系图帮助你看到范式之间的继承关系。",
    viewControlsAriaLabel: "谱系图显示模式",
    panelAriaLabel: "AI 技术谱系 SVG 图，可适配屏幕或横向滚动查看完整图解",
    svgTitle: "AI 技术谱系图",
    notesEyebrow: "阅读方式",
    notesHeading: "先看范式，再看 demo",
    notesBody:
      "从左到右看，你会看到 AI 从规则与搜索走向统计学习，再走向神经网络与基础模型。RAG 和 Agent 不是孤立应用，而是现代模型连接知识、工具和任务循环的系统化结果。",
    nodeAriaSeparator: "：",
  },
  en: {
    title: "AI Technical Lineage",
    description:
      "Understand the relationships among symbolic AI, statistical learning, neural networks, foundation models, RAG, and agents by paradigm.",
    eyebrow: "Paradigm Map",
    heading: "AI Technical Lineage",
    lede: "Technologies rarely appear from nowhere. They migrate between old problems and new constraints. This lineage map reveals how AI paradigms inherit from one another.",
    viewControlsAriaLabel: "Lineage map display mode",
    panelAriaLabel:
      "AI technical lineage SVG, which can fit the screen or scroll horizontally for the full diagram",
    svgTitle: "AI Technical Lineage",
    notesEyebrow: "How To Read",
    notesHeading: "Start With Paradigms, Then Explore Demos",
    notesBody:
      "From left to right, AI moves from rules and search to statistical learning, then to neural networks and foundation models. RAG and agents are not isolated applications; they are systematic ways for modern models to connect knowledge, tools, and task loops.",
    nodeAriaSeparator: ": ",
  },
} satisfies Record<Locale, Record<string, string>>;

export const lineageGroupLabels = {
  "zh-CN": {
    agent: "智能体 / agent",
    foundation: "基础模型 / foundation",
    neural: "神经 / neural",
    safety: "安全评估 / safety",
    statistical: "统计 / statistical",
    symbolic: "符号 / symbolic",
  },
  en: {
    agent: "agent",
    foundation: "foundation model",
    neural: "neural",
    safety: "safety / evaluation",
    statistical: "statistical",
    symbolic: "symbolic",
  },
} satisfies Record<Locale, Record<string, string>>;
