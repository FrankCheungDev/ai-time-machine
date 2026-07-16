import type { BoundaryMode, DecisionBoundaryDemo } from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const points: DecisionBoundaryDemo["points"] = [
  { id: "p1", x: 120, y: 240, className: "positive" },
  { id: "p2", x: 172, y: 196, className: "positive" },
  { id: "p3", x: 242, y: 232, className: "positive" },
  { id: "n1", x: 420, y: 130, className: "negative" },
  { id: "n2", x: 518, y: 180, className: "negative" },
  { id: "n3", x: 576, y: 104, className: "negative" },
];

type BoundaryModeTopology = {
  readonly id: string;
  readonly path: string;
};

const boundaryModeTopology = [
  { id: "linear", path: "M330 54 L330 316" },
  { id: "nonlinear", path: "M300 48 C250 140 392 184 332 318" },
  {
    id: "overfit",
    path: "M250 44 C396 78 236 152 388 198 S328 276 456 326",
  },
] as const satisfies readonly BoundaryModeTopology[];

type BoundaryModeId = (typeof boundaryModeTopology)[number]["id"];
type BoundaryModeCopy = Pick<BoundaryMode, "label" | "title" | "description">;

type DecisionBoundaryCopy = Omit<DecisionBoundaryDemo, "points" | "modes"> & {
  modes: Record<BoundaryModeId, BoundaryModeCopy>;
};

const decisionBoundaryCopies = {
  "zh-CN": {
    title: "经典机器学习：机器如何从数据中学习决策边界？",
    question: "机器如何从数据中学习分类边界？",
    simplificationNote:
      "本案例让预设边界按异常点位置和模式敏感度产生教学型变化，用于说明归纳偏置；它不训练真实模型，也不代表真实分类器性能。",
    learningGoals: [
      "理解经典机器学习如何从样本中学习决策边界。",
      "比较线性、非线性和过拟合边界的归纳偏置。",
      "观察异常点如何影响模型边界和泛化风险。",
    ],
    outlierLabel: "可拖动的负类异常点",
    modes: {
      linear: {
        label: "线性边界",
        title: "线性模型学习一条简单分界线",
        description: "线性边界稳定、可解释，但表达能力有限。",
      },
      nonlinear: {
        label: "非线性边界",
        title: "非线性模型可以弯曲边界",
        description: "非线性边界能贴合更复杂的数据形状，但也更需要控制复杂度。",
      },
      overfit: {
        label: "过拟合边界",
        title: "过拟合会追逐每个样本",
        description: "过拟合边界看似训练集表现很好，却可能把噪声也当成规律。",
      },
    },
  },
  en: {
    title:
      "Classic Machine Learning: How do machines learn decision boundaries from data?",
    question: "How do machines learn classification boundaries from data?",
    simplificationNote:
      "This demo changes preset boundaries according to the outlier position and each mode's teaching sensitivity to illustrate inductive bias. It does not train a real model or represent actual classifier performance.",
    learningGoals: [
      "Understand how classic machine learning learns a decision boundary from examples.",
      "Compare the inductive biases of linear, nonlinear, and overfit boundaries.",
      "Observe how an outlier can affect a model boundary and its generalization risk.",
    ],
    outlierLabel: "Draggable negative-class outlier",
    modes: {
      linear: {
        label: "Linear boundary",
        title: "A linear model learns a simple dividing line",
        description:
          "A linear boundary is stable and interpretable, but its expressive power is limited.",
      },
      nonlinear: {
        label: "Nonlinear boundary",
        title: "A nonlinear model can bend the boundary",
        description:
          "A nonlinear boundary can fit more complex data shapes, but its complexity needs tighter control.",
      },
      overfit: {
        label: "Overfit boundary",
        title: "Overfitting chases every example",
        description:
          "An overfit boundary may perform well on the training set while mistaking noise for a real pattern.",
      },
    },
  },
} satisfies Record<Locale, DecisionBoundaryCopy>;

export function getDecisionBoundaryDemo(
  locale: Locale = defaultLocale,
): DecisionBoundaryDemo {
  const copy =
    decisionBoundaryCopies[locale] ?? decisionBoundaryCopies[defaultLocale];
  const { modes, ...metadata } = copy;

  return cloneData({
    ...metadata,
    points,
    modes: boundaryModeTopology.map(({ id, path }) => ({
      id,
      label: modes[id].label,
      title: modes[id].title,
      description: modes[id].description,
      path,
    })),
  });
}

export const decisionBoundaryDemo = getDecisionBoundaryDemo();
