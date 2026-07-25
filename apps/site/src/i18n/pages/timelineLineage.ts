import type { Locale } from "../locales";
import type { TimelineEventType, TimelineSourceKind } from "@ai-history/data";

export interface TimelinePageCopy {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lede: string;
  chapterSpineEyebrow: string;
  chapterSpineHeading: (count: number) => string;
  listAriaLabel: string;
  eventsEyebrow: string;
  eventsHeading: (count: number) => string;
  eventsLede: string;
  eventsAriaLabel: string;
  impact: string;
  relatedChapters: string;
  relatedLineage: string;
  sources: string;
}

export const timelinePageCopy = {
  "zh-CN": {
    title: "AI 技术演化总览时间线",
    description:
      "沿章节主线与来源支持的关键事件，理解 AI 从符号主义到可靠生成系统的演化脉络。",
    eyebrow: "Overview",
    heading: "AI 技术演化总览时间线",
    lede: "先用章节主线建立时代框架，再用论文、系统、数据、算力与标准事件解释为什么技术会转向。事件经过选择，不追求收录完整。",
    chapterSpineEyebrow: "Chapter Spine",
    chapterSpineHeading: (count) => `${count} 个阶段构成学习主线`,
    listAriaLabel: "AI 技术演化章节主线",
    eventsEyebrow: "Source-backed Milestones",
    eventsHeading: (count) => `${count} 个事件解释关键转折`,
    eventsLede:
      "每个事件都关联章节、谱系节点和至少一份原始论文、专著、官方档案或标准。影响说明聚焦后续机制，不把单一事件写成唯一原因。",
    eventsAriaLabel: "有来源支持的 AI 历史事件",
    impact: "为什么重要",
    relatedChapters: "关联章节",
    relatedLineage: "关联谱系",
    sources: "原始来源",
  },
  en: {
    title: "AI Evolution Timeline",
    description:
      "Follow the chapter spine and source-backed milestones from symbolic AI to reliable generative systems.",
    eyebrow: "Overview",
    heading: "AI Evolution Timeline",
    lede: "Start with the chapter spine for an era-level frame, then use papers, systems, data, compute, and standards to explain why the field changed direction. The selection is representative, not exhaustive.",
    chapterSpineEyebrow: "Chapter Spine",
    chapterSpineHeading: (count) => `${count} Stages Form The Learning Path`,
    listAriaLabel: "AI evolution chapter spine",
    eventsEyebrow: "Source-backed Milestones",
    eventsHeading: (count) => `${count} Events Explain The Turning Points`,
    eventsLede:
      "Every event links to chapters, lineage nodes, and at least one primary paper, book, official record, or standard. Impact notes focus on downstream mechanisms without treating one event as the sole cause.",
    eventsAriaLabel: "Source-backed AI history events",
    impact: "Why It Matters",
    relatedChapters: "Related Chapters",
    relatedLineage: "Related Lineage",
    sources: "Primary Sources",
  },
} satisfies Record<Locale, TimelinePageCopy>;

export const timelineEventTypeLabels = {
  "zh-CN": {
    paper: "论文",
    book: "专著",
    system: "系统",
    dataset: "数据",
    compute: "算力转折",
    "turning-point": "范式转折",
    standard: "标准",
  },
  en: {
    paper: "Paper",
    book: "Book",
    system: "System",
    dataset: "Dataset",
    compute: "Compute Shift",
    "turning-point": "Turning Point",
    standard: "Standard",
  },
} satisfies Record<Locale, Record<TimelineEventType, string>>;

export const timelineSourceKindLabels = {
  "zh-CN": {
    "primary-paper": "原始论文",
    book: "专著",
    "official-record": "官方档案",
    standard: "正式标准",
  },
  en: {
    "primary-paper": "Primary Paper",
    book: "Book",
    "official-record": "Official Record",
    standard: "Published Standard",
  },
} satisfies Record<Locale, Record<TimelineSourceKind, string>>;

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
