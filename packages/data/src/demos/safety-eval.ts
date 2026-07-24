import type {
  SafetyEvalDemo,
  SafetyEvalNode,
  SafetyEvalStep,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const safetyNodeTopology = [
  { id: "request", x: 28, y: 184 },
  { id: "red-team", x: 194, y: 68 },
  { id: "policy", x: 194, y: 300 },
  { id: "model", x: 370, y: 184 },
  { id: "tool-gate", x: 548, y: 68 },
  { id: "review", x: 548, y: 300 },
  { id: "eval", x: 728, y: 184 },
] as const satisfies readonly Pick<SafetyEvalNode, "id" | "x" | "y">[];

type SafetyNodeId = (typeof safetyNodeTopology)[number]["id"];

const safetyEdgeTopology = [
  { id: "request-red-team", from: "request", to: "red-team" },
  { id: "red-team-model", from: "red-team", to: "model" },
  { id: "request-policy", from: "request", to: "policy" },
  { id: "policy-model", from: "policy", to: "model" },
  { id: "model-tool-gate", from: "model", to: "tool-gate" },
  { id: "model-review", from: "model", to: "review" },
  { id: "tool-gate-eval", from: "tool-gate", to: "eval" },
  { id: "review-eval", from: "review", to: "eval" },
  { id: "eval-policy", from: "eval", to: "policy" },
] as const;

type SafetyEdgeId = (typeof safetyEdgeTopology)[number]["id"];

type SafetyStepTopology = {
  readonly id: string;
  readonly activeNodeIds: readonly SafetyNodeId[];
  readonly activeEdgeIds: readonly SafetyEdgeId[];
};

const safetyStepTopology = [
  {
    id: "scope",
    activeNodeIds: ["policy"],
    activeEdgeIds: [],
  },
  {
    id: "red-team",
    activeNodeIds: ["request", "red-team"],
    activeEdgeIds: ["request-red-team"],
  },
  {
    id: "failure",
    activeNodeIds: ["red-team", "model"],
    activeEdgeIds: ["red-team-model"],
  },
  {
    id: "guardrail",
    activeNodeIds: ["model", "tool-gate", "review"],
    activeEdgeIds: ["model-tool-gate", "model-review"],
  },
  {
    id: "retest",
    activeNodeIds: ["tool-gate", "review", "eval"],
    activeEdgeIds: ["tool-gate-eval", "review-eval"],
  },
  {
    id: "feedback",
    activeNodeIds: ["eval", "policy"],
    activeEdgeIds: ["eval-policy"],
  },
] as const satisfies readonly SafetyStepTopology[];

type SafetyStepId = (typeof safetyStepTopology)[number]["id"];

type SafetyNodeCopy = Pick<SafetyEvalNode, "label" | "description">;
type SafetyStepCopy = Pick<
  SafetyEvalStep,
  "title" | "description" | "finding" | "findingTone"
>;
type SafetyScenarioCopy = Omit<SafetyEvalDemo["scenarios"][number], "id">;
type SafetyEvalCopy = Omit<
  SafetyEvalDemo,
  "nodes" | "edges" | "steps" | "scenarios" | "defaultScenarioId"
> & {
  nodes: Record<SafetyNodeId, SafetyNodeCopy>;
  steps: Record<SafetyStepId, SafetyStepCopy>;
  scenarios: Record<string, SafetyScenarioCopy>;
};

const safetyEvalCopies = {
  "zh-CN": {
    title: "安全评估：系统如何发现并修复风险？",
    question: "为什么可靠的 AI 系统需要红队、护栏和持续评估？",
    simplificationNote:
      "本案例是教学示意，不调用真实模型或安全评估服务；攻击样本、模型反应和修复结果都是预设，用来解释风险反馈回路。",
    learningGoals: [
      "理解红队如何把抽象风险变成可复现的攻击样本。",
      "观察策略约束、工具权限和人工复核如何共同降低系统风险。",
      "理解评估不是一次上线前检查，而是持续反馈和回归测试的循环。",
    ],
    nodes: {
      request: { label: "Request", description: "用户请求" },
      "red-team": { label: "Red Team", description: "构造攻击" },
      policy: { label: "Policy", description: "定义边界" },
      model: { label: "Model", description: "生成行为" },
      "tool-gate": { label: "Tool Gate", description: "权限护栏" },
      review: { label: "Review", description: "人工复核" },
      eval: { label: "Eval", description: "回归评估" },
    },
    steps: {
      scope: {
        title: "先定义可接受的行为边界",
        description:
          "评估从明确目标开始：哪些回答可以直接给出，哪些行动必须拒绝、降级或交给人工复核。",
        finding: "没有边界，就无法判断一次失败是否真的危险。",
        findingTone: "guardrail",
      },
      "red-team": {
        title: "红队构造可复现的攻击样本",
        description:
          "红队主动尝试提示注入、敏感信息诱导或越权工具调用，把隐含风险变成测试样本。",
        finding: "攻击样本把“可能不安全”变成可重复运行的案例。",
        findingTone: "risk",
      },
      failure: {
        title: "观察到模型把外部内容当成指令",
        description:
          "模型可能把不可信文档、用户输入或工具返回内容误当成更高优先级的指令。",
        finding: "模型输出本身不是权限边界；工具调用仍需要独立控制。",
        findingTone: "risk",
      },
      guardrail: {
        title: "把策略与工具权限放到模型之外",
        description:
          "护栏检查请求，工具网关限制作用域，人工复核接住高风险动作，让模型不能单独决定所有后果。",
        finding: "纵深防御把一次模型失误变成可拦截、可审计的事件。",
        findingTone: "guardrail",
      },
      retest: {
        title: "用评估集复测修复是否有效",
        description:
          "修复后重新运行攻击样本，并同时检查正常任务是否被过度拦截，避免只优化一个分数。",
        finding: "通过测试不代表零风险，只说明这个已知失败暂时受控。",
        findingTone: "pass",
      },
      feedback: {
        title: "把线上反馈送回下一轮评估",
        description:
          "新的失败、用户反馈和人工复核结果都应沉淀为回归样本，推动策略和权限边界继续迭代。",
        finding: "安全是持续测量、修复和复测的反馈回路。",
        findingTone: "pass",
      },
    },
    scenarios: {
      "prompt-injection": {
        label: "提示注入",
        title: "不可信文档试图改写系统目标",
        description:
          "检索到的文档包含隐藏指令，诱导模型忽略原任务并泄露上下文或调用工具。",
        risk: "可能导致上下文泄漏、错误回答或越权行动。",
        mitigation: "把检索内容视为数据，并让工具权限与模型生成分离。",
      },
      "tool-misuse": {
        label: "工具越权",
        title: "模型请求了超出任务范围的工具动作",
        description: "模型为了完成目标，尝试访问不必要的数据或执行不可逆操作。",
        risk: "可能扩大数据暴露面，造成不可逆的外部影响。",
        mitigation: "采用最小权限、参数校验、人工确认和可撤销操作。",
      },
      groundedness: {
        label: "事实性回归",
        title: "修复护栏后仍要检查回答质量",
        description:
          "系统拦住了危险行为，但也可能把正常请求误拒绝，或生成没有证据支撑的答案。",
        risk: "只看安全拦截率会掩盖可用性和事实性退化。",
        mitigation: "把安全、事实性、误拒绝和任务成功率放进同一组回归指标。",
      },
    },
  },
  en: {
    title: "Safety Evaluation: How can systems find and fix risk?",
    question:
      "Why do reliable AI systems need red teams, guardrails, and continuous evaluation?",
    simplificationNote:
      "This teaching demo does not call a real model or safety service. Attack samples, model behavior, and fixes are scripted to explain the risk feedback loop.",
    learningGoals: [
      "Understand how red teams turn abstract risks into reproducible attack cases.",
      "Observe how policy constraints, tool permissions, and human review reduce risk together.",
      "Understand evaluation as a loop of feedback and regression testing rather than a one-time launch check.",
    ],
    nodes: {
      request: { label: "Request", description: "User request" },
      "red-team": { label: "Red Team", description: "Construct attack" },
      policy: { label: "Policy", description: "Set boundary" },
      model: { label: "Model", description: "Generate behavior" },
      "tool-gate": { label: "Tool Gate", description: "Permission guard" },
      review: { label: "Review", description: "Human review" },
      eval: { label: "Eval", description: "Regression test" },
    },
    steps: {
      scope: {
        title: "Define acceptable behavior first",
        description:
          "Evaluation starts with a target: which answers are safe to return, which actions must be refused, downgraded, or reviewed by a person.",
        finding:
          "Without a boundary, it is impossible to judge whether a failure is dangerous.",
        findingTone: "guardrail",
      },
      "red-team": {
        title: "Red-team a reproducible attack case",
        description:
          "A red team actively tries prompt injection, sensitive-data elicitation, or unauthorized tool calls, turning hidden risk into a test case.",
        finding:
          "An attack case turns “possibly unsafe” into a repeatable example.",
        findingTone: "risk",
      },
      failure: {
        title: "Observe the model treating data as instructions",
        description:
          "The model may mistake untrusted documents, user input, or tool output for a higher-priority instruction.",
        finding:
          "Model output is not a permission boundary; tool calls still need independent control.",
        findingTone: "risk",
      },
      guardrail: {
        title: "Put policy and permissions outside the model",
        description:
          "A policy check inspects the request, a tool gate limits scope, and human review catches high-risk actions so the model cannot decide every consequence alone.",
        finding:
          "Defense in depth turns one model mistake into an interceptable, auditable event.",
        findingTone: "guardrail",
      },
      retest: {
        title: "Re-test whether the fix works",
        description:
          "Run the attack cases again after a fix, while checking that normal tasks are not over-blocked. Optimizing one score is not enough.",
        finding:
          "Passing a test does not mean zero risk; it means this known failure is temporarily controlled.",
        findingTone: "pass",
      },
      feedback: {
        title: "Feed production signals into the next evaluation round",
        description:
          "New failures, user feedback, and review outcomes become regression cases that improve policy and permission boundaries.",
        finding:
          "Safety is a feedback loop of measuring, fixing, and re-testing.",
        findingTone: "pass",
      },
    },
    scenarios: {
      "prompt-injection": {
        label: "Prompt injection",
        title: "An untrusted document tries to rewrite the system goal",
        description:
          "A retrieved document contains hidden instructions that ask the model to ignore the task and leak context or call a tool.",
        risk: "It can cause context leakage, wrong answers, or unauthorized actions.",
        mitigation:
          "Treat retrieved text as data and separate tool permissions from model generation.",
      },
      "tool-misuse": {
        label: "Tool misuse",
        title: "The model requests a tool action outside the task scope",
        description:
          "To complete a goal, the model tries to access unnecessary data or perform an irreversible action.",
        risk: "It can expand the data exposure surface and create irreversible external effects.",
        mitigation:
          "Use least privilege, parameter validation, human confirmation, and reversible actions.",
      },
      groundedness: {
        label: "Groundedness regression",
        title: "Answer quality still needs testing after a guardrail fix",
        description:
          "The system blocks dangerous actions but may also over-refuse normal requests or produce unsupported answers.",
        risk: "Looking only at block rates can hide usability and factuality regressions.",
        mitigation:
          "Evaluate safety, factuality, over-refusal, and task success as one regression set.",
      },
    },
  },
} satisfies Record<Locale, SafetyEvalCopy>;

function getSafetyEvalDemo(locale: Locale = defaultLocale): SafetyEvalDemo {
  const copy = safetyEvalCopies[locale] ?? safetyEvalCopies[defaultLocale];
  const { nodes, steps, scenarios, ...metadata } = copy;

  return cloneData({
    ...metadata,
    nodes: safetyNodeTopology.map(({ id, x, y }) => ({
      id,
      label: nodes[id].label,
      description: nodes[id].description,
      x,
      y,
    })),
    edges: safetyEdgeTopology.map(({ id, from, to }) => ({ id, from, to })),
    steps: safetyStepTopology.map(({ id, activeNodeIds, activeEdgeIds }) => ({
      id,
      title: steps[id].title,
      description: steps[id].description,
      finding: steps[id].finding,
      findingTone: steps[id].findingTone,
      activeNodeIds: [...activeNodeIds],
      activeEdgeIds: [...activeEdgeIds],
    })),
    scenarios: Object.entries(scenarios).map(([id, scenario]) => ({
      id,
      ...scenario,
    })),
    defaultScenarioId: "prompt-injection",
  });
}

export { getSafetyEvalDemo };

export const safetyEvalDemo = getSafetyEvalDemo();
