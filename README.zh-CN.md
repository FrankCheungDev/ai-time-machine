# 交互式人工智能图解史

这是一个开源知识库，用图解、动画和轻量交互解释人工智能技术从符号主义、统计学习、深度学习到大模型与智能体的发展脉络。

线上站点：[atlas.z-ai.cc](https://atlas.z-ai.cc)。中文为默认语言，`/en/`
下提供完整英文学习路径。

## 当前版本

v1.6 已由 PR #33 与 #35 合入 `main@adb3927` 并部署；对应 main CI、
Cloudflare Pages check 和 2026-08-08 生产隐私与交互 smoke 均已通过。
最终发布收口仍等待一次有记录的真实 VoiceOver 或 NVDA Guided Story spot check。

- 基于 Astro、MDX 与 Svelte islands 的纯静态站点。
- 从总览到 Safety / Eval 的 13 个章节，其中反馈学习位于 CNN 与 Attention 之间。
- 搜索树、专家系统、Bayes、决策边界、CNN、反馈学习、Attention、基础模型生命周期、LLM 系统边界、RAG、Agent、Safety / Eval 共 12 个教学 demo。
- 完整的中英文路由、文案、交互状态与参考资料。
- 可续学的本地进度、每章一个双语概念自测，以及前后章导航。
- 与章节和谱系关联的 27 个来源支持历史事件、可分享的时间线筛选、谱系聚焦深链和三条双语策展故事，以及由资产清单生成的 12 组可下载 SVG/PNG 图源页面。
- 公开隐私说明和经过评审的学习信号白名单；客户端学习数据收集保持禁用，部署响应头拒绝自动注入 RUM。Cloudflare 托管层的边缘流量统计不作为学习者数据。
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
- `/chapters/reinforcement-learning/`
- `/chapters/attention/`
- `/chapters/foundation-model/`
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
发布收口、章节扩展架构、Safety / Eval、图源资产库、事件级历史、因果图谱导航、
基础模型生命周期章节、章节自测与 v1.5 反馈学习切片已经实现并发布。v1.6 引导式
因果学习及其稳定性修复已部署，生产站现有三条策展故事；自动化发布证据已经闭合，
真实读屏 spot check 仍待完成。P2-05 真实使用闭环继续暂停：provider 决策重新开放，
没有获批或排期中的数据来源，自动化流量不会被当作学习者数据。页面内事件契约与聚合
分析器继续保留，但不会因此启用网络采集。发布记录与后续方案见
[`v1.5 反馈学习与引导式因果路径`](docs/V1_5_FEEDBACK_LEARNING_BRIEF.md)、
[`v1.6 引导式因果学习实施与发布说明`](docs/V1_6_GUIDED_CAUSAL_LEARNING_BRIEF.md)以及
[`v1.6 后续迭代分析`](docs/POST_V1_6_ITERATION_ANALYSIS.md)。v1.7 本机复习闭环现已进入评审：
它把章节完成状态与可清除、按学习主线排序的复习建议保持为两条独立状态轴，且不启用
联网采集。实施合同与待完成的发布门见
[`v1.7 本机复习闭环 brief`](docs/V1_7_LOCAL_REVIEW_LOOP_BRIEF.md)。

## 部署

生产与 PR 预览检查、发布步骤、冒烟测试、回滚方案和分析工具决策见
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 参与贡献

贡献前请阅读 `CONTRIBUTING.md`、`docs/DEMO_GUIDE.md`、
`docs/DIAGRAM_GUIDE.md`、`docs/DESIGN.md` 与 `docs/MOTION.md`。
