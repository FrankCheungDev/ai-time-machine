import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

export interface LlmSystemLayer {
  id: string;
  label: string;
  role: string;
  limitation: string;
}

export interface LlmSystemConnection {
  id: string;
  fromId: string;
  toId: string;
  from: string;
  to: string;
  label: string;
}

const localizedLlmSystemLayers = {
  "zh-CN": [
    {
      id: "base-model",
      label: "Base Model",
      role: "从预训练中获得通用语言、代码和世界知识模式。",
      limitation: "参数知识会过期，也无法直接观察你的私有业务状态。",
    },
    {
      id: "context-window",
      label: "Context Window",
      role: "把当前任务、指令、示例和检索片段临时放进模型输入。",
      limitation: "上下文容量有限，放入错误材料会放大错误。",
    },
    {
      id: "retrieval",
      label: "Retrieval",
      role: "从外部文档、知识库或搜索结果中召回相关证据。",
      limitation: "召回质量决定回答质量，检索不到就无法可靠引用。",
    },
    {
      id: "tools",
      label: "Tools",
      role: "让模型调用计算器、代码、搜索、数据库或业务系统执行动作。",
      limitation: "工具调用需要权限、参数校验和失败处理。",
    },
    {
      id: "memory",
      label: "Memory",
      role: "保存跨会话偏好、历史任务和长期项目状态。",
      limitation: "记忆需要选择、更新和遗忘策略，否则会污染上下文。",
    },
    {
      id: "eval",
      label: "Eval / Safety",
      role: "用测试、红队、权限和监控判断系统是否可靠。",
      limitation: "评估不能消除风险，只能让风险更早暴露。",
    },
  ],
  en: [
    {
      id: "base-model",
      label: "Base Model",
      role: "Learns general patterns of language, code, and world knowledge through pretraining.",
      limitation:
        "Parameter knowledge becomes outdated and cannot directly observe private business state.",
    },
    {
      id: "context-window",
      label: "Context Window",
      role: "Temporarily places the current task, instructions, examples, and retrieved passages into the model input.",
      limitation:
        "Context capacity is limited, and incorrect material can amplify errors.",
    },
    {
      id: "retrieval",
      label: "Retrieval",
      role: "Recalls relevant evidence from external documents, knowledge bases, or search results.",
      limitation:
        "Retrieval quality determines answer quality; missing evidence cannot be cited reliably.",
    },
    {
      id: "tools",
      label: "Tools",
      role: "Lets the model call calculators, code, search, databases, or business systems to perform actions.",
      limitation:
        "Tool calls require permissions, parameter validation, and failure handling.",
    },
    {
      id: "memory",
      label: "Memory",
      role: "Stores preferences across sessions, previous tasks, and long-term project state.",
      limitation:
        "Memory needs selection, update, and forgetting strategies or it will pollute the context.",
    },
    {
      id: "eval",
      label: "Eval / Safety",
      role: "Uses testing, red teaming, permissions, and monitoring to assess system reliability.",
      limitation:
        "Evaluation cannot eliminate risk; it can only expose risk earlier.",
    },
  ],
} satisfies Record<Locale, LlmSystemLayer[]>;

const localizedLlmSystemConnections = {
  "zh-CN": [
    {
      id: "model-context",
      fromId: "base-model",
      toId: "context-window",
      from: "Base Model",
      to: "Context Window",
      label: "读入任务",
    },
    {
      id: "retrieval-context",
      fromId: "retrieval",
      toId: "context-window",
      from: "Retrieval",
      to: "Context Window",
      label: "补充证据",
    },
    {
      id: "model-tools",
      fromId: "base-model",
      toId: "tools",
      from: "Base Model",
      to: "Tools",
      label: "请求行动",
    },
    {
      id: "memory-context",
      fromId: "memory",
      toId: "context-window",
      from: "Memory",
      to: "Context Window",
      label: "带入状态",
    },
    {
      id: "eval-system",
      fromId: "eval",
      toId: "whole-system",
      from: "Eval / Safety",
      to: "整套系统",
      label: "约束与验证",
    },
  ],
  en: [
    {
      id: "model-context",
      fromId: "base-model",
      toId: "context-window",
      from: "Base Model",
      to: "Context Window",
      label: "Read the task",
    },
    {
      id: "retrieval-context",
      fromId: "retrieval",
      toId: "context-window",
      from: "Retrieval",
      to: "Context Window",
      label: "Add evidence",
    },
    {
      id: "model-tools",
      fromId: "base-model",
      toId: "tools",
      from: "Base Model",
      to: "Tools",
      label: "Request an action",
    },
    {
      id: "memory-context",
      fromId: "memory",
      toId: "context-window",
      from: "Memory",
      to: "Context Window",
      label: "Bring in state",
    },
    {
      id: "eval-system",
      fromId: "eval",
      toId: "whole-system",
      from: "Eval / Safety",
      to: "Entire System",
      label: "Constrain and verify",
    },
  ],
} satisfies Record<Locale, LlmSystemConnection[]>;

export function getLlmSystemLayers(
  locale: Locale = defaultLocale,
): LlmSystemLayer[] {
  return getLocalizedValue(localizedLlmSystemLayers, locale);
}

export function getLlmSystemConnections(
  locale: Locale = defaultLocale,
): LlmSystemConnection[] {
  return getLocalizedValue(localizedLlmSystemConnections, locale);
}

export const llmSystemLayers = getLlmSystemLayers();
export const llmSystemConnections = getLlmSystemConnections();
