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

interface ChapterReference {
  href: string;
  label: string;
}

export interface DemoChapterCopy {
  eyebrow: string;
  title: string;
  description: string;
  lede: string;
  notesId: string;
  notesEyebrow: string;
  notesTitle: string;
  notesBody: string;
  references: ChapterReference[];
}

export const demoChapterCopy = {
  search: {
    "zh-CN": {
      eyebrow: "Demo 01",
      title: "符号主义与搜索：机器能否通过搜索表现出智能？",
      description: "一个静态、教学型搜索树交互图解。",
      lede: "早期 AI 把智能看作在明确规则空间中寻找答案。这个章节展示搜索为什么强大，以及状态空间扩大后为什么会遇到组合爆炸。",
      notesId: "search-notes",
      notesEyebrow: "观察指南",
      notesTitle: "搜索擅长明确规则，但害怕状态膨胀",
      notesBody:
        "它之前的问题是机器还缺少可执行的“问题求解”方法。搜索解决了路径寻找和规划问题，但没有解决知识表示、启发式质量和规模爆炸。后续影响包括规划、博弈树、A* 和强化学习中的搜索思想。",
      references: [
        {
          href: "https://aima.cs.berkeley.edu/",
          label: "Artificial Intelligence: A Modern Approach",
        },
        {
          href: "https://doi.org/10.1109/TSSC.1968.300136",
          label:
            "A Formal Basis for the Heuristic Determination of Minimum Cost Paths",
        },
      ],
    },
    en: {
      eyebrow: "Demo 01",
      title:
        "Symbolic AI And Search: Can machines act intelligent by searching?",
      description: "A static teaching diagram for search trees.",
      lede: "Early AI treated intelligence as finding answers in spaces with explicit rules. This chapter shows why search is powerful and why it encounters combinatorial explosion as the state space grows.",
      notesId: "search-notes",
      notesEyebrow: "Observation guide",
      notesTitle: "Search excels with explicit rules but fears state growth",
      notesBody:
        "The earlier problem was that machines still lacked an executable method for problem solving. Search addressed path finding and planning, but it did not solve knowledge representation, heuristic quality, or explosive scale. Its follow-on influence includes planning, game trees, A*, and search ideas in reinforcement learning.",
      references: [
        {
          href: "https://aima.cs.berkeley.edu/",
          label: "Artificial Intelligence: A Modern Approach",
        },
        {
          href: "https://doi.org/10.1109/TSSC.1968.300136",
          label:
            "A Formal Basis for the Heuristic Determination of Minimum Cost Paths",
        },
      ],
    },
  },
  "expert-system": {
    "zh-CN": {
      eyebrow: "Demo 02",
      title: "专家系统：专家知识能否写成 if-then 规则？",
      description: "一个静态、教学型专家系统规则推理交互图解。",
      lede: "专家系统把人类专家经验写成 if-then 规则。这个章节展示规则推理为何一度有效，以及例外和模糊边界为什么让规则库难以维护。",
      notesId: "expert-notes",
      notesEyebrow: "观察指南",
      notesTitle: "规则系统的问题常常出现在例外越来越多的时候",
      notesBody:
        "它之前的问题是通用搜索缺少领域知识。专家系统解决了可解释的专业规则推理，但没有解决知识获取瓶颈、规则冲突和维护成本。后续影响是知识工程、规则引擎和混合推理系统。",
      references: [
        {
          href: "https://www.shortliffe.net/",
          label: "Edward Shortliffe and MYCIN background",
        },
        {
          href: "https://doi.org/10.1016/0004-3702(93)90068-M",
          label: "DENDRAL and knowledge engineering history",
        },
      ],
    },
    en: {
      eyebrow: "Demo 02",
      title:
        "Expert Systems: Can expert knowledge be written as if-then rules?",
      description:
        "A static teaching diagram for expert-system rule reasoning.",
      lede: "Expert systems express human expertise as if-then rules. This chapter shows why rule-based reasoning was once effective and why exceptions and fuzzy boundaries make a rule base difficult to maintain.",
      notesId: "expert-notes",
      notesEyebrow: "Observation guide",
      notesTitle: "Rule systems struggle as exceptions accumulate",
      notesBody:
        "The earlier problem was that general search lacked domain knowledge. Expert systems enabled explainable reasoning with specialist rules, but they did not solve the knowledge-acquisition bottleneck, rule conflicts, or maintenance cost. Their follow-on influence includes knowledge engineering, rule engines, and hybrid reasoning systems.",
      references: [
        {
          href: "https://www.shortliffe.net/",
          label: "Edward Shortliffe and MYCIN background",
        },
        {
          href: "https://doi.org/10.1016/0004-3702(93)90068-M",
          label: "DENDRAL and knowledge engineering history",
        },
      ],
    },
  },
  bayes: {
    "zh-CN": {
      eyebrow: "Demo 03",
      title: "概率推理：机器如何处理不确定性？",
      description: "一个静态、教学型 Bayes 更新交互图解。",
      lede: "当世界无法被写成确定规则时，AI 需要表达不确定性。这个章节展示证据如何改变信念，让用户理解统计推理与规则推理的差异。",
      notesId: "bayes-notes",
      notesEyebrow: "观察指南",
      notesTitle: "证据不是替代信念，而是更新信念",
      notesBody:
        "它之前的问题是规则系统难以处理模糊和噪声。概率推理解决了不确定性表达，但没有自动解决因果解释、数据质量和建模假设。后续影响包括朴素 Bayes、图模型和统计机器学习。",
      references: [
        {
          href: "https://allendowney.github.io/ThinkBayes2/",
          label: "Think Bayes, 2nd Edition",
        },
        {
          href: "https://www.deeplearningbook.org/contents/prob.html",
          label: "Deep Learning Book: Probability and Information Theory",
        },
      ],
    },
    en: {
      eyebrow: "Demo 03",
      title: "Probabilistic Reasoning: How do machines handle uncertainty?",
      description: "A static teaching diagram for Bayesian updating.",
      lede: "When the world cannot be written as deterministic rules, AI needs a way to express uncertainty. This chapter shows how evidence changes belief and clarifies the difference between statistical and rule-based reasoning.",
      notesId: "bayes-notes",
      notesEyebrow: "Observation guide",
      notesTitle: "Evidence updates a belief rather than replacing it",
      notesBody:
        "The earlier problem was that rule systems struggled with ambiguity and noise. Probabilistic reasoning expressed uncertainty, but it did not automatically solve causal explanation, data quality, or modeling assumptions. Its follow-on influence includes naive Bayes, graphical models, and statistical machine learning.",
      references: [
        {
          href: "https://allendowney.github.io/ThinkBayes2/",
          label: "Think Bayes, 2nd Edition",
        },
        {
          href: "https://www.deeplearningbook.org/contents/prob.html",
          label: "Deep Learning Book: Probability and Information Theory",
        },
      ],
    },
  },
  "decision-boundary": {
    "zh-CN": {
      eyebrow: "Demo 04",
      title: "经典机器学习：机器如何从数据中学习决策边界？",
      description: "一个静态、教学型决策边界交互图解。",
      lede: "经典机器学习从手写规则转向数据驱动。这个章节展示样本、模型复杂度和决策边界之间的关系。",
      notesId: "boundary-notes",
      notesEyebrow: "观察指南",
      notesTitle: "模型不是背规则，而是在样本中学习分界",
      notesBody:
        "它之前的问题是规则无法覆盖所有情况。经典机器学习解决了从数据归纳规律的问题，但没有自动解决特征设计、泛化、偏差和过拟合。后续影响是 SVM、树模型、集成学习和深度学习。",
      references: [
        {
          href: "https://hastie.su.domains/ElemStatLearn/",
          label: "The Elements of Statistical Learning",
        },
        {
          href: "https://www.cs.cornell.edu/courses/cs4780/2018fa/lectures/",
          label: "CS4780 Machine Learning for Intelligent Systems notes",
        },
      ],
    },
    en: {
      eyebrow: "Demo 04",
      title:
        "Classic Machine Learning: How do machines learn decision boundaries from data?",
      description: "A static teaching diagram for decision boundaries.",
      lede: "Classic machine learning shifted from hand-written rules to data-driven methods. This chapter shows the relationship among examples, model complexity, and decision boundaries.",
      notesId: "boundary-notes",
      notesEyebrow: "Observation guide",
      notesTitle:
        "A model learns a boundary from examples instead of memorizing rules",
      notesBody:
        "The earlier problem was that rules could not cover every situation. Classic machine learning learned patterns from data, but it did not automatically solve feature design, generalization, bias, or overfitting. Its follow-on influence includes SVMs, tree models, ensemble learning, and deep learning.",
      references: [
        {
          href: "https://hastie.su.domains/ElemStatLearn/",
          label: "The Elements of Statistical Learning",
        },
        {
          href: "https://www.cs.cornell.edu/courses/cs4780/2018fa/lectures/",
          label: "CS4780 Machine Learning for Intelligent Systems notes",
        },
      ],
    },
  },
  cnn: {
    "zh-CN": {
      eyebrow: "Demo 05",
      title: "深度学习与 CNN：机器如何从图像中学习局部特征？",
      description: "一个静态、教学型 CNN 卷积核交互图解。",
      lede: "CNN 把图像理解拆成局部感受野和层级特征。这个章节用小网格展示 kernel 如何滑动并生成 feature map。",
      notesId: "cnn-notes",
      notesEyebrow: "观察指南",
      notesTitle: "局部特征可以组合成更高层视觉理解",
      notesBody:
        "它之前的问题是手写视觉特征难以泛化。CNN 解决了局部模式检测和参数共享问题，但没有自动解决数据需求、鲁棒性和可解释性。后续影响是深度视觉模型、残差网络和视觉 Transformer。",
      references: [
        {
          href: "https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
          label:
            "ImageNet Classification with Deep Convolutional Neural Networks",
        },
        {
          href: "https://www.deeplearningbook.org/contents/convnets.html",
          label: "Deep Learning Book: Convolutional Networks",
        },
      ],
    },
    en: {
      eyebrow: "Demo 05",
      title:
        "Deep Learning And CNNs: How do machines learn local visual features?",
      description: "A static teaching diagram for CNN kernels.",
      lede: "CNNs break image understanding into local receptive fields and hierarchical features. This chapter uses a small grid to show how a kernel slides and produces a feature map.",
      notesId: "cnn-notes",
      notesEyebrow: "Observation guide",
      notesTitle:
        "Local features can combine into higher-level visual understanding",
      notesBody:
        "The earlier problem was that hand-crafted visual features generalized poorly. CNNs addressed local pattern detection and parameter sharing, but they did not automatically solve data requirements, robustness, or interpretability. Their follow-on influence includes deep vision models, residual networks, and Vision Transformers.",
      references: [
        {
          href: "https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
          label:
            "ImageNet Classification with Deep Convolutional Neural Networks",
        },
        {
          href: "https://www.deeplearningbook.org/contents/convnets.html",
          label: "Deep Learning Book: Convolutional Networks",
        },
      ],
    },
  },
  attention: {
    "zh-CN": {
      eyebrow: "Demo 06",
      title: "Attention 与 Transformer：token 为什么可以直接互相关注？",
      description: "一个静态、教学型 Attention Map 交互图解。",
      lede: "为什么 Attention 比 RNN 更适合建模长距离依赖？这个章节把历史位置放在 RNN 之后、Transformer 之前，帮助用户看到“直接连接”为什么改变 NLP。",
      notesId: "attention-notes",
      notesEyebrow: "观察指南",
      notesTitle: "从链式传递到直接连接",
      notesBody:
        "它之前的问题是：RNN 需要按顺序传递状态，远距离 token 的关系容易变弱。Attention 解决的是信息路径过长的问题，但没有直接解决训练成本、幻觉或事实更新问题。后续影响是 Transformer、基础模型和现代多模态模型。",
      references: [
        {
          href: "https://arxiv.org/abs/1706.03762",
          label: "Attention Is All You Need",
        },
        {
          href: "https://jalammar.github.io/illustrated-transformer/",
          label: "The Illustrated Transformer",
        },
      ],
    },
    en: {
      eyebrow: "Demo 06",
      title:
        "Attention And Transformers: Why can tokens directly attend to each other?",
      description: "A static teaching diagram for an Attention map.",
      lede: "Why is Attention better suited than an RNN for modeling long-range dependencies? This chapter places the historical transition after RNNs and before Transformers, showing why direct connections changed NLP.",
      notesId: "attention-notes",
      notesEyebrow: "Observation guide",
      notesTitle: "From chain-like transmission to direct connections",
      notesBody:
        "The earlier problem was that RNNs passed state sequentially, so relationships between distant tokens could weaken. Attention shortened those information paths, but it did not directly solve training cost, hallucinations, or factual updates. Its follow-on influence includes Transformers, foundation models, and modern multimodal models.",
      references: [
        {
          href: "https://arxiv.org/abs/1706.03762",
          label: "Attention Is All You Need",
        },
        {
          href: "https://jalammar.github.io/illustrated-transformer/",
          label: "The Illustrated Transformer",
        },
      ],
    },
  },
  rag: {
    "zh-CN": {
      eyebrow: "Demo 08",
      title: "RAG：大模型如何连接外部知识？",
      description: "一个静态、教学型 RAG Pipeline 交互图解。",
      lede: "为什么只靠模型参数回答问题不够？这个 demo 用分步 SVG 流程解释检索、重排、拼接上下文和生成回答之间的关系。",
      notesId: "rag-notes",
      notesEyebrow: "历史位置",
      notesTitle: "RAG 把大模型接回外部知识系统",
      notesBody:
        "它之前的问题是：LLM 的参数知识会过期，也不能直接读取私有文档。RAG 解决的是把外部证据放进上下文，让答案更可更新、更可追溯。它没有自动解决错误检索、证据冲突、引用核验和权限控制问题。后续影响是企业知识库问答、搜索增强 Agent 和更严格的事实性评估。",
      references: [
        {
          href: "https://arxiv.org/abs/2005.11401",
          label:
            "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        },
        {
          href: "https://arxiv.org/abs/2312.10997",
          label:
            "Retrieval-Augmented Generation for Large Language Models: A Survey",
        },
      ],
    },
    en: {
      eyebrow: "Demo 08",
      title: "RAG: How do large language models connect to external knowledge?",
      description: "A static teaching diagram for the RAG pipeline.",
      lede: "Why are model parameters alone not enough for answering questions? This demo explains retrieval, reranking, context assembly, and answer generation as a step-by-step SVG flow.",
      notesId: "rag-notes",
      notesEyebrow: "Historical position",
      notesTitle:
        "RAG connects large models back to external knowledge systems",
      notesBody:
        "The previous problem was that LLM parameter knowledge becomes stale and cannot directly read private documents. RAG puts external evidence into context so answers can be more current and traceable. It still does not automatically solve wrong retrieval, conflicting evidence, citation verification, or permission control. Its follow-on impact includes enterprise knowledge-base question answering, search-augmented agents, and stricter factuality evaluation.",
      references: [
        {
          href: "https://arxiv.org/abs/2005.11401",
          label:
            "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        },
        {
          href: "https://arxiv.org/abs/2312.10997",
          label:
            "Retrieval-Augmented Generation for Large Language Models: A Survey",
        },
      ],
    },
  },
  agent: {
    "zh-CN": {
      eyebrow: "Demo 09",
      title: "Agent：大模型如何执行多步任务？",
      description: "一个静态、教学型 Agent Loop 交互图解。",
      lede: "为什么 Agent 不是一次回答，而是一个循环控制系统？这个章节把 Agent 放在 LLM 和 RAG 之后，解释计划、工具、观察和修正如何构成多步任务执行。",
      notesId: "agent-notes",
      notesEyebrow: "观察指南",
      notesTitle: "Agent 的关键不是“更会聊天”，而是进入行动循环",
      notesBody:
        "它之前的问题是：普通 LLM 往往只能一次性生成答案，不能持续观察外部状态。Agent 解决的是多步任务控制问题，但没有天然解决工具安全、目标漂移、成本和评估问题。后续影响是工具调用、工作流自动化、多智能体系统和安全评估。",
      references: [
        {
          href: "https://arxiv.org/abs/2210.03629",
          label: "ReAct: Synergizing Reasoning and Acting in Language Models",
        },
        {
          href: "https://arxiv.org/abs/2302.04761",
          label:
            "Toolformer: Language Models Can Teach Themselves to Use Tools",
        },
      ],
    },
    en: {
      eyebrow: "Demo 09",
      title: "Agents: How do large language models execute multi-step tasks?",
      description: "A static teaching diagram for the agent loop.",
      lede: "Why is an agent a looped control system rather than a one-shot answer? This chapter places agents after LLMs and RAG, explaining how planning, tools, observation, and revision form multi-step task execution.",
      notesId: "agent-notes",
      notesEyebrow: "Observation guide",
      notesTitle:
        "An agent enters an action loop instead of merely chatting better",
      notesBody:
        "The earlier problem was that an ordinary LLM often generated a one-shot answer without continuously observing external state. Agents address multi-step task control, but they do not inherently solve tool safety, goal drift, cost, or evaluation. Their follow-on influence includes tool use, workflow automation, multi-agent systems, and safety evaluation.",
      references: [
        {
          href: "https://arxiv.org/abs/2210.03629",
          label: "ReAct: Synergizing Reasoning and Acting in Language Models",
        },
        {
          href: "https://arxiv.org/abs/2302.04761",
          label:
            "Toolformer: Language Models Can Teach Themselves to Use Tools",
        },
      ],
    },
  },
} satisfies Record<string, Record<Locale, DemoChapterCopy>>;

export type DemoChapterId = keyof typeof demoChapterCopy;

interface LlmSystemCardCopy {
  label: string;
  title: string;
  body: string;
}

export interface LlmSystemChapterCopy {
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  question: string;
  mapEyebrow: string;
  mapTitle: string;
  mapAriaLabel: string;
  connectionsEyebrow: string;
  connectionsTitle: string;
  connectionDescription: string;
  notesEyebrow: string;
  notesTitle: string;
  cards: LlmSystemCardCopy[];
  simplificationEyebrow: string;
  simplificationTitle: string;
  simplificationBody: string;
  referencesEyebrow: string;
  references: ChapterReference[];
}

export const llmSystemChapterCopy = {
  "zh-CN": {
    title: "LLM 与现代 AI 系统：为什么大模型还需要外部系统？",
    description:
      "解释大模型、上下文窗口、检索、工具、记忆和评估如何组成现代 AI 系统。",
    eyebrow: "Chapter 07",
    lede: "Transformer 让模型能在大规模文本中学习通用模式，但真实产品不是只有一个模型调用。现代 AI 系统会把模型放进上下文、检索、工具、记忆和评估构成的外部结构里。",
    question: "为什么大模型还需要外部知识和工具？",
    mapEyebrow: "System Map",
    mapTitle: "从“会生成”到“可落地”的系统边界",
    mapAriaLabel: "LLM 系统组成图",
    connectionsEyebrow: "连接关系",
    connectionsTitle: "外部系统把模型能力变成可控流程",
    connectionDescription:
      "这条连接说明现代 LLM 应用通常不是一次生成，而是让模型在证据、行动和约束之间工作。",
    notesEyebrow: "历史位置",
    notesTitle: "它连接 Transformer、RAG 与 Agent",
    cards: [
      {
        label: "之前的问题",
        title: "模型参数不是实时世界",
        body: "预训练知识强大但会过期，也无法直接读取私有文档、业务数据库或工具结果。",
      },
      {
        label: "解决内容",
        title: "把能力放进系统结构",
        body: "上下文窗口、检索、工具调用、记忆和评估让模型变成可组合的软件组件。",
      },
      {
        label: "遗留问题",
        title: "系统仍会失败",
        body: "错误检索、工具误用、提示注入、权限泄漏和评估盲区仍需要工程约束。",
      },
    ],
    simplificationEyebrow: "简化说明",
    simplificationTitle: "这是系统地图，不是真实编排引擎",
    simplificationBody:
      "本章用静态图解说明 LLM 应用常见组件，不调用真实模型、数据库、工具 API 或评估服务。组件关系是教学抽象，用于解释为什么现代 AI 应用需要模型外部结构。",
    referencesEyebrow: "参考资料",
    references: [
      {
        href: "https://arxiv.org/abs/2005.14165",
        label: "Language Models are Few-Shot Learners",
      },
      {
        href: "https://arxiv.org/abs/2210.03629",
        label: "ReAct: Synergizing Reasoning and Acting in Language Models",
      },
    ],
  },
  en: {
    title:
      "LLMs And Modern AI Systems: Why do large models still need external systems?",
    description:
      "Explains how large models, context windows, retrieval, tools, memory, and evaluation form modern AI systems.",
    eyebrow: "Chapter 07",
    lede: "Transformers let models learn general patterns from large-scale text, but real products are more than a single model call. Modern AI systems place the model inside an external structure of context, retrieval, tools, memory, and evaluation.",
    question: "Why do large models still need external knowledge and tools?",
    mapEyebrow: "System Map",
    mapTitle: "The system boundary from generation to deployment",
    mapAriaLabel: "LLM system component map",
    connectionsEyebrow: "Connections",
    connectionsTitle:
      "External systems turn model capability into controlled processes",
    connectionDescription:
      "This connection shows that a modern LLM application is rarely a single generation. The model works among evidence, actions, and constraints.",
    notesEyebrow: "Historical position",
    notesTitle: "It connects Transformers, RAG, and agents",
    cards: [
      {
        label: "Earlier problem",
        title: "Model parameters are not the live world",
        body: "Pretrained knowledge is powerful but becomes outdated, and it cannot directly read private documents, business databases, or tool results.",
      },
      {
        label: "What it solves",
        title: "Place capability inside a system structure",
        body: "Context windows, retrieval, tool use, memory, and evaluation turn a model into a composable software component.",
      },
      {
        label: "Remaining problem",
        title: "The system can still fail",
        body: "Wrong retrieval, tool misuse, prompt injection, permission leaks, and evaluation blind spots still require engineering controls.",
      },
    ],
    simplificationEyebrow: "Simplification note",
    simplificationTitle:
      "This is a system map, not a real orchestration engine",
    simplificationBody:
      "This chapter uses a static diagram to explain common LLM application components. It does not call a real model, database, tool API, or evaluation service. The component relationships are teaching abstractions that explain why modern AI applications need structure outside the model.",
    referencesEyebrow: "References",
    references: [
      {
        href: "https://arxiv.org/abs/2005.14165",
        label: "Language Models are Few-Shot Learners",
      },
      {
        href: "https://arxiv.org/abs/2210.03629",
        label: "ReAct: Synergizing Reasoning and Acting in Language Models",
      },
    ],
  },
} satisfies Record<Locale, LlmSystemChapterCopy>;

export const homePageCopy = {
  "zh-CN": {
    title: "总览",
    heroEyebrow: "中文优先 · 图解优先 · 静态可部署",
    heroTitle: "交互式人工智能图解史",
    heroDescription:
      "用可点击、可分步播放、可对比的教学型案例，解释 AI 技术从规则、统计学习、深度学习到大模型、RAG 与 Agent 的演化脉络。",
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
      "沿着规则搜索、知识工程、概率统计、深度学习、Transformer、RAG 与 Agent，理解现代 AI 系统如何逐步形成。",
    eyebrow: "Chapter 00",
    heading: "总览：AI 为什么不是突然变成大模型的？",
    lede: "AI 的主线不是一个模型突然出现，而是规则搜索、知识工程、概率统计、表示学习、Transformer、RAG 与 Agent 不断回应前一阶段瓶颈的结果。",
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
      "Follow rules and search, knowledge engineering, probability, deep learning, Transformers, RAG, and agents to see how modern AI systems emerged.",
    eyebrow: "Chapter 00",
    heading: "Overview: Why did AI not suddenly become large models?",
    lede: "AI's main thread is not the sudden appearance of one model. It is the result of rules and search, knowledge engineering, probability and statistics, representation learning, Transformer, RAG, and agents repeatedly addressing earlier bottlenecks.",
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
