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
type CausalStoryStepId = CausalStoryDefinition["steps"][number]["id"];
type CausalStoryActionId = CausalStoryDefinition["actions"][number]["id"];
type CausalStoryReturnLinkId =
  | CausalStoryDefinition["returnLinks"]["timeline"]["id"]
  | CausalStoryDefinition["returnLinks"]["lineage"]["id"];

interface CausalStoryStepCopy {
  title: string;
  inherited: string;
  solved: string;
  missing: string;
}

interface CausalStoryCopy {
  title: string;
  coreQuestion: string;
  simplificationNote: string;
  steps: Record<CausalStoryStepId, CausalStoryStepCopy>;
  linkLabels: Record<CausalStoryActionId | CausalStoryReturnLinkId, string>;
}

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
  },
} satisfies Record<Locale, Record<CausalStoryId, CausalStoryCopy>>;

const causalStoryIds = new Set<string>(
  causalStoryDefinitions.map(({ id }) => id),
);

export function isCausalStoryId(value: unknown): value is CausalStoryId {
  return typeof value === "string" && causalStoryIds.has(value);
}

function buildCausalStory(
  definition: CausalStoryDefinition,
  locale: Locale,
): CausalStory {
  const copy = localizedCausalStoryCopy[locale][definition.id];
  const labelFor = (id: CausalStoryActionId | CausalStoryReturnLinkId) =>
    copy.linkLabels[id];

  return {
    id: definition.id,
    title: copy.title,
    coreQuestion: copy.coreQuestion,
    simplificationNote: copy.simplificationNote,
    steps: definition.steps.map((step) => ({
      ...step,
      lineageNodeIds: [...step.lineageNodeIds],
      chapterIds: [...step.chapterIds],
      ...copy.steps[step.id],
    })),
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
