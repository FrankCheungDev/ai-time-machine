import type { Locale } from "./locales";

export const commonLabels = {
  "zh-CN": {
    references: "参考资料",
    simplification: "简化说明",
  },
  en: {
    references: "References",
    simplification: "Simplification note",
  },
} satisfies Record<Locale, { references: string; simplification: string }>;

export const homePageCopy = {
  "zh-CN": {
    title: "总览",
    heroEyebrow: "中文优先 · 图解优先 · 静态可部署",
    heroTitle: "交互式人工智能图解史",
    heroDescription:
      "用可点击、可分步播放、可对比的教学型案例，解释 AI 技术从规则、统计学习、深度学习到大模型、RAG 与 Agent 的演化脉络。",
    primaryAction: "从总览开始",
    secondaryAction: "查看章节列表",
    mapAriaLabel: "AI 技术演化主线图",
    mapTitle: "AI 技术演化主线",
    pathEyebrow: "推荐学习顺序",
    pathTitle: "第一版主线：从总览到 8 个交互 demo 和 1 个系统桥接章",
    overviewEyebrow: "Overview Artifacts",
    overviewTitle: "用时间线、谱系图和图源规范把项目组织起来",
  },
  en: {
    title: "Overview",
    heroEyebrow: "Chinese-first · Diagram-first · Static deployment",
    heroTitle: "Interactive Illustrated AI History",
    heroDescription:
      "Explore the evolution of AI from rules and statistical learning to deep learning, large models, RAG, and agents through clickable, step-by-step teaching demos.",
    primaryAction: "Start with the overview",
    secondaryAction: "View chapter list",
    mapAriaLabel: "AI technical evolution map",
    mapTitle: "AI technical evolution",
    pathEyebrow: "Recommended learning path",
    pathTitle:
      "First edition spine: one overview, eight interactive demos, and one system bridge chapter",
    overviewEyebrow: "Overview Artifacts",
    overviewTitle:
      "Organize the project with a timeline, lineage map, and diagram source guide",
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

interface HomeLearningCard {
  route: string;
  label: string;
  title: string;
  description: string;
  recommendation?: string;
  meta?: string;
}

export const homeLearningPathCards = {
  "zh-CN": [
    {
      route: "/chapters/overview/",
      label: "Chapter 00",
      title: "00 总览章节",
      description:
        "用 MDX 串起规则、统计学习、深度学习、RAG 与 Agent 的演化主线。",
      recommendation: "推荐从这里开始",
      meta: "约 5 分钟 · 阅读主线",
    },
    {
      route: "/chapters/search/",
      label: "Demo 01",
      title: "搜索树 / A*",
      description: "切换 BFS、DFS、A*，观察搜索策略如何影响 frontier。",
    },
    {
      route: "/chapters/expert-system/",
      label: "Demo 02",
      title: "专家系统规则推理",
      description: "选择条件并加入例外，观察 if-then 规则如何产生冲突。",
    },
    {
      route: "/chapters/bayes/",
      label: "Demo 03",
      title: "Bayes 更新",
      description: "拖动先验与证据强度，看信念如何被证据更新。",
    },
    {
      route: "/chapters/decision-boundary/",
      label: "Demo 04",
      title: "决策边界",
      description: "比较线性、非线性、过拟合边界，理解数据驱动学习。",
    },
    {
      route: "/chapters/cnn/",
      label: "Demo 05",
      title: "CNN 卷积核",
      description: "选择 kernel 并推进窗口，观察 feature map 如何生成。",
    },
    {
      route: "/chapters/attention/",
      label: "Demo 06",
      title: "Attention Map",
      description: "点击 token，比较 Attention 直接连接和 RNN 链式传递。",
    },
    {
      route: "/chapters/llm-system/",
      label: "Chapter 07",
      title: "LLM 系统地图",
      description: "理解上下文、检索、工具、记忆和评估为什么围绕大模型出现。",
    },
    {
      route: "/chapters/rag/",
      label: "Demo 08",
      title: "RAG Pipeline",
      description:
        "观察问题如何经过 embedding、检索、重排、prompt、LLM 和引用答案。",
    },
    {
      route: "/chapters/agent/",
      label: "Demo 09",
      title: "Agent Loop",
      description:
        "执行 plan、tool call、observation、revise、final answer 的循环。",
    },
  ],
  en: [
    {
      route: "/chapters/overview/",
      label: "Chapter 00",
      title: "00 Overview Chapter",
      description:
        "Use MDX to connect the evolution from rules and statistical learning to deep learning, RAG, and agents.",
      recommendation: "Recommended starting point",
      meta: "About 5 minutes · Read the main thread",
    },
    {
      route: "/chapters/search/",
      label: "Demo 01",
      title: "Search Trees / A*",
      description:
        "Switch among BFS, DFS, and A* to see how search strategies affect the frontier.",
    },
    {
      route: "/chapters/expert-system/",
      label: "Demo 02",
      title: "Expert System Rule Reasoning",
      description:
        "Select conditions and add exceptions to see how if-then rules produce conflicts.",
    },
    {
      route: "/chapters/bayes/",
      label: "Demo 03",
      title: "Bayesian Updating",
      description:
        "Adjust the prior and evidence strength to see how evidence updates belief.",
    },
    {
      route: "/chapters/decision-boundary/",
      label: "Demo 04",
      title: "Decision Boundaries",
      description:
        "Compare linear, nonlinear, and overfit boundaries to understand data-driven learning.",
    },
    {
      route: "/chapters/cnn/",
      label: "Demo 05",
      title: "CNN Kernels",
      description:
        "Choose a kernel and advance the window to see how a feature map is produced.",
    },
    {
      route: "/chapters/attention/",
      label: "Demo 06",
      title: "Attention Map",
      description:
        "Select a token and compare direct Attention connections with RNN chain propagation.",
    },
    {
      route: "/chapters/llm-system/",
      label: "Chapter 07",
      title: "LLM System Map",
      description:
        "Understand why context, retrieval, tools, memory, and evaluation surround large models.",
    },
    {
      route: "/chapters/rag/",
      label: "Demo 08",
      title: "RAG Pipeline",
      description:
        "Follow a question through embedding, retrieval, reranking, prompting, the LLM, and a cited answer.",
    },
    {
      route: "/chapters/agent/",
      label: "Demo 09",
      title: "Agent Loop",
      description:
        "Run the loop of planning, tool calls, observation, revision, and a final answer.",
    },
  ],
} satisfies Record<Locale, HomeLearningCard[]>;

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
      label: "Guide",
      title: "图源与导出说明",
      description: "说明 SVG 命名、截图状态和贡献者图源工作流。",
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
      label: "Guide",
      title: "Diagram Sources And Exports",
      description:
        "Learn the SVG naming, screenshot-state, and source workflow conventions for contributors.",
    },
  ],
} satisfies Record<Locale, HomeOverviewCard[]>;

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

export const diagramsPageCopy = {
  "zh-CN": {
    title: "图源与导出说明",
    description: "贡献者如何命名、导出和复用交互图源。",
    eyebrow: "Diagram Source",
    heading: "图源与导出说明",
    lede: "本项目的图解需要截图友好、可维护、可绑定交互状态。优先使用手工整理的 SVG，并遵循稳定 id 约定。",
    workflowEyebrow: "推荐流程",
    workflowHeading: "从图源到可交互 SVG",
    namingEyebrow: "SVG 命名规范",
    namingHeading: "稳定命名让动画和测试更可靠",
    downloadsEyebrow: "可复用图源",
    downloadsHeading: "下载首批 SVG 源文件",
    downloadAriaLabel: "下载 RAG Pipeline SVG",
    downloadLabel: "下载 RAG Pipeline SVG",
    downloadDescriptionBefore: "包含 ",
    downloadDescriptionAfter: " 等稳定 id，便于绑定交互状态。",
    coreEyebrow: "MVP 核心图解",
    coreHeading: "12 张第一版核心图解",
    diagramLabel: "Diagram",
    screenshotsEyebrow: "截图友好",
    screenshotsHeading: "每张图都应该能单独传播",
    screenshotsBody:
      "保持边距、标题、激活状态和简化说明清晰可见。导出或截图前，优先选择能表达一个核心 aha moment 的状态，避免把多个控件面板、过长解释和复杂参数同时放进画面。",
  },
  en: {
    title: "Diagram Sources And Exports",
    description:
      "How contributors name, export, and reuse interactive diagram sources.",
    eyebrow: "Diagram Sources",
    heading: "Diagram Sources And Exports",
    lede: "The project's diagrams need to be screenshot-ready, maintainable, and bindable to interactive state. Prefer carefully authored SVGs and stable ID conventions.",
    workflowEyebrow: "Recommended Workflow",
    workflowHeading: "From Source To Interactive SVG",
    namingEyebrow: "SVG Naming Conventions",
    namingHeading: "Stable Names Make Animation And Tests More Reliable",
    downloadsEyebrow: "Reusable Sources",
    downloadsHeading: "Download The First SVG Source File",
    downloadAriaLabel: "Download RAG Pipeline SVG",
    downloadLabel: "Download RAG Pipeline SVG",
    downloadDescriptionBefore: "Includes stable IDs such as ",
    downloadDescriptionAfter: " for binding interactive state.",
    coreEyebrow: "MVP Core Diagrams",
    coreHeading: "12 Core Diagrams For The First Edition",
    diagramLabel: "Diagram",
    screenshotsEyebrow: "Screenshot Ready",
    screenshotsHeading: "Every Diagram Should Stand On Its Own",
    screenshotsBody:
      "Keep spacing, titles, active states, and simplification notes clearly visible. Before exporting or capturing a screenshot, choose a state that communicates one core aha moment instead of crowding the frame with multiple control panels, long explanations, and complex parameters.",
  },
} satisfies Record<Locale, Record<string, string>>;

export const diagramWorkflowSteps = {
  "zh-CN": [
    "Figma / Excalidraw 草图",
    "导出 SVG",
    "SVGO 优化",
    "补 id / data-role",
  ],
  en: [
    "Figma / Excalidraw sketch",
    "Export SVG",
    "Optimize with SVGO",
    "Add id / data-role",
  ],
} satisfies Record<Locale, string[]>;

interface DiagramNamingCard {
  title: string;
  description: string;
}

export const diagramNamingCards = {
  "zh-CN": [
    { title: "node-*", description: "概念节点、流程节点、token 节点。" },
    { title: "arrow-*", description: "数据流、控制流、影响关系。" },
    { title: "label-*", description: "截图和导出时保留的文字标签。" },
    { title: "highlight-*", description: "当前步骤、失败状态、解决状态。" },
  ],
  en: [
    { title: "node-*", description: "Concept, process, and token nodes." },
    {
      title: "arrow-*",
      description: "Data flow, control flow, and influence relationships.",
    },
    {
      title: "label-*",
      description: "Text labels retained in screenshots and exports.",
    },
    {
      title: "highlight-*",
      description: "Current steps, failure states, and resolved states.",
    },
  ],
} satisfies Record<Locale, DiagramNamingCard[]>;

interface CoreDiagram {
  title: string;
  route: string;
  note: string;
}

export const coreDiagrams = {
  "zh-CN": [
    {
      title: "AI 技术演化主线图",
      route: "/",
      note: "首页首屏的规则、学习、大模型、Agent 主线。",
    },
    {
      title: "AI 技术演化总览时间线",
      route: "/timeline/",
      note: "按时代串起关键技术转向和对应 demo。",
    },
    {
      title: "AI 技术谱系图",
      route: "/lineage/",
      note: "按范式展示符号主义、统计学习、神经网络、基础模型和 Agent。",
    },
    {
      title: "LLM 系统边界图",
      route: "/chapters/llm-system/",
      note: "展示模型、上下文、检索、工具、记忆和评估的系统关系。",
    },
    {
      title: "搜索树策略图",
      route: "/chapters/search/",
      note: "比较 BFS、DFS、A* 的展开路径和 frontier。",
    },
    {
      title: "专家系统规则图",
      route: "/chapters/expert-system/",
      note: "展示 if-then 规则、例外条件和冲突状态。",
    },
    {
      title: "Bayes 信念更新图",
      route: "/chapters/bayes/",
      note: "用先验、证据强度和后验条形反馈解释不确定性更新。",
    },
    {
      title: "决策边界对比图",
      route: "/chapters/decision-boundary/",
      note: "比较线性、非线性和过拟合边界。",
    },
    {
      title: "CNN Kernel 扫描图",
      route: "/chapters/cnn/",
      note: "展示局部窗口、卷积核和 feature map 响应。",
    },
    {
      title: "Attention Token 关系图",
      route: "/chapters/attention/",
      note: "展示 token 直接连接和 RNN 链式传递对比。",
    },
    {
      title: "RAG Pipeline 流程图",
      route: "/chapters/rag/",
      note: "展示 Query、Embedding、Vector DB、Reranker、Prompt、LLM、Answer。",
    },
    {
      title: "Agent Loop 行动循环图",
      route: "/chapters/agent/",
      note: "展示 plan、tool call、observation、revise、final answer。",
    },
  ],
  en: [
    {
      title: "AI Technical Evolution Map",
      route: "/",
      note: "The homepage path through rules, learning, large models, and agents.",
    },
    {
      title: "AI Evolution Timeline",
      route: "/timeline/",
      note: "Connects key technical shifts and matching demos across eras.",
    },
    {
      title: "AI Technical Lineage",
      route: "/lineage/",
      note: "Maps symbolic AI, statistical learning, neural networks, foundation models, and agents by paradigm.",
    },
    {
      title: "LLM System Boundary Map",
      route: "/chapters/llm-system/",
      note: "Shows the system relationships among models, context, retrieval, tools, memory, and evaluation.",
    },
    {
      title: "Search Tree Strategy Diagram",
      route: "/chapters/search/",
      note: "Compares expansion paths and frontiers for BFS, DFS, and A*.",
    },
    {
      title: "Expert System Rule Diagram",
      route: "/chapters/expert-system/",
      note: "Shows if-then rules, exception conditions, and conflict states.",
    },
    {
      title: "Bayesian Belief Update Diagram",
      route: "/chapters/bayes/",
      note: "Explains uncertainty updates with priors, evidence strength, and posterior bars.",
    },
    {
      title: "Decision Boundary Comparison",
      route: "/chapters/decision-boundary/",
      note: "Compares linear, nonlinear, and overfit boundaries.",
    },
    {
      title: "CNN Kernel Scan",
      route: "/chapters/cnn/",
      note: "Shows the local window, convolution kernel, and feature-map response.",
    },
    {
      title: "Attention Token Relationships",
      route: "/chapters/attention/",
      note: "Compares direct token connections with RNN chain propagation.",
    },
    {
      title: "RAG Pipeline Flow",
      route: "/chapters/rag/",
      note: "Shows Query, Embedding, Vector DB, Reranker, Prompt, LLM, and Answer.",
    },
    {
      title: "Agent Loop Action Cycle",
      route: "/chapters/agent/",
      note: "Shows planning, tool calls, observation, revision, and the final answer.",
    },
  ],
} satisfies Record<Locale, CoreDiagram[]>;

export const overviewChapterCopy = {
  "zh-CN": {
    title: "总览：AI 为什么不是突然变成大模型的？",
    description:
      "MDX chapter-zero overview for the interactive AI history project.",
    eyebrow: "Chapter 00",
    heading: "总览：AI 为什么不是突然变成大模型的？",
    lede: "AI 的主线不是一个模型突然出现，而是规则搜索、知识工程、概率统计、表示学习、Transformer、RAG 与 Agent 不断回应前一阶段瓶颈的结果。",
    question: "AI 为什么不是突然变成大模型的？",
    closureEyebrow: "Technical Closure",
    closureHeading: "MDX 章节可渲染",
    closureBody:
      "这个页面验证 Astro + MDX 章节闭环：贡献者可以用 Markdown/MDX 写解释文本，同时复用站点布局、设计 token 和 Astro 路由。",
    spineEyebrow: "历史主线",
    spineHeading: "从规则到系统",
    readingEyebrow: "阅读方式",
    readingHeading: "每章看四件事",
    simplificationHeading: "这是一张学习地图，不是完整 AI 百科",
    simplificationBody:
      "总览章节刻意保留主线和代表性技术，省略大量分支、人物、论文和工程细节。后续章节会用交互 demo 展开每个阶段的一个核心机制直觉。",
    primaryAction: "打开时间线",
    secondaryAction: "从搜索章节开始",
  },
  en: {
    title: "Overview: Why did AI not suddenly become large models?",
    description:
      "Chapter-zero overview for the interactive illustrated AI history project.",
    eyebrow: "Chapter 00",
    heading: "Overview: Why did AI not suddenly become large models?",
    lede: "AI's main thread is not the sudden appearance of one model. It is the result of rules and search, knowledge engineering, probability and statistics, representation learning, Transformer, RAG, and agents repeatedly addressing earlier bottlenecks.",
    question: "Why did AI not suddenly become large models?",
    closureEyebrow: "Technical Closure",
    closureHeading: "The MDX Chapter Renders",
    closureBody:
      "This page verifies the Astro + MDX chapter loop: contributors can write explanations in Markdown/MDX while reusing the site layout, design tokens, and Astro routing.",
    spineEyebrow: "Historical Spine",
    spineHeading: "From Rules To Systems",
    readingEyebrow: "How To Read",
    readingHeading: "Four Things To Notice In Every Chapter",
    simplificationHeading:
      "This Is A Learning Map, Not A Complete AI Encyclopedia",
    simplificationBody:
      "The overview deliberately keeps the main thread and representative technologies while omitting many branches, people, papers, and engineering details. Later chapters use interactive demos to develop one core mechanism intuition for each era.",
    primaryAction: "Open the timeline",
    secondaryAction: "Start with the search chapter",
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
        "Transformer 扩展出 LLM，RAG、工具、记忆和评估把模型组织成现代 AI 系统。",
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
        "Transformer scaled into LLMs, while RAG, tools, memory, and evaluation organize models into modern AI systems.",
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
