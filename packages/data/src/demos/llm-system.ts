import type {
  LlmSystemDemo,
  LlmSystemEdge,
  LlmSystemNode,
  LlmSystemScenario,
  LlmSystemStep,
} from "@ai-history/demo-core";
import { cloneData, defaultLocale, type Locale } from "../locales";

const llmSystemNodeTopology = [
  { id: "task", x: 22, y: 154 },
  { id: "context", x: 184, y: 154 },
  { id: "model", x: 354, y: 154 },
  { id: "eval", x: 704, y: 154 },
  { id: "result", x: 874, y: 154 },
  { id: "memory", x: 184, y: 18 },
  { id: "retrieval", x: 184, y: 290 },
  { id: "tools", x: 524, y: 290 },
] as const satisfies readonly Pick<LlmSystemNode, "id" | "x" | "y">[];

type LlmSystemNodeId = (typeof llmSystemNodeTopology)[number]["id"];

const llmSystemEdgeTopology = [
  { id: "task-context", from: "task", to: "context" },
  { id: "memory-context", from: "memory", to: "context" },
  { id: "retrieval-context", from: "retrieval", to: "context" },
  { id: "context-model", from: "context", to: "model" },
  { id: "model-eval", from: "model", to: "eval" },
  { id: "model-tools", from: "model", to: "tools" },
  { id: "tools-eval", from: "tools", to: "eval" },
  { id: "eval-result", from: "eval", to: "result" },
] as const satisfies readonly {
  id: string;
  from: LlmSystemNodeId;
  to: LlmSystemNodeId;
}[];

type LlmSystemEdgeId = (typeof llmSystemEdgeTopology)[number]["id"];

const llmSystemStepTopology = [
  {
    id: "policy-task",
    nodeId: "task",
    activeNodeIds: ["task"],
    activeEdgeIds: [],
  },
  {
    id: "policy-model-gap",
    nodeId: "model",
    activeNodeIds: ["task", "context", "model"],
    activeEdgeIds: ["task-context", "context-model"],
  },
  {
    id: "policy-retrieval",
    nodeId: "retrieval",
    activeNodeIds: ["task", "retrieval"],
    activeEdgeIds: [],
  },
  {
    id: "policy-context",
    nodeId: "context",
    activeNodeIds: ["task", "retrieval", "context"],
    activeEdgeIds: ["task-context", "retrieval-context"],
  },
  {
    id: "policy-model",
    nodeId: "model",
    activeNodeIds: ["task", "retrieval", "context", "model"],
    activeEdgeIds: ["task-context", "retrieval-context", "context-model"],
  },
  {
    id: "policy-eval",
    nodeId: "result",
    activeNodeIds: ["task", "retrieval", "context", "model", "eval", "result"],
    activeEdgeIds: [
      "task-context",
      "retrieval-context",
      "context-model",
      "model-eval",
      "eval-result",
    ],
  },
  {
    id: "resume-task",
    nodeId: "task",
    activeNodeIds: ["task"],
    activeEdgeIds: [],
  },
  {
    id: "resume-model-gap",
    nodeId: "model",
    activeNodeIds: ["task", "context", "model"],
    activeEdgeIds: ["task-context", "context-model"],
  },
  {
    id: "resume-memory",
    nodeId: "memory",
    activeNodeIds: ["task", "memory"],
    activeEdgeIds: [],
  },
  {
    id: "resume-context",
    nodeId: "context",
    activeNodeIds: ["task", "memory", "context"],
    activeEdgeIds: ["task-context", "memory-context"],
  },
  {
    id: "resume-tool",
    nodeId: "tools",
    activeNodeIds: ["task", "memory", "context", "model", "tools"],
    activeEdgeIds: [
      "task-context",
      "memory-context",
      "context-model",
      "model-tools",
    ],
  },
  {
    id: "resume-eval",
    nodeId: "result",
    activeNodeIds: [
      "task",
      "memory",
      "context",
      "model",
      "tools",
      "eval",
      "result",
    ],
    activeEdgeIds: [
      "task-context",
      "memory-context",
      "context-model",
      "model-tools",
      "tools-eval",
      "eval-result",
    ],
  },
] as const satisfies readonly {
  id: string;
  nodeId: LlmSystemNodeId;
  activeNodeIds: readonly LlmSystemNodeId[];
  activeEdgeIds: readonly LlmSystemEdgeId[];
}[];

type LlmSystemStepId = (typeof llmSystemStepTopology)[number]["id"];

const llmSystemScenarioTopology = [
  {
    id: "current-policy",
    stepIds: [
      "policy-task",
      "policy-model-gap",
      "policy-retrieval",
      "policy-context",
      "policy-model",
      "policy-eval",
    ],
  },
  {
    id: "resume-and-submit",
    stepIds: [
      "resume-task",
      "resume-model-gap",
      "resume-memory",
      "resume-context",
      "resume-tool",
      "resume-eval",
    ],
  },
] as const satisfies readonly {
  id: string;
  stepIds: readonly LlmSystemStepId[];
}[];

type LlmSystemScenarioId = (typeof llmSystemScenarioTopology)[number]["id"];
const defaultScenarioId = "current-policy" satisfies LlmSystemScenarioId;

type LlmSystemNodeCopy = Pick<LlmSystemNode, "label" | "description">;
type LlmSystemStepCopy = Pick<
  LlmSystemStep,
  "title" | "description" | "statusLabel" | "finding" | "findingTone"
>;
type LlmSystemScenarioCopy = Omit<LlmSystemScenario, "id" | "stepIds">;
type LlmSystemCopy = Omit<
  LlmSystemDemo,
  "nodes" | "edges" | "steps" | "scenarios" | "defaultScenarioId"
> & {
  nodes: Record<LlmSystemNodeId, LlmSystemNodeCopy>;
  steps: Record<LlmSystemStepId, LlmSystemStepCopy>;
  scenarios: Record<LlmSystemScenarioId, LlmSystemScenarioCopy>;
};

const llmSystemCopies = {
  "zh-CN": {
    title: "LLM 系统边界：一个模型为什么不等于完整产品？",
    question: "同一个 Base Model 面对不同任务，为什么需要不同的外部系统路径？",
    simplificationNote:
      "本案例不调用真实模型、检索库、记忆服务、工具或评估器；请求、证据、状态、动作和检查结果均为预设。图中的组件是教学边界，真实系统可能合并、拆分或省略其中的模块。",
    learningGoals: [
      "区分模型参数、当前上下文、外部检索和长期任务状态。",
      "理解工具把生成变成外部动作，因此需要独立的权限与结果检查。",
      "观察系统如何按任务需要选择组件，而不是给每个请求堆叠全部模块。",
    ],
    nodes: {
      task: { label: "Task", description: "任务输入" },
      context: { label: "Context", description: "组装输入" },
      model: { label: "Base Model", description: "生成候选" },
      memory: { label: "Memory", description: "恢复状态" },
      retrieval: { label: "Retrieval", description: "取回证据" },
      tools: { label: "Tools", description: "执行动作" },
      eval: { label: "Eval", description: "验证约束" },
      result: { label: "Result", description: "交付结果" },
    },
    steps: {
      "policy-task": {
        title: "任务带着时效与引用要求进入系统",
        description:
          "用户问的是本周更新的内部制度，并要求引用依据；任务输入只说明目标，没有携带答案本身。",
        statusLabel: "识别任务",
        finding: "一条清晰指令仍可能缺少完成任务所需的外部事实。",
        findingTone: "context",
      },
      "policy-model-gap": {
        title: "只调用模型会撞上知识边界",
        description:
          "参数可能学过通用休假常识，但无法证明自己知道本周生效的私有政策版本。",
        statusLabel: "证据缺口",
        finding: "流畅生成不能替代当前、私有、可引用的来源。",
        findingTone: "gap",
      },
      "policy-retrieval": {
        title: "Retrieval 找到版本化政策",
        description: "检索层从获准访问的内部知识库召回当前政策片段和版本信息。",
        statusLabel: "补充证据",
        finding: "检索解决取回候选证据的问题，但不保证模型已经正确使用它。",
        findingTone: "context",
      },
      "policy-context": {
        title: "Context Window 组合任务与证据",
        description:
          "系统把用户问题、引用要求和检索片段放进本次输入；模型参数并没有因此被实时改写。",
        statusLabel: "上下文就绪",
        finding:
          "Context 是一次请求的工作区，Retrieval 是把外部材料送进工作区的方法。",
        findingTone: "context",
      },
      "policy-model": {
        title: "Base Model 根据上下文生成候选回答",
        description:
          "模型现在可以依据政策片段组织答案和引用，而不是只从参数中回忆。",
        statusLabel: "生成候选",
        finding: "有证据的生成更可追溯，但引用是否匹配仍需要检查。",
        findingTone: "context",
      },
      "policy-eval": {
        title: "Eval 核对引用后交付结果",
        description:
          "评估步骤确认结论与召回片段一致、引用指向当前版本，再把结果交给用户。",
        statusLabel: "有据可核",
        finding:
          "最终结果来自模型生成、外部证据与验证的组合，不是模型单独拥有了最新知识。",
        findingTone: "verified",
      },
      "resume-task": {
        title: "任务要求继续昨天的报销",
        description:
          "“继续并提交”依赖昨天保存的草稿、已确认金额和当前用户的明确动作意图。",
        statusLabel: "识别任务",
        finding: "当前一句话没有包含继续任务所需的历史状态。",
        findingTone: "context",
      },
      "resume-model-gap": {
        title: "只调用模型不知道昨天发生了什么",
        description:
          "模型参数不是用户任务记录，也不能凭空知道哪份草稿已经确认。",
        statusLabel: "状态缺口",
        finding: "把模型说得像记得用户，不等于系统真的读取了受控状态。",
        findingTone: "gap",
      },
      "resume-memory": {
        title: "Memory 恢复获准保存的任务状态",
        description:
          "记忆层取回昨天的报销草稿、确认标记和必要偏好，而不是暴露全部历史。",
        statusLabel: "恢复状态",
        finding:
          "Memory 是可选择、可更新、可删除的外部状态，不是模型权重中的私人记忆。",
        findingTone: "context",
      },
      "resume-context": {
        title: "Context 组合当前指令与恢复状态",
        description:
          "系统只把本次提交需要的草稿和确认信息放入输入，形成可执行的当前上下文。",
        statusLabel: "上下文就绪",
        finding: "长期状态先经过选择，再进入有限的 Context Window。",
        findingTone: "context",
      },
      "resume-tool": {
        title: "模型提出动作，Tools 在边界内执行",
        description:
          "模型生成结构化提交请求；工具层校验参数和授权后，才把报销单写入业务系统。",
        statusLabel: "受控执行",
        finding: "模型输出只是动作建议，真正的外部副作用由工具与权限边界决定。",
        findingTone: "action",
      },
      "resume-eval": {
        title: "Eval 检查回执并交付确认",
        description:
          "系统核对提交金额、单据编号和工具回执，再向用户确认动作已经完成。",
        statusLabel: "动作已核验",
        finding: "可交付结果需要状态、生成、工具执行和结果验证共同闭环。",
        findingTone: "verified",
      },
    },
    scenarios: {
      "current-policy": {
        label: "最新政策问答",
        title: "私有且刚更新的政策不能只靠参数回忆",
        description:
          "这个任务需要当前证据和可核引用，但不需要执行外部动作，也不需要恢复长期状态。",
        request: "根据本周更新的内部政策，我有几天陪产假？请引用依据。",
        requirement:
          "需要 Retrieval、Context 与 Eval；Memory 和 Tools 在这条路径中保持可选。",
      },
      "resume-and-submit": {
        label: "继续并提交任务",
        title: "跨日状态与外部动作不能只靠一次生成",
        description:
          "这个任务需要恢复已确认的草稿，并通过受控工具产生真实业务结果。",
        request: "继续昨天的差旅报销，把确认后的总额提交。",
        requirement:
          "需要 Memory、Context、Tools 与 Eval；这次不需要检索知识文档。",
      },
    },
  },
  en: {
    title: "LLM System Boundaries: Why is one model not a complete product?",
    question:
      "Why does the same base model need different external system paths for different tasks?",
    simplificationNote:
      "This demo calls no real model, retrieval store, memory service, tool, or evaluator. Requests, evidence, state, actions, and checks are scripted. The components are teaching boundaries; a real system may merge, split, or omit them.",
    learningGoals: [
      "Distinguish model parameters, current context, external retrieval, and persistent task state.",
      "Understand that tools turn generation into external action and therefore need separate authorization and result checks.",
      "See systems select components for a task instead of stacking every module onto every request.",
    ],
    nodes: {
      task: { label: "Task", description: "Current request" },
      context: { label: "Context", description: "Assemble input" },
      model: { label: "Base Model", description: "Draft output" },
      memory: { label: "Memory", description: "Restore state" },
      retrieval: { label: "Retrieval", description: "Fetch evidence" },
      tools: { label: "Tools", description: "Take action" },
      eval: { label: "Eval", description: "Check constraints" },
      result: { label: "Result", description: "Deliver outcome" },
    },
    steps: {
      "policy-task": {
        title: "The task arrives with freshness and citation requirements",
        description:
          "The user asks about an internal policy updated this week and requires a citation. The request states the goal but does not contain the answer.",
        statusLabel: "Task identified",
        finding:
          "A clear instruction can still lack the external facts required to complete it.",
        findingTone: "context",
      },
      "policy-model-gap": {
        title: "A model-only call hits a knowledge boundary",
        description:
          "The parameters may contain general leave-policy patterns, but they cannot prove knowledge of this week's private policy version.",
        statusLabel: "Evidence gap",
        finding:
          "Fluent generation is not a substitute for a current, private, citable source.",
        findingTone: "gap",
      },
      "policy-retrieval": {
        title: "Retrieval finds the versioned policy",
        description:
          "The retrieval layer recalls the current passage and version metadata from an authorized internal knowledge base.",
        statusLabel: "Evidence added",
        finding:
          "Retrieval fetches candidate evidence; it does not prove that the model used the evidence correctly.",
        findingTone: "context",
      },
      "policy-context": {
        title: "The context window combines the task and evidence",
        description:
          "The system places the question, citation requirement, and retrieved passage into this request. The model parameters are not updated in real time.",
        statusLabel: "Context ready",
        finding:
          "Context is the request workspace; retrieval is one way to bring external material into that workspace.",
        findingTone: "context",
      },
      "policy-model": {
        title: "The base model drafts an answer from the context",
        description:
          "The model can now organize an answer and citation from the policy passage instead of recalling only from its parameters.",
        statusLabel: "Draft generated",
        finding:
          "Evidence makes generation traceable, but the citation still needs to be checked.",
        findingTone: "context",
      },
      "policy-eval": {
        title: "Evaluation checks the citation before delivery",
        description:
          "The evaluation step confirms that the conclusion matches the retrieved passage and points to the current version.",
        statusLabel: "Grounded result",
        finding:
          "The outcome combines generation, external evidence, and verification; the model alone did not gain current knowledge.",
        findingTone: "verified",
      },
      "resume-task": {
        title: "The task asks to resume yesterday's expense claim",
        description:
          "Resume and submit depends on yesterday's draft, a confirmed total, and the user's explicit intent to act now.",
        statusLabel: "Task identified",
        finding:
          "The current sentence does not include the historical state needed to continue.",
        findingTone: "context",
      },
      "resume-model-gap": {
        title: "A model-only call does not know what happened yesterday",
        description:
          "Model parameters are not a user task record and cannot identify which draft was confirmed.",
        statusLabel: "State gap",
        finding:
          "A model sounding familiar is not proof that the system read controlled user state.",
        findingTone: "gap",
      },
      "resume-memory": {
        title: "Memory restores authorized task state",
        description:
          "The memory layer retrieves the expense draft, confirmation flag, and necessary preferences instead of exposing the full history.",
        statusLabel: "State restored",
        finding:
          "Memory is selectable, updateable, deletable external state, not private memory hidden in model weights.",
        findingTone: "context",
      },
      "resume-context": {
        title: "Context combines the current instruction and restored state",
        description:
          "Only the draft and confirmation needed for this submission enter the prompt, forming an actionable current context.",
        statusLabel: "Context ready",
        finding:
          "Persistent state is selected before it enters the limited context window.",
        findingTone: "context",
      },
      "resume-tool": {
        title: "The model proposes an action and a tool executes it",
        description:
          "The model produces a structured submission request. The tool validates parameters and authorization before writing to the business system.",
        statusLabel: "Controlled action",
        finding:
          "Model output proposes an action; the tool and permission boundary decide the real external side effect.",
        findingTone: "action",
      },
      "resume-eval": {
        title: "Evaluation checks the receipt before confirmation",
        description:
          "The system verifies the submitted amount, claim identifier, and tool receipt before telling the user the action completed.",
        statusLabel: "Action verified",
        finding:
          "A deliverable outcome closes the loop across state, generation, tool execution, and verification.",
        findingTone: "verified",
      },
    },
    scenarios: {
      "current-policy": {
        label: "Current policy Q&A",
        title:
          "A newly updated private policy cannot come from parameters alone",
        description:
          "This task needs current evidence and a verifiable citation, but no external action or persistent state.",
        request:
          "Under the internal policy updated this week, how many days of parental leave do I receive? Cite the source.",
        requirement:
          "Needs Retrieval, Context, and Eval; Memory and Tools remain optional on this path.",
      },
      "resume-and-submit": {
        label: "Resume and submit",
        title:
          "Cross-day state and external action need more than one generation",
        description:
          "This task restores a confirmed draft and uses a controlled tool to create a real business result.",
        request:
          "Resume yesterday's travel expense claim and submit the confirmed total.",
        requirement:
          "Needs Memory, Context, Tools, and Eval; this path does not retrieve a knowledge document.",
      },
    },
  },
} satisfies Record<Locale, LlmSystemCopy>;

export function getLlmSystemDemo(
  locale: Locale = defaultLocale,
): LlmSystemDemo {
  const copy = llmSystemCopies[locale] ?? llmSystemCopies[defaultLocale];
  const { nodes, steps, scenarios, ...metadata } = copy;

  return cloneData({
    ...metadata,
    nodes: llmSystemNodeTopology.map(({ id, x, y }) => ({
      id,
      label: nodes[id].label,
      description: nodes[id].description,
      x,
      y,
    })),
    edges: llmSystemEdgeTopology.map(({ id, from, to }) => ({
      id,
      from,
      to,
    })) satisfies LlmSystemEdge[],
    steps: llmSystemStepTopology.map(
      ({ id, nodeId, activeNodeIds, activeEdgeIds }) => ({
        id,
        nodeId,
        title: steps[id].title,
        description: steps[id].description,
        statusLabel: steps[id].statusLabel,
        finding: steps[id].finding,
        findingTone: steps[id].findingTone,
        activeNodeIds: [...activeNodeIds],
        activeEdgeIds: [...activeEdgeIds],
      }),
    ),
    scenarios: llmSystemScenarioTopology.map(({ id, stepIds }) => ({
      id,
      ...scenarios[id],
      stepIds: [...stepIds],
    })),
    defaultScenarioId,
  });
}

export const llmSystemDemo = getLlmSystemDemo();
