# 交互式人工智能图解史

这是一个中文优先的开源知识库，用图解、动画和轻量交互解释人工智能技术从符号主义、统计学习、深度学习到大模型与智能体的发展脉络。

当前 MVP 先验证一个最小闭环：

- Astro 静态站点
- Svelte 交互 island
- SVG 流程图
- 通用 Stepper demo 组件
- 搜索树 / A* 教学原型
- 专家系统规则推理教学原型
- Bayes 更新教学原型
- 决策边界教学原型
- CNN 卷积核教学原型
- RAG Pipeline 教学原型
- Attention Map 教学原型
- Agent Loop 教学原型

## 本地开发

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

已实现页面：

- `/chapters/search/`
- `/chapters/expert-system/`
- `/chapters/bayes/`
- `/chapters/decision-boundary/`
- `/chapters/cnn/`
- `/chapters/rag/`
- `/chapters/attention/`
- `/chapters/agent/`
