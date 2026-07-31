import type { ChapterId } from "../chapters";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

export interface ConceptCheckOption {
  id: string;
  label: string;
}

export interface ConceptCheck {
  id: string;
  chapterId: ChapterId;
  prompt: string;
  options: ConceptCheckOption[];
  correctOptionId: string;
  explanation: string;
}

const conceptCheckDefinitions = [
  {
    id: "overview-paradigm-reuse",
    chapterId: "overview",
    correctOptionId: "recombine",
  },
  {
    id: "search-astar-priority",
    chapterId: "search",
    correctOptionId: "cost-plus-estimate",
  },
  {
    id: "expert-system-rule-match",
    chapterId: "expert-system",
    correctOptionId: "all-conditions",
  },
  {
    id: "bayes-neutral-evidence",
    chapterId: "bayes",
    correctOptionId: "stay-at-prior",
  },
  {
    id: "decision-boundary-training-points",
    chapterId: "decision-boundary",
    correctOptionId: "points-shape-boundary",
  },
  {
    id: "cnn-shared-kernel",
    chapterId: "cnn",
    correctOptionId: "reuse-weights",
  },
  {
    id: "reinforcement-learning-runtime-boundary",
    chapterId: "reinforcement-learning",
    correctOptionId: "runtime-observation",
  },
  {
    id: "attention-direct-links",
    chapterId: "attention",
    correctOptionId: "weighted-direct-links",
  },
  {
    id: "foundation-model-runtime-boundary",
    chapterId: "foundation-model",
    correctOptionId: "context-only",
  },
  {
    id: "llm-system-boundary",
    chapterId: "llm-system",
    correctOptionId: "system-layers",
  },
  {
    id: "rag-context-not-training",
    chapterId: "rag",
    correctOptionId: "retrieved-context",
  },
  {
    id: "agent-observe-revise",
    chapterId: "agent",
    correctOptionId: "observe-and-revise",
  },
  {
    id: "safety-regression-limit",
    chapterId: "safety",
    correctOptionId: "known-risk-evidence",
  },
] as const;

interface ConceptCheckCopy {
  prompt: string;
  options: readonly ConceptCheckOption[];
  explanation: string;
}

const localizedConceptCheckCopy = {
  "zh-CN": {
    overview: {
      prompt: "这条 AI 历史主线最想说明哪一种关系？",
      options: [
        {
          id: "replace",
          label: "新范式出现后，旧机制就完全失效",
        },
        {
          id: "recombine",
          label: "后来的系统会重新组合搜索、概率、表示学习等旧机制",
        },
        {
          id: "chronology-only",
          label: "技术之间没有因果关系，只需记住年份",
        },
      ],
      explanation:
        "技术史不是一条“新方法淘汰旧方法”的直线。AlphaGo、RAG 与 Agent 都把早期搜索、概率推理或系统控制重新组合进新架构。",
    },
    search: {
      prompt: "A* 在本章演示中用什么决定优先展开哪个 frontier 节点？",
      options: [
        {
          id: "estimate-only",
          label: "只看离目标的估计距离 h",
        },
        {
          id: "cost-plus-estimate",
          label: "比较已走成本 g 与剩余估计 h 的和 f = g + h",
        },
        {
          id: "alphabetical",
          label: "始终按节点名称排序",
        },
      ],
      explanation:
        "A* 同时考虑已经付出的路径成本 g 和对剩余成本的启发估计 h。只看 h 会忽略绕远路已经付出的代价。",
    },
    "expert-system": {
      prompt: "一条 if-then 规则什么时候可以在演示中触发？",
      options: [
        {
          id: "one-condition",
          label: "任意一个条件为真就触发",
        },
        {
          id: "all-conditions",
          label: "前提条件全部满足，并且没有命中阻断它的例外",
        },
        {
          id: "latest-rule",
          label: "总是触发最后写入规则库的规则",
        },
      ],
      explanation:
        "规则推理依赖明确的条件组合。缺少一个前提或命中例外都会改变结论，这也是规则库随领域扩大后难以维护的原因。",
    },
    bayes: {
      prompt: "如果证据支持度是演示中的中性 50%，后验信念会怎样？",
      options: [
        {
          id: "become-fifty",
          label: "无论先验是多少，后验都变成 50%",
        },
        {
          id: "stay-at-prior",
          label: "证据没有偏向任一方向，后验保持在先验附近",
        },
        {
          id: "become-certain",
          label: "证据一出现，后验就变成 100%",
        },
      ],
      explanation:
        "Bayes 更新把新证据与原有先验结合。中性证据没有提供支持或反对的方向，因此不应凭空把信念推到 50% 或 100%。",
    },
    "decision-boundary": {
      prompt: "为什么移动一个离群点可能让演示中的决策边界变化？",
      options: [
        {
          id: "points-shape-boundary",
          label: "训练样本的位置会影响学习到的分隔方式",
        },
        {
          id: "color-animation",
          label: "边界只是跟随点的颜色做动画",
        },
        {
          id: "labels-ignored",
          label: "分类边界完全不看样本与标签",
        },
      ],
      explanation:
        "分类器从带标签样本中寻找分隔规律。离群点改变了数据几何关系，可能迫使边界移动、弯曲，或暴露过拟合。",
    },
    cnn: {
      prompt: "同一个卷积核滑过图像不同位置时，最关键的机制是什么？",
      options: [
        {
          id: "new-weights-everywhere",
          label: "每个像素位置都重新生成一套权重",
        },
        {
          id: "reuse-weights",
          label: "在不同局部窗口复用同一组核权重",
        },
        {
          id: "whole-image-once",
          label: "只对整张图计算一次全局平均",
        },
      ],
      explanation:
        "局部感受野让卷积核查看小窗口，参数共享让同一特征探测器可以在不同位置复用，而不是为每个位置学习独立权重。",
    },
    "reinforcement-learning": {
      prompt:
        "Agent 调用工具失败后，根据错误回执修改参数并重试。这一事实本身说明了什么？",
      options: [
        {
          id: "automatic-gradient",
          label: "失败回执自动变成梯度，并在线更新了模型权重",
        },
        {
          id: "runtime-observation",
          label:
            "当前运行中的 observation 改变了下一步动作，但不能单独证明权重已更新",
        },
        {
          id: "reward-means-rl",
          label: "只要界面出现 reward 文案，就一定正在运行强化学习",
        },
      ],
      explanation:
        "运行时 observation 可以让 Agent 在当前任务中修正计划或工具参数。除非系统另有明确的训练数据、目标和更新管线，这个重试本身不代表模型权重发生了在线更新。",
    },
    attention: {
      prompt: "Attention 相比链式 RNN 路径，如何连接相距较远的 token？",
      options: [
        {
          id: "weighted-direct-links",
          label: "根据当前上下文建立加权的直接连接",
        },
        {
          id: "fixed-neighbors",
          label: "每个 token 永远只看左右一个邻居",
        },
        {
          id: "causal-proof",
          label: "权重越大就证明两个词存在因果关系",
        },
      ],
      explanation:
        "Attention 让 token 在一次层计算中聚合其他位置的信息。权重表达当前模型中的信息路径，不等于人类解释或因果证据。",
    },
    "foundation-model": {
      prompt: "把新材料放进 Runtime Context 时，演示中什么会改变？",
      options: [
        {
          id: "retrain-weights",
          label: "模型权重会在每次请求时自动重训",
        },
        {
          id: "context-only",
          label: "固定权重处理本次上下文，改变当前输出",
        },
        {
          id: "grant-permissions",
          label: "模型自动获得外部工具和私有数据权限",
        },
      ],
      explanation:
        "预训练和后训练阶段可以更新模型权重；普通推理使用固定权重处理当前指令与材料。实时知识、工具和权限仍需要外部系统明确提供。",
    },
    "llm-system": {
      prompt: "为什么现代 AI 应用不能只画一个“LLM”方框？",
      options: [
        {
          id: "model-knows-everything",
          label: "模型参数天然包含最新事实、权限与完整记忆",
        },
        {
          id: "system-layers",
          label: "上下文、检索、工具、记忆、权限和评估承担不同系统职责",
        },
        {
          id: "ui-only",
          label: "外部系统只负责改变页面颜色",
        },
      ],
      explanation:
        "模型生成只是系统的一部分。知识新鲜度、真实动作、状态保存、权限控制和发布评估需要由边界清楚的外部组件承担。",
    },
    rag: {
      prompt: "RAG 检索到片段后，对模型做了什么？",
      options: [
        {
          id: "retrain-weights",
          label: "每次提问都重新训练并永久修改模型权重",
        },
        {
          id: "retrieved-context",
          label: "把相关片段放进本次生成上下文，作为可引用证据",
        },
        {
          id: "guarantee-truth",
          label: "只要检索过，答案就必然正确",
        },
      ],
      explanation:
        "RAG 通常不在查询时更新模型参数，而是提供外部上下文。检索错误或证据冲突仍会带偏生成，所以来源与评估不可省略。",
    },
    agent: {
      prompt: "工具调用失败后，一个可靠的 Agent 循环应该先做什么？",
      options: [
        {
          id: "repeat-blindly",
          label: "忽略结果并无限重复同一个动作",
        },
        {
          id: "observe-and-revise",
          label: "读取 observation，更新计划，再决定是否重试或停止",
        },
        {
          id: "claim-success",
          label: "直接生成成功结论，避免暴露失败",
        },
      ],
      explanation:
        "Agent 的闭环来自“动作后的观察”。失败结果必须改变下一步；预算、停止条件与权限边界则防止循环失控。",
    },
    safety: {
      prompt: "修复版通过 RT-017 回归用例，最准确的结论是什么？",
      options: [
        {
          id: "all-risk-gone",
          label: "系统已经证明不存在任何其他风险",
        },
        {
          id: "known-risk-evidence",
          label: "这个已知失败有了可重复证据，但仍需持续发现和评估其他风险",
        },
        {
          id: "guardrails-unneeded",
          label: "既然测试通过，就可以移除权限和人工复核",
        },
      ],
      explanation:
        "回归测试防止一个已知失败悄悄复发，却不覆盖未知场景。Safety / Eval 必须持续运行，并和最小权限、人工复核共同工作。",
    },
  },
  en: {
    overview: {
      prompt: "What relationship is this AI history path primarily teaching?",
      options: [
        {
          id: "replace",
          label: "Every new paradigm makes older mechanisms completely useless",
        },
        {
          id: "recombine",
          label:
            "Later systems recombine older mechanisms such as search, probability, and representation learning",
        },
        {
          id: "chronology-only",
          label: "Technologies have no causal links, so only the dates matter",
        },
      ],
      explanation:
        "Technical history is not a straight line of replacement. AlphaGo, RAG, and agents all recombine earlier search, probabilistic reasoning, or control mechanisms inside new architectures.",
    },
    search: {
      prompt:
        "What determines which frontier node A* expands first in this chapter?",
      options: [
        {
          id: "estimate-only",
          label: "Only the estimated distance h",
        },
        {
          id: "cost-plus-estimate",
          label: "The traveled cost g plus remaining estimate h, so f = g + h",
        },
        {
          id: "alphabetical",
          label: "The node name in alphabetical order",
        },
      ],
      explanation:
        "A* combines the path cost already paid, g, with a heuristic estimate of what remains, h. Looking only at h would ignore the cost of a detour already taken.",
    },
    "expert-system": {
      prompt: "When can an if-then rule fire in the demo?",
      options: [
        {
          id: "one-condition",
          label: "As soon as any one condition is true",
        },
        {
          id: "all-conditions",
          label:
            "When every premise is satisfied and no blocking exception matches",
        },
        {
          id: "latest-rule",
          label: "Whenever it is the most recently added rule",
        },
      ],
      explanation:
        "Rule inference depends on an explicit combination of conditions. A missing premise or matching exception changes the result, which is why large rule bases become difficult to maintain.",
    },
    bayes: {
      prompt:
        "What happens when evidence support is a neutral 50% in the demo?",
      options: [
        {
          id: "become-fifty",
          label: "The posterior always becomes 50%, whatever the prior was",
        },
        {
          id: "stay-at-prior",
          label:
            "The evidence favors neither direction, so the posterior stays near the prior",
        },
        {
          id: "become-certain",
          label: "Any new evidence makes the posterior 100%",
        },
      ],
      explanation:
        "Bayesian updating combines new evidence with an existing prior. Neutral evidence adds no directional support, so it should not force belief to 50% or 100%.",
    },
    "decision-boundary": {
      prompt:
        "Why can moving one outlier change the decision boundary in the demo?",
      options: [
        {
          id: "points-shape-boundary",
          label: "Training-example positions influence the learned separator",
        },
        {
          id: "color-animation",
          label: "The boundary only follows the point color as an animation",
        },
        {
          id: "labels-ignored",
          label: "A classification boundary ignores examples and labels",
        },
      ],
      explanation:
        "A classifier looks for a separating pattern in labeled examples. An outlier changes that geometry and may move or bend the boundary, or reveal overfitting.",
    },
    cnn: {
      prompt:
        "What is the key mechanism when one convolution kernel slides across an image?",
      options: [
        {
          id: "new-weights-everywhere",
          label: "It creates a separate set of weights at every pixel",
        },
        {
          id: "reuse-weights",
          label: "It reuses the same kernel weights across local windows",
        },
        {
          id: "whole-image-once",
          label: "It computes one global average for the whole image",
        },
      ],
      explanation:
        "Local receptive fields inspect small windows, while parameter sharing lets the same feature detector work at different positions instead of learning unrelated weights everywhere.",
    },
    "reinforcement-learning": {
      prompt:
        "An agent changes tool parameters and retries after reading an error response. What does this fact establish by itself?",
      options: [
        {
          id: "automatic-gradient",
          label:
            "The error response automatically became a gradient and updated model weights online",
        },
        {
          id: "runtime-observation",
          label:
            "A runtime observation changed the next action, but does not by itself prove that weights updated",
        },
        {
          id: "reward-means-rl",
          label:
            "Any interface that mentions a reward must be running reinforcement learning",
        },
      ],
      explanation:
        "A runtime observation can make an agent revise its plan or tool parameters in the current task. Unless the system has an explicit training dataset, objective, and update pipeline, the retry alone does not mean that model weights changed online.",
    },
    attention: {
      prompt:
        "How does attention connect distant tokens compared with a chained RNN path?",
      options: [
        {
          id: "weighted-direct-links",
          label:
            "It creates weighted direct links based on the current context",
        },
        {
          id: "fixed-neighbors",
          label: "Every token can only inspect its immediate neighbors",
        },
        {
          id: "causal-proof",
          label: "A larger weight proves a causal relationship between words",
        },
      ],
      explanation:
        "Attention lets a token aggregate information from other positions in one layer. Its weights describe model information paths in context, not human explanations or causal proof.",
    },
    "foundation-model": {
      prompt:
        "When new material enters Runtime Context, what changes in this demo?",
      options: [
        {
          id: "retrain-weights",
          label:
            "The model automatically retrains its weights on every request",
        },
        {
          id: "context-only",
          label:
            "Fixed weights process this context and change the current output",
        },
        {
          id: "grant-permissions",
          label:
            "The model automatically gains tools and private-data permissions",
        },
      ],
      explanation:
        "Pretraining and post-training can update model weights. Ordinary inference uses fixed weights with the current instructions and material. Live knowledge, tools, and permissions still need explicit external systems.",
    },
    "llm-system": {
      prompt:
        "Why is one box labeled “LLM” insufficient for a modern AI application?",
      options: [
        {
          id: "model-knows-everything",
          label:
            "Model parameters inherently contain current facts, permissions, and complete memory",
        },
        {
          id: "system-layers",
          label:
            "Context, retrieval, tools, memory, permissions, and evaluation serve distinct system responsibilities",
        },
        {
          id: "ui-only",
          label: "External systems only change interface colors",
        },
      ],
      explanation:
        "Model generation is one system component. Fresh knowledge, real actions, saved state, authorization, and release evaluation need explicit external boundaries.",
    },
    rag: {
      prompt: "What does RAG do after it retrieves relevant passages?",
      options: [
        {
          id: "retrain-weights",
          label:
            "It retrains and permanently changes model weights for every question",
        },
        {
          id: "retrieved-context",
          label:
            "It puts passages into this generation context as citable evidence",
        },
        {
          id: "guarantee-truth",
          label: "Retrieval guarantees that every answer is correct",
        },
      ],
      explanation:
        "RAG usually supplies external context without updating model parameters at query time. Bad retrieval or conflicting evidence can still mislead generation, so provenance and evaluation remain necessary.",
    },
    agent: {
      prompt:
        "What should a reliable agent loop do first after a tool call fails?",
      options: [
        {
          id: "repeat-blindly",
          label: "Ignore the result and repeat the same action forever",
        },
        {
          id: "observe-and-revise",
          label:
            "Read the observation, revise the plan, then decide whether to retry or stop",
        },
        {
          id: "claim-success",
          label: "Claim success immediately so the failure stays hidden",
        },
      ],
      explanation:
        "The loop closes through observation after action. A failure must change what happens next, while budgets, stop conditions, and permissions keep retries bounded.",
    },
    safety: {
      prompt:
        "The fixed version passes regression case RT-017. What can we conclude?",
      options: [
        {
          id: "all-risk-gone",
          label: "The system has proved that no other risk exists",
        },
        {
          id: "known-risk-evidence",
          label:
            "This known failure now has repeatable evidence, while other risks still need ongoing discovery and evaluation",
        },
        {
          id: "guardrails-unneeded",
          label: "Permissions and human review can now be removed",
        },
      ],
      explanation:
        "A regression test stops one known failure from silently returning; it does not cover unknown cases. Safety and evaluation must continue alongside least privilege and human review.",
    },
  },
} satisfies Record<Locale, Record<ChapterId, ConceptCheckCopy>>;

const definitionByChapterId = new Map<
  ChapterId,
  (typeof conceptCheckDefinitions)[number]
>(
  conceptCheckDefinitions.map((definition) => [
    definition.chapterId,
    definition,
  ]),
);

export function getConceptCheck(
  chapterId: ChapterId,
  locale: Locale = defaultLocale,
): ConceptCheck {
  const definition = definitionByChapterId.get(chapterId);
  if (!definition) {
    throw new Error(`Missing concept check for chapter: ${chapterId}`);
  }

  const copy = getLocalizedValue(localizedConceptCheckCopy, locale)[chapterId];

  return {
    ...definition,
    options: copy.options.map((option) => ({ ...option })),
    prompt: copy.prompt,
    explanation: copy.explanation,
  };
}

export function getConceptChecks(
  locale: Locale = defaultLocale,
): ConceptCheck[] {
  return conceptCheckDefinitions.map(({ chapterId }) =>
    getConceptCheck(chapterId, locale),
  );
}

export const conceptChecks = getConceptChecks();
