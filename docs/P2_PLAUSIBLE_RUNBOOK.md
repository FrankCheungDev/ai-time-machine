# P2-05 Plausible 运行手册

- Provider：Plausible Hosted Business
- Site ID：`atlas.z-ai.cc`
- Reporting timezone：`Asia/Shanghai`
- 所有者批准：2026-07-26
- 当前阶段：P2-05A 实现与站点配置；真实观察窗口尚未开始

## 1. 已批准的处理边界

项目所有者已批准 Plausible Hosted Business 费用、欧盟数据处理、请求阶段的 IP/User-Agent 临时处理、每日匿名标识、粗粒度设备派生、至少 14 个完整自然日的观察窗口，以及章节总体 50、语言/设备分段 30 位访客的最低决策门槛。

浏览器只向 `https://plausible.io/api/event` 发送五类自定义事件。项目不加载 Plausible 外部脚本，不自动记录 pageview、出站链接、下载、表单或 404，也不发送 cookie、项目 visitor/session id、用户输入、精确时间戳、浏览器当前完整 URL、query、hash 或 referrer。事件 URL 由章节注册表重新生成，只包含正式域名和规范章节路径。

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
2. 完成章节开始、自测、解释与续学流程。
3. Network 中必须没有 `plausible.io` 请求；Cloudflare preview hostname 不能进入发送模块。
4. 确认 CSP 只增加 `connect-src https://plausible.io/api/event`，`script-src` 仍只允许本站脚本。

### Production

1. 发布人员先设置 `plausible_ignore=true`，再运行 `pnpm smoke:production:privacy`。
2. Smoke 必须观察到五类站内信号，同时对 Plausible、Cloudflare beacon 与 RUM 保持零请求。
3. 检查生产 HTML、CSP、双语隐私页和规范章节路径。
4. 在 Dashboard 确认站点、五个 goals、两个 funnels、hostname allowlist、timezone 和访问责任人均已配置。
5. 只在以上检查完成且有真实学习者流量入口时记录观察期开始日。发布者自己的事件不能用于 Dashboard 验证。

## 6. 观察与导出

- 事件映射、属性、funnels 和排除规则在观察期内冻结。
- 开始日与 `endDateExclusive` 都按 `Asia/Shanghai` 的完整自然日记录，至少相差 14 天。
- 使用 Stats API v2 的 `POST /api/v2/query`，只查询 aggregate `visitors`。固定查询计划包含六个事件计数 × overall / locale / device 三种分段，共 18 个请求，再生成协议要求的 11 × 7 = 77 行。
- 设备值映射为：`Desktop` → `desktop`、`Laptop` → `laptop`、`Tablet` → `tablet`、`Mobile` → `mobile`。
- Stats API 查询的是漏斗对应事件步骤的聚合访客数，不把 `has_done` 的同 session 行为过滤误写成顺序证明。步骤先后由站内事件发射契约和 Dashboard 中冻结的两个 sequential funnels 验证；导出器继续校验计数层级。
- 先运行以下无密钥 dry run，人工审查并保存完整查询定义。API 的 date range 为闭区间，因此 `endDateExclusive` 会转换成前一天作为查询结束日：

      pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --dry-run > plausible-query-plan.json

- 由 secret manager 向同一命令进程注入 `PLAUSIBLE_STATS_API_KEY` 后，只有在每项声明真实成立时才运行正式导出：

      pnpm --silent export:learning-metrics -- --start-date=YYYY-MM-DD --end-date-exclusive=YYYY-MM-DD --attest-real-learner-traffic --attest-production-dashboard-verified --attest-ci-preview-smoke-developer-excluded --attest-filters-frozen > aggregate-export.json

- `--attest-production-dashboard-verified` 表示正式站点、timezone、hostname allowlist、五个 goals 和两个 sequential funnels 已逐项核验；组合排除声明表示 CI、preview、smoke 与开发者均在观察窗口开始前排除。不得为了让 CLI 通过而虚假声明。
- schema v2 导出保存窗口、样本量和明确 attestation，不保存 API key、原始响应、个人级事件、IP 或每日匿名 id；未知字段、未知章节/语言/设备、分页截断和非规范查询都会失败。
- 运行 `pnpm analyze:learning-metrics -- <aggregate-export.json>`。任何 cell 不达门槛都标记为 insufficient evidence，不能用扩窗外数据、测试流量或合成值补齐。查询计划与聚合导出只放入经评审的证据位置；提交前再次确认不含 secret 或个人数据。

## 7. 移除与回滚

Provider 可在一个独立回滚 PR 中完整移除：

1. 把 `learningSignalCollectionMode` 恢复为 `disabled`，删除 Plausible 动态适配器及其网络测试；保留站内类型化信号供交互测试使用。
2. 把 `_headers` 恢复为 `connect-src 'none'`；`script-src` 和 `no-transform` 继续保留。
3. 同步 `/privacy/`、`/en/privacy/`、README、ROADMAP、部署文档和过程记录。
4. 运行完整本地门禁、PR preview 零请求检查、`main` CI、Pages 和 production smoke。
5. 在 Plausible 删除 goals/funnels；若终止服务，删除 `atlas.z-ai.cc` site 或账户并永久删除聚合数据，同时吊销 Stats API key。

静态学习路径、进度和自测不得依赖 Plausible 可用性。端点不可用、被 CSP/扩展拦截或返回非 202 时，适配器不重试、不显示错误，也不阻断任何学习交互。
