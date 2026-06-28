import type { AgentLoopDemo } from "@ai-history/demo-core";

export const agentLoopDemo = {
  title: "Agent：大模型如何执行多步任务？",
  question: "为什么 Agent 不是一次回答，而是一个循环控制系统？",
  simplificationNote:
    "本案例是教学示意，不调用真实工具或大模型；工具结果和修正路径都是预设，用来解释 Agent loop。",
  learningGoals: [
    "理解 Agent 的 plan → tool call → observation → revise → final answer 循环。",
    "观察工具失败时为什么需要回到计划修正，而不是直接输出答案。",
    "区分一次性 LLM 回答和带外部行动闭环的 Agent 系统。",
  ],
  steps: [
    {
      id: "plan",
      title: "拆解任务并制定计划",
      loopLabel: "Plan",
      description:
        "Agent 先把用户目标拆成可执行步骤，决定需要查什么、算什么、再回答什么。",
      activeNodeIds: ["plan"],
      activeEdgeIds: [],
    },
    {
      id: "tool",
      title: "调用工具获取真实信息",
      loopLabel: "Tool Call",
      description:
        "它不只生成文字，还会调用搜索、数据库、代码执行器等外部工具获取新状态。",
      activeNodeIds: ["tool"],
      activeEdgeIds: ["plan-tool"],
    },
    {
      id: "observe",
      title: "观察工具返回结果",
      loopLabel: "Observation",
      description:
        "工具返回结果后，Agent 判断结果是否足够、是否可信、是否需要换一个路径。",
      activeNodeIds: ["observe"],
      activeEdgeIds: ["tool-observe"],
    },
    {
      id: "revise",
      title: "观察失败并修正计划",
      loopLabel: "Revise",
      description:
        "如果工具失败或结果不完整，Agent 会调整计划，再决定下一次工具调用或降级策略。",
      activeNodeIds: ["revise"],
      activeEdgeIds: ["observe-revise", "revise-tool"],
    },
    {
      id: "final",
      title: "生成最终答案",
      loopLabel: "Final Answer",
      description: "当证据足够时，Agent 汇总过程和结果，给出可解释的最终回答。",
      activeNodeIds: ["final"],
      activeEdgeIds: ["revise-final"],
    },
  ],
  branchOptions: [
    {
      id: "tool-failure",
      label: "模拟工具失败",
      targetStepId: "revise",
      description:
        "工具返回空结果或过期信息，Agent 需要观察失败原因并修正计划。",
    },
  ],
} satisfies AgentLoopDemo;
