import type { DemoChapterId as CanonicalDemoChapterId } from "@ai-history/data/chapters";
import type { Locale } from "../locales";

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

export interface ChapterReference {
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
  safety: {
    "zh-CN": {
      eyebrow: "Demo 10",
      title: "Safety / Eval：系统如何发现、阻断并修复风险？",
      description: "一个静态、教学型 Safety / Eval 反馈回路图解。",
      lede: "当 RAG 和 Agent 能读取外部知识、调用工具并产生外部影响时，系统必须把风险变成可复现测试。这个章节展示红队样本、输入护栏、最小权限、人工复核、回归评估和发布门如何形成持续反馈回路。",
      notesId: "safety-notes",
      notesEyebrow: "教学与事实边界",
      notesTitle: "通过评估不是“绝对安全”，而是让已知风险可测、可拦截、可回归",
      notesBody:
        "NIST 把生成式 AI 风险管理放在完整生命周期中，并强调部署前测试、持续评估、事件记录和定期复核。OWASP 说明提示注入无法只靠模型提示彻底消除，并建议最小权限与高风险动作人工批准。HELM 则展示为什么评估不能只看准确率，还要同时观察鲁棒性、安全、公平性和效率。本 demo 把这些原则压缩成一个间接提示注入案例，不构成完整安全基准或合规方案。",
      references: [
        {
          href: "https://doi.org/10.6028/NIST.AI.600-1",
          label: "NIST AI 600-1: Generative Artificial Intelligence Profile",
        },
        {
          href: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
          label: "OWASP LLM01:2025 Prompt Injection",
        },
        {
          href: "https://genai.owasp.org/llmrisk2023-24/llm08-excessive-agency/",
          label: "OWASP LLM08: Excessive Agency",
        },
        {
          href: "https://arxiv.org/abs/2211.09110",
          label: "Holistic Evaluation of Language Models (HELM)",
        },
      ],
    },
    en: {
      eyebrow: "Demo 10",
      title: "Safety / Eval: How do systems find, block, and fix risk?",
      description:
        "A static teaching diagram for the Safety / Eval feedback loop.",
      lede: "Once RAG and agents can read external knowledge, call tools, and affect external systems, failures need to become reproducible tests. This chapter shows how red-team cases, input guardrails, least privilege, human review, regression evaluation, and a release gate form a continuous feedback loop.",
      notesId: "safety-notes",
      notesEyebrow: "Teaching And Evidence Boundary",
      notesTitle:
        "Passing an evaluation is not absolute safety; it makes known risk measurable, interceptable, and repeatable",
      notesBody:
        "NIST places generative-AI risk management across the lifecycle and emphasizes pre-deployment testing, ongoing evaluation, incident records, and periodic review. OWASP explains that prompt injection cannot be eliminated by model instructions alone and recommends least privilege plus human approval for high-risk actions. HELM shows why evaluation needs metrics beyond accuracy, including robustness, safety-related harms, fairness, and efficiency. This demo compresses those principles into one indirect prompt-injection case; it is not a complete security benchmark or compliance program.",
      references: [
        {
          href: "https://doi.org/10.6028/NIST.AI.600-1",
          label: "NIST AI 600-1: Generative Artificial Intelligence Profile",
        },
        {
          href: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
          label: "OWASP LLM01:2025 Prompt Injection",
        },
        {
          href: "https://genai.owasp.org/llmrisk2023-24/llm08-excessive-agency/",
          label: "OWASP LLM08: Excessive Agency",
        },
        {
          href: "https://arxiv.org/abs/2211.09110",
          label: "Holistic Evaluation of Language Models (HELM)",
        },
      ],
    },
  },
} satisfies Record<CanonicalDemoChapterId, Record<Locale, DemoChapterCopy>>;

export type DemoChapterId = CanonicalDemoChapterId;
