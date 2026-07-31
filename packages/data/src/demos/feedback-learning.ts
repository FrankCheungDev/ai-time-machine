import type {
  FeedbackLearningBoundaryView,
  FeedbackLearningDemo,
  FeedbackLearningEdge,
  FeedbackLearningEpisode,
  FeedbackLearningNode,
  FeedbackLearningPolicySnapshot,
  FeedbackLearningSignalComparison,
  FeedbackLearningStep,
  FeedbackLearningTransition,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const feedbackLearningNodeTopology = [
  { id: "state", x: 30, y: 170 },
  { id: "policy", x: 190, y: 170 },
  { id: "action", x: 350, y: 170 },
  { id: "environment", x: 510, y: 170 },
  { id: "observation-reward", x: 670, y: 170 },
  { id: "return-update", x: 830, y: 170 },
  { id: "updated-policy", x: 990, y: 170 },
] as const satisfies readonly Pick<FeedbackLearningNode, "id" | "x" | "y">[];

type FeedbackLearningNodeId =
  (typeof feedbackLearningNodeTopology)[number]["id"];

const feedbackLearningEdgeTopology = [
  { id: "state-policy", from: "state", to: "policy" },
  { id: "policy-action", from: "policy", to: "action" },
  { id: "action-environment", from: "action", to: "environment" },
  {
    id: "environment-observation-reward",
    from: "environment",
    to: "observation-reward",
  },
  {
    id: "observation-reward-return-update",
    from: "observation-reward",
    to: "return-update",
  },
  {
    id: "return-update-updated-policy",
    from: "return-update",
    to: "updated-policy",
  },
] as const satisfies readonly {
  id: string;
  from: FeedbackLearningNodeId;
  to: FeedbackLearningNodeId;
}[];

type FeedbackLearningEdgeId =
  (typeof feedbackLearningEdgeTopology)[number]["id"];

const feedbackLearningStepTopology = [
  {
    id: "read-state",
    nodeId: "policy",
    stage: "training",
    activeNodeIds: ["state", "policy"],
    activeEdgeIds: ["state-policy"],
    policySnapshotId: "initial",
  },
  {
    id: "run-baseline",
    nodeId: "observation-reward",
    stage: "training",
    activeNodeIds: [
      "state",
      "policy",
      "action",
      "environment",
      "observation-reward",
    ],
    activeEdgeIds: [
      "state-policy",
      "policy-action",
      "action-environment",
      "environment-observation-reward",
    ],
    episodeId: "baseline",
    policySnapshotId: "initial",
  },
  {
    id: "run-exploration",
    nodeId: "observation-reward",
    stage: "training",
    activeNodeIds: [
      "state",
      "policy",
      "action",
      "environment",
      "observation-reward",
    ],
    activeEdgeIds: [
      "state-policy",
      "policy-action",
      "action-environment",
      "environment-observation-reward",
    ],
    episodeId: "exploration",
    policySnapshotId: "initial",
  },
  {
    id: "compare-returns",
    nodeId: "return-update",
    stage: "training",
    activeNodeIds: ["observation-reward", "return-update"],
    activeEdgeIds: ["observation-reward-return-update"],
  },
  {
    id: "update-policy",
    nodeId: "updated-policy",
    stage: "training",
    activeNodeIds: ["return-update", "updated-policy"],
    activeEdgeIds: ["return-update-updated-policy"],
    policySnapshotId: "updated",
  },
  {
    id: "compare-runtime",
    nodeId: "observation-reward",
    stage: "runtime",
    activeNodeIds: ["policy", "action", "environment", "observation-reward"],
    activeEdgeIds: [
      "policy-action",
      "action-environment",
      "environment-observation-reward",
    ],
    policySnapshotId: "updated",
  },
] as const satisfies readonly {
  id: string;
  nodeId: FeedbackLearningNodeId;
  stage: FeedbackLearningStep["stage"];
  activeNodeIds: readonly FeedbackLearningNodeId[];
  activeEdgeIds: readonly FeedbackLearningEdgeId[];
  episodeId?: string;
  policySnapshotId?: string;
}[];

type FeedbackLearningStepId =
  (typeof feedbackLearningStepTopology)[number]["id"];

const feedbackLearningTransitionTopology = [
  {
    id: "baseline-left",
    episodeId: "baseline",
    fromStateId: "start",
    actionId: "left",
    toStateId: "left-terminal",
    reward: 1,
  },
  {
    id: "exploration-right",
    episodeId: "exploration",
    fromStateId: "start",
    actionId: "right",
    toStateId: "right-stage-two",
    reward: 0,
  },
  {
    id: "exploration-continue",
    episodeId: "exploration",
    fromStateId: "right-stage-two",
    actionId: "continue",
    toStateId: "right-terminal",
    reward: 3,
  },
] as const satisfies readonly Pick<
  FeedbackLearningTransition,
  "id" | "episodeId" | "fromStateId" | "actionId" | "toStateId" | "reward"
>[];

type FeedbackLearningTransitionId =
  (typeof feedbackLearningTransitionTopology)[number]["id"];

const feedbackLearningEpisodeTopology = [
  {
    id: "baseline",
    transitionIds: ["baseline-left"],
    actionIds: ["left"],
    rewards: [1],
    returnValue: 1,
  },
  {
    id: "exploration",
    transitionIds: ["exploration-right", "exploration-continue"],
    actionIds: ["right", "continue"],
    rewards: [0, 3],
    returnValue: 3,
  },
] as const satisfies readonly Pick<
  FeedbackLearningEpisode,
  "id" | "transitionIds" | "actionIds" | "rewards" | "returnValue"
>[];

type FeedbackLearningEpisodeId =
  (typeof feedbackLearningEpisodeTopology)[number]["id"];

const feedbackLearningPolicyTopology = [
  { id: "initial", leftProbability: 0.7, rightProbability: 0.3 },
  { id: "updated", leftProbability: 0.4, rightProbability: 0.6 },
] as const satisfies readonly Pick<
  FeedbackLearningPolicySnapshot,
  "id" | "leftProbability" | "rightProbability"
>[];

type FeedbackLearningPolicyId =
  (typeof feedbackLearningPolicyTopology)[number]["id"];

const feedbackLearningBoundaryTopology = [
  {
    id: "training",
    activeNodeIds: [
      "state",
      "policy",
      "action",
      "environment",
      "observation-reward",
      "return-update",
      "updated-policy",
    ],
    activeEdgeIds: [
      "state-policy",
      "policy-action",
      "action-environment",
      "environment-observation-reward",
      "observation-reward-return-update",
      "return-update-updated-policy",
    ],
  },
  {
    id: "runtime",
    activeNodeIds: ["policy", "action", "environment", "observation-reward"],
    activeEdgeIds: [
      "policy-action",
      "action-environment",
      "environment-observation-reward",
    ],
  },
] as const satisfies readonly Pick<
  FeedbackLearningBoundaryView,
  "id" | "activeNodeIds" | "activeEdgeIds"
>[];

type FeedbackLearningBoundaryId =
  (typeof feedbackLearningBoundaryTopology)[number]["id"];

const feedbackLearningSignalIds = [
  "target-label",
  "reward-return",
  "preference-comparison",
  "runtime-observation",
] as const;

type FeedbackLearningSignalId = (typeof feedbackLearningSignalIds)[number];

type FeedbackLearningNodeCopy = Pick<
  FeedbackLearningNode,
  "label" | "description"
>;
type FeedbackLearningStepCopy = Pick<
  FeedbackLearningStep,
  "title" | "description" | "statusLabel" | "finding" | "findingTone"
>;
type FeedbackLearningTransitionCopy = Pick<
  FeedbackLearningTransition,
  "actionLabel" | "observation"
>;
type FeedbackLearningEpisodeCopy = Pick<
  FeedbackLearningEpisode,
  "label" | "title" | "description" | "result"
>;
type FeedbackLearningPolicyCopy = Pick<
  FeedbackLearningPolicySnapshot,
  "label" | "explanation"
>;
type FeedbackLearningBoundaryCopy = Pick<
  FeedbackLearningBoundaryView,
  "label" | "title" | "description" | "weightStatus" | "nextActionStatus"
>;
type FeedbackLearningSignalCopy = Omit<FeedbackLearningSignalComparison, "id">;

interface FeedbackLearningCopy extends Omit<
  FeedbackLearningDemo,
  | "nodes"
  | "edges"
  | "steps"
  | "transitions"
  | "episodes"
  | "policySnapshots"
  | "boundaryViews"
  | "signalComparisons"
  | "defaultBoundaryViewId"
> {
  nodes: Record<FeedbackLearningNodeId, FeedbackLearningNodeCopy>;
  steps: Record<FeedbackLearningStepId, FeedbackLearningStepCopy>;
  transitions: Record<
    FeedbackLearningTransitionId,
    FeedbackLearningTransitionCopy
  >;
  episodes: Record<FeedbackLearningEpisodeId, FeedbackLearningEpisodeCopy>;
  policySnapshots: Record<FeedbackLearningPolicyId, FeedbackLearningPolicyCopy>;
  boundaryViews: Record<
    FeedbackLearningBoundaryId,
    FeedbackLearningBoundaryCopy
  >;
  signalComparisons: Record<
    FeedbackLearningSignalId,
    FeedbackLearningSignalCopy
  >;
}

const feedbackLearningCopies = {
  "zh-CN": {
    title: "反馈学习闭环：结果如何改变下一次策略？",
    question: "reward、偏好比较和运行时 observation 分别在什么时候改变什么？",
    simplificationNote:
      "本案例是固定的两条路径和两次训练 episode，不做随机采样，也不运行真实优化器。概率与 reward 只用于解释结果反馈如何改变后续策略，不代表真实机器人、游戏或通用决策任务。强化学习是一类问题设定与方法族，不等于单一算法；RLHF 也不等于全部后训练或完整 alignment。",
    learningGoals: [
      "区分目标标签、reward / return、偏好比较与运行时 observation。",
      "理解策略只在明确的训练边界中更新，普通 Agent 运行不会自动修改模型权重。",
      "观察延迟 reward 为什么需要比较完整 episode 的结果，而不是寻找每一步唯一正确动作。",
    ],
    nodes: {
      state: { label: "State", description: "当前起点状态" },
      policy: { label: "Policy", description: "两个动作的示意概率" },
      action: { label: "Action", description: "固定脚本选择" },
      environment: { label: "Environment", description: "执行动作并转移" },
      "observation-reward": {
        label: "Observation + Reward",
        description: "返回新状态与结果信号",
      },
      "return-update": {
        label: "Return / Update",
        description: "比较完整 episode",
      },
      "updated-policy": {
        label: "Updated Policy",
        description: "下一次更常走高回报路径",
      },
    },
    steps: {
      "read-state": {
        title: "读取状态与初始示意策略",
        description:
          "起点有左、右两个动作。初始策略固定显示左侧 70%、右侧 30%；这些数值不是现场采样结果。",
        statusLabel: "训练前",
        finding:
          "Policy 描述行动倾向，不会告诉环境哪一个动作在每一步都是唯一正确答案。",
        findingTone: "state",
      },
      "run-baseline": {
        title: "运行 baseline episode",
        description:
          "脚本固定走左侧，一步到达终点并立即得到小奖励 +1。展示更常见动作，不把概率动画伪装成真实随机采样。",
        statusLabel: "即时小奖励",
        finding:
          "baseline return 为 1；它提供一条可比较结果，不是逐步目标标签。",
        findingTone: "episode",
      },
      "run-exploration": {
        title: "运行 exploration episode",
        description:
          "脚本固定探索右侧：第一步 observation 表示仍未到终点，reward 为 0；继续后得到延迟奖励 +3。",
        statusLabel: "延迟高奖励",
        finding:
          "第一步没有奖励不代表右侧动作错误；完整序列的 return 才显露更高结果。",
        findingTone: "episode",
      },
      "compare-returns": {
        title: "比较两个 episode 的 return",
        description:
          "左侧 return 为 1，右侧 return 为 3。真实强化学习必须处理 delayed reward 与 credit assignment，本案例只标出问题，不实现算法。",
        statusLabel: "Return：1 对 3",
        finding:
          "Reward 评价动作之后的结果；它不保证在每一步直接给出标准动作。",
        findingTone: "comparison",
      },
      "update-policy": {
        title: "只在训练边界内更新示意策略",
        description:
          "审核过的脚本把左 / 右概率从 70% / 30% 改为 40% / 60%，表示下一次训练 episode 更常走高 return 路径。",
        statusLabel: "训练更新",
        finding:
          "这里的概率变化是教学结果，不是可复现的 Q-learning、PPO 或其他真实优化步骤。",
        findingTone: "update",
      },
      "compare-runtime": {
        title: "对照 Runtime Agent 的 observation",
        description:
          "Agent 调用工具失败后可以依据错误回执修改本次任务的下一步，但普通运行没有 return / update 阶段。",
        statusLabel: "权重保持不变",
        finding:
          "运行时 observation 改变当前行动计划；除非另有明确训练管线，它不会自动成为梯度或修改模型权重。",
        findingTone: "boundary",
      },
    },
    transitions: {
      "baseline-left": {
        actionLabel: "向左",
        observation: "到达左侧终点；episode 结束",
      },
      "exploration-right": {
        actionLabel: "向右探索",
        observation: "进入第二阶段；尚未到达终点",
      },
      "exploration-continue": {
        actionLabel: "继续前进",
        observation: "到达右侧终点；episode 结束",
      },
    },
    episodes: {
      baseline: {
        label: "Baseline",
        title: "左侧：即时小奖励",
        description: "固定走当前更常见的左侧动作，一步结束。",
        result: "reward +1，return 1",
      },
      exploration: {
        label: "Exploration",
        title: "右侧：延迟高奖励",
        description: "固定探索右侧，先得到 0，再在第二步得到 +3。",
        result: "rewards 0、+3，return 3",
      },
    },
    policySnapshots: {
      initial: {
        label: "初始示意策略",
        explanation: "左侧 70%，右侧 30%；数值固定，不进行随机采样。",
      },
      updated: {
        label: "更新后示意策略",
        explanation: "左侧 40%，右侧 60%；只表示高 return 路径更常见。",
      },
    },
    boundaryViews: {
      training: {
        label: "训练时",
        title: "结果反馈进入明确的更新阶段",
        description:
          "episode 结束后比较 return，再由训练流程改变示意策略；本案例不实现具体算法。",
        weightStatus: "训练边界：参数可以更新",
        nextActionStatus: "更新后的策略影响后续 episode",
      },
      runtime: {
        label: "运行时",
        title: "Observation 改变当前任务的下一步",
        description:
          "工具回执或环境状态进入当前 Agent 循环，但普通推理没有自动训练阶段。",
        weightStatus: "运行边界：模型权重保持不变",
        nextActionStatus: "当前计划可以根据 observation 修正",
      },
    },
    signalComparisons: {
      "target-label": {
        label: "Target label",
        inputSignal: "输入对应的目标输出",
        timing: "训练时",
        effect: "直接描述期望答案并用于更新参数",
        boundary: "不等于环境中的长期行动结果",
      },
      "reward-return": {
        label: "Reward / return",
        inputSignal: "动作后的结果与序列累计回报",
        timing: "训练时",
        effect: "改变价值估计或策略倾向",
        boundary: "不保证逐步给出唯一正确动作",
      },
      "preference-comparison": {
        label: "Preference comparison",
        inputSignal: "特定标注协议下的候选比较或排序",
        timing: "训练时",
        effect: "可进入奖励模型加 RL，也可进入其他直接偏好目标",
        boundary: "不是普遍真理，也不等于单一 RLHF 流程",
      },
      "runtime-observation": {
        label: "Runtime observation",
        inputSignal: "当前工具回执或环境新状态",
        timing: "运行时",
        effect: "改变当前任务的下一步行动",
        boundary: "不自动成为训练样本或权重更新",
      },
    },
  },
  en: {
    title: "Feedback Learning Loop: How do outcomes change later policy?",
    question:
      "When do rewards, preference comparisons, and runtime observations change the system?",
    simplificationNote:
      "This demo uses two fixed paths and two scripted training episodes. It performs no random sampling or real optimization. Probabilities and rewards only explain how outcome feedback can change later policy; they do not model a real robot, game, or general decision problem. Reinforcement learning is a family of problem settings and methods, not one algorithm. RLHF is not all post-training or complete alignment.",
    learningGoals: [
      "Distinguish target labels, reward and return, preference comparisons, and runtime observations.",
      "Understand that policy changes only inside an explicit training boundary and that ordinary agent runs do not update model weights automatically.",
      "See why delayed reward requires comparing complete episode outcomes rather than looking for one correct action at every step.",
    ],
    nodes: {
      state: { label: "State", description: "current starting state" },
      policy: { label: "Policy", description: "illustrative action chances" },
      action: { label: "Action", description: "fixed scripted choice" },
      environment: { label: "Environment", description: "apply transition" },
      "observation-reward": {
        label: "Observation + Reward",
        description: "new state and outcome signal",
      },
      "return-update": {
        label: "Return / Update",
        description: "compare complete episodes",
      },
      "updated-policy": {
        label: "Updated Policy",
        description: "favor the higher-return path",
      },
    },
    steps: {
      "read-state": {
        title: "Read the state and initial illustrative policy",
        description:
          "The starting state has left and right actions. The initial policy is fixed at 70% left and 30% right; these values are not live samples.",
        statusLabel: "Before training",
        finding:
          "A policy describes action tendencies. It does not tell the environment that one action is the uniquely correct answer at every step.",
        findingTone: "state",
      },
      "run-baseline": {
        title: "Run the baseline episode",
        description:
          "The script takes the left path, reaches a terminal state in one step, and receives an immediate reward of +1. It shows the more common action without pretending to sample it.",
        statusLabel: "Immediate small reward",
        finding:
          "The baseline return is 1. It supplies an outcome for comparison, not a target label for each step.",
        findingTone: "episode",
      },
      "run-exploration": {
        title: "Run the exploration episode",
        description:
          "The script explores right. The first observation says the episode continues and gives reward 0; the second step produces a delayed reward of +3.",
        statusLabel: "Delayed larger reward",
        finding:
          "No reward on the first step does not make the right action wrong. The full return reveals the better outcome.",
        findingTone: "episode",
      },
      "compare-returns": {
        title: "Compare the two episode returns",
        description:
          "The left return is 1 and the right return is 3. Real reinforcement learning must handle delayed reward and credit assignment; this demo labels that problem without implementing an algorithm.",
        statusLabel: "Return: 1 versus 3",
        finding:
          "Reward evaluates outcomes after actions. It does not guarantee the correct action is supplied at every step.",
        findingTone: "comparison",
      },
      "update-policy": {
        title: "Update the illustrative policy only in training",
        description:
          "The reviewed script changes left and right from 70% / 30% to 40% / 60%, so a later training episode would take the higher-return path more often.",
        statusLabel: "Training update",
        finding:
          "This probability change is a teaching outcome, not a reproducible Q-learning, PPO, or other optimization step.",
        findingTone: "update",
      },
      "compare-runtime": {
        title: "Compare a runtime agent observation",
        description:
          "After a tool failure, an agent can use the error response to change the next step in this task, but an ordinary run has no return-and-update stage.",
        statusLabel: "Weights unchanged",
        finding:
          "A runtime observation changes the current action plan. Without an explicit training pipeline, it does not automatically become a gradient or update model weights.",
        findingTone: "boundary",
      },
    },
    transitions: {
      "baseline-left": {
        actionLabel: "Go left",
        observation: "Reached the left terminal state; episode ends",
      },
      "exploration-right": {
        actionLabel: "Explore right",
        observation: "Entered stage two; no terminal state yet",
      },
      "exploration-continue": {
        actionLabel: "Continue",
        observation: "Reached the right terminal state; episode ends",
      },
    },
    episodes: {
      baseline: {
        label: "Baseline",
        title: "Left: immediate small reward",
        description:
          "Take the currently more common left action and finish in one step.",
        result: "reward +1, return 1",
      },
      exploration: {
        label: "Exploration",
        title: "Right: delayed larger reward",
        description:
          "Explore right, receive 0 first, then receive +3 on the second step.",
        result: "rewards 0 and +3, return 3",
      },
    },
    policySnapshots: {
      initial: {
        label: "Initial illustrative policy",
        explanation:
          "70% left and 30% right; fixed values with no random sampling.",
      },
      updated: {
        label: "Updated illustrative policy",
        explanation:
          "40% left and 60% right; only shows the higher-return path becoming more common.",
      },
    },
    boundaryViews: {
      training: {
        label: "Training",
        title: "Outcome feedback enters an explicit update stage",
        description:
          "The training process compares returns after episodes and changes the illustrative policy. No particular algorithm runs here.",
        weightStatus: "Training boundary: parameters may update",
        nextActionStatus: "The updated policy affects later episodes",
      },
      runtime: {
        label: "Runtime",
        title: "An observation changes the next action in this task",
        description:
          "A tool response or environment state enters the current agent loop, while ordinary inference has no automatic training stage.",
        weightStatus: "Runtime boundary: model weights stay fixed",
        nextActionStatus: "The current plan can change after an observation",
      },
    },
    signalComparisons: {
      "target-label": {
        label: "Target label",
        inputSignal: "A target output paired with an input",
        timing: "Training",
        effect: "Directly describes the expected answer for a parameter update",
        boundary: "Not the same as a long-term outcome in an environment",
      },
      "reward-return": {
        label: "Reward / return",
        inputSignal: "Outcomes after actions and cumulative sequence return",
        timing: "Training",
        effect: "Changes a value estimate or policy tendency",
        boundary: "Does not guarantee one correct action at each step",
      },
      "preference-comparison": {
        label: "Preference comparison",
        inputSignal:
          "Candidate comparisons or rankings under a specified labeling protocol",
        timing: "Training",
        effect:
          "Can feed a reward model plus RL or another direct preference objective",
        boundary: "Not universal truth and not one mandatory RLHF pipeline",
      },
      "runtime-observation": {
        label: "Runtime observation",
        inputSignal: "A current tool response or new environment state",
        timing: "Runtime",
        effect: "Changes the next action in the current task",
        boundary:
          "Does not automatically become training data or a weight update",
      },
    },
  },
} satisfies Record<Locale, FeedbackLearningCopy>;

export function getFeedbackLearningDemo(
  locale: Locale = defaultLocale,
): FeedbackLearningDemo {
  const copy = feedbackLearningCopies[locale] ?? feedbackLearningCopies.en;

  const nodes = feedbackLearningNodeTopology.map((node) => ({
    ...node,
    ...copy.nodes[node.id],
  }));
  const edges: FeedbackLearningEdge[] = feedbackLearningEdgeTopology.map(
    (edge) => ({ ...edge }),
  );
  const steps = feedbackLearningStepTopology.map((step) => ({
    ...step,
    activeNodeIds: [...step.activeNodeIds],
    activeEdgeIds: [...step.activeEdgeIds],
    ...copy.steps[step.id],
  }));
  const transitions = feedbackLearningTransitionTopology.map((transition) => ({
    ...transition,
    ...copy.transitions[transition.id],
  }));
  const episodes = feedbackLearningEpisodeTopology.map((episode) => ({
    ...episode,
    transitionIds: [...episode.transitionIds],
    actionIds: [...episode.actionIds],
    rewards: [...episode.rewards],
    ...copy.episodes[episode.id],
  }));
  const policySnapshots = feedbackLearningPolicyTopology.map((policy) => ({
    ...policy,
    ...copy.policySnapshots[policy.id],
  }));
  const boundaryViews = feedbackLearningBoundaryTopology.map((view) => ({
    ...view,
    activeNodeIds: [...view.activeNodeIds],
    activeEdgeIds: [...view.activeEdgeIds],
    ...copy.boundaryViews[view.id],
  }));
  const signalComparisons = feedbackLearningSignalIds.map((id) => ({
    id,
    ...copy.signalComparisons[id],
  }));

  return cloneData({
    title: copy.title,
    question: copy.question,
    simplificationNote: copy.simplificationNote,
    learningGoals: [...copy.learningGoals],
    nodes,
    edges,
    steps,
    transitions,
    episodes,
    policySnapshots,
    boundaryViews,
    signalComparisons,
    defaultBoundaryViewId: "training",
  });
}

export const feedbackLearningDemo = getFeedbackLearningDemo();
