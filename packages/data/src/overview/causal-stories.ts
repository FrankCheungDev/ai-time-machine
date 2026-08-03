import type { ChapterId } from "../chapters";
import { cloneData, defaultLocale, type Locale } from "../locales";
import type { TimelineEventId } from "./timeline-events";

export type CausalStoryLinkKind = "chapter" | "timeline" | "lineage";

export interface CausalStoryLink {
  id: string;
  kind: CausalStoryLinkKind;
  label: string;
  href: `/${string}`;
  chapterId?: ChapterId;
}

export interface CausalStoryStep {
  id: string;
  eventId: TimelineEventId;
  lineageNodeIds: string[];
  chapterIds: ChapterId[];
  title: string;
  inherited: string;
  solved: string;
  missing: string;
}

export interface CausalStory {
  id: CausalStoryId;
  title: string;
  coreQuestion: string;
  simplificationNote: string;
  steps: CausalStoryStep[];
  actions: CausalStoryLink[];
  returnLinks: {
    timeline: CausalStoryLink;
    lineage: CausalStoryLink;
  };
}

const causalStoryDefinitions = [
  {
    id: "feedback-learning",
    steps: [
      {
        id: "samuel-experience",
        eventId: "samuel-checkers",
        lineageNodeIds: ["symbolic", "statistical", "reinforcement-learning"],
        chapterIds: ["search", "reinforcement-learning"],
      },
      {
        id: "q-learning-values",
        eventId: "q-learning",
        lineageNodeIds: ["statistical", "reinforcement-learning"],
        chapterIds: ["reinforcement-learning"],
      },
      {
        id: "dqn-representations",
        eventId: "dqn-atari",
        lineageNodeIds: ["neural", "reinforcement-learning"],
        chapterIds: ["cnn", "reinforcement-learning"],
      },
      {
        id: "alphago-search",
        eventId: "alphago",
        lineageNodeIds: ["symbolic", "neural", "reinforcement-learning"],
        chapterIds: ["search", "cnn", "reinforcement-learning"],
      },
      {
        id: "instructgpt-preferences",
        eventId: "instructgpt-human-feedback",
        lineageNodeIds: [
          "reinforcement-learning",
          "foundation-model",
          "safety",
        ],
        chapterIds: ["reinforcement-learning", "foundation-model", "safety"],
      },
      {
        id: "agent-runtime-boundary",
        eventId: "react-agent-loop",
        lineageNodeIds: ["agent", "safety"],
        chapterIds: ["agent", "safety"],
      },
    ],
    actions: [
      {
        id: "open-feedback-learning-chapter",
        kind: "chapter",
        href: "/chapters/reinforcement-learning/",
        chapterId: "reinforcement-learning",
      },
      {
        id: "open-agent-boundary-chapter",
        kind: "chapter",
        href: "/chapters/agent/",
        chapterId: "agent",
      },
    ],
    returnLinks: {
      timeline: {
        id: "return-feedback-timeline",
        kind: "timeline",
        href: "/timeline/?story=feedback-learning#story-feedback-learning",
      },
      lineage: {
        id: "return-feedback-lineage",
        kind: "lineage",
        href: "/lineage/?story=feedback-learning#story-feedback-learning",
      },
    },
  },
  {
    id: "rules-to-representations",
    steps: [
      {
        id: "rules-astar-heuristics",
        eventId: "astar-formalized",
        lineageNodeIds: ["symbolic"],
        chapterIds: ["search"],
      },
      {
        id: "rules-mycin-expertise",
        eventId: "mycin-consultation",
        lineageNodeIds: ["expert"],
        chapterIds: ["expert-system"],
      },
      {
        id: "rules-bayesian-uncertainty",
        eventId: "bayesian-networks",
        lineageNodeIds: ["statistical"],
        chapterIds: ["bayes"],
      },
      {
        id: "rules-svm-boundaries",
        eventId: "support-vector-networks",
        lineageNodeIds: ["classical-ml"],
        chapterIds: ["decision-boundary"],
      },
      {
        id: "rules-lenet-representations",
        eventId: "lenet-document-recognition",
        lineageNodeIds: ["neural"],
        chapterIds: ["cnn"],
      },
      {
        id: "rules-imagenet-data",
        eventId: "imagenet-dataset",
        lineageNodeIds: ["neural"],
        chapterIds: ["cnn"],
      },
      {
        id: "rules-alexnet-scale",
        eventId: "alexnet-gpu-scale",
        lineageNodeIds: ["neural"],
        chapterIds: ["cnn"],
      },
    ],
    actions: [
      {
        id: "open-rules-expert-system-chapter",
        kind: "chapter",
        href: "/chapters/expert-system/",
        chapterId: "expert-system",
      },
      {
        id: "open-rules-cnn-chapter",
        kind: "chapter",
        href: "/chapters/cnn/",
        chapterId: "cnn",
      },
    ],
    returnLinks: {
      timeline: {
        id: "return-rules-representations-timeline",
        kind: "timeline",
        href: "/timeline/?story=rules-to-representations#story-rules-to-representations",
      },
      lineage: {
        id: "return-rules-representations-lineage",
        kind: "lineage",
        href: "/lineage/?story=rules-to-representations#story-rules-to-representations",
      },
    },
  },
  {
    id: "scaled-models-to-reliable-systems",
    steps: [
      {
        id: "systems-transformer-backbone",
        eventId: "transformer",
        lineageNodeIds: ["transformer", "foundation-model"],
        chapterIds: ["attention", "foundation-model"],
      },
      {
        id: "systems-scaling-laws",
        eventId: "language-model-scaling-laws",
        lineageNodeIds: ["foundation-model"],
        chapterIds: ["foundation-model"],
      },
      {
        id: "systems-gpt3-interface",
        eventId: "gpt3-few-shot",
        lineageNodeIds: ["foundation-model", "llm-system"],
        chapterIds: ["foundation-model", "llm-system"],
      },
      {
        id: "systems-rag-knowledge",
        eventId: "rag",
        lineageNodeIds: ["rag"],
        chapterIds: ["rag"],
      },
      {
        id: "systems-instructgpt-post-training",
        eventId: "instructgpt-human-feedback",
        lineageNodeIds: [
          "reinforcement-learning",
          "foundation-model",
          "llm-system",
          "safety",
        ],
        chapterIds: [
          "reinforcement-learning",
          "foundation-model",
          "llm-system",
          "safety",
        ],
      },
      {
        id: "systems-react-actions",
        eventId: "react-agent-loop",
        lineageNodeIds: ["agent"],
        chapterIds: ["agent"],
      },
      {
        id: "systems-nist-risk",
        eventId: "nist-generative-ai-profile",
        lineageNodeIds: ["safety"],
        chapterIds: ["safety"],
      },
    ],
    actions: [
      {
        id: "open-scaled-foundation-model-chapter",
        kind: "chapter",
        href: "/chapters/foundation-model/",
        chapterId: "foundation-model",
      },
      {
        id: "open-scaled-llm-system-chapter",
        kind: "chapter",
        href: "/chapters/llm-system/",
        chapterId: "llm-system",
      },
      {
        id: "open-scaled-safety-chapter",
        kind: "chapter",
        href: "/chapters/safety/",
        chapterId: "safety",
      },
    ],
    returnLinks: {
      timeline: {
        id: "return-scaled-systems-timeline",
        kind: "timeline",
        href: "/timeline/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems",
      },
      lineage: {
        id: "return-scaled-systems-lineage",
        kind: "lineage",
        href: "/lineage/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems",
      },
    },
  },
] as const satisfies readonly {
  id: string;
  steps: readonly {
    id: string;
    eventId: TimelineEventId;
    lineageNodeIds: readonly string[];
    chapterIds: readonly ChapterId[];
  }[];
  actions: readonly {
    id: string;
    kind: CausalStoryLinkKind;
    href: `/${string}`;
    chapterId: ChapterId;
  }[];
  returnLinks: {
    timeline: {
      id: string;
      kind: "timeline";
      href: `/${string}`;
    };
    lineage: {
      id: string;
      kind: "lineage";
      href: `/${string}`;
    };
  };
}[];

export type CausalStoryId = (typeof causalStoryDefinitions)[number]["id"];

type CausalStoryDefinition = (typeof causalStoryDefinitions)[number];
type CausalStoryDefinitionById = {
  [Definition in CausalStoryDefinition as Definition["id"]]: Definition;
};

interface CausalStoryStepCopy {
  title: string;
  inherited: string;
  solved: string;
  missing: string;
}

type CausalStoryCopy<Definition extends CausalStoryDefinition> = {
  title: string;
  coreQuestion: string;
  simplificationNote: string;
  steps: Record<Definition["steps"][number]["id"], CausalStoryStepCopy>;
  linkLabels: Record<
    | Definition["actions"][number]["id"]
    | Definition["returnLinks"]["timeline"]["id"]
    | Definition["returnLinks"]["lineage"]["id"],
    string
  >;
};

type CausalStoryLinkId<Definition extends CausalStoryDefinition> =
  | Definition["actions"][number]["id"]
  | Definition["returnLinks"]["timeline"]["id"]
  | Definition["returnLinks"]["lineage"]["id"];

type CausalStoryCopyById = {
  [StoryId in CausalStoryId]: CausalStoryCopy<
    CausalStoryDefinitionById[StoryId]
  >;
};

const localizedCausalStoryCopy = {
  "zh-CN": {
    "feedback-learning": {
      title: "从经验更新到反馈闭环",
      coreQuestion:
        "行动后的结果如何逐步进入价值学习、深度表示、偏好后训练与 Agent 系统？",
      simplificationNote:
        "这是一条经过审核的教学路径，不是唯一、完整或已被证明的历史因果链。它只突出反馈信号如何被不同系统复用；未选事件仍属于完整历史。Samuel 节点表示搜索、评估函数与经验更新的早期组合，不把 1959 年工作倒推为后来才形成的完整强化学习范式。",
      steps: {
        "samuel-experience": {
          title: "Samuel Checkers：经验开始改变后续选择",
          inherited: "继承博弈树搜索和人工设计的局面表示。",
          solved: "让运行经验更新评估函数，从而改变后续搜索倾向。",
          missing:
            "尚未形成后来强化学习的统一问题设定，也没有深度表示或通用收敛结果。",
        },
        "q-learning-values": {
          title: "Q-learning：用结果反馈更新动作价值",
          inherited: "继承状态、动作和累计结果的序贯决策问题。",
          solved:
            "给出增量动作价值更新，并在论文条件下建立收敛结果，不要求每一步提供目标动作。",
          missing:
            "表格或离散表示难以直接处理高维像素；有限样本和函数逼近也不由该定理自动保证。",
        },
        "dqn-representations": {
          title: "DQN：深度表示接入价值学习",
          inherited: "继承 Q-learning 的动作价值目标与 CNN 的视觉表示。",
          solved:
            "用深度网络和经验回放从 Atari 像素输入学习多个游戏的控制策略。",
          missing:
            "游戏基准中的结果不等于现实世界可靠控制，也没有消除探索、稳定性和泛化问题。",
        },
        "alphago-search": {
          title: "AlphaGo：学习与搜索重新组合",
          inherited: "继承监督学习、强化学习、策略与价值网络，以及经典树搜索。",
          solved:
            "让学习到的评估与 Monte Carlo 树搜索协同处理围棋的巨大行动空间。",
          missing: "不能归结为强化学习取代搜索，也不能从围棋表现推出通用智能。",
        },
        "instructgpt-preferences": {
          title: "InstructGPT：偏好信号进入语言模型后训练",
          inherited: "继承预训练语言模型、监督示范、候选排序和策略优化方法。",
          solved:
            "在研究的任务与评测分布中，用奖励模型和 PPO 让输出更符合标注协议下的偏好。",
          missing:
            "偏好不是普遍真理，受偏好不保证事实正确或完整安全，偏好优化也不只存在这一条路线。",
        },
        "agent-runtime-boundary": {
          title: "Agent / Safety：运行时反馈不等于训练更新",
          inherited:
            "继承语言模型、工具调用与 observation 驱动的计划修正循环。",
          solved:
            "让外部回执改变当前任务的下一步，并通过权限、停止条件与评估约束行动。",
          missing:
            "一次运行中的重试不能证明权重在线更新；可靠性仍需要明确训练管线与持续安全评估。",
        },
      },
      linkLabels: {
        "open-feedback-learning-chapter": "进入反馈学习章节",
        "open-agent-boundary-chapter": "对照 Agent 运行时边界",
        "return-feedback-timeline": "回到反馈学习时间线",
        "return-feedback-lineage": "回到反馈学习谱系",
      },
    },
    "rules-to-representations": {
      title: "从规则到可学习表示",
      coreQuestion:
        "当搜索、规则、不确定性建模和手工特征各自遇到限制时，AI 如何逐步转向数据驱动与可学习表示？",
      simplificationNote:
        "这是一条展示问题表示方式如何变化与重组的策展路径，不是规则被概率方法、经典机器学习再被深度学习逐步替代的单线历史。各条路线长期交叠；ImageNet 与 AlexNet 节点只突出共同数据、评测和算力如何与既有卷积机制组合。未选事件仍属于完整历史。",
      steps: {
        "rules-astar-heuristics": {
          title: "A*：用代价与启发信息组织搜索",
          inherited: "继承把路径问题表示成图、状态与可比较代价的做法。",
          solved:
            "在明确条件下，让已走路径代价与领域启发估计共同决定节点展开顺序。",
          missing:
            "启发信息仍由设计者提供；它没有从数据中学习特征，也不会自动表达不确定性。",
        },
        "rules-mycin-expertise": {
          title: "MYCIN：把领域知识写成可解释规则",
          inherited: "继承显式知识表示、规则匹配与受限问题求解。",
          solved: "用规则、置信因子和解释机制处理受限的感染诊疗咨询问题。",
          missing:
            "强表现依赖窄领域知识，知识获取、例外维护与责任边界仍是瓶颈。",
        },
        "rules-bayesian-uncertainty": {
          title: "Bayesian network：把不确定依赖组织成图",
          inherited: "继承结构化知识表示与根据证据更新判断的问题。",
          solved: "用有向图表达条件依赖，并把证据传播与概率推理放进同一框架。",
          missing:
            "图结构与变量仍需要建模；它没有直接解决从高维原始输入学习任务特征。",
        },
        "rules-svm-boundaries": {
          title: "SVM：从样本学习最大间隔边界",
          inherited: "继承带标签样本、特征表示与优化目标构成的分类问题。",
          solved:
            "把输入映射到高维特征空间，并由支持向量确定最大间隔分类边界。",
          missing:
            "学到分类边界不等于自动得到适合所有任务的多层表示或完整感知系统。",
        },
        "rules-lenet-representations": {
          title: "LeNet：卷积表示进入文档识别流程",
          inherited: "继承多层网络训练，并复用局部连接和参数共享。",
          solved: "把卷积网络与全局训练用于手写字符和支票读取等真实工程流程。",
          missing:
            "一个受限文档任务的成功没有证明同一规模的数据与计算能覆盖广泛视觉问题。",
        },
        "rules-imagenet-data": {
          title: "ImageNet：共同数据让视觉进步可比较",
          inherited: "继承对象识别对带标签样本、类别组织和共同评测的需求。",
          solved:
            "用 WordNet 层级组织大规模图像，为训练与可比较评测提供共同基础。",
          missing:
            "数据集本身不选择模型或完成训练，标签层级也限定了它能测量的问题。",
        },
        "rules-alexnet-scale": {
          title: "AlexNet：算法、数据与 GPU 规模同时组合",
          inherited: "继承深层卷积网络、ImageNet 任务与并行计算条件。",
          solved:
            "在约 120 万张训练图像上用高效 GPU 实现深层 CNN，并显著降低 ImageNet 错误率。",
          missing:
            "视觉基准突破不表示规则、概率推理或经典搜索已经失效，也不等于通用视觉已经解决。",
        },
      },
      linkLabels: {
        "open-rules-expert-system-chapter": "进入专家系统章节",
        "open-rules-cnn-chapter": "进入卷积表示章节",
        "return-rules-representations-timeline": "回到规则与表示时间线",
        "return-rules-representations-lineage": "回到规则与表示谱系",
      },
    },
    "scaled-models-to-reliable-systems": {
      title: "从规模化模型到可靠系统",
      coreQuestion:
        "规模化语言模型进入具体应用时，为什么还可能需要外部知识、后训练、行动循环和持续风险评估？",
      simplificationNote:
        "这是一条经过审核的系统边界路径，不是所有应用都必须经过的流水线，也不是已被证明的单线因果史。各节点解决不同问题，可以被组合、替换或省略；RAG 不会因此更新模型权重，偏好后训练不保证事实与安全，运行时 observation 也不等于训练更新。未选事件仍属于完整历史。",
      steps: {
        "systems-transformer-backbone": {
          title: "Transformer：并行 Attention 提供可扩展主干",
          inherited: "继承神经序列转换与从数据学习 token 表示的问题。",
          solved:
            "用 attention 取代循环与卷积主干，让 token 直接连接并提高训练并行性。",
          missing:
            "一种架构本身没有决定训练规模，也没有自动提供最新知识、可靠行动或风险治理。",
        },
        "systems-scaling-laws": {
          title: "Scaling Laws：把规模化变成可测量方向",
          inherited:
            "继承语言模型预测损失，以及模型、数据和计算规模的工程选择。",
          solved:
            "在研究范围内量化交叉熵损失与模型规模、数据规模和训练计算量的幂律关系。",
          missing: "更低训练损失本身不等于更可靠、更安全或更符合具体用户意图。",
        },
        "systems-gpt3-interface": {
          title: "GPT-3：任务适应进入文本上下文",
          inherited: "继承大规模预训练语言模型和自然语言生成接口。",
          solved:
            "让模型在不更新权重时，根据提示中的说明和少量示例完成多类任务。",
          missing:
            "上下文内适应不保证知识最新、答案可核验，也不赋予模型外部行动能力。",
        },
        "systems-rag-knowledge": {
          title: "RAG：把可检索知识接入生成上下文",
          inherited: "继承预训练生成模型、神经检索器与外部文档索引。",
          solved: "把参数记忆、可更新外部知识与生成过程拆成可组合的系统部件。",
          missing:
            "检索段落只进入当前上下文，不会更新模型权重，也不能保证最终回答正确。",
        },
        "systems-instructgpt-post-training": {
          title: "InstructGPT：用示范与偏好塑造助手行为",
          inherited: "继承预训练模型、监督示范、候选排序与策略优化。",
          solved: "在研究任务、标注协议与评测分布内，让输出更符合标注者偏好。",
          missing:
            "偏好不是普遍真理，受偏好不保证事实或完整安全，后训练也不只有这一条路线。",
        },
        "systems-react-actions": {
          title: "ReAct：让观察结果改变下一步行动",
          inherited: "继承语言模型推理、外部来源调用与计划修正。",
          solved:
            "交错生成推理轨迹、环境动作与观察，让系统根据回执更新当前计划。",
          missing:
            "一次运行中的 observation 不等于权重更新；工具错误、权限和停止条件仍需系统约束。",
        },
        "systems-nist-risk": {
          title: "NIST GenAI Profile：把风险证据变成持续过程",
          inherited: "继承 AI RMF 的生命周期风险管理框架。",
          solved:
            "把红队、事件记录、持续评估与风险处置映射到生成式 AI 风险管理。",
          missing:
            "治理指南不是模型能力，也不能保证组织已经落实控制或让风险永久消失。",
        },
      },
      linkLabels: {
        "open-scaled-foundation-model-chapter": "进入基础模型生命周期章节",
        "open-scaled-llm-system-chapter": "对照 LLM 系统边界",
        "open-scaled-safety-chapter": "进入安全与评估章节",
        "return-scaled-systems-timeline": "回到模型与系统时间线",
        "return-scaled-systems-lineage": "回到模型与系统谱系",
      },
    },
  },
  en: {
    "feedback-learning": {
      title: "From Experience Updates To Feedback Loops",
      coreQuestion:
        "How did outcomes after actions enter value learning, deep representations, preference post-training, and agent systems?",
      simplificationNote:
        "This is a reviewed teaching path, not the unique, complete, or proven causal history. It highlights how different systems reuse feedback signals while every unselected event remains part of the full history. The Samuel step represents an early combination of search, evaluation, and experience updates; it does not retroactively label the 1959 work as the complete reinforcement-learning paradigm later formalized.",
      steps: {
        "samuel-experience": {
          title: "Samuel Checkers: Experience Changes Later Choices",
          inherited:
            "It inherited game-tree search and hand-designed board representations.",
          solved:
            "Playing experience updated an evaluation function and changed later search tendencies.",
          missing:
            "It did not yet provide a unified later reinforcement-learning formulation, deep representations, or a general convergence result.",
        },
        "q-learning-values": {
          title: "Q-learning: Outcome Feedback Updates Action Values",
          inherited:
            "It inherited sequential decisions described by states, actions, and cumulative outcomes.",
          solved:
            "It supplied an incremental action-value update and a convergence result under the paper's conditions without target actions at every step.",
          missing:
            "Tabular or discrete representations did not directly handle high-dimensional pixels, and the theorem did not automatically cover finite data with function approximation.",
        },
        "dqn-representations": {
          title: "DQN: Deep Representations Enter Value Learning",
          inherited:
            "It inherited the Q-learning action-value objective and CNN visual representations.",
          solved:
            "A deep network and experience replay learned control policies for multiple Atari games from pixel input.",
          missing:
            "Results on game benchmarks did not establish reliable real-world control or remove exploration, stability, and generalization problems.",
        },
        "alphago-search": {
          title: "AlphaGo: Learning Recombines With Search",
          inherited:
            "It inherited supervised learning, reinforcement learning, policy and value networks, and classical tree search.",
          solved:
            "Learned evaluations worked with Monte Carlo tree search in Go's enormous action space.",
          missing:
            "The result cannot be reduced to reinforcement learning replacing search, nor can Go performance establish general intelligence.",
        },
        "instructgpt-preferences": {
          title: "InstructGPT: Preferences Enter Language-Model Post-Training",
          inherited:
            "It inherited pretrained language models, supervised demonstrations, candidate rankings, and policy optimization.",
          solved:
            "A reward model and PPO made outputs more preferred under the study's tasks, labeling protocol, and evaluation distributions.",
          missing:
            "Preferences are not universal truth, being preferred does not guarantee factuality or complete safety, and preference optimization has other routes.",
        },
        "agent-runtime-boundary": {
          title: "Agent / Safety: Runtime Feedback Is Not A Training Update",
          inherited:
            "It inherited language models, tool calls, and plan revision driven by observations.",
          solved:
            "External responses can change the next action in a current task, with permissions, stop conditions, and evaluation constraining action.",
          missing:
            "A retry during one run does not prove online weight updates. Reliability still needs an explicit training pipeline and ongoing safety evaluation.",
        },
      },
      linkLabels: {
        "open-feedback-learning-chapter": "Open the feedback-learning chapter",
        "open-agent-boundary-chapter": "Compare the agent runtime boundary",
        "return-feedback-timeline": "Return to the feedback-learning timeline",
        "return-feedback-lineage": "Return to the feedback-learning lineage",
      },
    },
    "rules-to-representations": {
      title: "From Rules To Learned Representations",
      coreQuestion:
        "When search, rules, uncertainty modeling, and hand-crafted features each met their limits, how did AI gradually shift toward data-driven and learnable representations?",
      simplificationNote:
        "This curated path shows changing and recombined problem representations, not a single line in which probability replaced rules, classical machine learning replaced probability, and deep learning replaced everything before it. The routes continued to overlap. The ImageNet and AlexNet steps only highlight how shared data, evaluation, and compute combined with existing convolutional mechanisms. Every unselected event remains part of the full history.",
      steps: {
        "rules-astar-heuristics": {
          title: "A*: Costs and Heuristics Organize Search",
          inherited:
            "It inherited the representation of path problems as graphs, states, and comparable costs.",
          solved:
            "Under explicit conditions, path cost and a domain heuristic could jointly determine node expansion order.",
          missing:
            "The heuristic still came from designers. The method did not learn features from data or automatically represent uncertainty.",
        },
        "rules-mycin-expertise": {
          title: "MYCIN: Domain Knowledge Becomes Explainable Rules",
          inherited:
            "It inherited explicit knowledge representation, rule matching, and constrained problem solving.",
          solved:
            "Rules, certainty factors, and explanation mechanisms supported a constrained infectious-disease consultation problem.",
          missing:
            "Strong performance depended on narrow domain knowledge, while knowledge acquisition, exception maintenance, and accountability remained bottlenecks.",
        },
        "rules-bayesian-uncertainty": {
          title: "Bayesian Networks: Uncertain Dependencies Become Graphs",
          inherited:
            "They inherited the problems of structured knowledge representation and updating judgments from evidence.",
          solved:
            "Directed graphs represented conditional dependence and put evidence propagation and probabilistic reasoning into one framework.",
          missing:
            "The graph structure and variables still required modeling, and the framework did not directly learn task features from high-dimensional raw input.",
        },
        "rules-svm-boundaries": {
          title: "SVMs: Samples Determine a Maximum-Margin Boundary",
          inherited:
            "They inherited a classification problem made from labeled samples, feature representations, and an optimization objective.",
          solved:
            "Inputs were mapped into a high-dimensional feature space, where support vectors determined a maximum-margin boundary.",
          missing:
            "Learning a classification boundary did not automatically produce a multilayer representation for every task or a complete perception system.",
        },
        "rules-lenet-representations": {
          title:
            "LeNet: Convolutional Representations Enter Document Pipelines",
          inherited:
            "It inherited multilayer network training while reusing local connectivity and shared parameters.",
          solved:
            "Convolutional networks and global training entered real handwriting and cheque-reading pipelines.",
          missing:
            "Success on a constrained document task did not establish that the same data and compute scale covered broad visual problems.",
        },
        "rules-imagenet-data": {
          title: "ImageNet: Shared Data Makes Vision Progress Comparable",
          inherited:
            "It inherited object recognition's need for labeled examples, organized categories, and a common evaluation task.",
          solved:
            "A large image collection organized by the WordNet hierarchy provided a shared base for training and comparable evaluation.",
          missing:
            "A dataset did not select or train a model by itself, and its label hierarchy bounded the questions it could measure.",
        },
        "rules-alexnet-scale": {
          title: "AlexNet: Algorithm, Data, and GPU Scale Combine",
          inherited:
            "It inherited deep convolutional networks, the ImageNet task, and parallel-compute conditions.",
          solved:
            "An efficient GPU implementation trained a deep CNN on about 1.2 million images and sharply reduced ImageNet error.",
          missing:
            "A vision-benchmark breakthrough did not make rules, probabilistic reasoning, or classical search obsolete, nor did it solve general vision.",
        },
      },
      linkLabels: {
        "open-rules-expert-system-chapter": "Open the expert-systems chapter",
        "open-rules-cnn-chapter":
          "Open the convolutional-representations chapter",
        "return-rules-representations-timeline":
          "Return to the rules and representations timeline",
        "return-rules-representations-lineage":
          "Return to the rules and representations lineage",
      },
    },
    "scaled-models-to-reliable-systems": {
      title: "From Scaled Models To Reliable Systems",
      coreQuestion:
        "When scaled language models enter concrete applications, why might they still need external knowledge, post-training, action loops, and ongoing risk evaluation?",
      simplificationNote:
        "This is a reviewed system-boundary path, not a pipeline that every application must follow or a proven linear causal history. The steps address different problems and may be combined, replaced, or omitted. RAG does not thereby update model weights, preference post-training does not guarantee truth or safety, and a runtime observation is not a training update. Every unselected event remains part of the full history.",
      steps: {
        "systems-transformer-backbone": {
          title:
            "The Transformer: Parallel Attention Provides a Scalable Backbone",
          inherited:
            "It inherited neural sequence transduction and the problem of learning token representations from data.",
          solved:
            "Attention replaced the recurrent and convolutional backbone, directly connected tokens, and improved training parallelism.",
          missing:
            "An architecture alone did not determine training scale or automatically provide current knowledge, reliable action, or risk governance.",
        },
        "systems-scaling-laws": {
          title: "Scaling Laws: Scale Becomes a Measurable Direction",
          inherited:
            "They inherited language-model prediction loss and engineering choices across model, data, and compute scale.",
          solved:
            "Within the study's scope, power-law relationships connected cross-entropy loss with model size, dataset size, and training compute.",
          missing:
            "Lower training loss alone did not establish reliability, safety, or alignment with a concrete user's intent.",
        },
        "systems-gpt3-interface": {
          title: "GPT-3: Task Adaptation Enters the Text Context",
          inherited:
            "It inherited large-scale pretrained language models and a natural-language generation interface.",
          solved:
            "Instructions and a few prompt examples supported many tasks without updating model weights.",
          missing:
            "In-context adaptation did not guarantee current knowledge or verifiable answers, and it did not itself grant external action capabilities.",
        },
        "systems-rag-knowledge": {
          title: "RAG: Retrievable Knowledge Enters Generation Context",
          inherited:
            "It inherited a pretrained generator, a neural retriever, and an external document index.",
          solved:
            "Parametric memory, updateable external knowledge, and generation became separable system components.",
          missing:
            "Retrieved passages entered only the current context. They did not update model weights or guarantee a correct final answer.",
        },
        "systems-instructgpt-post-training": {
          title:
            "InstructGPT: Demonstrations and Preferences Shape Assistant Behavior",
          inherited:
            "It inherited pretrained models, supervised demonstrations, candidate rankings, and policy optimization.",
          solved:
            "Outputs became more preferred within the study's tasks, labeling protocol, and evaluation distributions.",
          missing:
            "Preferences are not universal truth, being preferred does not guarantee factuality or complete safety, and post-training has other routes.",
        },
        "systems-react-actions": {
          title: "ReAct: Observations Change the Next Action",
          inherited:
            "It inherited language-model reasoning, calls to external sources, and plan revision.",
          solved:
            "Reasoning traces, environment actions, and observations alternated so responses could update the current plan.",
          missing:
            "A runtime observation was not a weight update. Tool errors, permissions, and stopping conditions still required system constraints.",
        },
        "systems-nist-risk": {
          title:
            "The NIST GenAI Profile: Risk Evidence Becomes an Ongoing Process",
          inherited:
            "It inherited the AI RMF lifecycle framework for managing risk.",
          solved:
            "Red teaming, incident records, ongoing evaluation, and risk treatment were mapped onto generative-AI risk management.",
          missing:
            "Governance guidance is not a model capability and cannot prove that an organization implemented controls or permanently removed risk.",
        },
      },
      linkLabels: {
        "open-scaled-foundation-model-chapter":
          "Open the foundation-model lifecycle chapter",
        "open-scaled-llm-system-chapter": "Compare the LLM-system boundary",
        "open-scaled-safety-chapter": "Open the safety and evaluation chapter",
        "return-scaled-systems-timeline":
          "Return to the models and systems timeline",
        "return-scaled-systems-lineage":
          "Return to the models and systems lineage",
      },
    },
  },
} satisfies Record<Locale, CausalStoryCopyById>;

const causalStoryIds = new Set<string>(
  causalStoryDefinitions.map(({ id }) => id),
);

export function isCausalStoryId(value: unknown): value is CausalStoryId {
  return typeof value === "string" && causalStoryIds.has(value);
}

function assembleCausalStory<Definition extends CausalStoryDefinition>(
  definition: Definition,
  copy: CausalStoryCopy<Definition>,
): CausalStory {
  const stepCopies: Readonly<Record<string, CausalStoryStepCopy>> = copy.steps;
  const linkLabels: Readonly<Record<string, string>> = copy.linkLabels;
  const labelFor = (id: CausalStoryLinkId<Definition>) => linkLabels[id];

  return {
    id: definition.id,
    title: copy.title,
    coreQuestion: copy.coreQuestion,
    simplificationNote: copy.simplificationNote,
    steps: definition.steps.map((step) => {
      const stepCopy = stepCopies[step.id];

      if (!stepCopy) {
        throw new Error(`Missing copy for causal story step: ${step.id}`);
      }

      return {
        ...step,
        lineageNodeIds: [...step.lineageNodeIds],
        chapterIds: [...step.chapterIds],
        ...stepCopy,
      };
    }),
    actions: definition.actions.map((link) => ({
      ...link,
      label: labelFor(link.id),
    })),
    returnLinks: {
      timeline: {
        ...definition.returnLinks.timeline,
        label: labelFor(definition.returnLinks.timeline.id),
      },
      lineage: {
        ...definition.returnLinks.lineage,
        label: labelFor(definition.returnLinks.lineage.id),
      },
    },
  };
}

function buildCausalStory(
  definition: CausalStoryDefinition,
  locale: Locale,
): CausalStory {
  const localizedCopy = localizedCausalStoryCopy[locale];

  switch (definition.id) {
    case "feedback-learning":
      return assembleCausalStory(
        definition,
        localizedCopy["feedback-learning"],
      );
    case "rules-to-representations":
      return assembleCausalStory(
        definition,
        localizedCopy["rules-to-representations"],
      );
    case "scaled-models-to-reliable-systems":
      return assembleCausalStory(
        definition,
        localizedCopy["scaled-models-to-reliable-systems"],
      );
  }
}

export function getCausalStories(
  locale: Locale = defaultLocale,
): CausalStory[] {
  return cloneData(
    causalStoryDefinitions.map((definition) =>
      buildCausalStory(definition, locale),
    ),
  );
}

export function getCausalStory(
  id: CausalStoryId,
  locale: Locale = defaultLocale,
): CausalStory {
  const story = getCausalStories(locale).find(
    (candidate) => candidate.id === id,
  );

  if (!story) {
    throw new Error(`Unknown causal story: ${id}`);
  }

  return story;
}

export const causalStories = getCausalStories();
