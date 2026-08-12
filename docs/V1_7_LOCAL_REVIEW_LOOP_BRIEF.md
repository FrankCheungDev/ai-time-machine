# v1.7 Local Review Loop Brief

- 状态：已合并并部署；本地与自动发布验证完成，真实 VoiceOver 或 NVDA 辅助技术检查待完成
- 日期：2026-08-11
- 规划基线：`main` @ `1d64cbc`（PR #36 已合并）
- 实现分支：`codex/v1-7-local-review-loop`
- 发布基线：`main` @ `ff19b4a`（PR #37）
- 范围：向后兼容的复习状态 schema v2、本机复习队列、首页复习面板、章节自测深链、独立清除与发布验证
- 决策性质：基于现有本地自测状态形成确定性复习建议；不声称已经由真实学习效果、用户研究或线上指标验证

## 1. 决策摘要

当前首页能够回答“下一章是什么”，每章概念自测也会在本机保存首次正确性、尝试次数和解释查看状态，但站点仍不能回答：

> 哪些章节值得我回去复习，以及我怎样在这台设备上完成一次可解释、可消除的复习？

v1.7 只使用已有概念自测及章节注册表建立一个本机复习闭环：答错会让章节进入待复习队列，后续答对会解除建议，再次答错则重新进入。首页同时展示“继续学习”和“本机待复习”，复习链接直接返回对应章节的概念自测。章节完成状态与复习建议保持两条独立状态轴，互不推导、互不清除。

本版不新增账号、后端、数据库、时间戳、自由文本、推荐模型或联网事件。客户端学习信号采集继续保持禁用，部署 CSP 继续保持 `connect-src 'none'`。自动化与发布 smoke 只验证实现行为和隐私边界，不作为学习效果证据。

## 2. 当前基线与缺口

规划基线已经具备：

- 13 个由 `chapterRegistry` 定义的双语章节，以及由其派生的 `learningPath`；
- `ai-history-learning-progress` 中独立保存的章节完成 id；
- `ai-history-concept-check-progress` v1 中保存的 `firstCorrect`、`attempts` 与 `explanationViewed`；
- 每章一个双语、非阻断的 `ConceptCheck`，支持答题、解释、重试和清除全部自测记录；
- 首页续学、全路径完成状态、时间线 / 谱系 / 图源回顾入口；
- 同页 `CustomEvent`、跨页 `localStorage` 和跨 tab `storage` 事件同步模式；
- `learningSignalCollectionMode = "disabled"`、类型化站内信号白名单与 `connect-src 'none'`；
- Vitest、Chromium Playwright、生产隐私 smoke 和双语隐私页。

现有 v1 自测记录不能直接形成闭环：`firstCorrect` 永远不变，累计 `attempts` 也不能说明最后一次是否正确；因此仅用 `firstCorrect === false` 派生队列会让首次答错永久留在队列。v1.7 必须增加一个明确、可更新的当前建议状态，并定义旧记录的保守迁移规则。

## 3. 产品状态合同

### 3.1 完成与复习是独立状态轴

| 完成状态 | 复习状态 | 首页含义                       |
| -------- | -------- | ------------------------------ |
| 未完成   | 无建议   | 继续学习，不显示复习入口       |
| 未完成   | 建议复习 | 同时保留继续学习与待复习入口   |
| 已完成   | 无建议   | 计入完成，不显示针对性复习     |
| 已完成   | 建议复习 | 仍计入完成，同时显示待复习入口 |

以下行为不得互相替代：

- “标记完成并继续”只更新章节完成记录；
- 概念自测答案只更新自测与复习记录；
- 重置学习进度不清除自测或复习记录；
- 清除自测与复习记录不清除章节完成记录。

### 3.2 队列进入与退出

对 v2 运行时记录采用以下确定性规则：

1. 没有自测记录：`reviewSuggested` 不存在，不进入队列；
2. 提交错误答案：写入 `reviewSuggested: true`，进入队列；
3. 提交正确答案：写入 `reviewSuggested: false`，退出队列；
4. 已退出后再次提交错误答案：重新写入 `true`，再次入队；
5. 查看或收起解释：不改变 `reviewSuggested`；
6. 标记章节完成、进入下一章、切换语言或打开历史视图：不改变 `reviewSuggested`；
7. 清除全部自测与复习记录：删除整个 concept-check store，队列清空。

首版不提供“忽略”“稍后提醒”或仅靠点击就解除建议的操作。解除建议的学习动作固定为：在该章同一个概念自测中提交正确答案。

## 4. Concept-check schema v2

### 4.1 数据形状

沿用现有 storage key：

```text
ai-history-concept-check-progress
```

目标 schema 使用旧解析器仍能读取的兼容封装。根 `version` 保持 1，新增的
`reviewVersion: 2` 才是复习状态 schema 的版本标识：

```ts
interface ConceptCheckResult {
  chapterId: LearningChapterId;
  firstCorrect: boolean;
  attempts: number;
  explanationViewed: boolean;
  reviewSuggested: boolean;
}

interface ConceptCheckProgress {
  version: 1;
  reviewVersion: 2;
  results: ConceptCheckResult[];
}
```

保留根 `version: 1` 不是把新字段伪装成旧 schema，而是一个明确的发布窗口兼容约束：已部署的 v1 parser 会忽略未知的根字段与结果字段，因而仍能保留全部章节的既有自测记录；新代码则以 `reviewVersion` 区分 legacy 数据与复习状态 v2。若直接把同一 key 的根版本改为 2，仍打开的旧页面会把整张表解析为空，并可能在下一次答题时只用当前章节覆盖它。

`reviewSuggested` 是当前本机复习建议状态，不是“学习者是否掌握”的测量，也不表示任何预测概率。它只由本合同中的本机答题动作更新。

不得在 schema 中加入：

- 最近答题时间、复习时间或过期时间；
- 用户 id、访客 id、设备指纹或跨站 id；
- 自由文本、用户输入正文或具体选项文本；
- locale、展示标题或手写排序值；
- provider、同步版本、远端记录 id 或网络投递状态。

### 4.2 v1 内存迁移

缺少 `reviewVersion` 的 legacy v1 记录迁移到 review-state v2 时使用固定公式：

```ts
reviewSuggested = !firstCorrect || attempts > 1;
```

迁移行为必须满足：

- `firstCorrect === false` 的旧记录进入队列；
- `attempts > 1` 的旧记录进入队列，即使 `firstCorrect === true`；
- 只有 `firstCorrect === true && attempts === 1` 的旧记录迁移为无建议；
- `explanationViewed` 不参与迁移判断；
- chapter id 仍按 `learningPath` 过滤、去重和排序；
- attempts 继续限制为安全整数范围，畸形结果逐条过滤；
- 无效 JSON 或无效根结构安全回退为空 review-v2 进度；
- 未知根 `version` 或未知 `reviewVersion` 会显示兼容性警告，并禁止答题 / 解释 mutation 覆盖原值；用户仍可通过明确确认的全量清除操作删除该 store。

迁移只发生在内存中。读取 legacy v1 不得立即调用 `setItem`，避免一次首页访问静默改写用户数据；只有后续答题、打开解释所需的既有写操作，或主动清除时，才把规范化状态写成 review-v2 兼容封装。单纯读取、渲染首页或切换语言不能写 storage。

### 4.3 迁移歧义

v1 没有保存最后一次答案，因此无法判断“首次答错、第二次已经答对”与“多次仍未答对”的差异，也无法知道首次答对后为什么又产生更多尝试。上述公式刻意选择保守的假阳性：只要首次错误或多次尝试，就建议在新版本中再正确作答一次。

该歧义必须在实现说明和测试中显式保留，不能通过推断最近答案、引入时间戳或伪造迁移结果来掩盖。迁移后一次正确答案即可解除建议。

## 5. 队列与注册表派生

待复习队列必须是 concept progress 与 `learningPath` 的纯函数结果：

1. 收集 `reviewSuggested === true` 的有效 chapter id；
2. 按 `learningPath` 的规范顺序输出；
3. 通过 `getLocalizedLearningChapter(id, locale)` 获取当前语言的标题和章节 href；
4. 在 href 后追加稳定 fragment `#concept-check-<chapterId>`；
5. 不维护第二份章节 id、标题、route 或排序表。

队列不按“最近”“最弱”“最重要”或尝试次数自动排序。当前数据没有时间语义，项目也没有真实学习效果证据支撑个性化排序。学习主线顺序是首版唯一可解释的顺序。

## 6. 首页本机复习面板

### 6.1 信息层级

首页学习区域保留现有主操作，并增加一个不会与其竞争的本机复习面板：

- “继续学习”仍是未完成路径的主操作；
- 有队列时展示“本机待复习 N 章”和有序章节链接；
- 每个链接展示当前 locale 的章节短标题，并进入该章 `#concept-check-<chapterId>`；
- 全路径完成但仍有待复习项时，先展示针对性复习，再展示时间线、谱系和图源回顾；
- 无待复习项时不渲染空列表，可显示简短的“当前没有待复习章节”状态，但不得声称学习者已经掌握全部内容；
- 面板明确说明记录仅保存在本设备。

首版不新增 `/review/` 或 `/en/review/` route。当前最多 13 个章节，首页面板与既有章节自测足以形成闭环；新 route 会额外扩大 sitemap、canonical、部署 header 与 smoke 表面，但不会增加首版学习动作。

### 6.2 深链与章节反馈

每个 `ConceptCheck` 根 section 增加稳定 id：

```html
<section id="concept-check-search" ...></section>
```

深链必须：

- 保持当前 locale；
- 在桌面和移动端清除 sticky header，并留有可读安全间距；
- 聚焦到自测区域而不是自动选择答案或自动提交；
- 保持键盘顺序、radio group 和反馈标题焦点行为；
- 不把 `reviewSuggested` 隐藏在只有颜色可见的状态里。

正确答案解除建议后，现有正确反馈可以继续使用；若增加“复习建议已解除”文案，必须作为当前本机状态说明，不能写成掌握度结论。

### 6.3 独立清除

首页复习面板提供独立确认操作，调用现有 concept-check reset 语义：

- 标签必须准确说明会清除“全部自测与复习记录”，不能暗示只隐藏队列；
- 清除前二次确认；
- 成功后在同页更新队列并派发 concept progress changed 事件；
- 不触碰 `ai-history-learning-progress`；
- 删除失败时保留当前 UI 状态并显示存储不可用提示；
- 章节内现有“清除全部自测记录”继续具有同一全局清除效果。

## 7. 同页、跨 tab 与旧 tab 合同

### 7.1 更新版本页面之间

- 同一页面写入后，通过现有 concept progress `CustomEvent` 更新本页组件；
- 同一 origin 的其他 tab 通过 `storage` 事件同步；
- `event.key` 等于 concept storage key 或为 `null` 时重新读取；
- 重新读取必须同时接受 legacy v1 与 review-v2 兼容封装，并重新从 `learningPath` 派生队列；
- 刷新、前进后退与中英文 route 共用同一 storage 状态。

### 7.2 旧 tab 风险

部署后仍打开的旧版本 tab 只认识根 `version: 1`。兼容封装让它继续读取并保留全部章节的 `firstCorrect`、`attempts` 与 `explanationViewed`；旧代码会忽略 `reviewVersion` 与 `reviewSuggested`，并可能在答题或打开解释时把 storage 重新写成不含扩展字段的 legacy v1。新页面下一次收到 `storage` 事件时必须安全地把该值再次按迁移公式读入内存，而不是报错或清空记录。

这种兼容策略存在已知限制：

- 旧 tab 最后写入 legacy v1 时会丢失扩展的 `reviewVersion` 与 `reviewSuggested`，但不会丢失其他章节的基础自测记录；
- 新 tab 会根据 `!firstCorrect || attempts > 1` 保守重建建议，可能让已解除的建议重新出现；
- 两个 tab 同时写不同章节时仍是浏览器 storage 的 last-write-wins，不能保证无冲突合并；
- 不通过时间戳、后台同步或隐藏设备 id 解决该问题。

控制方式是保持兼容根封装、解析 legacy / review-v2 两种记录、每次写前读取当前快照、用单元回归模拟已发布 v1 parser 的真实重写、让更新版本中的下一次正确答案重新解除建议，并允许用户清除全部本机自测记录。发布说明应建议长期打开的旧页面刷新，但不能声称跨 tab 写冲突已被完全解决。

## 8. 存储异常与渐进增强

- localStorage 读取失败时，首页继续提供开始 / 继续学习和浏览全部章节，不显示基于未知状态生成的复习建议；
- localStorage 写入失败时，答题反馈、解释与章节继续操作仍然可用，但明确说明复习状态未保存；
- 清除失败不乐观清空 UI；
- 无 JavaScript 时，服务器仍渲染首页主线、全部章节内容、概念自测静态结构和章节导航；本机复习队列属于增强能力，不伪造 SSR 状态；
- 不通过写入探针测试 storage 可用性，继续捕获访问、读取、写入与删除异常；
- legacy v1 或 review-v2 中的单条畸形记录不得破坏其他有效章节记录。

## 9. 隐私、安全与站内信号

### 9.1 本地数据披露

双语隐私页必须更新为准确描述：

- 本机保存 stable chapter id、首次正确性、尝试次数、是否查看解释和当前复习建议布尔状态；
- 首页“重置学习进度”只清除完成记录；
- 首页复习面板或任意章节的自测清除操作会删除全部自测与复习记录；
- 清除浏览器站点数据会删除两类 store 和语言偏好。

### 9.2 不扩大联网边界

- `learningSignalCollectionMode` 保持 `disabled`；
- 不新增 `review_suggested`、`review_completed`、`review_cleared` 或其他联网 / 站内 signal；
- 现有 `concept_check_completed` 继续只携带 allowlist 字段；
- CSP 保持 `connect-src 'none'`；
- 不加载 analytics provider、pixel、beacon、RUM 或远端配置；
- 不修改 provider gate，不恢复 P2-05；
- CI、Playwright、preview、production smoke 与开发者操作继续明确排除在真实学习者证据之外。

## 10. 实现切片

### P0-01：状态合同与 brief

状态：已完成并按兼容封装决策同步实现。

- 固定 v2 schema、迁移公式、进入 / 退出规则及完成状态独立性；
- 固定无新 route、无新事件、无时间戳与无后端边界；
- 对尚未实际执行的发布证据保持待验证。

### P1-01：schema v2 与纯队列派生

状态：已实现；单元、浏览器兼容回归与独立只读复核通过。

- 扩展 concept progress parser、writer 与 reset；
- 支持 v1 内存迁移及严格 v2 规范化；
- 答错入队、答对退出、再次答错重入，解释不改变状态；
- 从 `learningPath` 派生稳定队列；
- 增加状态与迁移单元测试。

### P1-02：首页面板与章节深链

状态：已实现；双语、320px / 390px、键盘焦点、深链与跨 tab 回归通过。

- 首页同时读取 completion 与 concept progress，但保持两条状态轴；
- 增加双语队列、章节自测深链和独立清除确认；
- 增加逐章 `#concept-check-<chapterId>` 锚点、sticky-header 间距、键盘与移动端样式；
- 监听同页事件和跨 tab storage 变化；
- 不把下方全部章节卡重构为新的客户端应用。

### P2-01：隐私、浏览器与发布门禁

状态：隐私说明、自动化、production smoke 脚本、本地视觉证据、PR / main CI、生产部署与 production smoke 均已完成；真实辅助技术检查待完成。

- 更新双语隐私说明；
- 增加端到端闭环、双语、刷新、跨 tab、存储异常与无网络测试；
- 更新 production privacy smoke 的代表性复习闭环；
- 留存本地视觉证据；PR preview 与 production 核验在对应环境可用后执行；
- 只有真实结果产生后才补入提交、CI、部署和 smoke 证据。

## 11. 最小验收矩阵

### 11.1 Vitest

| 场景                  | 必须证明                                                   |
| --------------------- | ---------------------------------------------------------- |
| 空记录                | 返回空 review-v2 兼容封装，storage 可用状态准确            |
| v1 首次正确且一次尝试 | 内存迁移为 `reviewSuggested: false`，不写回                |
| v1 首次错误           | 内存迁移为 `true`，不写回                                  |
| v1 多次尝试           | 无论 `firstCorrect` 值均迁移为 `true`                      |
| v2 错误提交           | attempts 增加并写入 `true`                                 |
| v2 正确提交           | 保留 `firstCorrect`，写入 `false`                          |
| 正确后再次错误        | 从 `false` 重新写入 `true`                                 |
| 打开解释              | 只更新 `explanationViewed`，建议状态不变                   |
| 畸形记录              | 过滤未知 chapter、错误类型、重复项并按 `learningPath` 排序 |
| 写入 / 删除失败       | 保留先前快照，返回 `persisted: false` 与不可用状态         |
| 队列派生              | 只包含 `true`，顺序严格等于 `learningPath` 子序列          |
| 状态独立              | completion 输入不影响 review 队列，反之亦然                |

### 11.2 Playwright

| 场景          | 必须证明                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| 基本闭环      | 章节答错 → 首页入队 → 深链返回自测 → 答对 → 首页出队                        |
| 重新进入      | 出队后再次答错，刷新首页重新入队                                            |
| 迁移          | seed legacy v1 后首页正确显示，单纯访问不写回；答题后落为 review-v2 封装    |
| 两条状态轴    | 全路径完成仍可待复习；重置完成不清复习；清除复习不清完成                    |
| 双语共享      | 中文产生建议，英文首页显示英文标题和 `/en/...#concept-check-<id>`，状态共用 |
| 刷新与返回    | 首页、章节刷新及前进后退后状态保持                                          |
| 同 tab 事件   | 首页清除后 UI 立即更新，无需刷新                                            |
| 跨 tab        | 两个同 origin page 中答题 / 清除后，另一 tab 经 storage 事件更新            |
| 旧 tab 值     | 已发布 v1 parser 能读新封装；重写后保留全部章节，新 UI 再保守迁移           |
| 存储失败      | 读取、写入、删除失败分别安全降级，答题和章节导航仍可用                      |
| 深链位置      | 中文 / 英文、桌面 / 390px 下 concept-check 清除 sticky header               |
| 可访问操作    | 清单、链接、确认按钮可键盘操作，目标至少 44px，不只用颜色表达               |
| 移动布局      | 390px 无横向溢出，长英文标题可换行，队列不复用 nowrap 样式                  |
| 无 JavaScript | 静态学习主线、章节、自测和继续入口仍存在                                    |
| 隐私网络      | 整个闭环不产生 analytics、collect、beacon、telemetry 或 RUM 请求            |

现有每章 × 双语概念自测渲染矩阵继续负责证明所有章节都有自测；本版闭环使用代表性章节，不复制 26 份相同交互流程。

### 11.3 Production privacy smoke

生产 smoke 至少增加一个新浏览器上下文中的代表性流程：

1. 在 Search 章节提交错误答案；
2. 返回首页并确认 Search 出现在本机待复习队列；
3. 通过深链返回 `#concept-check-search`；
4. 提交正确答案并确认队列解除；
5. 验证写入的是 `version: 1` + `reviewVersion: 2` 兼容封装，且不含时间戳、正文、身份或未知字段；
6. 继续证明 `connect-src 'none'`、`no-transform`、无 Cloudflare beacon / RUM、无 forbidden request；
7. 保留现有章节继续、概念解释与站内 signal allowlist 验证。

production smoke 的成功只证明受测生产路径与隐私边界，不证明复习功能改善了学习效果。章节、事件与 Guided Story registry 化仍是独立工程治理项，不混入本版。

## 12. 容易遗漏的回归

- 首页移动样式中的既有 `.review-links` 使用 `nowrap`；可变长度复习队列必须使用独立 class，避免 13 项横向溢出；
- `HomeLearningProgress` 目前只监听 completion store；v1.7 必须同时监听 concept key，但不能让其中一种读取失败覆盖另一种可用状态；
- `storage` 事件不会在发起写入的同一 tab 触发，因此同页仍必须 dispatch concept progress changed 事件；
- v1 迁移不能在首页 mount 时写回，否则访问页面本身会改变记录；
- `firstCorrect` 在重试后必须保持原值，只有 `reviewSuggested` 跟随当前答案更新；
- `explanationViewed` 写入不能把 `reviewSuggested` 重置为迁移默认值；
- 深链 fragment 不能进入 storage，也不能因语言切换改变 chapter id；
- 清除复习记录不能调用 learning progress reset；
- 首页路径完成分支不能因为存在复习队列而隐藏“学习主线已完成”；
- 空队列不能被表述为“已掌握全部章节”；
- 新本地字段必须更新隐私页，但不能借机增加新的学习 signal；
- production smoke 的本机记录必须使用全新 browser context，不能污染或依赖真实用户数据；
- 自动化通过不能被写成真实屏幕阅读器、跨浏览器或学习效果结论。

## 13. 风险与控制

| 风险                              | 控制                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| v1 无法知道最后一次答案           | 使用固定保守公式；明确可能出现假阳性；一次新版本正确答案即可解除                    |
| 多 tab 同时写导致 last-write-wins | 每次写前读取、监听 storage、接受双版本；不声称解决并发合并                          |
| 旧 tab 去掉 review-v2 扩展字段    | 兼容根避免整表丢失；新版本再次保守迁移；发布说明建议刷新旧页面                      |
| 把队列误写成掌握度判断            | 文案只说“本机复习建议”，不说薄弱项预测、掌握度或个性化推荐                          |
| 首页入口压过继续学习              | 保持继续学习为主操作，复习面板为独立次级区域                                        |
| 队列过长导致移动端溢出            | 独立 grid / wrap 样式、长标题换行、390px 自动回归                                   |
| hydration 后布局位移或过度播报    | 控制面板占位与信息量；`aria-live` 只播报简短状态，不播报整张动态清单                |
| 清除语义误导                      | 标签明确“全部自测与复习记录”，二次确认，并测试 completion 独立                      |
| 借本版恢复联网采集                | signal allowlist 不变、collection disabled、CSP `connect-src 'none'`、privacy smoke |

## 14. 可测试验收标准

- concept-check store 使用兼容根 `version: 1` 与 `reviewVersion: 2`，结果中唯一新增字段为 `reviewSuggested: boolean`；
- v1 按 `!firstCorrect || attempts > 1` 只在内存迁移，单纯读取不写回；
- 错误入队、正确退出、再次错误重入，解释查看不改变建议；
- 队列完全按 `learningPath` 派生，不复制 chapter id、route、标题或顺序；
- completion 与 review 的显示、写入和清除均保持独立；
- 首页提供本机复习面板、当前 locale 章节链接、逐章 concept-check 深链和独立清除；
- 中文与英文共享状态但只显示当前语言文案和 route；
- 刷新、跨 tab、合法旧 v1 值和 localStorage 异常均安全处理；
- 无 JavaScript 时现有静态学习与章节路径不退化；
- 桌面与 390px 移动端无横向溢出，深链不被 sticky header 遮挡，操作目标不低于 44px；
- 双语隐私页准确披露 v2 本地字段与两种独立清除方式；
- 不新增账号、后端、数据库、时间戳、自由文本、provider、API key 或网络请求；
- `learningSignalCollectionMode` 保持 `disabled`，CSP 保持 `connect-src 'none'`；
- format、data validation、type / lint、build、unit、browser、privacy 与 production smoke 结果全部有可追溯记录；
- 页面与发布记录不声称复习建议已经由真实学习效果验证。

## 15. 非范围

- 不新增 `/review/` 页面、账号中心或跨设备同步；
- 不实现间隔重复、遗忘曲线、时间衰减、优先级评分或个性化推荐；
- 不保存最后访问时间、答题时间、复习时长或连续学习天数；
- 不新增自由文本笔记、错题正文、导入导出或分享复习记录；
- 不重构全部首页章节卡为客户端应用；
- 不拆分“阅读完成、Demo 核心交互、章节完成、继续下一章”的既有 signal 语义；
- 不恢复 hosted analytics，不修改 P2-05 provider 决策；
- 不把 production smoke registry 化、性能预算、axe / WebKit 门禁或 Guided Story Reader 混入本版；
- 不新增章节、Demo、历史事件、来源或图源；
- 不把本机确定性规则包装成 AI 推荐或学习诊断。

## 16. 发布证据模板

以下项目在真实执行并取得结果前一律标记为待验证，不得根据计划或历史运行推断成功：

| 发布证据                            | 当前状态 | 记录                                                                                                                                        |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm format` / `pnpm format:check` | 本地通过 | 2026-08-11；Prettier 写入后复核全部文件符合格式                                                                                             |
| `pnpm validate:data`                | 本地通过 | 2026-08-11；`packages/data` TypeScript `--noEmit` 通过                                                                                      |
| `pnpm lint`                         | 本地通过 | 2026-08-11；Astro 155 files，0 errors / warnings / hints；workspace 与 scripts TypeScript 检查通过                                          |
| `pnpm build`                        | 本地通过 | 2026-08-11；Astro 155 files 零诊断，37 个静态页面与 sitemap 构建完成                                                                        |
| Vitest                              | 本地通过 | 2026-08-11；26 files / 208 tests：demo-core 5、data 61、site 142                                                                            |
| Chromium Playwright                 | 本地通过 | 2026-08-11；196 tests，包括 review-loop 定向 10 tests、旧客户端重写、unknown schema、防网络请求与移动端回归                                 |
| 脚本语法与 diff whitespace          | 本地通过 | 2026-08-11；两个 v1.7 相关 `.mjs` 脚本均通过 `node --check`，`git diff --check` 通过                                                        |
| 320px / 390px 与桌面视觉证据        | 本地通过 | 2026-08-11；三张 v1.7 证据已重抓并经独立 UX 复核，无剩余阻塞项；概念自测预期视觉快照已同步                                                  |
| 独立测试只读复核                    | 本地通过 | 2026-08-11；兼容 schema、防覆写、跨 tab、重新入队、焦点、深链边界与 production-smoke 字段白名单无合并阻塞项                                 |
| PR head remote checks               | 通过     | PR #37 头提交 `b18e328` 的 Quality / build、Chromium 与 Cloudflare Pages checks 成功；不据此补写未记录的人工 preview 审阅                   |
| main CI                             | 通过     | PR #37 合并为 `ff19b4a`；main CI run 31569422805 的 Quality / build 与 Chromium jobs 成功                                                   |
| Cloudflare Pages production         | 通过     | Cloudflare Pages 对 `ff19b4a` 的 production check 成功                                                                                      |
| `pnpm smoke:production:privacy`     | 通过     | 2026-08-12；33 个请求、26 条双语章节路由、32 个 HTML policy 检查；本机复习进入 / 退出与三条故事通过，`forbiddenRequests`、`failures` 均为空 |
| 真实 VoiceOver / NVDA spot check    | 待验证   | 自动化只覆盖语义、键盘、焦点和尺寸，不替代真实辅助技术检查                                                                                  |

v1.7 已部署且自动发布门完成，但在真实 VoiceOver 或 NVDA 结果写回前，人工辅助技术发布收口仍未完成。即使全部工程门禁通过，也只能证明实现与受测发布行为符合本 brief，不能写成“已证明有效”；真实学习效果仍需要独立、获批的数据来源、观察窗口与研究设计。后续顺序见 [`POST_V1_7_ITERATION_PLAN.md`](POST_V1_7_ITERATION_PLAN.md)。
