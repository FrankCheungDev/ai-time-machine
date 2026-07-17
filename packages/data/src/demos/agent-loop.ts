import type {
  AgentLoopDemo,
  AgentLoopNode,
  AgentLoopScenario,
  AgentLoopStep,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const agentNodeTopology = [
  { id: "plan", x: 44, y: 92 },
  { id: "tool", x: 244, y: 92 },
  { id: "observe", x: 444, y: 92 },
  { id: "revise", x: 344, y: 248 },
  { id: "final", x: 644, y: 92 },
] as const satisfies readonly Pick<AgentLoopNode, "id" | "x" | "y">[];

type AgentNodeId = (typeof agentNodeTopology)[number]["id"];

type AgentEdgeTopology = {
  readonly id: string;
  readonly from: AgentNodeId;
  readonly to: AgentNodeId;
};

const agentEdgeTopology = [
  { id: "plan-tool", from: "plan", to: "tool" },
  { id: "tool-observe", from: "tool", to: "observe" },
  { id: "observe-revise", from: "observe", to: "revise" },
  { id: "revise-tool", from: "revise", to: "tool" },
  { id: "observe-final", from: "observe", to: "final" },
] as const satisfies readonly AgentEdgeTopology[];

type AgentEdgeId = (typeof agentEdgeTopology)[number]["id"];

type AgentStepTopology = {
  readonly id: string;
  readonly nodeId: AgentNodeId;
  readonly activeEdgeIds: readonly AgentEdgeId[];
};

const agentStepTopology = [
  { id: "plan", nodeId: "plan", activeEdgeIds: [] },
  {
    id: "tool-primary",
    nodeId: "tool",
    activeEdgeIds: ["plan-tool"],
  },
  {
    id: "observe-success",
    nodeId: "observe",
    activeEdgeIds: ["tool-observe"],
  },
  {
    id: "observe-failure",
    nodeId: "observe",
    activeEdgeIds: ["tool-observe"],
  },
  {
    id: "revise",
    nodeId: "revise",
    activeEdgeIds: ["observe-revise"],
  },
  {
    id: "tool-retry",
    nodeId: "tool",
    activeEdgeIds: ["revise-tool"],
  },
  {
    id: "observe-retry",
    nodeId: "observe",
    activeEdgeIds: ["tool-observe"],
  },
  {
    id: "final",
    nodeId: "final",
    activeEdgeIds: ["observe-final"],
  },
] as const satisfies readonly AgentStepTopology[];

type AgentStepId = (typeof agentStepTopology)[number]["id"];

type AgentScenarioTopology = {
  readonly id: string;
  readonly stepIds: readonly AgentStepId[];
};

const agentScenarioTopology = [
  {
    id: "success",
    stepIds: ["plan", "tool-primary", "observe-success", "final"],
  },
  {
    id: "tool-failure",
    stepIds: [
      "plan",
      "tool-primary",
      "observe-failure",
      "revise",
      "tool-retry",
      "observe-retry",
      "final",
    ],
  },
] as const satisfies readonly AgentScenarioTopology[];

type AgentScenarioId = (typeof agentScenarioTopology)[number]["id"];
const defaultScenarioId = "success" satisfies AgentScenarioId;

type AgentNodeCopy = Pick<AgentLoopNode, "label" | "description">;
type AgentStepCopy = Pick<AgentLoopStep, "title" | "description">;
type AgentScenarioCopy = Pick<AgentLoopScenario, "label" | "description">;

type AgentLoopCopy = Omit<
  AgentLoopDemo,
  "nodes" | "edges" | "steps" | "scenarios" | "defaultScenarioId"
> & {
  nodes: Record<AgentNodeId, AgentNodeCopy>;
  steps: Record<AgentStepId, AgentStepCopy>;
  scenarios: Record<AgentScenarioId, AgentScenarioCopy>;
};

const agentLoopCopies = {
  "zh-CN": {
    title: "Agent：大模型如何执行多步任务？",
    question: "为什么 Agent 不是一次回答，而是一个循环控制系统？",
    simplificationNote:
      "本案例是教学示意，不调用真实工具或大模型；工具结果和修正路径都是预设，用来解释 Agent loop。",
    learningGoals: [
      "理解 Agent 如何在计划、工具调用、观察结果和最终回答之间流转。",
      "观察工具失败时为什么必须修正计划，并再次经过工具调用和结果观察。",
      "区分一次性 LLM 回答和带外部行动闭环的 Agent 系统。",
    ],
    nodes: {
      plan: { label: "Plan", description: "制定计划" },
      tool: { label: "Tool Call", description: "调用工具" },
      observe: { label: "Observation", description: "检查结果" },
      revise: { label: "Revise", description: "修正计划" },
      final: { label: "Final Answer", description: "给出答案" },
    },
    steps: {
      plan: {
        title: "拆解任务并制定计划",
        description:
          "Agent 先把用户目标拆成可执行步骤，决定需要查什么、算什么、再回答什么。",
      },
      "tool-primary": {
        title: "调用工具获取真实信息",
        description:
          "Agent 执行第一次工具调用，从搜索、数据库或代码执行器获取新的外部状态。",
      },
      "observe-success": {
        title: "观察到可用的工具结果",
        description:
          "工具返回了足够且可信的信息，Agent 判断当前证据已经可以支撑最终回答。",
      },
      "observe-failure": {
        title: "观察到工具调用失败",
        description:
          "工具返回空结果或过期信息，Agent 先识别失败，而不是直接跳到最终答案。",
      },
      revise: {
        title: "观察失败并修正计划",
        description:
          "Agent 根据失败原因调整查询、工具或执行顺序，为下一次调用准备更可靠的方案。",
      },
      "tool-retry": {
        title: "按修正后的计划再次调用工具",
        description:
          "Agent 执行第二次工具调用；这一步说明修正计划之后仍然需要真正采取行动。",
      },
      "observe-retry": {
        title: "观察到重试结果可用",
        description:
          "Agent 再次检查工具结果，确认重试已经获得足够证据，之后才能进入最终回答。",
      },
      final: {
        title: "生成最终答案",
        description:
          "当证据足够时，Agent 汇总过程和结果，给出可解释的最终回答。",
      },
    },
    scenarios: {
      success: {
        label: "正常成功",
        description:
          "第一次工具调用返回可用结果，Agent 在观察后直接进入最终回答。",
      },
      "tool-failure": {
        label: "工具先失败",
        description:
          "第一次工具调用失败，Agent 必须修正计划、再次调用工具并观察重试结果。",
      },
    },
  },
  en: {
    title: "Agents: How do large language models execute multi-step tasks?",
    question:
      "Why is an agent a looped control system rather than a one-shot answer?",
    simplificationNote:
      "This teaching demo does not call real tools or a large language model. Tool results and revision paths are scripted to explain the agent loop.",
    learningGoals: [
      "Understand how an agent moves between planning, tool calls, observations, and a final answer.",
      "Observe why a tool failure must revise the plan and repeat both the tool call and result inspection.",
      "Distinguish a one-shot LLM answer from an agent system with a closed loop of external actions.",
    ],
    nodes: {
      plan: { label: "Plan", description: "Make a plan" },
      tool: { label: "Tool Call", description: "Call a tool" },
      observe: { label: "Observation", description: "Check result" },
      revise: { label: "Revise", description: "Revise plan" },
      final: { label: "Final Answer", description: "Give answer" },
    },
    steps: {
      plan: {
        title: "Break down the task and make a plan",
        description:
          "The agent first divides the user's goal into executable steps, deciding what to look up, what to calculate, and what to answer.",
      },
      "tool-primary": {
        title: "Call a tool to obtain real information",
        description:
          "The agent makes its first tool call to obtain new external state from search, a database, or a code executor.",
      },
      "observe-success": {
        title: "Observe a usable tool result",
        description:
          "The tool returns sufficient, trustworthy information, so the agent decides that the evidence can support a final answer.",
      },
      "observe-failure": {
        title: "Observe the tool failure",
        description:
          "The tool returns no result or outdated information, so the agent recognizes the failure instead of jumping to a final answer.",
      },
      revise: {
        title: "Observe failure and revise the plan",
        description:
          "The agent changes the query, tool, or execution order based on the failure and prepares a more reliable next attempt.",
      },
      "tool-retry": {
        title: "Retry the tool with the revised plan",
        description:
          "The agent makes a second tool call, showing that revising a plan must be followed by another real action.",
      },
      "observe-retry": {
        title: "Observe a usable retry result",
        description:
          "The agent checks the tool result again and confirms that the retry produced enough evidence before answering.",
      },
      final: {
        title: "Generate the final answer",
        description:
          "Once the evidence is sufficient, the agent summarizes the process and result in an explainable final answer.",
      },
    },
    scenarios: {
      success: {
        label: "Normal success",
        description:
          "The first tool call returns a usable result, so the agent moves from observation directly to the final answer.",
      },
      "tool-failure": {
        label: "Tool fails first",
        description:
          "The first tool call fails, so the agent must revise the plan, call the tool again, and inspect the retry result.",
      },
    },
  },
} satisfies Record<Locale, AgentLoopCopy>;

export function getAgentLoopDemo(
  locale: Locale = defaultLocale,
): AgentLoopDemo {
  const copy = agentLoopCopies[locale] ?? agentLoopCopies[defaultLocale];
  const { nodes, steps, scenarios, ...metadata } = copy;

  return cloneData({
    ...metadata,
    nodes: agentNodeTopology.map(({ id, x, y }) => ({
      id,
      label: nodes[id].label,
      description: nodes[id].description,
      x,
      y,
    })),
    edges: agentEdgeTopology.map(({ id, from, to }) => ({ id, from, to })),
    steps: agentStepTopology.map(({ id, nodeId, activeEdgeIds }) => ({
      id,
      nodeId,
      title: steps[id].title,
      description: steps[id].description,
      activeNodeIds: [nodeId],
      activeEdgeIds: [...activeEdgeIds],
    })),
    scenarios: agentScenarioTopology.map(({ id, stepIds }) => ({
      id,
      label: scenarios[id].label,
      description: scenarios[id].description,
      stepIds: [...stepIds],
    })),
    defaultScenarioId,
  });
}

export const agentLoopDemo = getAgentLoopDemo();
