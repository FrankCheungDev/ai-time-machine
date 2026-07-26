# 交互式人工智能图解史

这是一个开源知识库，用图解、动画和轻量交互解释人工智能技术从符号主义、统计学习、深度学习到大模型与智能体的发展脉络。

线上站点：[atlas.z-ai.cc](https://atlas.z-ai.cc)。中文为默认语言，`/en/`
下提供完整英文学习路径。

## 当前版本

- 基于 Astro、MDX 与 Svelte islands 的纯静态站点。
- 从总览到 Safety / Eval 的 11 个章节。
- 搜索树、专家系统、Bayes、决策边界、CNN、Attention、RAG、Agent、Safety / Eval 共 9 个教学 demo。
- 完整的中英文路由、文案、交互状态与参考资料。
- 可续学的本地进度、每章一个双语概念自测，以及前后章导航。
- 与章节和谱系关联的 22 个来源支持历史事件，以及由资产清单生成的 9 组可下载 SVG/PNG 图源页面。
- 公开隐私说明和经过评审的学习信号白名单；只有精确正式域名使用严格 Plausible Events API 适配器，本地、预览、自动化、smoke 和已排除开发者保持离线。部署响应头继续拒绝 Cloudflare 自动 RUM，托管层边缘流量不作为学习者数据。
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
- `/chapters/safety/`
- `/timeline/`
- `/lineage/`
- `/diagrams/`
- `/privacy/`

在任意路由前增加 `/en` 可访问英文版本，例如
`/en/chapters/rag/`。

## 后续路线

Post-MVP 的实施顺序、依赖、质量门禁和完成定义见
[`docs/POST_MVP_ITERATION_PROCESS.md`](docs/POST_MVP_ITERATION_PROCESS.md)。
发布收口、章节扩展架构、Safety / Eval、图源资产库、事件级历史和章节自测
已经实现。Plausible 已获批用于正式域名的最小学习事件；剩余证据门是至少
14 天的独立真实使用观察周期，自动化流量不会被当作学习者数据。

## 部署

生产与 PR 预览检查、发布步骤、冒烟测试、回滚方案和分析工具决策见
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 参与贡献

贡献前请阅读 `CONTRIBUTING.md`、`docs/DEMO_GUIDE.md`、
`docs/DIAGRAM_GUIDE.md`、`docs/DESIGN.md` 与 `docs/MOTION.md`。
