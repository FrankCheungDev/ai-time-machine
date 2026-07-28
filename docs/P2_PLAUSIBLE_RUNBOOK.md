# P2-05 Plausible 运行手册

- Provider：Plausible Hosted Business
- Site ID：`atlas.z-ai.cc`
- Reporting timezone：`Asia/Shanghai`
- 所有者批准：2026-07-26
- 当前阶段：P2-05A Draft PR #26 与站点配置；站点、时区、hostname allowlist、五个 Goals 与两个 Funnels 已完成，账户安全、付费与生产发布仍待完成；真实观察窗口尚未开始

## 1. 已批准的处理边界

项目所有者已批准 Plausible Hosted Business 费用、欧盟数据处理、请求阶段的 IP/User-Agent 临时处理、每日匿名标识、粗粒度设备派生、至少 14 个完整自然日的观察窗口，以及每个指标按自身分母执行的最低决策门槛：章节总体 50 位访客，语言/设备分段 30 位访客。

浏览器只向 `https://plausible.io/api/event` 发送五类自定义事件。项目不加载 Plausible 外部脚本，不自动记录 pageview、出站链接、下载、表单或 404，也不发送 cookie、项目 visitor/session id、用户输入、浏览器当前/原始 URL、query、hash 或 referrer。事件 URL 由章节注册表重新生成为 `https://atlas.z-ai.cc` 下的规范 absolute chapter URL。项目不主动发送事件时间戳；Plausible 会记录事件到达服务端的接收时间。

Plausible 会从网络请求必然携带的 IP 与 User-Agent 派生浏览器、操作系统、设备与地区，并用每日 salt 生成 24 小时匿名标识。项目只使用 `Desktop`、`Laptop`、`Tablet`、`Mobile` 聚合设备分段，不查询或导出地区、浏览器版本或单个访问轨迹。聚合数据保留在所有者账户中，直到所有者删除站点或账户；Plausible 的 DPA 与 data policy 承诺永久删除且无不当延迟。

## 2. Plausible 账户与站点设置

这些步骤必须由拥有 Plausible 账户的项目所有者完成；不要在 issue、PR、聊天或仓库中发送登录信息或 API key。

1. 使用 Hosted Business 账户添加 `atlas.z-ai.cc`，Reporting timezone 设为 `Asia/Shanghai`。
2. 保持 pageview、outbound links、file downloads、form submissions、404、revenue 和其他自动测量关闭。本站使用 Events API，不使用 Plausible tracker snippet。
3. 在 **Shields → Hostnames** 中只允许 `atlas.z-ai.cc`；不要加入 localhost、Cloudflare preview 或通配子域名。
4. 建立以下五个大小写完全一致的 Custom event goals：
   - `chapter_started`
   - `core_interaction_completed`
   - `concept_check_completed`
   - `concept_explanation_opened`
   - `next_chapter_continued`
5. 建立两个允许中间活动的 sequential funnels：
   - `chapter_started` → `core_interaction_completed`
   - `core_interaction_completed` → `next_chapter_continued`
6. 确认 custom properties 可按 `chapterId`、`locale`、`completionSource`、`correct`、`attempt`、`nextChapterId` 过滤。
7. 指定唯一的 dashboard / Stats API 责任人，并开启账户 2FA。

站内交互必须与两个漏斗的决策语义一致：用户先点击“标记本章完成”，页面留在本章且只发送 `core_interaction_completed`；随后出现的“下一章”链接在被单独点击时才发送 `next_chapter_continued`。禁止一次点击同时发送两个事件；终章没有“下一章”动作，也不采集第二个漏斗。

### 2.1 配置执行记录（2026-07-27 至 2026-07-28，Asia/Shanghai）

- [x] 在项目所有者账户创建 `atlas.z-ai.cc`，30 天免费试用从 2026-07-27 开始；创建过程没有选择套餐、付款或保存支付信息。
- [x] 在创建表单和 General 设置页双重确认 Reporting timezone 为 `Asia/Shanghai`。
- [x] 未复制、安装或验证 Plausible tracker snippet；安装检测失败是 Events API-only 方案的预期结果，不作为配置失败。
- [x] 保持 outbound links、file downloads 与 form submissions 自动测量关闭；未安装 tracker snippet，也未启用 pageview、404 采集或 revenue tracking。
- [x] 在 **Shields → Hostnames** 添加且只添加 `atlas.z-ai.cc`；Plausible 显示状态为 `Allowed`。
- [x] 删除 provisioning UI 自动生成的 `Form: Submission`、`File Download`、`Outbound Link: Click` 与 `404` Goals。新增 Goal 对话框仍会把它们作为过去六个月检测到的历史事件提示，但未重新添加或一键导入。
- [x] 创建并逐项核验五个同名 Custom event goals；Event name 与 Display name 均使用批准清单中的原名，列表中没有额外 Goal。
- [x] 创建并逐项核验两个 2-step sequential funnels：`chapter_started → core_interaction_completed` 与 `core_interaction_completed → next_chapter_continued`；漏斗名称与步骤链同名，且两者均开启“Allow other activity between funnel steps”。
- [ ] 通过真实事件进入 Dashboard 后，核验六个 custom properties 可用于过滤；不得用作者、自动化或合成事件制造验证数据。
- [ ] 指定唯一 Dashboard / Stats API 责任人并启用账户 2FA。
- [ ] 单独确认 Business 订阅付款并完成购买；本次免费试用建站授权不等于付款授权。
- [ ] 创建 Stats API key，并确认其仅存放在操作系统钥匙串、1Password 或等价受控 secret store。

在上述未完成项关闭、PR #26 发布并完成生产排除验证前，不记录观察期开始日，也不运行带真实 key 的导出。

## 3. 流量排除

适配器在请求发出前执行三层排除：

- `window.location.origin` 必须精确等于 `https://atlas.z-ai.cc`，因此 localhost、CI 和 PR preview 不加载发送模块。
- `navigator.webdriver === true` 时停止，覆盖 Playwright 和 production browser smoke。
- `localStorage.plausible_ignore === "true"` 时停止，覆盖开发者与发布人员的真实生产浏览器。

每位开发者和发布人员在访问生产站前，都必须在该域名对应的浏览器控制台运行：

    localStorage.setItem("plausible_ignore", "true")

用以下命令核对；它必须返回字符串 `"true"`：

    localStorage.getItem("plausible_ignore")

确需恢复该浏览器的计数时运行：

    localStorage.removeItem("plausible_ignore")

不要为自动化关闭 WebDriver 检测，也不要使用作者、CI、preview、smoke 或合成事件验证“真实使用”。Plausible 的 IP blocklist 可作为开发者排除的第二层保护，但不能代替浏览器发送前排除。

## 4. Stats API key

Stats API key 只用于观察期结束后的聚合查询：

- 在 Plausible Account settings 创建 **Stats API** key，而不是 Enterprise Sites API key。
- 存放在操作系统钥匙串、1Password 或等价的受控 secret store。
- 只在本机查询进程中以 `PLAUSIBLE_STATS_API_KEY` 临时注入；导出 CLI 不提供 `--api-key` 参数，并会在读取后从自身进程环境删除该变量。不得把值放入浏览器、Cloudflare Pages 构建变量、公开 GitHub Actions、仓库、`.env*`、shell history、日志、PR 或聊天。
- 若以后确需受控 CI 导出，先单独评审 GitHub Environment、最小权限、日志脱敏与 artifact 保留；本批次不创建该 secret。
- 发现泄露时立即吊销并创建新 key；无需改动或重新部署静态站点。

## 5. 发布验证

### PR preview

1. 确认页面仍有 `data-learning-signal-collection="plausible-production"`，说明构建包含已批准模式。
2. 完成章节开始、自测、解释流程；先点击“标记本章完成”并确认仍停留在本页，再单独点击“下一章”。
3. Network 中必须没有 `plausible.io` 请求；Cloudflare preview hostname 不能进入发送模块。
4. 确认 CSP 只增加 `connect-src https://plausible.io/api/event`，`script-src` 仍只允许本站脚本。

### Production

1. 发布人员先设置 `plausible_ignore=true`，再运行 `pnpm smoke:production:privacy`。
2. Smoke 必须观察到五类站内信号，并证明完成与下一章是两个独立动作，同时对 Plausible、Cloudflare beacon 与 RUM 保持零请求。
3. 检查生产 HTML、CSP、双语隐私页和规范章节路径。
4. 在 Dashboard 确认站点、五个 goals、两个 funnels、hostname allowlist、timezone 和访问责任人均已配置。
5. 只在以上检查完成且有真实学习者流量入口时记录观察期开始日。发布者自己的事件不能用于 Dashboard 验证。

## 6. 观察与导出

- 事件映射、属性、funnels 和排除规则在观察期内冻结。
- 开始日与 `endDateExclusive` 都按 `Asia/Shanghai` 的完整自然日记录，至少相差 14 天。
- 公开 Stats API v2 的 `POST /api/v2/query` 只负责四个自测相关的 aggregate `visitors` 计数：自测发生、首次作答、首次作答正确、解释展开；每项分别查询 overall、locale、device，共 12 个请求。
- 两个 sequential funnel 的 entered / converted visitors 只能来自 Plausible Dashboard 对同一观察窗口和同一冻结过滤条件的人工聚合采集。公开 Stats API 没有 sequential-funnel metric；独立事件访客数即使来自同一日期和分段，也不能相除后冒充顺序漏斗。
- 固定 Dashboard 采集计划包含 147 个任务：`started-to-core` 覆盖 11 章 × 7 分段 = 77 个 cell；`core-to-continued` 只覆盖前 10 章 × 7 分段 = 70 个 cell。终章续学计数与 evidence ref 在最终导出中必须是 `null` / N/A，不能写成 0。
- 设备值映射为：`Desktop` → `desktop`、`Laptop` → `laptop`、`Tablet` → `tablet`、`Mobile` → `mobile`。
- 禁止调用 Plausible 未公开的 Dashboard 内部 API，禁止向脚本、导出器、证据文件或对话提供浏览器 cookie、session、Access token 或其他已登录状态。Stats API key 只能调用公开 Stats API，并继续遵守第 4 节的 secret 边界。
- 先运行以下无密钥 dry run，人工审查并保存完整查询定义。API 的 date range 为闭区间，因此 `endDateExclusive` 会转换成前一天作为查询结束日：

      pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --dry-run > plausible-query-plan.json

  dry run 输出必须恰好包含 12 个 Stats API 查询和 `requiredFunnelEvidence.captureTasks` 中的 147 个 Dashboard 采集任务；它不读取 key，也不调用网络。

- 操作员按 dry-run 任务逐项在 Dashboard 记录 aggregate-only 的 `enteredVisitors`、`convertedVisitors` 与唯一、非敏感 `evidenceRef`。`evidenceRef` 必须是安全的相对 artifact path：每段非空且不得为 `.` / `..`，不得使用绝对路径、反斜杠、URL scheme、query、hash 或尾斜杠。证据输入文件使用独立的 funnel-evidence schema v1，并必须固定以下内容：
  - source 为 `operator-supplied-plausible-dashboard`，site、reporting timezone、观察窗口、两个 funnel 定义和 capture plan 与 dry run 完全一致；
  - 恰好 147 个 capture，且每项的 `captureId`、funnel、chapter、locale、device 与任务一致；
  - `operatorAttestation.dashboardCountsTranscribed` 与 `aggregateOnlyConfirmed` 均为 `true`；
  - 由不同于操作员的评审者逐项复核，并把 `reviewerAttestation.independentlyReviewed` 与 `capturePlanMatched` 设为 `true`；
  - `evidenceBundleSha256` 为被复核证据包原始 bytes 的 lowercase SHA-256；证据包只保留聚合 cell 与必要上下文，先裁剪/脱敏账户界面，不包含凭据、cookie、session、个人级轨迹或原始事件；正式导出必须单独提供该 bundle 文件，导出器会在读取或删除 Stats API key、发起任何网络请求之前重新计算并比对 digest；
  - `capturedAt` 不早于 `endDateExclusive` 在 `Asia/Shanghai` 的开始时刻；文件中的 observation window 与查询计划完全一致。

- 由 secret manager 向同一命令进程注入 `PLAUSIBLE_STATS_API_KEY` 后，只有在证据与每项声明真实成立时才运行正式导出。CLI 必须同时提供证据 JSON 与经复核 bundle：

      pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --dashboard-funnel-evidence=/controlled/path/plausible-funnel-evidence.json --dashboard-funnel-evidence-bundle=/controlled/path/plausible-funnel-evidence-bundle.zip --attest-real-learner-traffic --attest-production-dashboard-verified --attest-ci-preview-smoke-developer-excluded --attest-filters-frozen > aggregate-export.json

- `--attest-production-dashboard-verified` 表示正式站点、timezone、hostname allowlist、五个 goals 和两个 sequential funnels 已逐项核验；组合排除声明表示 CI、preview、smoke 与开发者均在观察窗口开始前排除。不得为了让 CLI 通过而虚假声明。
- schema v3 最终导出必须恰好包含 11 章 × 7 个规范分段 = 77 行。每行分别保存两个 funnel 的 entered / converted counts 与非敏感 evidence refs，以及四个 Stats API 自测计数；终章的第二个 funnel 字段均为 `null`。
- 导出器验证每个 funnel 的 converted ≤ entered、`started-to-core.converted ≤ core-to-continued.entered`（允许不相等）以及首次正确 ≤ 首次作答 ≤ 自测发生；它还拒绝未知字段、未知章节/语言/设备、不安全或重复的 evidence ref、分页截断、非规范查询和窗口不一致。
- 运行 `pnpm analyze:learning-metrics -- <aggregate-export.json>`。四个比率分别用自己的分母判断门槛：核心完成率用 started-to-core entered，续学率用 core-to-continued entered，首次正确率用首次作答，自测解释展开率用自测发生。总体 cell 的每个适用分母至少 50，locale/device cell 的每个适用分母至少 30；终章续学率为 N/A，不参与该项门槛。解释展开与自测发生是两个独立事件的访客数，不是同一 cohort 或 sequential funnel；在观察窗口边界上解释展开率可以超过 100%。任一适用比率不达门槛都标记为 insufficient evidence，不能用扩窗外数据、测试流量或合成值补齐。
- schema v3 保存窗口、样本量、Dashboard evidence metadata、operator / reviewer attestations 和 evidence bundle SHA-256；不保存 API key、公开 API 原始响应、个人级事件、IP 或每日匿名 id。查询计划、证据输入和聚合导出只放入经评审的受控证据位置；提交前再次确认不含 secret 或个人数据。

## 7. 移除与回滚

Provider 可在一个独立回滚 PR 中完整移除：

1. 把 `learningSignalCollectionMode` 恢复为 `disabled`，删除 Plausible 动态适配器及其网络测试；保留站内类型化信号供交互测试使用。
2. 把 `_headers` 恢复为 `connect-src 'none'`；`script-src` 和 `no-transform` 继续保留。
3. 同步 `/privacy/`、`/en/privacy/`、README、ROADMAP、部署文档和过程记录。
4. 运行完整本地门禁、PR preview 零请求检查、`main` CI、Pages 和 production smoke。
5. 在 Plausible 删除 goals/funnels；若终止服务，删除 `atlas.z-ai.cc` site 或账户并永久删除聚合数据，同时吊销 Stats API key。

静态学习路径、进度和自测不得依赖 Plausible 可用性。端点不可用、被 CSP/扩展拦截或返回非 202 时，适配器不重试、不显示错误，也不阻断任何学习交互。
