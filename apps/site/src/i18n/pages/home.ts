import { chapterRegistry, type ChapterId } from "@ai-history/data/chapters";
import type { Locale } from "../locales";

export const homePageCopy = {
  "zh-CN": {
    title: "总览",
    heroEyebrow: "从规则到智能体 · 图解学习",
    heroTitle: "交互式人工智能图解史",
    heroDescription:
      "用可点击、可分步播放、可对比的教学型案例，解释 AI 技术从规则、统计学习、深度学习到大模型、RAG 与 Agent 的演化脉络。",
    mapAriaLabel: "AI 技术演化主线图",
    mapTitle: "AI 技术演化主线",
    pathEyebrow: "推荐学习顺序",
    pathTitle: "沿着 10 个章节理解 AI 如何一步步演化",
    overviewEyebrow: "延伸探索",
    overviewTitle: "从不同视角回看 AI 的演化脉络",
  },
  en: {
    title: "Overview",
    heroEyebrow: "From rules to agents · Learn visually",
    heroTitle: "Interactive Illustrated AI History",
    heroDescription:
      "Explore the evolution of AI from rules and statistical learning to deep learning, large models, RAG, and agents through clickable, step-by-step teaching demos.",
    mapAriaLabel: "AI technical evolution map",
    mapTitle: "AI technical evolution",
    pathEyebrow: "Recommended learning path",
    pathTitle: "Follow ten chapters to see how AI evolved step by step",
    overviewEyebrow: "Explore Further",
    overviewTitle: "Revisit AI's evolution from different perspectives",
  },
} satisfies Record<Locale, Record<string, string>>;

interface HomeMapNode {
  title: string;
  subtitle: string;
}

export const homeMapNodes = {
  "zh-CN": [
    { title: "规则", subtitle: "搜索 / 专家系统" },
    { title: "学习", subtitle: "数据驱动" },
    { title: "大模型", subtitle: "RAG / 对齐" },
    { title: "Agent", subtitle: "计划-工具-观察" },
  ],
  en: [
    { title: "Rules", subtitle: "Search / experts" },
    { title: "Learning", subtitle: "Data-driven" },
    { title: "Large models", subtitle: "RAG / alignment" },
    { title: "Agent", subtitle: "Plan, tool, observe" },
  ],
} satisfies Record<Locale, HomeMapNode[]>;

export interface HomeLearningCard {
  route: string;
  label: string;
  title: string;
  description: string;
  recommendation?: string;
  meta?: string;
}

type HomeLearningCardCopy = Omit<HomeLearningCard, "route" | "label" | "title">;

const homeLearningPathCardCopy = {
  "zh-CN": {
    overview: {
      description:
        "用一张学习地图串起规则、统计学习、深度学习、RAG 与 Agent 的演化主线。",
      recommendation: "推荐从这里开始",
      meta: "约 5 分钟 · 阅读主线",
    },
    search: {
      description: "切换 BFS、DFS、A*，观察搜索策略如何影响 frontier。",
    },
    "expert-system": {
      description: "选择条件并加入例外，观察 if-then 规则如何产生冲突。",
    },
    bayes: {
      description: "拖动先验与证据强度，看信念如何被证据更新。",
    },
    "decision-boundary": {
      description: "比较线性、非线性、过拟合边界，理解数据驱动学习。",
    },
    cnn: {
      description: "选择 kernel 并推进窗口，观察 feature map 如何生成。",
    },
    attention: {
      description: "点击 token，比较 Attention 直接连接和 RNN 链式传递。",
    },
    "llm-system": {
      description: "理解上下文、检索、工具、记忆和评估为什么围绕大模型出现。",
    },
    rag: {
      description:
        "观察问题如何经过 embedding、检索、重排、prompt、LLM 和引用答案。",
    },
    agent: {
      description:
        "执行 plan、tool call、observation、revise、final answer 的循环。",
    },
    safety: {
      description: "对比正常与风险请求，把失败固化为回归测试并经过发布门。",
    },
  },
  en: {
    overview: {
      description:
        "Use one learning map to connect the evolution from rules and statistical learning to deep learning, RAG, and agents.",
      recommendation: "Recommended starting point",
      meta: "About 5 minutes · Read the main thread",
    },
    search: {
      description:
        "Switch among BFS, DFS, and A* to see how search strategies affect the frontier.",
    },
    "expert-system": {
      description:
        "Select conditions and add exceptions to see how if-then rules produce conflicts.",
    },
    bayes: {
      description:
        "Adjust the prior and evidence strength to see how evidence updates belief.",
    },
    "decision-boundary": {
      description:
        "Compare linear, nonlinear, and overfit boundaries to understand data-driven learning.",
    },
    cnn: {
      description:
        "Choose a kernel and advance the window to see how a feature map is produced.",
    },
    attention: {
      description:
        "Select a token and compare direct Attention connections with RNN chain propagation.",
    },
    "llm-system": {
      description:
        "Understand why context, retrieval, tools, memory, and evaluation surround large models.",
    },
    rag: {
      description:
        "Follow a question through embedding, retrieval, reranking, prompting, the LLM, and a cited answer.",
    },
    agent: {
      description:
        "Run the loop of planning, tool calls, observation, revision, and a final answer.",
    },
    safety: {
      description:
        "Compare normal and risky requests, save a failure as a regression test, and run the release gate.",
    },
  },
} satisfies Record<Locale, Record<ChapterId, HomeLearningCardCopy>>;

export const homeLearningPathCards = Object.fromEntries(
  (["zh-CN", "en"] as const).map((locale) => [
    locale,
    chapterRegistry.map((chapter) => ({
      route: chapter.route,
      label: `${chapter.kind === "demo" ? "Demo" : "Chapter"} ${chapter.number}`,
      title: chapter.shortTitle[locale],
      ...homeLearningPathCardCopy[locale][chapter.id],
    })),
  ]),
) as Record<Locale, HomeLearningCard[]>;

interface HomeOverviewCard {
  route: string;
  label: string;
  title: string;
  description: string;
}

export const homeOverviewCards = {
  "zh-CN": [
    {
      route: "/timeline/",
      label: "Timeline",
      title: "AI 技术演化总览时间线",
      description:
        "按时代串起搜索、规则、统计学习、深度学习、Transformer、RAG 和 Agent。",
    },
    {
      route: "/lineage/",
      label: "Lineage",
      title: "AI 技术谱系图",
      description:
        "按范式展示符号主义、统计学习、神经网络、基础模型和 Agent 的关系。",
    },
    {
      route: "/diagrams/",
      label: "Diagrams",
      title: "可复用图解与导出",
      description: "查看可下载的图解资源，以及适合分享和复习的重点画面。",
    },
  ],
  en: [
    {
      route: "/timeline/",
      label: "Timeline",
      title: "AI Evolution Timeline",
      description:
        "Connect search, rules, statistical learning, deep learning, Transformer, RAG, and agents across eras.",
    },
    {
      route: "/lineage/",
      label: "Lineage",
      title: "AI Technical Lineage",
      description:
        "See how symbolic AI, statistical learning, neural networks, foundation models, and agents relate by paradigm.",
    },
    {
      route: "/diagrams/",
      label: "Diagrams",
      title: "Reusable Diagrams And Exports",
      description:
        "Browse downloadable diagrams and key views designed for sharing and review.",
    },
  ],
} satisfies Record<Locale, HomeOverviewCard[]>;
