# Post-v1.7 Iteration Plan

- 状态：方向已确定；v1.7 自动发布证据已闭合，人工辅助技术收口待完成；v1.8 与 v1.9 尚未实施
- 日期：2026-08-12
- 当前发布基线：`main` @ `ff19b4a`（PR #37）
- 证据范围：仓库与构建产物静态审阅、GitHub check 结果、2026-08-12 生产隐私 / 交互 smoke
- 决策性质：固定 post-v1.7 的执行顺序、进入条件、非目标与验收边界；不等同于实现授权或真实学习效果证据

## 1. 决策摘要

v1.7 已把“继续学习”和“本机待复习”连接成确定性闭环。当前最重要的工作不再是继续扩张复习状态，而是先把已经部署的版本收口，再为后续产品迭代建立可重复的工程基线，最后把现有 Guided Story 从 Atlas 筛选结果升级为一段可逐步完成的阅读任务。

执行顺序固定为：

1. **P0：完成 v1.7 发布与事实源收口。** 自动发布门已经通过；补齐真实 VoiceOver 或 NVDA 检查，并让 README、ROADMAP、发布 brief 与部署记录保持一致。
2. **v1.8：以三个独立小 PR 建立工程质量基线。** 依次覆盖 transitive-gzip 性能测量、axe 与精简 WebKit smoke、production smoke registry 化。先测量和固化合同，再决定优化手段。
3. **v1.9：单独立项 Timeline 单故事 Reader。** 首个原型只覆盖现有 `feedback-learning` 故事，验证 `story + step + view` URL 状态、逐步导航与准确事件聚焦。
4. **继续延期新内容分支与真实指标闭环。** Diffusion、多模态、Lineage Reader、托管分析和 P2-05 都需要独立决策门，不随本方案自动进入开发。

本方案不授权把 v1.8 的三个门禁或 v1.9 Reader 合并为一个大版本。每个切片都必须从最新 `main` 建立短生命周期 `codex/*` worktree，独立评审、验证、发布和记录证据。

本文中的 v1.8 / v1.9 是产品迭代标签，不自动要求修改 workspace 的 `package.json` 版本或创建 Git tag；正式版本与 tag 策略若有需要，应另案决定。

## 2. 当前基线与证据边界

### 2.1 已发布表面

`main@ff19b4a` 包含：

- 13 个双语章节、12 个脚本化教学 Demo、27 个来源支持事件、12 组 SVG / PNG 图源和 3 条双语策展故事；
- 可续学的本机章节完成记录，以及每章一个双语概念自测；
- 与章节完成独立的 review-state v2：答错入队、答对出队、再次答错重入；
- 按 `learningPath` 派生的首页复习队列、逐章自测深链、独立清除与跨 tab 同步；
- `connect-src 'none'`、客户端学习采集 `disabled`、无账号、无后端和无数据库的静态边界。

可核验的自动发布证据为：

- [PR #37](https://github.com/FrankCheungDev/ai-time-machine/pull/37) 合并为 [`ff19b4a`](https://github.com/FrankCheungDev/ai-time-machine/commit/ff19b4accb4a7f8dc709c73d7ab870212ade8fe5)；
- [main CI run 31569422805](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/31569422805) 的 Quality / build 与 Chromium jobs 成功；
- Cloudflare Pages 对同一提交的 production check 成功；
- 2026-08-12 的 `pnpm smoke:production:privacy` 检查 33 个请求、26 条双语章节路由和 32 个 HTML 响应策略，完成“答错入队 → 自测深链 → 答对出队”以及三条 Guided Story 流程；`missingNoTransform`、`missingNoConnectPolicy` 与 `invalidScriptPolicy` 均为 0，`forbiddenRequests` 与 `failures` 均为空。

这些结果证明受测构建、部署、交互和隐私边界符合合同，但不证明复习功能改善了理解、记忆、完成率或任何学习结果。

### 2.2 尚未闭合的发布门

仓库仍没有一份真实 VoiceOver 或 NVDA 记录，能够同时证明：

- Timeline 与 Lineage 中未选故事不进入阅读与顺序 Tab 流；
- 故事筛选器、返回链接和 `aria-live` 状态被准确播报；
- 首页复习面板、展开其余章节、清除确认和清除后状态具有可理解的控件名称与焦点顺序；
- 章节自测深链落点清除 sticky header，并从合理的阅读起点继续。

因此 v1.7 的准确状态是“已部署且自动发布门完成，人工辅助技术发布收口待完成”，不能写成完整无障碍合规。

### 2.3 当前产品缺口

三条 Guided Story 已经拥有稳定的 6 / 7 / 7 步结构，每一步都包含“继承了什么、解决了什么、仍缺什么”。但当前 Timeline 仍把故事作为 Atlas 筛选条件：

- 选中故事后会同时展示全部故事步骤；
- 全部 27 个事件仍保留，只对故事内事件高亮、其余事件弱化；
- URL 只保存 `story`，没有当前 `step` 或阅读视图；
- 没有上一步、下一步、`n / total`，也不能通过浏览器历史恢复逐步阅读位置。

这使站点擅长“浏览一张资料地图”，但尚未验证“一次读完一条人工策展因果路径”的任务体验。Reader 是待验证产品假设，不是已经证明有效的改进。

### 2.4 探索性性能测量

在 `ff19b4a` 的 production build 上，以各页面 HTML 引用的 JavaScript 为入口，递归遍历静态 import、按路由去重 chunk，并分别 gzip 后求和，得到以下探索性结果：

| 路由           | Transitive JS gzip |
| -------------- | -----------------: |
| Home           |           28,415 B |
| Search chapter |          103,039 B |
| RAG chapter    |          127,383 B |
| Timeline       |            3,347 B |
| Lineage        |            3,285 B |

其中 Search 与 RAG 都会引入约 64.5 KB gzip 的共享数据 chunk；RAG 自身 chunk 约 29.4 KB gzip，并包含只在该 Demo 使用的 GSAP。当前所有 Demo、页尾 ConceptCheck 与 ChapterJourney 都使用 `client:load`。

这些数字只用于证明“需要可重复测量与归因”，不是正式预算，也不能与 handoff 中定义不完整的“单 Demo < 80 KB gzip”直接比较。构建文件名、压缩工具和依赖版本都会影响结果；v1.8-01 必须先把测量方法固化进仓库。

## 3. P0：v1.7 发布与事实源收口

### P0-01：发布事实同步

本方案文档 PR 负责同步：

- `README.md` 与 `README.zh-CN.md` 的 Current Release；
- `ROADMAP.md` 的 Current Surface 与 post-v1.7 顺序；
- `POST_MVP_ITERATION_PROCESS.md` 的当前基线与执行记录；
- `V1_7_LOCAL_REVIEW_LOOP_BRIEF.md` 的真实自动发布证据；
- `DEPLOYMENT.md` 的独立 v1.7 Release Record。

该项只有在文档 PR 合并且远端检查通过后才完成。本轮不追溯重写 v1.6 分析、原始 handoff 或早期发布 brief 中明确标注日期与提交的历史证据。

### P0-02：真实辅助技术检查

在当前生产版本上使用真实 VoiceOver 或 NVDA，至少检查：

1. 中文 Timeline 的一条非首个 Guided Story 深链；
2. 英文 Lineage 的同一故事切换、隐藏内容与返回链接；
3. 首页包含两条以上待复习项时的主入口、`details` 展开与章节链接；
4. 清除自测与复习记录的确认、取消、成功状态和焦点返回；
5. 从首页进入章节 `#concept-check-<chapterId>` 后的标题、题组与反馈阅读顺序。

记录必须包含浏览器、操作系统、辅助技术及其版本、受测 URL、步骤、预期、实际结果和已知限制。只有结果写回仓库，且检查发现的问题全部修复并使用真实辅助技术复验通过后，才关闭 v1.6 / v1.7 共用的人工辅助技术发布门；否则该门保持阻塞。该 spot check 仍不是 WCAG 认证，也不替代缩放、reflow、键盘和自动规则测试。

### P0 退出条件

- 所有当前状态文档都指向同一个已发布提交与自动证据；
- 不再把 v1.7 写成 “in review” 或“生产仍为 v1.6”；
- P0-01 可在文档合并且继续明确标注人工门后关闭；
- P0 整体只有在真实辅助技术结果写回，且发现的问题已经修复并验证后才关闭；无法在当前切片修复的问题必须明确保持为发布阻塞，不能仅凭记录后续处置关闭门禁；
- 不把 CI、smoke 或人工 spot check 写成真实学习效果证据。

## 4. v1.8：工程质量基线

v1.8 是三个独立、可单独发布的小 PR。它们解决不同风险，不应共享一个大重构分支。

### v1.8-01：可重复性能基线与回退门

范围：

- 增加构建后测量脚本，从实际页面入口递归解析 transitive JavaScript；
- 对 Home、Search、RAG、Timeline 与 Lineage 固定 raw / gzip 基线；
- 去重同一路由中的共享 chunk，并记录 Node、pnpm、构建提交和测量方法；
- 将结果作为 CI artifact 或清晰日志输出；
- 初始回退门为：任一路由相对已评审基线增长超过 `max(5 KB, 5%)` 时失败。需要接受增长时，必须在同一 PR 更新基线并解释来源与用户价值。

在基线和归因建立后，按证据决定是否另开优化 PR：

- 为 hydrated islands 使用 `@ai-history/data` 精确子路径；
- 测量 ConceptCheck 与 ChapterJourney 改用 `client:visible` 的收益与状态恢复风险；
- 测量 RAG 保留 GSAP、按需拆分或改用 CSS / WAAPI 的差异。

验收：

- 本地与 CI 在相同提交上产生同一组路由和可解释数字；
- 脚本不会只测入口 chunk，也不会重复计算同一路由的共享 chunk；
- 纯测量 PR 不改变页面行为、教学内容或资源加载顺序；
- 后续优化必须提供同一脚本下的 before / after，并保持无 JavaScript 内容、键盘、reduced-motion 与视觉回归不退化。

非目标：在归因前移除依赖、重写全部 island，或把探索性数字包装成已达成的性能预算。

### v1.8-02：axe、skip link 与精简 WebKit smoke

范围：

- 为全站增加双语 skip link；首次 Tab 可见，激活后进入主内容，且落点不被 sticky header 遮挡；
- 对首页、代表性 Demo、Timeline story、Lineage story 与 Privacy 的代表性中英文路由执行 axe；
- `critical` 与 `serious` 违规数固定为 0；
- 保留现有完整 Chromium 矩阵，只增加精简 WebKit smoke。

WebKit 只覆盖高价值合同：

- 首页复习入口与 390px reflow；
- 一个代表性 Demo 的主控件、键盘与 reduced-motion；
- Timeline / Lineage story 深链与语言切换状态；
- concept-check 深链和 sticky-header 安全间距。

验收：

- axe 结果可在 CI 中重复，失败时输出具体 route、rule 与 node；
- skip link 在中英文、桌面和移动宽度下可见、可操作、焦点明确；
- WebKit smoke 不复制全部 Chromium 截图矩阵，也不通过静默 skip 规避稳定失败；
- 文档继续声明 axe 与 WebKit 不能替代真实读屏、语义质量或完整 WCAG 评估。

### v1.8-03：Production smoke registry 化

范围：

- 26 条双语章节路由从 `chapterRegistry` 与 locale registry 派生；
- 事件 id / 数量从 timeline event registry 派生；
- story id 与每条故事步骤从 causal story manifest 派生；
- 首页 story 列表、双语拓扑、story step → event 引用继续交叉验证；
- 保留概念自测、v1.7 复习闭环、`no-transform`、`connect-src 'none'` 与 forbidden request 检查。

为避免“代码只和自己比较”的循环验证，保留一份小型、版本化的 release-surface 摘要，明确本次发布批准的公共表面总量；不再维护章节 id、story id 或 6 / 7 / 7 步数的第二份手写数组。

验收：

- 脚本中不再手写 13、27、3 或 6 / 7 / 7 拓扑；
- fixture 测试证明新增章节或故事会自动进入受测矩阵；
- registry 内的无效 route、未知 event 引用或双语拓扑差异会让测试失败；
- 生产 smoke 的请求与隐私边界不因重构而减少。

### v1.8 内容版本决策门

当前 concept-check store 没有题目内容版本。如果后续修改题干、选项或正确答案，旧的本机结果可能继续被解释为当前题目的记录。因此：

- v1.8 不为了预防性设计而立即扩张 storage schema；
- 任一概念题的语义或正确答案发生变化前，必须先建立 `checkVersion` 或等价的失效 / 迁移合同；
- 该合同必须覆盖旧值不被误解释、未知未来版本不被覆写、隐私说明与清除语义；
- 纯拼写、标点或不改变题意的翻译修正，可在评审明确后保持版本不变。

## 5. v1.9：Timeline 单故事 Reader 原型

### 5.1 待验证假设

如果学习者能一次只处理一条人工策展故事中的一个步骤，同时看到对应历史事件，并能通过 URL 与浏览器历史恢复位置，那么 Guided Story 可能比当前一次展示全部步骤的筛选视图更容易作为一段完整任务使用。

这是产品假设。工程验收只能证明 Reader 状态与交互符合合同，不能证明它提高理解或学习效率。

### 5.2 首版范围

首版只选择步骤最少、已有完整自动发布证据的 `feedback-learning` 故事，不改变其内容与顺序。人工辅助技术发布门仍按 P0-02 单独闭合。

建议 URL 合同：

```text
/timeline/?story=feedback-learning&step=samuel-experience&view=reader#story-feedback-learning
```

- `story` 与 `step` 使用 manifest 中的稳定 id，不使用数组下标；
- `view=reader` 表示学习者主动进入 Reader；只有 `view=reader`、合法 `story` 与合法 `step` 同时存在时，才直接恢复指定 Reader 步骤；
- `view=reader` + 合法 `story` + 缺失或非法 `step` 回退到该故事第一步，并用 `replaceState` 写入规范 step；
- `view=reader` + 缺失或非法 `story` 回退完整 Atlas，并移除无效 `story`、`step` 与 `view`；随后按现有 Atlas 合同恢复仍然合法的 `chapter` / `lineage` 筛选；
- 缺失 `view` 时保留现有 Atlas 行为；不受支持的 `view` 与脱离 Reader 的 `step` 都被移除，合法 Atlas 筛选继续生效；
- Reader 与 `chapter` / `lineage` 互斥：合法 Reader 状态优先，并在规范化时移除这两个筛选；非 Reader 状态继续遵守现有 Atlas 的 story 优先级和筛选规范化；
- 用户显式切换步骤使用浏览器历史，前进 / 后退恢复同一 story、step 与 view；
- 语言切换保留全部合法查询状态与 fragment。

Reader 交互：

- 显示上一步、下一步和本地化的 `第 n / total 步`；
- 一次只暴露当前故事步骤，隐藏步骤不进入 Tab 顺序或辅助技术树；
- 只展示当前故事关联的事件集合，并用非颜色唯一状态标识当前步骤对应事件；
- 提供明确的“查看完整历史”，一键回到现有 27 事件 Atlas；
- 始终显示“人工策展、非唯一、非完整、非因果证明”的简化边界；
- 无 JavaScript 时仍能阅读完整历史与全部故事文字。

### 5.3 可测试验收

- `story + step + view` 在直接打开、刷新、前进、后退和语言切换后完整恢复；
- 缺失 / 非法 story、缺失 / 非法 step、不受支持的 view、游离 step 与 Reader / Atlas 筛选冲突都有确定性、安全、无空白页的回退和 URL 规范化；
- 上一步 / 下一步的禁用状态与 `n / total` 始终和 manifest 一致；
- 当前步骤、当前 event card 与 URL 使用同一个稳定 event / step 合同；
- 中英文、桌面、390px、44px 操作目标、键盘、reduced-motion 和 sticky-header 深链回归通过；
- 隐藏步骤与非 Reader 内容不进入顺序 Tab 流或辅助技术树；
- 无 JavaScript fallback、客户端采集 `disabled` 和 CSP `connect-src 'none'` 不退化；
- Reader 的独立 brief、视觉证据、PR preview、main CI、production deployment 和 production smoke 均有真实记录。

### 5.4 非范围

- 不做 Lineage Reader 或一个步骤对应多个 lineage nodes 的视觉语义；
- 不做从章节离开后返回原 story / step；
- 不做 Reader 完成记录、复习队列、推荐、排序或跨设备同步；
- 不做 CMS、通用 story builder、自动因果推断或 AI 生成故事；
- 不新增故事、事件、章节、来源或图源；
- 不新增 analytics event、provider、API key、后端或数据库。

上述能力若继续推进，分别建立 Lineage 数据合同、章节往返状态和 Reader 证据研究 brief，不因首个原型可运行而自动扩张。

## 6. 执行顺序与决策门

| 顺序 | 切片                              | 规模 | 进入条件                                       | 退出证据                                               |
| ---- | --------------------------------- | ---- | ---------------------------------------------- | ------------------------------------------------------ |
| 1    | P0-01 发布事实同步                | S    | `main@ff19b4a` 自动发布证据可核验              | 文档 PR 合并、远端检查通过、状态口径一致               |
| 2    | P0-02 真实 VoiceOver / NVDA       | S    | 当前生产版本可访问                             | 真实设备 / AT 记录写回；发现的缺陷修复并验证           |
| 3    | v1.8-01 性能测量与回退门          | S–M  | P0 整体关闭                                    | 可重复 transitive 基线进入 CI                          |
| 4    | v1.8-02 axe / skip link / WebKit  | S–M  | 人工与自动无障碍职责已写清                     | axe、skip link、精简 WebKit 与现有 Chromium 同时通过   |
| 5    | v1.8-03 production smoke registry | S    | registry / manifest 是当前事实源               | 手写拓扑移除，fixture、生产 smoke 与隐私边界通过       |
| 6    | v1.9 Reader 独立 brief            | S    | 三项 v1.8 基线完成                             | URL、默认 view、history、焦点和非目标合同获批          |
| 7    | v1.9 Timeline Reader 实现         | M    | Reader brief 获批且从最新 `main` 建立 worktree | 双语 / 移动 / 键盘 / 无 JS / 发布证据全部按 brief 闭合 |

v1.8 的三个 PR 在依赖上可以独立，但为降低评审负担，默认一次只保持一个主要工程切片处于合并评审。Reader 不得绕过任何未完成的 v1.8 进入门。

## 7. 隐私、教学与证据边界

全阶段保持：

- `learningSignalCollectionMode` 为 `disabled`；
- CSP 为 `connect-src 'none'`，HTML 保持 `no-transform`；
- 不保存身份、自由文本、精确时间戳、Reader 行为或跨站标识；
- CI、Playwright、preview、production smoke 和开发者访问不进入真实学习者指标；
- 本机复习建议不被称为掌握度、薄弱点预测或个性化诊断；
- Guided Story 不被描述为唯一历史路径、完整因果图或因果证明。

未来若要声称 Reader 或复习功能改善学习效果，必须另行批准真实参与者、研究问题、观察窗口、数据来源、隐私说明和停止条件。P2-05 在此之前继续暂停。

## 8. 明确延期项

- **Lineage Reader：** 一个步骤可以关联多个节点，必须先定义不虚构谱系边的表达合同；
- **章节往返恢复：** 需要明确离开 Reader、进入章节、返回时的 history 与 fragment 语义；
- **故事级迁移检查：** 需要先定义跨步骤教学目标，不能把单章概念题简单拼接；
- **Diffusion / 多模态 / 生成模型新分支：** 先明确一个用户问题、来源范围和教学边界，不并行开启多条热点内容线；
- **间隔重复、导入导出与跨设备同步：** 会扩张时间、数据和兼容合同，当前本机确定性队列不需要这些能力；
- **Hosted analytics / P2-05：** 没有获批 provider、真实观察窗口或可读取的真实聚合数据，继续暂停。

## 9. 风险与控制

| 风险                              | 控制                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------- |
| 文档把已部署写成已证明有效        | 发布证据与学习效果证据分开；所有产品价值使用“假设”“待验证”                    |
| 性能脚本只测入口或重复共享 chunk  | 从页面实际入口递归、按路由去重、记录工具版本，并用 fixture 验证图遍历         |
| 先定优化方案再寻找证据            | v1.8-01 先测量与归因；精确导入、hydration、GSAP 都作为后续决策而非预设结论    |
| axe / WebKit 被写成完整无障碍证明 | 保留真实读屏、键盘、reflow 与阅读顺序的独立职责                               |
| registry 化形成循环验证           | registry 派生详细矩阵，同时保留一份经评审的版本化公共表面摘要                 |
| Reader URL 与现有筛选状态冲突     | 在独立 brief 中固定参数互斥、非法值、history 与语言切换合同                   |
| Reader 隐藏内容仍可聚焦或被播报   | 使用原生 `hidden` / 明确 display 合同，并做 role、Tab、axe 与真实辅助技术复核 |
| Reader 暗示唯一线性因果           | 始终显示策展与简化说明；不推断新边、不改变来源声明                            |
| 新内容与工程门禁同时扩张评审面    | Reader 前先完成三项 v1.8；新历史分支继续延期                                  |
| 未来题目变化沿用过时本地结果      | 语义或正确答案变化前强制 `checkVersion` / 失效迁移决策门                      |

## 10. Definition of Done

每个后续切片只有同时满足以下条件，才能在路线图中从“计划”改为“完成”：

1. 范围、非目标、教学简化、隐私边界和可测试验收已经写入独立 brief 或当前计划；
2. 从最新 `main` 建立独立 worktree 和 `codex/*` 分支，不直接在 `main` 开发；
3. format、data、type、build、unit、browser、visual、accessibility 与 teaching correctness 中所有相关门禁通过；
4. 可见变化包含双语、桌面、390px 与必要的视觉证据；
5. PR preview、main CI、Cloudflare Pages 与 production smoke 只在真实执行后记录；
6. 真实辅助技术或真实学习效果证据没有被自动化结果替代；
7. README、ROADMAP、brief、Deployment 与 visual-evidence 索引没有继续保留非历史性的状态漂移。
