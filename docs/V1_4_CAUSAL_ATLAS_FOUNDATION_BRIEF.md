# v1.4 Causal Atlas And Foundation Model Lifecycle Brief

- 状态：实现与本地门禁完成，等待 Pull Request 评审
- 分支：`codex/causal-atlas-foundation`
- 日期：2026-07-30
- 范围：P0 发布收口、P1 因果导航、P2 基础模型生命周期教学章节

## P0：v1.3 发布收口

v1.3 已由 PR #28 合并并发布。本迭代把 `ROADMAP.md`、部署 smoke 清单、发布过程记录和 v1.3 brief 对齐到已发布事实，并记录提交 `c4dea11`、CI、Cloudflare Pages 与生产隐私 smoke 证据。历史发布证据保持原始数量，不用当前表面数量改写过去的 release record。

## P1：跨视图因果导航

时间线增加章节与谱系双筛选。筛选只保留与所选对象直接关联的事件，不把关联误写成单一原因；状态使用 `chapter` 与 `lineage` URL 参数保存，可分享、刷新并从谱系图往返。

谱系图增加节点聚焦。选中节点后：

- 当前节点和直接相邻边高亮，其余拓扑降噪但不删除；
- 展示节点解释、直接关联事件、对应章节与已筛选时间线入口；
- 使用 `?lineage=<id>#node-<id>` 形成稳定深链；
- 无 JavaScript 时仍保留完整时间线、谱系 SVG 和原有章节链接。

这是一种教学导航，不是因果推断算法。事件与章节/谱系的关联由类型化 manifest 审核维护，页面明确说明单一论文、系统或标准不应被写成历史变化的唯一原因。

## P2：基础模型生命周期

### 核心问题

> 预训练、指令微调、偏好反馈和运行时上下文分别改变了什么？

新 Demo 07 位于 Attention / Transformer 与 LLM System 之间，使用六个脚本化步骤解释：

1. 预训练把大规模语料转成后续 token 预测目标；
2. Base Model 获得通用条件生成能力，但不一定稳定执行指令；
3. Instruction Tuning 用任务指令与目标回答继续更新权重；
4. Preference Feedback 用示范与候选排序塑造某类行为更常出现；
5. 后训练可以提高特定评测分布中的用户偏好，但不保证事实、权限或完整安全；
6. Runtime Context 影响当前一次推理，普通请求不会现场重训权重。

拓扑固定为：

`Training Corpus → Pretraining → Base Model → Instruction Tuning → Instruction Model → Preference Feedback → Assistant Model`

`Assistant Model + Runtime Context → Output`

### 来源与声明边界

| 来源                                                                                                    | 本站使用的限定声明                                                                             | 不作出的推论                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)                             | 在论文研究范围内，交叉熵损失随模型、数据与计算规模呈幂律关系                                   | 规模增大自动带来事实性、安全或对齐     |
| [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)                               | 175B 自回归模型可从文本说明与少量示例完成多类任务，而不在任务时更新权重                        | 提示内适应等于永久学习或实时知识       |
| [Finetuned Language Models Are Zero-Shot Learners](https://arxiv.org/abs/2109.01652)                    | 对自然语言指令描述的任务集合进行 instruction tuning，可改善论文所评估未见任务的 zero-shot 表现 | 所有任务、模型和分布都得到同等改善     |
| [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155) | 示范、候选排序与反馈优化可改善所评估分布中的输出偏好；论文仍记录简单错误与限制                 | “更受偏好”等于唯一正确、无偏或完整安全 |

Demo 不运行真实训练、标注、奖励模型或推理。不同模型可以采用不同数据、目标与优化流程；图中的单一路径只用于解释职责边界。

## 当前表面

- 12 章、11 个交互 Demo、24 个双语章节路由；
- 25 个有来源事件，其中新增 Scaling Laws、FLAN 与 InstructGPT；
- 11 组 manifest 驱动的 SVG / PNG 图源；
- 每章一个双语三选一自测；
- 静态站点边界不变：无真实模型、API key、后端、数据库或联网学习采集。

## 验收门禁

- `pnpm format:check`
- `pnpm validate:data`
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm render:diagrams`
- `git diff --check`
- 新章节桌面、英文移动端与因果导航视觉证据

2026-07-30 本地门禁结果：

- `pnpm format`、`pnpm format:check`、`pnpm validate:data`、`pnpm lint`、`pnpm build`、`pnpm test`、`pnpm render:diagrams` 与 `git diff --check` 全部通过；
- `pnpm test` 覆盖 demo-core 5 项、data 48 项、site unit 120 项与 macOS Playwright 156 项，全部通过；
- CI 同款 `mcr.microsoft.com/playwright:v1.61.1-noble` Linux 容器 Playwright 156 / 156 通过；
- 已生成并人工检查 `v1-4-foundation-runtime-desktop.png`、`v1-4-foundation-preference-english-mobile.png` 与 `v1-4-lineage-foundation-focus-desktop.png`。

Pull Request 继续保留来源限定、教学简化、验证命令与上述视觉证据，等待评审后合并。
