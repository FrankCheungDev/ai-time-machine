export interface LlmSystemLayer {
  id: string;
  label: string;
  role: string;
  limitation: string;
}

export interface LlmSystemConnection {
  id: string;
  from: string;
  to: string;
  label: string;
}

export const llmSystemLayers: LlmSystemLayer[] = [
  {
    id: "base-model",
    label: "Base Model",
    role: "从预训练中获得通用语言、代码和世界知识模式。",
    limitation: "参数知识会过期，也无法直接观察你的私有业务状态。"
  },
  {
    id: "context-window",
    label: "Context Window",
    role: "把当前任务、指令、示例和检索片段临时放进模型输入。",
    limitation: "上下文容量有限，放入错误材料会放大错误。"
  },
  {
    id: "retrieval",
    label: "Retrieval",
    role: "从外部文档、知识库或搜索结果中召回相关证据。",
    limitation: "召回质量决定回答质量，检索不到就无法可靠引用。"
  },
  {
    id: "tools",
    label: "Tools",
    role: "让模型调用计算器、代码、搜索、数据库或业务系统执行动作。",
    limitation: "工具调用需要权限、参数校验和失败处理。"
  },
  {
    id: "memory",
    label: "Memory",
    role: "保存跨会话偏好、历史任务和长期项目状态。",
    limitation: "记忆需要选择、更新和遗忘策略，否则会污染上下文。"
  },
  {
    id: "eval",
    label: "Eval / Safety",
    role: "用测试、红队、权限和监控判断系统是否可靠。",
    limitation: "评估不能消除风险，只能让风险更早暴露。"
  }
];

export const llmSystemConnections: LlmSystemConnection[] = [
  { id: "model-context", from: "Base Model", to: "Context Window", label: "读入任务" },
  { id: "retrieval-context", from: "Retrieval", to: "Context Window", label: "补充证据" },
  { id: "model-tools", from: "Base Model", to: "Tools", label: "请求行动" },
  { id: "memory-context", from: "Memory", to: "Context Window", label: "带入状态" },
  { id: "eval-system", from: "Eval / Safety", to: "整套系统", label: "约束与验证" }
];
