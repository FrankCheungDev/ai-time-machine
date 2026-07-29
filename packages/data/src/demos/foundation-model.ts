import type {
  FoundationModelDemo,
  FoundationModelEdge,
  FoundationModelNode,
  FoundationModelStep,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const foundationModelNodeTopology = [
  { id: "corpus", x: 20, y: 170 },
  { id: "pretraining", x: 172, y: 170 },
  { id: "base-model", x: 324, y: 170 },
  { id: "instruction-tuning", x: 476, y: 170 },
  { id: "instruction-model", x: 628, y: 170 },
  { id: "preference-feedback", x: 780, y: 170 },
  { id: "assistant-model", x: 932, y: 170 },
  { id: "runtime-context", x: 628, y: 326 },
  { id: "output", x: 932, y: 326 },
] as const satisfies readonly Pick<FoundationModelNode, "id" | "x" | "y">[];

type FoundationModelNodeId = (typeof foundationModelNodeTopology)[number]["id"];

const foundationModelEdgeTopology = [
  { id: "corpus-pretraining", from: "corpus", to: "pretraining" },
  { id: "pretraining-base", from: "pretraining", to: "base-model" },
  { id: "base-instruction", from: "base-model", to: "instruction-tuning" },
  {
    id: "instruction-model",
    from: "instruction-tuning",
    to: "instruction-model",
  },
  {
    id: "instruction-preference",
    from: "instruction-model",
    to: "preference-feedback",
  },
  {
    id: "preference-assistant",
    from: "preference-feedback",
    to: "assistant-model",
  },
  { id: "assistant-output", from: "assistant-model", to: "output" },
  { id: "context-output", from: "runtime-context", to: "output" },
] as const satisfies readonly {
  id: string;
  from: FoundationModelNodeId;
  to: FoundationModelNodeId;
}[];

type FoundationModelEdgeId = (typeof foundationModelEdgeTopology)[number]["id"];

const foundationModelStepTopology = [
  {
    id: "corpus-objective",
    nodeId: "pretraining",
    activeNodeIds: ["corpus", "pretraining"],
    activeEdgeIds: ["corpus-pretraining"],
  },
  {
    id: "base-model",
    nodeId: "base-model",
    activeNodeIds: ["corpus", "pretraining", "base-model"],
    activeEdgeIds: ["corpus-pretraining", "pretraining-base"],
  },
  {
    id: "instruction-tuning",
    nodeId: "instruction-model",
    activeNodeIds: [
      "corpus",
      "pretraining",
      "base-model",
      "instruction-tuning",
      "instruction-model",
    ],
    activeEdgeIds: [
      "corpus-pretraining",
      "pretraining-base",
      "base-instruction",
      "instruction-model",
    ],
  },
  {
    id: "preference-feedback",
    nodeId: "preference-feedback",
    activeNodeIds: [
      "corpus",
      "pretraining",
      "base-model",
      "instruction-tuning",
      "instruction-model",
      "preference-feedback",
    ],
    activeEdgeIds: [
      "corpus-pretraining",
      "pretraining-base",
      "base-instruction",
      "instruction-model",
      "instruction-preference",
    ],
  },
  {
    id: "assistant-limit",
    nodeId: "assistant-model",
    activeNodeIds: [
      "corpus",
      "pretraining",
      "base-model",
      "instruction-tuning",
      "instruction-model",
      "preference-feedback",
      "assistant-model",
    ],
    activeEdgeIds: [
      "corpus-pretraining",
      "pretraining-base",
      "base-instruction",
      "instruction-model",
      "instruction-preference",
      "preference-assistant",
    ],
  },
  {
    id: "runtime-context",
    nodeId: "output",
    activeNodeIds: ["assistant-model", "runtime-context", "output"],
    activeEdgeIds: ["assistant-output", "context-output"],
  },
] as const satisfies readonly {
  id: string;
  nodeId: FoundationModelNodeId;
  activeNodeIds: readonly FoundationModelNodeId[];
  activeEdgeIds: readonly FoundationModelEdgeId[];
}[];

type FoundationModelStepId = (typeof foundationModelStepTopology)[number]["id"];
type FoundationModelNodeCopy = Pick<
  FoundationModelNode,
  "label" | "description"
>;
type FoundationModelStepCopy = Pick<
  FoundationModelStep,
  | "title"
  | "description"
  | "statusLabel"
  | "finding"
  | "findingTone"
  | "outputTitle"
  | "outputPreview"
>;
type FoundationModelCopy = Omit<
  FoundationModelDemo,
  "nodes" | "edges" | "steps"
> & {
  nodes: Record<FoundationModelNodeId, FoundationModelNodeCopy>;
  steps: Record<FoundationModelStepId, FoundationModelStepCopy>;
};

const foundationModelCopies = {
  "zh-CN": {
    title: "基础模型生命周期：预测 token 如何变成按指令协作？",
    question: "预训练、指令微调、偏好反馈和运行时上下文分别改变了什么？",
    simplificationNote:
      "本案例用一条历史上重要的后训练路径解释职责边界，不运行真实训练、标注、奖励模型或推理。不同模型会使用不同数据、目标和优化方法；偏好反馈也不保证事实正确、安全或完全符合用户意图。",
    learningGoals: [
      "区分预训练获得的通用模式与后训练塑造的交互行为。",
      "理解指令数据和偏好比较会更新权重，而运行时上下文只影响当前生成。",
      "知道更会按指令协作不等于拥有实时知识、权限或可靠性保证。",
    ],
    nodes: {
      corpus: { label: "训练语料", description: "大规模文本样本" },
      pretraining: { label: "Pretraining", description: "预测后续 token" },
      "base-model": { label: "Base Model", description: "学习通用模式" },
      "instruction-tuning": {
        label: "Instruction Tuning",
        description: "学习任务示例",
      },
      "instruction-model": {
        label: "Instruction Model",
        description: "更会遵循格式",
      },
      "preference-feedback": {
        label: "Preference Feedback",
        description: "比较候选输出",
      },
      "assistant-model": {
        label: "Assistant Model",
        description: "行为经过后训练",
      },
      "runtime-context": {
        label: "Runtime Context",
        description: "本次请求材料",
      },
      output: { label: "Output", description: "当前一次回答" },
    },
    steps: {
      "corpus-objective": {
        title: "预训练把大规模语料变成预测任务",
        description:
          "模型反复根据前文预测后续 token。规模化数据与计算可以降低训练损失，但语料不是逐条核验的事实库。",
        statusLabel: "预训练目标",
        finding:
          "预测目标提供广泛语言模式，不直接定义“怎样才是对用户最有帮助的回答”。",
        findingTone: "data",
        outputTitle: "训练信号",
        outputPreview: "给定：人工智能的发展…… → 预测下一个 token",
      },
      "base-model": {
        title: "Base Model 学会续写，却未必稳定执行指令",
        description:
          "自回归预训练形成可以生成和少样本适配的基础模型，但更大的模型不会自动等于更符合用户意图。",
        statusLabel: "基础能力",
        finding:
          "Base Model 的核心能力是条件生成；“按要求完成任务”仍需要额外行为塑造。",
        findingTone: "base",
        outputTitle: "固定提示：请用三点总结这段话",
        outputPreview: "这段话讨论了……接下来作者可能会继续说明……",
      },
      "instruction-tuning": {
        title: "Instruction Tuning 用任务示例塑造指令跟随",
        description:
          "带有自然语言指令和目标回答的任务集合继续更新模型权重，使模型更能识别请求格式，并迁移到未见任务。",
        statusLabel: "指令微调",
        finding:
          "指令微调改变的是模型对任务和回答格式的行为倾向，不是查询时临时塞入一条提示。",
        findingTone: "instruction",
        outputTitle: "同一提示，指令模型",
        outputPreview: "1. 核心变化…… 2. 关键限制…… 3. 后续影响……",
      },
      "preference-feedback": {
        title: "偏好反馈比较候选，而不是声明唯一正确答案",
        description:
          "标注者的示范与排序可以用于监督微调和基于反馈的进一步优化，让某类输出更常被选择。",
        statusLabel: "偏好塑形",
        finding:
          "偏好数据表达特定标注流程下的选择；它可能有盲区、分歧和分布外失效。",
        findingTone: "preference",
        outputTitle: "候选比较",
        outputPreview:
          "A：直接但缺少边界　B：清晰、相关并说明不确定性 → 选择 B",
      },
      "assistant-limit": {
        title: "后训练模型更会协作，但仍然会犯错",
        description:
          "历史实验显示较小的 InstructGPT 输出可以比更大的 GPT-3 更受偏好，但论文也明确记录了简单错误和未解决限制。",
        statusLabel: "行为改进",
        finding:
          "更受偏好不等于事实正确，也不会自动提供私有数据、外部权限或完整安全保证。",
        findingTone: "preference",
        outputTitle: "Assistant Model",
        outputPreview: "按指定格式回答，并在证据不足时表达限制。",
      },
      "runtime-context": {
        title: "运行时上下文改变本次输出，不会现场重训权重",
        description:
          "部署后，系统把当前指令和材料与后训练模型组合生成一次回答。若任务需要新知识、状态或动作，仍要交给外部系统边界。",
        statusLabel: "训练 / 推理边界",
        finding:
          "训练阶段更新权重；推理阶段使用固定权重处理当前上下文。这正是下一章从模型走向系统的入口。",
        findingTone: "boundary",
        outputTitle: "本次运行",
        outputPreview:
          "Assistant Model + 当前上下文 → 当前回答（权重保持不变）",
      },
    },
  },
  en: {
    title:
      "Foundation Model Lifecycle: How does token prediction become instruction following?",
    question:
      "What changes during pretraining, instruction tuning, preference feedback, and runtime context?",
    simplificationNote:
      "This demo uses one historically important post-training path to explain responsibility boundaries. It runs no real training, labeling, reward model, or inference. Models use different data, objectives, and optimization methods, and preference feedback does not guarantee factuality, safety, or complete alignment with user intent.",
    learningGoals: [
      "Separate broad patterns learned in pretraining from interaction behavior shaped in post-training.",
      "Understand that instruction data and preference comparisons can update weights while runtime context changes only the current generation.",
      "Recognize that better instruction following does not provide live knowledge, permissions, or a reliability guarantee.",
    ],
    nodes: {
      corpus: { label: "Training Corpus", description: "large text samples" },
      pretraining: { label: "Pretraining", description: "predict next tokens" },
      "base-model": { label: "Base Model", description: "broad patterns" },
      "instruction-tuning": {
        label: "Instruction Tuning",
        description: "learn task examples",
      },
      "instruction-model": {
        label: "Instruction Model",
        description: "follows formats better",
      },
      "preference-feedback": {
        label: "Preference Feedback",
        description: "compare candidates",
      },
      "assistant-model": {
        label: "Assistant Model",
        description: "post-trained behavior",
      },
      "runtime-context": {
        label: "Runtime Context",
        description: "this request's material",
      },
      output: { label: "Output", description: "one current answer" },
    },
    steps: {
      "corpus-objective": {
        title: "Pretraining turns a large corpus into a prediction task",
        description:
          "The model repeatedly predicts later tokens from earlier text. More data and compute can reduce training loss, but the corpus is not a fact-checked database.",
        statusLabel: "Pretraining objective",
        finding:
          "The prediction objective supplies broad language patterns; it does not directly define the most helpful response to a user.",
        findingTone: "data",
        outputTitle: "Training signal",
        outputPreview: "Given: The history of AI… → predict the next token",
      },
      "base-model": {
        title:
          "A base model learns continuation without reliably executing instructions",
        description:
          "Autoregressive pretraining produces a model that can generate and adapt from examples, but making it larger does not automatically align it with user intent.",
        statusLabel: "Base capability",
        finding:
          "A base model is fundamentally a conditional generator. Stable task following still needs additional behavior shaping.",
        findingTone: "base",
        outputTitle: "Fixed prompt: Summarize this in three points",
        outputPreview:
          "This passage discusses… The author may continue by explaining…",
      },
      "instruction-tuning": {
        title: "Instruction tuning shapes task following with examples",
        description:
          "Collections of natural-language instructions and target responses continue updating model weights, improving recognition of task formats and transfer to unseen tasks.",
        statusLabel: "Instruction tuning",
        finding:
          "Instruction tuning changes behavioral tendencies through weight updates; it is not a prompt inserted temporarily at query time.",
        findingTone: "instruction",
        outputTitle: "The same prompt, after instruction tuning",
        outputPreview:
          "1. Core change… 2. Key limitation… 3. Downstream effect…",
      },
      "preference-feedback": {
        title:
          "Preference feedback compares candidates instead of declaring one universal truth",
        description:
          "Demonstrations and ranked outputs can support supervised fine-tuning and further feedback-based optimization so selected behavior appears more often.",
        statusLabel: "Preference shaping",
        finding:
          "Preference data reflects choices within a particular labeling process and can contain blind spots, disagreement, and out-of-distribution failures.",
        findingTone: "preference",
        outputTitle: "Candidate comparison",
        outputPreview:
          "A: direct but unqualified　B: clear, relevant, and scoped → prefer B",
      },
      "assistant-limit": {
        title:
          "A post-trained assistant is more cooperative and still fallible",
        description:
          "Historical evaluations found that a smaller InstructGPT model could be preferred over a much larger GPT-3 model, while the paper still documented simple mistakes and unresolved limitations.",
        statusLabel: "Behavior improved",
        finding:
          "Being preferred does not guarantee factuality or provide private data, external permissions, or complete safety.",
        findingTone: "preference",
        outputTitle: "Assistant Model",
        outputPreview:
          "Follow the requested format and state a limitation when evidence is missing.",
      },
      "runtime-context": {
        title:
          "Runtime context changes this output without retraining the weights",
        description:
          "After deployment, the system combines current instructions and material with the post-trained model for one generation. New knowledge, state, or actions still require external system boundaries.",
        statusLabel: "Training / inference boundary",
        finding:
          "Training updates weights; inference uses fixed weights with current context. That boundary leads directly into the next chapter's model-plus-system view.",
        findingTone: "boundary",
        outputTitle: "This runtime call",
        outputPreview:
          "Assistant Model + current context → current answer (weights stay fixed)",
      },
    },
  },
} satisfies Record<Locale, FoundationModelCopy>;

export function getFoundationModelDemo(
  locale: Locale = defaultLocale,
): FoundationModelDemo {
  const copy =
    foundationModelCopies[locale] ?? foundationModelCopies[defaultLocale];
  const { nodes, steps, ...metadata } = copy;

  return cloneData({
    ...metadata,
    nodes: foundationModelNodeTopology.map(({ id, x, y }) => ({
      id,
      x,
      y,
      ...nodes[id],
    })),
    edges: foundationModelEdgeTopology.map(({ id, from, to }) => ({
      id,
      from,
      to,
    })) satisfies FoundationModelEdge[],
    steps: foundationModelStepTopology.map(
      ({ id, nodeId, activeNodeIds, activeEdgeIds }) => ({
        id,
        nodeId,
        activeNodeIds: [...activeNodeIds],
        activeEdgeIds: [...activeEdgeIds],
        ...steps[id],
      }),
    ),
  });
}

export const foundationModelDemo = getFoundationModelDemo();
