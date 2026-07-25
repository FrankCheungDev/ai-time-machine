# P2-05 匿名学习指标 Provider 决策与观察协议

- 状态：等待项目所有者批准；客户端采集保持禁用
- 对应任务：P2-04 / P2-05
- 评审日期：2026-07-25
- 条件式推荐：Plausible Hosted Business

## 1. 决策问题

P2-05 要根据真实学习者数据调整章节与交互。现有代码已经在浏览器内派发五类经过清洗的学习信号，但 `learningSignalCollectionMode` 仍为 `disabled`，没有 listener、provider、API key、后端或数据库接收这些信号。

本决策必须同时回答：

1. provider 能否用匿名聚合数据计算章节开始、核心交互完成、自测、解释展开和续学漏斗；
2. provider 能否按站点语言与粗粒度设备类型比较结果；
3. 是否能可靠排除本地、CI、预览、生产 smoke 和开发者流量；
4. 项目能否读取聚合结果，并保留样本量、观察窗口和查询定义；
5. 引入 provider 所增加的数据处理、费用、脚本与 CSP 权限是否被明确批准。

在批准前，本文件不授权加载任何分析脚本、发送任何网络事件或放宽 `apps/site/public/_headers`。

## 2. 不可降低的边界

- 仍然保持纯静态站点，不增加项目自有后端、数据库、用户系统或运行时 secret。
- 只发送现有五类学习事件和已经评审的字段。
- 不发送用户输入正文、答案文字、姓名、邮箱、账号、访客 id、设备指纹或项目生成的跨会话标识。
- 不主动发送精确时间戳、完整页面 URL、query、hash、referrer、IP 或 User-Agent。
- 只有正式域名 `atlas.z-ai.cc` 可以加载 provider；本地和 Cloudflare 预览不能加载。
- 自动化、smoke 和开发者流量必须在发送前被排除，不能在查询后靠猜测扣除。
- Stats API key 只能存在于本机安全存储或受控 CI secret，不进入浏览器、仓库、PR、日志或构建产物。
- 必须提供一键移除路径：删除 loader / adapter、恢复 `connect-src 'none'` 和只允许本站脚本的 CSP，并同步双语隐私页。

## 3. 候选方案核查

| 方案                      | 功能证据                                                                                                                                                 | 隐私与运维影响                                                                                                                                                                                                                                                | 结论                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Plausible Hosted Business | 支持 JavaScript 自定义事件、custom properties、按访客计算的漏斗、设备过滤和 Stats API；API 可查询 visitors、events、conversion rate、device 与自定义属性 | 无 cookie 或持久标识；但每个 HTTP 请求仍会携带 IP 与 User-Agent，Plausible 用它们和每日 salt 生成 24 小时标识，并从中派生设备与地区；原始 IP/User-Agent 不存储，数据在欧盟处理。Custom properties 与 funnels 属于 Business 功能，需要付费账户和 Stats API key | **条件式推荐**。功能满足，但每日匿名标识、设备/地区派生、费用和欧盟数据处理必须由所有者显式批准 |
| Cloudflare Web Analytics  | 提供页面、路径、设备、浏览器和性能维度                                                                                                                   | 官方 FAQ 明确不支持直接向 RUM endpoint 做 custom integration；beacon 面向页面浏览与性能，不能表达本站五类学习事件。自动注入还曾与本站隐私声明冲突                                                                                                             | **不用于 P2-05**。保留托管层 edge analytics 与学习证据的隔离                                    |
| Umami Cloud               | 支持自定义事件、事件数据和 API；API 有 event、device、language 等维度                                                                                    | tracker 默认包含 hostname、language、referrer、screen、title 和 URL，超过当前白名单；Cloud 的驻留、保留、删除与访问控制仍需单独审核                                                                                                                           | **暂不采用**。功能可行，但最小化配置和托管条款证据弱于推荐项                                    |
| 自托管 Umami              | 与 Umami Cloud 相同，并可自行控制数据                                                                                                                    | 官方文档要求 PostgreSQL；会给纯静态项目增加数据库、部署、备份、安全与删除责任                                                                                                                                                                                 | **拒绝**。违反本项目静态、无数据库边界                                                          |
| 人工同意的本地记录导出    | 不自动联网，可由参与者主动交付匿名本地记录                                                                                                               | 需要另行实现本地事件记录、导出、知情同意和人工招募；目前没有真实参与者或观察窗口                                                                                                                                                                              | **无 provider 时的回退方案**，但不能用作者、CI 或 smoke 生成的文件替代真实参与者                |

### 3.1 条件式推荐的隐私差异

Plausible Hosted 虽然不存储原始 IP/User-Agent，也不生成跨日持久标识，但它会在请求处理阶段使用这些网络元数据，并自动派生粗粒度设备与地区。这个行为超出当前“provider 端只接收事件白名单字段”的最严格解释。

因此批准 Plausible 不是机械接入，而是一项新的隐私决定：

- 允许 provider 临时处理 IP/User-Agent，只用于每日匿名聚合、bot 过滤和粗粒度设备分类；
- 禁止项目读取或导出原始 IP/User-Agent、地区、浏览器版本或单个访问轨迹；
- 只在报告中使用 `Desktop` / `Laptop` / `Tablet` / `Mobile` 的聚合维度；
- 项目不发送自己的 visitor id、session id、cookie、localStorage 标识或时间戳；
- provider 为聚合所记录的接收时间、每日匿名标识与数据保留条款必须写入双语隐私页。

如果所有者不接受这项差异，则应选择“人工同意的本地记录导出”，而不是暗中放宽边界。

## 4. 事件映射

启用批次只能把已经存在的清洗后事件映射到同名 Plausible custom event：

| 事件                         | 允许的 custom properties                    | 用途                     |
| ---------------------------- | ------------------------------------------- | ------------------------ |
| `chapter_started`            | `chapterId`, `locale`                       | 每章漏斗起点             |
| `core_interaction_completed` | `chapterId`, `locale`, `completionSource`   | 章节开始到核心交互完成率 |
| `concept_check_completed`    | `chapterId`, `locale`, `correct`, `attempt` | 首次正确率与重试需求     |
| `concept_explanation_opened` | `chapterId`, `locale`                       | 解释展开率               |
| `next_chapter_continued`     | `chapterId`, `locale`, `nextChapterId`      | 完成后继续下一章比例     |

实现必须满足：

- adapter 只接收 `sanitizeLearningSignal` 的返回值，并逐事件重建 props，不能透传任意对象；
- `autoCapturePageviews` 关闭，不自动发送页面浏览、referrer、query 或 hash；
- provider 要求的 event location 固定归一为站点级常量，不使用当前完整 URL；
- 不把设备类型添加到事件 payload，由获批 provider 在聚合层派生；
- `correct` 等非字符串字段采用固定枚举序列化，并以网络契约测试锁定；
- 任何未知事件、未知字段或非正式 hostname 都必须在发送前丢弃。

## 5. 流量排除协议

1. loader 在运行时精确匹配 `window.location.hostname === "atlas.z-ai.cc"`；本地、CI 和 preview 不下载 provider 脚本。
2. 生产 smoke 在首次导航前设置官方排除标记 `localStorage.plausible_ignore = "true"`，并断言没有分析请求。
3. 开发者和发布人员在自己的每个生产浏览器设置相同标记；启用 PR 记录核验截图或 provider dashboard 的排除确认。
4. Plausible site settings 只允许 `atlas.z-ai.cc` hostname；不把通配预览域名加入 allowlist。
5. 观察报告必须记录排除规则生效日期。规则改变后重新开始观察窗口，不能混用前后数据。

## 6. 观察窗口与决策规则

- 从启用 PR 的生产部署与网络复验均成功后的下一个完整自然日开始。
- 首个观察窗口至少 14 个完整自然日；发布当天和不完整结束日不计入。
- 章节级调整至少需要该章节 50 个真实 `chapter_started` 聚合访客；不足则延长窗口，不作“数据驱动”改动。
- 语言或设备分段只在对应 cell 至少 30 个聚合访客时作方向性比较；低于该数只报告样本不足。
- 不使用行业 benchmark。只比较同一站点、同一查询定义下的章节差异，或后续独立窗口的前后变化。
- 第一轮只选择一个有充分样本、且在核心完成率、续学率、首次正确率或解释展开率中出现最大可解释缺口的章节。
- 调整 PR 必须写清假设、目标指标、非目标、改动前窗口、样本量、查询定义和教学简化；一次只改一个主要交互假设。
- 若所有 cell 都未达到样本门槛，P2-05 保持等待，不用合成数据、开发者流量或扩大解释范围来宣称完成。

### 6.1 固定指标定义

| 指标           | 分子                                                    | 分母                                         |
| -------------- | ------------------------------------------------------- | -------------------------------------------- |
| 核心交互完成率 | 完成 `core_interaction_completed` 的漏斗访客            | 完成 `chapter_started` 的漏斗访客            |
| 完成后续学率   | 完成 `next_chapter_continued` 的漏斗访客                | 完成 `core_interaction_completed` 的漏斗访客 |
| 自测首次正确率 | 首次 `concept_check_completed` 且 `correct=true` 的访客 | 首次触发 `concept_check_completed` 的访客    |
| 解释展开率     | 完成 `concept_explanation_opened` 的访客                | 触发 `concept_check_completed` 的访客        |

所有漏斗使用 sequential 顺序；允许学习者在步骤间查看解释或页面内容。查询按 `chapterId` 过滤，并分别输出总体、`locale` 和获批的粗粒度 device 维度。

## 7. 分批实施

### P2-05A：启用候选 provider

前置条件：所有者书面批准 provider、费用、欧盟数据处理、每日匿名标识、设备派生、14 天窗口和样本门槛，并提供站点配置与 Stats API 访问方式。

同一个 PR 必须完成：

- production-only loader 与严格 adapter；
- CSP / `no-transform` 的显式调整；
- 单元测试、浏览器网络契约、preview 零请求与 smoke 排除测试；
- `/privacy/`、`/en/privacy/`、部署文档和本决策记录更新；
- provider removal 路径；
- 预览、生产和 dashboard 三方验证。

### P2-05B：只观察，不改产品

- 冻结事件名、字段、漏斗和排除规则；
- 运行至少 14 个完整自然日；
- 使用 Stats API 导出聚合结果，保存查询定义、窗口和样本量，不保存 API key 或个人级数据；
- 将不达门槛的结果明确标记为 insufficient evidence。

### P2-05C：单点数据驱动调整

- 选择一个证据充分的章节和一个主要问题；
- 从最新 `main` 新建独立 worktree 和 Draft PR；
- 完成双语、移动端、可访问性、教学正确性和生产 smoke；
- 发布后开启新的独立观察窗口，不把启用前后混成一个样本。

## 8. 所有者批准清单

在以下各项有明确答案前，不得进入 P2-05A：

- [ ] 批准 Plausible Hosted Business 及其费用；或明确选择人工同意的本地导出方案。
- [ ] 批准欧盟数据处理、保留与删除条款。
- [ ] 批准临时处理 IP/User-Agent、每日匿名标识与粗粒度设备派生。
- [ ] 指定拥有 provider dashboard 和 Stats API 读取权限的人。
- [ ] 确认 Stats API key 的安全存放方式，不进入公开构建。
- [ ] 批准至少 14 个完整自然日的观察窗口。
- [ ] 批准 50 个章节总体访客和 30 个分段访客的最低决策门槛。
- [ ] 确认正式观察期开始前有真实学习者流量来源。

## 9. 官方资料

- [Plausible custom events](https://plausible.io/docs/custom-event-goals)
- [Plausible custom properties](https://plausible.io/docs/custom-props/introduction)
- [Plausible funnel analysis](https://plausible.io/docs/funnel-analysis)
- [Plausible Stats API](https://plausible.io/docs/stats-api)
- [Plausible data policy](https://plausible.io/data-policy)
- [Plausible internal-traffic exclusion](https://plausible.io/docs/excluding)
- [Plausible localStorage exclusion](https://plausible.io/docs/excluding-localstorage)
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [Cloudflare Web Analytics dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/)
- [Umami event tracking](https://umami.is/docs/track-events)
- [Umami tracker functions and default payload](https://umami.is/docs/tracker-functions)
- [Umami website statistics API](https://umami.is/docs/api/website-stats)
- [Umami FAQ](https://umami.is/docs/faq)
