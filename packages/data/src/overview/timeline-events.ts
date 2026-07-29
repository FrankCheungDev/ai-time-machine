import type { ChapterId } from "../chapters";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

export type TimelineEventType =
  | "paper"
  | "book"
  | "system"
  | "dataset"
  | "compute"
  | "turning-point"
  | "standard";

export type TimelineSourceKind =
  "primary-paper" | "book" | "official-record" | "standard";

export interface TimelineEventSource {
  label: string;
  href: `https://${string}`;
  kind: TimelineSourceKind;
}

export interface TimelineMilestoneEvent {
  id: string;
  sortYear: number;
  year: string;
  type: TimelineEventType;
  chapterIds: ChapterId[];
  lineageNodeIds: string[];
  title: string;
  summary: string;
  impact: string;
  sources: TimelineEventSource[];
}

interface TimelineEventDefinition {
  id: string;
  sortYear: number;
  year: string;
  type: TimelineEventType;
  chapterIds: readonly ChapterId[];
  lineageNodeIds: readonly string[];
  sources: readonly TimelineEventSource[];
}

const timelineEventDefinitions = [
  {
    id: "turing-imitation-game",
    sortYear: 1950,
    year: "1950",
    type: "paper",
    chapterIds: ["overview", "search"],
    lineageNodeIds: ["symbolic"],
    sources: [
      {
        label: "Computing Machinery and Intelligence",
        href: "https://doi.org/10.1093/mind/LIX.236.433",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "dartmouth-proposal",
    sortYear: 1955,
    year: "1955–1956",
    type: "turning-point",
    chapterIds: ["overview", "search"],
    lineageNodeIds: ["symbolic"],
    sources: [
      {
        label: "A Proposal for the Dartmouth Summer Research Project on AI",
        href: "https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html",
        kind: "official-record",
      },
    ],
  },
  {
    id: "rosenblatt-perceptron",
    sortYear: 1958,
    year: "1958",
    type: "paper",
    chapterIds: ["decision-boundary", "cnn"],
    lineageNodeIds: ["classical-ml", "neural"],
    sources: [
      {
        label: "The Perceptron",
        href: "https://doi.org/10.1037/h0042519",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "samuel-checkers",
    sortYear: 1959,
    year: "1959",
    type: "system",
    chapterIds: ["search", "decision-boundary"],
    lineageNodeIds: ["symbolic", "statistical"],
    sources: [
      {
        label: "Some Studies in Machine Learning Using the Game of Checkers",
        href: "https://doi.org/10.1147/rd.33.0210",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "shakey-robot",
    sortYear: 1966,
    year: "1966–1972",
    type: "system",
    chapterIds: ["search", "agent"],
    lineageNodeIds: ["symbolic", "agent"],
    sources: [
      {
        label: "SRI: Shakey the Robot",
        href: "https://www.sri.com/hoi/shakey-the-robot/",
        kind: "official-record",
      },
    ],
  },
  {
    id: "astar-formalized",
    sortYear: 1968,
    year: "1968",
    type: "paper",
    chapterIds: ["search"],
    lineageNodeIds: ["symbolic"],
    sources: [
      {
        label:
          "A Formal Basis for the Heuristic Determination of Minimum Cost Paths",
        href: "https://doi.org/10.1109/TSSC.1968.300136",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "lighthill-report",
    sortYear: 1972,
    year: "1972–1973",
    type: "turning-point",
    chapterIds: ["overview", "search", "expert-system"],
    lineageNodeIds: ["symbolic", "expert"],
    sources: [
      {
        label: "Artificial Intelligence: A General Survey",
        href: "https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf",
        kind: "official-record",
      },
    ],
  },
  {
    id: "mycin-consultation",
    sortYear: 1976,
    year: "1976",
    type: "system",
    chapterIds: ["expert-system"],
    lineageNodeIds: ["expert"],
    sources: [
      {
        label: "Computer-Based Medical Consultations: MYCIN",
        href: "https://doi.org/10.1016/B978-0-444-00179-5.X5001-X",
        kind: "book",
      },
    ],
  },
  {
    id: "backprop-representations",
    sortYear: 1986,
    year: "1986",
    type: "paper",
    chapterIds: ["cnn"],
    lineageNodeIds: ["neural"],
    sources: [
      {
        label: "Learning Representations by Back-Propagating Errors",
        href: "https://doi.org/10.1038/323533a0",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "bayesian-networks",
    sortYear: 1988,
    year: "1988",
    type: "book",
    chapterIds: ["bayes"],
    lineageNodeIds: ["statistical"],
    sources: [
      {
        label: "Probabilistic Reasoning in Intelligent Systems",
        href: "https://www.sciencedirect.com/book/9780080514895/probabilistic-reasoning-in-intelligent-systems",
        kind: "book",
      },
    ],
  },
  {
    id: "support-vector-networks",
    sortYear: 1995,
    year: "1995",
    type: "paper",
    chapterIds: ["decision-boundary"],
    lineageNodeIds: ["classical-ml"],
    sources: [
      {
        label: "Support-Vector Networks",
        href: "https://doi.org/10.1007/BF00994018",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "deep-blue",
    sortYear: 1997,
    year: "1997",
    type: "system",
    chapterIds: ["search"],
    lineageNodeIds: ["symbolic"],
    sources: [
      {
        label: "IBM: Deep Blue",
        href: "https://www.ibm.com/history/deep-blue",
        kind: "official-record",
      },
    ],
  },
  {
    id: "lenet-document-recognition",
    sortYear: 1998,
    year: "1998",
    type: "paper",
    chapterIds: ["cnn"],
    lineageNodeIds: ["neural"],
    sources: [
      {
        label: "Gradient-Based Learning Applied to Document Recognition",
        href: "https://doi.org/10.1109/5.726791",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "imagenet-dataset",
    sortYear: 2009,
    year: "2009",
    type: "dataset",
    chapterIds: ["cnn"],
    lineageNodeIds: ["neural"],
    sources: [
      {
        label: "ImageNet: A Large-Scale Hierarchical Image Database",
        href: "https://www.image-net.org/static_files/papers/imagenet_cvpr09.pdf",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "alexnet-gpu-scale",
    sortYear: 2012,
    year: "2012",
    type: "compute",
    chapterIds: ["cnn"],
    lineageNodeIds: ["neural"],
    sources: [
      {
        label:
          "ImageNet Classification with Deep Convolutional Neural Networks",
        href: "https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "alphago",
    sortYear: 2016,
    year: "2016",
    type: "system",
    chapterIds: ["search", "cnn", "agent"],
    lineageNodeIds: ["symbolic", "neural", "agent"],
    sources: [
      {
        label:
          "Mastering the Game of Go with Deep Neural Networks and Tree Search",
        href: "https://doi.org/10.1038/nature16961",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "transformer",
    sortYear: 2017,
    year: "2017",
    type: "paper",
    chapterIds: ["attention", "foundation-model"],
    lineageNodeIds: ["transformer", "foundation-model"],
    sources: [
      {
        label: "Attention Is All You Need",
        href: "https://papers.nips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "language-model-scaling-laws",
    sortYear: 2020,
    year: "2020",
    type: "paper",
    chapterIds: ["foundation-model"],
    lineageNodeIds: ["foundation-model"],
    sources: [
      {
        label: "Scaling Laws for Neural Language Models",
        href: "https://arxiv.org/abs/2001.08361",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "gpt3-few-shot",
    sortYear: 2020,
    year: "2020",
    type: "paper",
    chapterIds: ["foundation-model", "llm-system"],
    lineageNodeIds: ["foundation-model", "llm-system"],
    sources: [
      {
        label: "Language Models Are Few-Shot Learners",
        href: "https://papers.nips.cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract.html",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "rag",
    sortYear: 2020,
    year: "2020",
    type: "paper",
    chapterIds: ["rag"],
    lineageNodeIds: ["rag"],
    sources: [
      {
        label:
          "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        href: "https://papers.nips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "flan-instruction-tuning",
    sortYear: 2021,
    year: "2021",
    type: "paper",
    chapterIds: ["foundation-model"],
    lineageNodeIds: ["foundation-model"],
    sources: [
      {
        label: "Finetuned Language Models Are Zero-Shot Learners",
        href: "https://arxiv.org/abs/2109.01652",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "instructgpt-human-feedback",
    sortYear: 2022,
    year: "2022",
    type: "paper",
    chapterIds: ["foundation-model", "llm-system", "safety"],
    lineageNodeIds: ["foundation-model", "llm-system", "safety"],
    sources: [
      {
        label:
          "Training Language Models to Follow Instructions with Human Feedback",
        href: "https://arxiv.org/abs/2203.02155",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "react-agent-loop",
    sortYear: 2022,
    year: "2022–2023",
    type: "paper",
    chapterIds: ["agent"],
    lineageNodeIds: ["agent"],
    sources: [
      {
        label: "ReAct: Synergizing Reasoning and Acting in Language Models",
        href: "https://arxiv.org/abs/2210.03629",
        kind: "primary-paper",
      },
    ],
  },
  {
    id: "nist-ai-rmf",
    sortYear: 2023,
    year: "2023",
    type: "standard",
    chapterIds: ["safety"],
    lineageNodeIds: ["safety"],
    sources: [
      {
        label: "NIST AI Risk Management Framework 1.0",
        href: "https://doi.org/10.6028/NIST.AI.100-1",
        kind: "standard",
      },
    ],
  },
  {
    id: "nist-generative-ai-profile",
    sortYear: 2024,
    year: "2024",
    type: "standard",
    chapterIds: ["safety"],
    lineageNodeIds: ["safety"],
    sources: [
      {
        label: "NIST Generative Artificial Intelligence Profile",
        href: "https://doi.org/10.6028/NIST.AI.600-1",
        kind: "standard",
      },
    ],
  },
] as const satisfies readonly TimelineEventDefinition[];

export type TimelineEventId = (typeof timelineEventDefinitions)[number]["id"];

interface TimelineEventCopy {
  title: string;
  summary: string;
  impact: string;
}

const localizedTimelineEventCopy = {
  "zh-CN": {
    "turing-imitation-game": {
      title: "图灵把“机器会思考吗”改写为可检验问题",
      summary:
        "《计算机器与智能》用模仿游戏讨论机器智能，把抽象争论转向可以观察的行为证据。",
      impact:
        "它没有给出完整智能定义，却建立了此后 AI 研究反复使用的基准思路：先明确任务，再讨论证据。",
    },
    "dartmouth-proposal": {
      title: "Dartmouth 提案为“人工智能”建立共同研究议程",
      summary:
        "1955 年提案为 1956 年夏季项目设定语言、抽象、问题求解、自我改进和神经网络等问题。",
      impact:
        "它把分散的计算、逻辑和神经研究聚到一个名称下，也留下了远大目标与现实能力之间的长期张力。",
    },
    "rosenblatt-perceptron": {
      title: "感知机让分类边界可以从样本中学习",
      summary:
        "Rosenblatt 用概率模型描述一个可根据输入调整连接并完成识别的假想神经系统。",
      impact:
        "可学习权重替代了部分手写规则，但单层边界的能力有限，后来推动了对多层表示的探索。",
    },
    "samuel-checkers": {
      title: "跳棋程序展示机器可从经验改善策略",
      summary:
        "Samuel 的程序把搜索、局面评估和学习结合起来，实验证明程序能超过其编写者的跳棋水平。",
      impact:
        "“机器学习”不再只是概念：系统可以用运行经验更新评估函数，并改变后续搜索选择。",
    },
    "shakey-robot": {
      title: "Shakey 把感知、规划与行动接进同一循环",
      summary:
        "SRI 在 1966 至 1972 年研究的移动机器人可以感知环境、规划路线并移动简单物体。",
      impact:
        "它把图搜索和规划从纸面问题带到受限物理环境，也暴露了现实感知与行动的工程成本。",
    },
    "astar-formalized": {
      title: "A* 为启发式最小成本路径搜索提供形式基础",
      summary:
        "Hart、Nilsson 与 Raphael 说明如何把领域启发信息纳入图搜索，并讨论一类策略的最优性质。",
      impact:
        "搜索不再只是盲目枚举；路径成本与启发估计可以在明确条件下共同指导展开顺序。",
    },
    "lighthill-report": {
      title: "Lighthill 报告记录早期 AI 的失望与资金质疑",
      summary:
        "报告认为许多早期承诺没有兑现，并把组合爆炸列为通用系统扩展时的核心障碍。",
      impact:
        "它是第一次 AI 寒冬背景中的代表性原始材料；这里把它视为英国评审观点，而不是全球衰退的单一原因。",
    },
    "mycin-consultation": {
      title: "MYCIN 把领域知识组织成可解释规则咨询",
      summary: "MYCIN 用规则、置信因子和解释机制处理受限的感染诊疗咨询问题。",
      impact:
        "专家系统证明窄领域知识可以带来强表现，同时把知识获取、例外维护和责任边界变成新瓶颈。",
    },
    "backprop-representations": {
      title: "反向传播让隐藏层学到任务相关表示",
      summary:
        "Rumelhart、Hinton 与 Williams 描述通过输出误差反复调整连接权重的学习过程。",
      impact:
        "多层网络可以形成中间特征，不必只依赖人工设计的输入表示，为后来的深度学习复兴提供关键机制。",
    },
    "bayesian-networks": {
      title: "Bayesian network 把不确定关系组织成图",
      summary:
        "Pearl 系统化了用有向图表达条件依赖、传播证据并进行概率推理的方法。",
      impact:
        "概率更新从单个公式扩展为结构化推理框架，让知识、依赖和不确定性可以共同建模。",
    },
    "support-vector-networks": {
      title: "SVM 用最大间隔构造可泛化决策边界",
      summary:
        "Cortes 与 Vapnik 把输入映射到高维特征空间，并用支持向量确定分类边界。",
      impact:
        "经典机器学习把优化目标、边界复杂度和泛化联系起来，成为深度学习前的重要高性能路线。",
    },
    "deep-blue": {
      title: "Deep Blue 在标准赛制中击败国际象棋世界冠军",
      summary:
        "IBM 系统通过专用搜索、评估和大规模并行计算，在 1997 年六局赛中战胜 Garry Kasparov。",
      impact:
        "胜利说明窄任务中的搜索与算力可以达到超人表现，但不等于系统获得了通用智能。",
    },
    "lenet-document-recognition": {
      title: "LeNet 展示卷积网络可进入真实文档识别流程",
      summary:
        "论文比较手写字符识别方法，并展示卷积网络与全局训练在支票读取系统中的应用。",
      impact:
        "局部连接和参数共享从机制变成工程系统，为后来更大规模视觉网络提供可复用结构。",
    },
    "imagenet-dataset": {
      title: "ImageNet 把大规模带标签图像变成共同数据基础",
      summary:
        "ImageNet 以 WordNet 层级组织大规模图像数据，为对象识别训练与可比较评测提供基础。",
      impact:
        "数据规模与统一任务让模型进步可以被持续比较，也为深度视觉的算力竞赛准备了条件。",
    },
    "alexnet-gpu-scale": {
      title: "AlexNet 把深层 CNN、ImageNet 与 GPU 规模结合",
      summary:
        "2012 年系统在 130 万张训练图像上使用深层卷积网络和高效 GPU 实现，显著降低 ImageNet 错误率。",
      impact:
        "算法、数据和算力同时到位后，深度学习从长期研究路线转为视觉领域的主流工程方法。",
    },
    alphago: {
      title: "AlphaGo 把深度网络、自我对弈与树搜索组合起来",
      summary:
        "系统用策略网络选择动作、价值网络评估局面，并与 Monte Carlo 树搜索结合。",
      impact:
        "它展示学习表示和经典搜索不是互相替代，而可以在闭环系统中协同解决巨大搜索空间。",
    },
    transformer: {
      title: "Transformer 用 Attention 取代序列递归主干",
      summary:
        "论文提出仅基于 attention 的序列转换架构，省去循环与卷积，并提升训练并行性。",
      impact: "token 间直接连接和并行训练成为基础模型扩展的关键结构前提。",
    },
    "language-model-scaling-laws": {
      title: "语言模型 Scaling Laws 量化规模与训练损失的关系",
      summary:
        "论文在研究范围内观察到，交叉熵损失随模型规模、数据规模和训练计算量呈现幂律变化。",
      impact:
        "规模化从经验性尝试变成可测量的工程方向，但较低训练损失本身不等于更可靠、更安全或更符合用户意图。",
    },
    "gpt3-few-shot": {
      title: "GPT-3 展示规模化语言模型的文本内任务适应",
      summary:
        "1750 亿参数模型在不更新权重的情况下，通过提示中的说明和少量示例完成多类任务。",
      impact:
        "能力入口从专门微调部分转向通用文本交互，同时也放大了数据、评估和系统约束的重要性。",
    },
    rag: {
      title: "RAG 把参数记忆与可检索外部记忆结合",
      summary:
        "RAG 用神经检索器访问 Wikipedia 稠密索引，再让生成模型依据检索段落作答。",
      impact:
        "知识更新、来源追踪和生成能力可以拆成系统部件，而不必把全部事实都固化在模型参数中。",
    },
    "flan-instruction-tuning": {
      title: "FLAN 展示跨任务 Instruction Tuning 的零样本迁移",
      summary:
        "研究用自然语言指令描述的一组任务继续微调预训练语言模型，并评估未见任务上的零样本表现。",
      impact:
        "后训练开始明确塑造“理解请求并按任务格式回答”的行为，而不只是扩大预训练模型。",
    },
    "instructgpt-human-feedback": {
      title: "InstructGPT 用示范、排序与人类反馈塑造助手行为",
      summary:
        "研究先用标注者示范监督微调，再用候选输出排序训练反馈信号并继续优化模型。",
      impact:
        "研究显示特定评测分布中的偏好可明显改善，同时也明确记录简单错误和未解决限制；受偏好不等于事实正确或完整安全。",
    },
    "react-agent-loop": {
      title: "ReAct 交错生成推理轨迹与环境动作",
      summary:
        "方法让语言模型在推理、调用外部来源、观察结果和更新计划之间交替推进。",
      impact:
        "Agent 的核心不只是生成一份计划，而是让观察结果持续改变下一步动作。",
    },
    "nist-ai-rmf": {
      title: "NIST AI RMF 把风险治理组织成持续函数",
      summary:
        "AI RMF 1.0 用 Govern、Map、Measure、Manage 四个函数组织 AI 生命周期风险管理。",
      impact:
        "安全与可靠性从单次测试扩展为贯穿设计、部署、监控与复评的组织过程。",
    },
    "nist-generative-ai-profile": {
      title: "NIST 为生成式 AI 补充专门风险画像",
      summary:
        "生成式 AI Profile 把红队、事件记录、持续评估和风险处置映射到 AI RMF。",
      impact:
        "现代生成系统的发布门需要可重复证据和持续监控，不能用一次通过代表风险已经消失。",
    },
  },
  en: {
    "turing-imitation-game": {
      title: "Turing Reframed Machine Intelligence as a Testable Question",
      summary:
        "Computing Machinery and Intelligence used the imitation game to discuss machine intelligence, shifting an abstract argument toward observable behavioral evidence.",
      impact:
        "It did not define intelligence completely, but established a recurring AI pattern: specify the task first, then debate the evidence.",
    },
    "dartmouth-proposal": {
      title:
        "The Dartmouth Proposal Set a Shared Agenda for Artificial Intelligence",
      summary:
        "The 1955 proposal for the 1956 summer project named language, abstraction, problem solving, self-improvement, and neural nets as research problems.",
      impact:
        "It gathered computing, logic, and neural research under one label while exposing the lasting tension between ambitious goals and available capability.",
    },
    "rosenblatt-perceptron": {
      title: "The Perceptron Made a Classification Boundary Learnable",
      summary:
        "Rosenblatt described a probabilistic model of a hypothetical nervous system that could adjust connections from input and perform recognition.",
      impact:
        "Learned weights replaced some hand-written rules, while the limits of a single layer later motivated work on multilayer representations.",
    },
    "samuel-checkers": {
      title: "A Checkers Program Showed That Experience Could Improve Strategy",
      summary:
        "Samuel combined search, position evaluation, and learning, reporting a program that could play better checkers than its author.",
      impact:
        "Machine learning became an implemented mechanism: experience could update an evaluation function and alter later search choices.",
    },
    "shakey-robot": {
      title: "Shakey Connected Perception, Planning, and Action",
      summary:
        "SRI's mobile robot, researched from 1966 to 1972, could perceive its surroundings, plan routes, and rearrange simple objects.",
      impact:
        "It moved graph search and planning into a constrained physical world and exposed the engineering cost of real perception and action.",
    },
    "astar-formalized": {
      title: "A* Put Heuristic Minimum-Cost Search on a Formal Basis",
      summary:
        "Hart, Nilsson, and Raphael showed how domain heuristics could enter graph search and established an optimality property for a class of strategies.",
      impact:
        "Search no longer meant only blind enumeration: path cost and an estimate could jointly guide expansion under explicit conditions.",
    },
    "lighthill-report": {
      title:
        "The Lighthill Report Recorded Early AI Disappointment and Funding Doubt",
      summary:
        "The report argued that many early promises had not been met and highlighted combinatorial explosion as a barrier to scaling general systems.",
      impact:
        "It is representative primary evidence for the first AI-winter context; this atlas treats it as one UK review, not the single cause of a global downturn.",
    },
    "mycin-consultation": {
      title:
        "MYCIN Organized Domain Knowledge as Explainable Consultation Rules",
      summary:
        "MYCIN used rules, certainty factors, and explanation mechanisms for a constrained infectious-disease consultation problem.",
      impact:
        "Expert systems showed the power of narrow domain knowledge while turning knowledge acquisition, exceptions, and accountability into new bottlenecks.",
    },
    "backprop-representations": {
      title:
        "Backpropagation Let Hidden Layers Learn Task-Relevant Representations",
      summary:
        "Rumelhart, Hinton, and Williams described repeatedly adjusting connection weights from output error.",
      impact:
        "Multilayer networks could form intermediate features instead of relying only on hand-designed inputs, providing a key mechanism for the later deep-learning revival.",
    },
    "bayesian-networks": {
      title: "Bayesian Networks Organized Uncertain Relationships as Graphs",
      summary:
        "Pearl systematized directed graphs for conditional dependence, evidence propagation, and probabilistic reasoning.",
      impact:
        "Probability updating grew from an isolated formula into a structured framework combining knowledge, dependencies, and uncertainty.",
    },
    "support-vector-networks": {
      title: "SVMs Used Maximum Margins to Build Generalizable Boundaries",
      summary:
        "Cortes and Vapnik mapped inputs into high-dimensional feature spaces and used support vectors to determine a classification boundary.",
      impact:
        "Classical machine learning linked optimization, boundary capacity, and generalization, becoming a major high-performance route before deep learning.",
    },
    "deep-blue": {
      title:
        "Deep Blue Defeated the World Chess Champion Under Standard Match Controls",
      summary:
        "IBM's system combined specialized search, evaluation, and massive parallel computation to defeat Garry Kasparov in a six-game match in 1997.",
      impact:
        "The win showed that search and compute could exceed humans in a narrow task, not that the system had acquired general intelligence.",
    },
    "lenet-document-recognition": {
      title:
        "LeNet Brought Convolutional Networks into Real Document Pipelines",
      summary:
        "The paper compared handwriting-recognition methods and described convolutional networks plus global training in cheque-reading systems.",
      impact:
        "Local connectivity and shared parameters moved from mechanisms into deployed engineering, providing reusable structure for larger vision networks.",
    },
    "imagenet-dataset": {
      title: "ImageNet Made Large Labeled Image Collections a Shared Data Base",
      summary:
        "ImageNet organized large-scale image data with the WordNet hierarchy, supporting object-recognition training and comparable evaluation.",
      impact:
        "Data scale and a common task made progress measurable and prepared the conditions for a compute-intensive deep-vision race.",
    },
    "alexnet-gpu-scale": {
      title: "AlexNet Combined Deep CNNs, ImageNet, and GPU Scale",
      summary:
        "The 2012 system trained a deep convolutional network on 1.3 million images with an efficient GPU implementation and sharply reduced ImageNet error.",
      impact:
        "When algorithm, data, and compute arrived together, deep learning shifted from a long-running research route to mainstream vision engineering.",
    },
    alphago: {
      title: "AlphaGo Combined Deep Networks, Self-Play, and Tree Search",
      summary:
        "The system used policy networks to select moves, value networks to evaluate positions, and Monte Carlo tree search to plan.",
      impact:
        "It showed that learned representations and classical search can cooperate in a closed-loop system rather than simply replace one another.",
    },
    transformer: {
      title:
        "The Transformer Replaced the Recurrent Sequence Backbone with Attention",
      summary:
        "The paper proposed a sequence-transduction architecture based only on attention, removing recurrence and convolution while improving training parallelism.",
      impact:
        "Direct token connections and parallel training became key structural preconditions for scaling foundation models.",
    },
    "language-model-scaling-laws": {
      title:
        "Language-Model Scaling Laws Quantified Scale Against Training Loss",
      summary:
        "Within the study's scope, cross-entropy loss followed power-law relationships with model size, dataset size, and training compute.",
      impact:
        "Scaling became a measurable engineering direction, while lower training loss alone did not establish reliability, safety, or alignment with user intent.",
    },
    "gpt3-few-shot": {
      title: "GPT-3 Showed In-Text Task Adaptation at Language-Model Scale",
      summary:
        "The 175-billion-parameter model performed many tasks from instructions and examples in its prompt without updating its weights.",
      impact:
        "The capability interface shifted partly from task-specific fine-tuning to general text interaction, increasing the importance of data, evaluation, and system constraints.",
    },
    rag: {
      title: "RAG Combined Parametric and Retrievable External Memory",
      summary:
        "RAG used a neural retriever over a dense Wikipedia index and conditioned generation on retrieved passages.",
      impact:
        "Knowledge updates, provenance, and generation could become separate system components instead of putting every fact into model parameters.",
    },
    "flan-instruction-tuning": {
      title:
        "FLAN Showed Zero-Shot Transfer from Cross-Task Instruction Tuning",
      summary:
        "The study further tuned a pretrained language model on tasks described by natural-language instructions and evaluated zero-shot performance on unseen tasks.",
      impact:
        "Post-training began to shape behavior around recognizing requests and following task formats instead of only enlarging the pretrained model.",
    },
    "instructgpt-human-feedback": {
      title:
        "InstructGPT Used Demonstrations, Rankings, and Human Feedback to Shape Assistant Behavior",
      summary:
        "The study first used labeler demonstrations for supervised fine-tuning, then ranked candidate outputs to train a feedback signal and optimize the model further.",
      impact:
        "Preferences improved substantially on the evaluated distribution, while the paper still documented simple mistakes and unresolved limits; being preferred did not establish factuality or complete safety.",
    },
    "react-agent-loop": {
      title: "ReAct Interleaved Reasoning Traces with Environment Actions",
      summary:
        "The method alternated language-model reasoning, calls to external sources, observations, and plan updates.",
      impact:
        "An agent's core is not merely producing a plan; observations must keep changing the next action.",
    },
    "nist-ai-rmf": {
      title: "NIST AI RMF Organized Risk Governance as Continuous Functions",
      summary:
        "AI RMF 1.0 organized lifecycle risk management into Govern, Map, Measure, and Manage functions.",
      impact:
        "Safety and reliability expanded from one-time testing into an organizational process spanning design, deployment, monitoring, and review.",
    },
    "nist-generative-ai-profile": {
      title: "NIST Added a Dedicated Risk Profile for Generative AI",
      summary:
        "The Generative AI Profile mapped red teaming, incident records, ongoing evaluation, and treatment of risk onto the AI RMF.",
      impact:
        "Release gates for modern generative systems need repeatable evidence and ongoing monitoring; one passing run cannot prove that risk is gone.",
    },
  },
} satisfies Record<Locale, Record<TimelineEventId, TimelineEventCopy>>;

export function getAiTimelineEvents(
  locale: Locale = defaultLocale,
): TimelineMilestoneEvent[] {
  const localizedCopy = getLocalizedValue(localizedTimelineEventCopy, locale);

  return timelineEventDefinitions.map((event) => ({
    ...event,
    chapterIds: [...event.chapterIds],
    lineageNodeIds: [...event.lineageNodeIds],
    sources: event.sources.map((source) => ({ ...source })),
    ...localizedCopy[event.id],
  }));
}

export const aiTimelineEvents = getAiTimelineEvents();
