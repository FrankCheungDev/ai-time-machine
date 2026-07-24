# 交互式人工智能图解史

这是一个开源知识库，用图解、动画和轻量交互解释人工智能技术从符号主义、统计学习、深度学习到大模型与智能体的发展脉络。

线上站点：[atlas.z-ai.cc](https://atlas.z-ai.cc)。中文为默认语言，`/en/`
下提供完整英文学习路径。

## 当前 MVP

- 基于 Astro、MDX 与 Svelte islands 的纯静态站点。
- 从总览到 Agent 的 10 个章节。
- 搜索树、专家系统、Bayes、决策边界、CNN、Attention、RAG、Agent 共 8 个教学 demo。
- 完整的中英文路由、文案、交互状态与参考资料。
- 可续学的本地进度、章节完成状态与前后章导航。
- 时间线、技术谱系和可复用图源页面。
- 覆盖格式、类型、数据契约、静态构建、单元测试、浏览器行为、视觉回归、可访问性控件和教学正确性的 CI。
- 设计、动效、图源、demo 与模板贡献指南。

## 本地开发

```bash
pnpm install
pnpm dev
pnpm validate:data
pnpm lint
pnpm build
pnpm test
pnpm format:check
```

## 主要页面

- `/chapters/overview/`
- `/chapters/search/`
- `/chapters/expert-system/`
- `/chapters/bayes/`
- `/chapters/decision-boundary/`
- `/chapters/cnn/`
- `/chapters/attention/`
- `/chapters/llm-system/`
- `/chapters/rag/`
- `/chapters/agent/`
- `/timeline/`
- `/lineage/`
- `/diagrams/`

在任意路由前增加 `/en` 可访问英文版本，例如
`/en/chapters/rag/`。

## 后续路线

Post-MVP 的实施顺序、依赖、质量门禁和完成定义见
[`docs/POST_MVP_ITERATION_PROCESS.md`](docs/POST_MVP_ITERATION_PROCESS.md)。

## 参与贡献

贡献前请阅读 `CONTRIBUTING.md`、`docs/DEMO_GUIDE.md`、
`docs/DIAGRAM_GUIDE.md`、`docs/DESIGN.md` 与 `docs/MOTION.md`。
