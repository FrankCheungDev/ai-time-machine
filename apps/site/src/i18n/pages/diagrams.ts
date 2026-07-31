import type { Locale } from "../locales";

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
    downloadsHeading: "12 组可下载 SVG 与 PNG 预览",
    assetStateLabel: "状态",
    assetVersionLabel: "版本",
    assetLicenseLabel: "许可证",
    stableIdsLabel: "稳定节点 / 箭头 id",
    simplificationLabel: "教学简化",
    downloadSvgLabel: "下载 SVG",
    downloadPngLabel: "下载 PNG",
    openChapterLabel: "打开章节",
    coreEyebrow: "MVP 核心图解",
    coreHeading: "15 张核心图解",
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
    downloadsHeading: "12 Downloadable SVGs And PNG Previews",
    assetStateLabel: "State",
    assetVersionLabel: "Version",
    assetLicenseLabel: "License",
    stableIdsLabel: "Stable node / arrow IDs",
    simplificationLabel: "Teaching simplification",
    downloadSvgLabel: "Download SVG",
    downloadPngLabel: "Download PNG",
    openChapterLabel: "Open chapter",
    coreEyebrow: "MVP Core Diagrams",
    coreHeading: "15 Core Diagrams",
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
      title: "反馈学习策略更新图",
      route: "/chapters/reinforcement-learning/",
      note: "展示延迟回报如何在训练边界更新示意策略，并区分运行时 observation。",
    },
    {
      title: "Attention Token 关系图",
      route: "/chapters/attention/",
      note: "展示 token 直接连接和 RNN 链式传递对比。",
    },
    {
      title: "基础模型生命周期图",
      route: "/chapters/foundation-model/",
      note: "区分预训练、指令微调、偏好反馈与运行时上下文。",
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
    {
      title: "Safety / Eval 发布反馈图",
      route: "/chapters/safety/",
      note: "展示红队样本、护栏、最小权限、人工复核、回归评估和发布门。",
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
      title: "Feedback Learning Policy Update",
      route: "/chapters/reinforcement-learning/",
      note: "Shows how delayed return updates an illustrative policy at the training boundary while runtime observations stay separate.",
    },
    {
      title: "Attention Token Relationships",
      route: "/chapters/attention/",
      note: "Compares direct token connections with RNN chain propagation.",
    },
    {
      title: "Foundation Model Lifecycle",
      route: "/chapters/foundation-model/",
      note: "Separates pretraining, instruction tuning, preference feedback, and runtime context.",
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
    {
      title: "Safety / Eval Release Feedback Loop",
      route: "/chapters/safety/",
      note: "Shows red-team cases, guardrails, least privilege, human review, regression evaluation, and the release gate.",
    },
  ],
} satisfies Record<Locale, CoreDiagram[]>;
