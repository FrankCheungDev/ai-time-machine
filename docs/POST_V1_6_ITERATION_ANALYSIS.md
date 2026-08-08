# Post-v1.6 Iteration Analysis

- 状态：方向分析，待拆分为独立 brief 后实施
- 日期：2026-08-08
- 代码基线：`main` @ `f6e4178`（PR #33 已合并）
- 证据范围：本地静态构建、当前代码与测试静态审阅、中文桌面关键路径检查
- 决策性质：产品与工程方向建议，不等同于生产发布记录或真实学习效果证据

## 1. 决策摘要

v1.6 的三条 Guided Stories、首页入口和章节上下文链接已经进入
`main`，但发布收口尚未在仓库中完整记录。本轮建议按以下顺序推进：

1. **先做 v1.6 发布稳定化与收口。** 修复已确认的故事显示与深链落点问题，补齐行为测试，再记录 main CI、Cloudflare Pages production 和三故事 production smoke。
2. **下一项主要产品迭代优先验证本地复习闭环。** 把它作为当前优先假设，利用现有自测记录回答“我该复习什么”，并保持无账号、无后端、无联网采集。
3. **把 Guided Story 阅读模式保留为 P2 独立候选。** 首个原型只验证 timeline 单故事的步骤状态与准确聚焦，不扩张为通用 story builder。
4. **分别建立性能、自动无障碍与精简跨浏览器、production smoke 三类门禁。** 每类以独立小 PR 推进，先测量和设预算，再决定依赖与 hydration 调整。
5. **暂不新增历史分支，也不恢复 P2-05。** 新章节或真实指标闭环都需要独立决策门和证据来源。

这份分析不授权直接把所有方向合并为一个版本。每个方向仍需遵循
[Post-MVP iteration process](POST_MVP_ITERATION_PROCESS.md) 建立范围、非目标、验收标准与发布证据。

## 2. 当前基线与证据边界

`main` @ `f6e4178` 已包含以下能力：

- 13 个章节、12 个教学 Demo、27 个来源事件和 12 组图源；
- 三条双语 Guided Stories，步骤拓扑分别为 6 / 7 / 7；
- 首页从 story manifest 派生故事卡与时间线、谱系入口；
- 章节末尾从 chapter registry 派生时间线与谱系上下文链接；
- Chromium 下的首页卡片、双语、移动宽度、44px 操作目标和键盘焦点测试；
- provider-neutral 学习信号契约，但客户端 collection mode 继续保持 `disabled`。

2026-08-07 在该提交上执行 `pnpm build`，Astro 检查 151 个文件无错误、警告或提示，并生成 37 个静态页面。本轮没有执行完整 `pnpm test`。随后在 Codex in-app Chromium 桌面视口完成本地浏览器关键路径检查；浏览器版本没有单独记录，也没有执行 Tab 顺序或屏幕阅读器 pass。检查覆盖：

1. 首页续学；
2. 首页三条故事发现；
3. 从首页进入指定时间线故事；
4. 从故事进入基础模型生命周期章节；
5. 从章节进入谱系节点，以及直接进入同一条谱系故事。

这些证据只证明本地构建与被检查路径的当前行为。它们没有验证生产部署、WebKit、真实屏幕阅读器或完整 WCAG 合规，也不是 P2-05 的真实学习者证据。

## 3. P0：v1.6 发布稳定化与收口

### 3.1 已确认：未选故事仍参与布局

时间线与谱系控制器会给未选中的 `[data-causal-story-detail]` 设置
`hidden`。但全局样式同时给 `.causal-story-detail` 设置
`display: grid`，没有为 detail 自身声明更明确的 hidden 规则。

在中文桌面检查中打开：

```text
/timeline/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems
/lineage/?story=scaled-models-to-reliable-systems#story-scaled-models-to-reliable-systems
```

前两条 story detail 均为 `hidden=true`，但 computed `display` 仍为
`grid`，并分别保留完整高度。结果是：

- 第三条故事之前仍出现前两条故事内容；
- 页面长度显著增加；
- 未选 detail 的可见文本、链接和步骤仍实际参与渲染；
- “聚焦故事”与控件状态不一致，并形成潜在的键盘顺序与辅助技术暴露风险；该风险仍需通过 tab order、accessibility tree 和真实屏幕阅读器验证。

相关实现：

- [故事详情样式](../apps/site/src/styles/tokens.css)
- [时间线隐藏逻辑](../apps/site/src/components/pages/TimelinePage.astro)
- [谱系隐藏逻辑](../apps/site/src/components/pages/LineagePage.astro)
- [现有 story 状态浏览器测试](../apps/site/tests/feedback-learning-story.spec.ts)
- [首页 Guided Stories 浏览器测试](../apps/site/tests/guided-stories.spec.ts)

v1.6 发布稳定化验收至少包括：

- 未选 detail 的 computed display 为 `none`，且没有可聚焦后代；
- 时间线与谱系分别只显示当前选中的一个故事摘要；
- Tab 从故事筛选器跳过全部未选故事操作，accessibility tree 也不暴露未选故事的名称与步骤；
- 至少完成一次真实屏幕阅读器 spot check，并确认 `aria-live` 区域不会异常播报未选故事；
- 中英文、刷新、语言切换和三条 story id 都通过同一组 manifest-driven 测试；
- 无 JavaScript fallback 仍能阅读完整历史与故事内容。

### 3.2 已确认：story 深链标题会被固定导航遮挡

直接打开 `#story-<storyId>` 时，目标 article 会贴到视口顶部，标题和
Guided Causal Story eyebrow 被 sticky header 遮住。首页学习路径锚点已有
`scroll-margin-top`，story article 尚未共享同类规则。

验收应证明：

- 从首页、时间线或谱系进入任一 story 深链时，故事标题完整可见，且目标标题的 `top` 不小于 sticky header 的 `bottom` 加安全间距；
- 中文、英文和移动端使用同一可解释的 header offset；
- 直接打开或刷新深链时，目标内容与阅读起点不会藏在导航后方。

### 3.3 发布记录尚未闭合

PR #33 已把 v1.6 实现合入 `main`，但以下发布证据和文档仍记录“实现未开始”、只列出 v1.5，或尚未形成一致记录：

- [README](../README.md) 与 [中文 README](../README.zh-CN.md)；
- [v1.6 brief](V1_6_GUIDED_CAUSAL_LEARNING_BRIEF.md) 的状态与实施状态；
- [visual-evidence 索引](visual-evidence/README.md)，虽然三张 v1.6 图片已经存在；
- main CI、Cloudflare Pages production、production smoke 与对应提交的发布记录。

仓库根脚本中尚无可复现的 `capture:v1.6-evidence`。这适合作为证据工程化的后续小项，但原 v1.6 完成定义要求留存视觉证据，并未指定必须提供该脚本，因此脚本本身不构成发布阻断条件。

在把 v1.6 标记为“已发布”前，必须记录：

1. `main` 对应提交的 CI 成功；
2. Cloudflare Pages production 部署成功；
3. production privacy smoke 遍历三条 story，并保持 CSP、RUM 和网络边界不变；
4. 修复 3.1 与 3.2 后的中英文桌面、移动视觉证据；
5. README、ROADMAP、brief、visual-evidence 索引与部署记录使用同一提交和日期。

若生产验证尚未完成，公开状态只能写“实现已合并，发布收口待完成”。

## 4. P1：本地复习闭环

### 4.1 为什么优先

当前首页能回答“下一章是什么”，但不能回答“哪一章值得复习”。现有
[concept check progress](../apps/site/src/learning/conceptCheckProgress.ts)
已经在本地记录：

- `firstCorrect`；
- `attempts`；
- `explanationViewed`。

因此首版复习闭环不依赖 analytics provider、账户、时间戳或新后端，能够在不扩大隐私面的前提下提升学习路径的实际用途。

### 4.2 建议范围

- 首页形成“继续学习 / 待复习”两个清楚但不竞争的入口；
- 章节卡分别展示完成进度与复习建议，两者是独立维度，不强行合并为互斥三态；
- 待复习清单优先包含首次答错或多次尝试的章节；`explanationViewed` 只能作为解释上下文，不能因未打开解释而自动入队；
- 为复习队列定义明确的进入与退出规则；后续正确作答或完成一次复习必须能够消除建议，而不是让首次答错永久留在队列；
- 完成全部章节后，给出针对性复习入口，而不是只导向时间线、谱系和图源；
- 支持单独清除复习记录，并在 localStorage 不可用时安全降级；
- 状态继续跨中英文路由共用，但文案与链接保持当前 locale。
- 新增或迁移本地字段时，同步更新隐私页的数据说明与统一清除入口。

### 4.3 必须先拆开的语义

当前“完成并继续”会在同一动作中连续表达核心交互完成和继续下一章，不能区分：

- 阅读完章节；
- 完成 Demo 的关键交互；
- 提交概念自测；
- 主动继续下一章。

现有 concept-check schema 也只保存不可变的 `firstCorrect`、累计
`attempts` 与 `explanationViewed`，没有 `lastCorrect`、复习完成或建议已解决状态。实现前需要定义版本化 schema 迁移，并明确：

- completion 与 review 是两条独立状态轴；
- 什么行为让章节进入待复习队列；
- 什么行为证明本设备上的复习建议已经解决；
- 旧版记录、无效记录和存储异常如何降级。

首版复习闭环应先明确产品状态，再决定是否调整站内事件契约。即使事件语义被修正，也不代表授权联网采集。相关限制继续以
[P2 metrics provider decision](P2_METRICS_PROVIDER_DECISION.md) 为准。

### 4.4 验收边界

- 所有复习排序可由当前设备上的确定性数据解释；
- 队列进入、退出与 schema 迁移规则均有单元和浏览器测试；
- 不增加身份、自由文本、时间戳、provider、API key 或网络请求；
- CSP `connect-src 'none'` 和 collection mode `disabled` 保持不变；
- 覆盖中英文、刷新、存储异常、单独清除与完成状态/自测状态分离；
- 不声称复习建议已经由真实学习效果验证。

## 5. P2 候选：Guided Story 阅读模式

首页已经解决故事发现，但时间线和谱系仍主要是 atlas/filter 体验。该方向应在本地复习闭环之后单独立项。首个可验收原型只面向 timeline 的一条故事：

- 上一步、下一步和 `第 n / total 步`；
- URL 保存 `story + step`，刷新和语言切换后恢复；
- 明确的“只看故事 / 查看完整历史”切换；
- 当前时间线事件与步骤保持一致聚焦。

该方向不得演变为自动因果推断、推荐算法、CMS 或通用 story builder。策展顺序仍需人工审核，且必须持续显示“非唯一、非完整、非因果证明”的边界说明。

“只看故事”必须是学习者主动选择的 Reader 模式，完整历史始终可以一键恢复，默认状态则由独立 brief 明确。后续范围应拆成三个独立决策与验收切片：

1. 单条 timeline story 的 `story + step`；
2. lineage step order 的数据合同、视觉表达与关系语义；一个步骤可关联多个节点，不能用不存在的谱系边暗示因果或一一对应；
3. 章节往返和原 story/step 恢复。

只有第一个切片属于建议的首个 M 级原型；三项完整范围更接近 L，不能作为一个版本隐式打包。

## 6. 并行工程门禁

### 6.1 客户端包边界与性能预算

原始 handoff 建议首屏 JavaScript 小于 150KB gzip、单 Demo 小于 80KB gzip，但当前 CI 没有 transitive-gzip 预算。在 `f6e4178` 上执行 `pnpm build` 后，沿 RAG island chunk 的直接 import 找到其组件 chunk 与数据 chunk，并分别用 `gzip -c <chunk> | wc -c` 测量，合计为 93,158 bytes（93.2 kB / 91.0 KiB）。该数值尚未计入共享 runtime、其他 transitive shared chunks 或 HTML bootstrap，只能作为建立正式、可重复测量的动机，不能直接作为长期基线。

建议：

- 对首页、代表性章节、RAG、时间线和谱系记录 raw/gzip 基线；
- 为 `@ai-history/data` 增加精确子路径，避免客户端 island 引入无关 demo/历史数据；
- 测量页尾 ConceptCheck 与 ChapterJourney 改用 `client:visible` 的收益；
- 单独评审只由 RAG 使用的 GSAP，测量后再决定保留或改用 CSS/WAAPI；
- CI 先阻止明显回退，再逐步逼近既有预算。

### 6.2 自动无障碍与 WebKit smoke

现有键盘、44px 目标、动态 ARIA 和 reduced-motion 测试应继续保留，并增加：

- 首页、代表性 Demo、timeline/story、lineage/story、privacy 的 axe critical/serious 检查；
- 精简 WebKit smoke，而不是复制完整 Chromium 矩阵；
- 全站 skip link；
- story hidden、深链落点和 sticky header 的专项回归。

axe 只作为自动规则门禁，不能替代键盘顺序、缩放与 reflow、阅读顺序和真实屏幕阅读器 spot check，也不能单独支持“完整无障碍合规”的结论。

### 6.3 Production smoke registry 化

[production privacy smoke](../scripts/smoke-production-privacy.mjs) 仍手写章节列表、27 个事件数量以及三条 story 的步骤数。应把章节、story、事件和双语路径派生自 registry/manifest，只在单一版本清单中保留“预期发布表面数量”。

## 7. P2 与明确延期项

### 7.1 新历史分支

生成模型、Diffusion、多模态仍有内容价值，但必须先选择一个明确用户问题，建立来源范围与教学边界，再决定是否新增章节或 Demo。不要因为热点同时开启多条内容线。

进入条件：

- v1.6 发布稳定化与收口完成；
- 本地复习或 Story Reader 至少有一个形成稳定切片；
- 性能与跨浏览器基线已经建立；
- 新增声明通过事实与来源评审。

### 7.2 P2-05 继续暂停

没有获批 provider、正式观察窗口或达到门槛的真实聚合学习者样本。自动化、preview、production smoke、开发者访问和模拟导出都不能替代真实证据。

任何恢复提案必须先重新批准费用、隐私、数据驻留、访问控制、事件语义、真实流量来源和一键移除路径。本地复习闭环不构成恢复 P2-05 的理由。

## 8. 推荐拆分

| 顺序 | 切片                                   | 用户价值         | 成本 | 进入下一步的必要证据                              |
| ---- | -------------------------------------- | ---------------- | ---- | ------------------------------------------------- |
| 1    | v1.6 story 可见性、深链落点与回归测试  | 高               | S    | 三条 story × 双语 × timeline/lineage 回归通过     |
| 2    | v1.6 发布记录收口                      | 高               | S    | main CI、production、privacy smoke 与文档证据一致 |
| 3    | 本地复习闭环 brief 与首个纵向切片      | 预期最高，待验证 | M    | 本地确定性状态、隐私边界与降级测试通过            |
| 4    | 客户端包边界与性能预算小 PR            | 中高             | S–M  | 可重复的页面与 transitive-gzip 基线进入 CI        |
| 5    | axe 与精简 WebKit smoke 小 PR          | 中高             | S–M  | 自动规则、键盘和跨浏览器门禁职责明确              |
| 6    | production smoke registry 化小 PR      | 中               | S    | 路径与数量从 registry/manifest 派生               |
| 7    | P2：timeline 单故事 Reader 原型        | 待验证           | M    | `story + step` 可恢复且不夸大因果关系             |
| 8    | P2：lineage 与章节往返 Reader 后续切片 | 待验证           | L    | 数据合同、关系语义与上下文恢复分别获批            |
| 9    | 单一新历史分支 brief                   | 待验证           | L    | 用户问题、来源范围和教学边界获批                  |

下一轮不应同时实现 3–9。建议以本地复习闭环作为主要产品版本；三类工程门禁分别作为独立小 PR，Story Reader 则保留为后续独立候选。
