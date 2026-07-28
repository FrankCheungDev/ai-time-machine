# P2-05 匿名学习指标 Provider 决策与观察协议

- 状态：Provider 决策重新开放；客户端学习采集保持禁用
- 对应任务：P2-04 / P2-05
- 初次评审日期：2026-07-25
- 决策更新：2026-07-28，因所需能力依赖付费方案，不采用 Plausible Hosted Business
- 当前结论：没有获批 provider，没有有效观察窗口；P2-05A、P2-05B、P2-05C 均未完成

## 1. 当前决策

P2-05 原计划根据真实学习者数据调整章节与交互。现有代码会在浏览器页面内派发五类经过清洗的学习信号，但 `learningSignalCollectionMode` 在 `main` 上始终为 `disabled`，没有 listener、provider、API key、后端或数据库接收这些信号，部署 CSP 也继续使用 `connect-src 'none'`。

[PR #23](https://github.com/FrankCheungDev/ai-time-machine/pull/23) 完成了候选 provider 的条件式比较。随后 Draft [PR #26](https://github.com/FrankCheungDev/ai-time-machine/pull/26) 曾尝试实施 Plausible 路径；项目所有者于 2026-07-28 因所需能力依赖付费方案决定不采用 Plausible，PR #26 已关闭且未合并。因此：

- `main` 从未启用 Plausible，也从未放宽生产网络策略；
- 不继续 Plausible adapter、Events API、Stats API、Dashboard、Goals、Funnels 或付费账户实施；
- 既不把其他 provider 自动视为替代，也不把人工同意的本地导出自动视为已批准方案；
- provider 决策重新开放；在新的方案和所有者批准出现前，真实指标闭环暂停；
- Plausible 控制台已移除 `atlas.z-ai.cc`：站点列表不再显示该站点，并明确提示站点与 page views 删除流程已启动；项目不删除用户的整个 Plausible 账户。

关闭 PR #26 只证明其代码未进入 `main`；外部站点状态由上述 Plausible 控制台结果独立验证。控制台的提示证明删除流程已经启动，不把后台物理清除尚未完成的时间误写成即时完成。

## 2. 不可降低的边界

- 保持纯静态站点，不增加项目自有后端、数据库、用户系统或运行时 secret。
- 客户端学习采集保持 `disabled`；不加载分析脚本，不发送学习事件，不放宽 `apps/site/public/_headers`。
- 保留现有五类站内事件及字段白名单，供产品逻辑和自动化测试验证，不把它们联网。
- 不采集或导出用户输入正文、答案文字、姓名、邮箱、账号、访客 id、设备指纹、精确时间戳、完整 URL、query、hash、referrer、IP、User-Agent 或项目生成的跨会话标识。
- 自动化、CI、Playwright、preview、smoke 和开发者流量不能作为真实学习者证据。
- Cloudflare Web Analytics、RUM 或 edge analytics 是托管层运行指标，不是本站学习信号，不能用于完成 P2-05。
- 不用模拟数据、合成事件或作者自测填充转化率，也不为了关闭里程碑而降低观察窗口或样本门槛。
- 任何未来方案都必须从最新 `main` 新建独立 PR，重新完成 provider、费用、隐私、访问、排除、移除与生产网络评审。

## 3. 候选方案核查与当前结论

| 方案                      | 功能与边界                                                                                                             | 当前结论                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Plausible Hosted Business | 功能上可支持自定义事件、properties、漏斗、设备分段和 Stats API，但满足本站需求的路径依赖付费方案，并会增加外部数据处理 | **不采用。** 所有者于 2026-07-28 因付费要求撤回该路径；本记录不再构成推荐或实施授权           |
| Cloudflare Web Analytics  | 只能提供页面、路径、设备、浏览器和性能等托管层统计，不能表达本站五类学习事件                                           | **不用于 P2-05。** 不把 edge analytics、自动 RUM 或页面流量冒充学习效果证据                   |
| Umami Cloud               | 支持自定义事件与 API，但默认 payload、数据驻留、保留、删除与访问控制仍需重新评审                                       | **未批准。** 不因 Plausible 被拒绝而自动切换                                                  |
| 自托管 Umami              | 需要 PostgreSQL 及部署、备份、安全和删除运维                                                                           | **不采用。** 违反纯静态、无数据库边界                                                         |
| 人工同意的本地记录导出    | 不自动联网，但需要另行设计本地记录、导出、知情同意、参与者招募和证据保管                                               | **仅是未批准候选。** 不得用作者、CI、smoke 或合成文件代替真实参与者，也不得视为当前默认下一步 |

上述比较保留为历史决策依据。当前状态是“没有获批 provider”，不是“自动选择次优候选”。

## 4. 保留的 provider-neutral 事件契约

以下事件只在页面内作为类型化 `CustomEvent` 派发；当前没有监听器把它们发送出浏览器：

| 事件                         | 允许字段                                             | 潜在聚合用途         |
| ---------------------------- | ---------------------------------------------------- | -------------------- |
| `chapter_started`            | `name`, `chapterId`, `locale`                        | 每章漏斗起点         |
| `core_interaction_completed` | 上述字段 + 固定 `completionSource`                   | 核心交互完成率       |
| `concept_check_completed`    | 上述字段 + `correct`, `attempt`（`first` / `retry`） | 首次正确率与重试需求 |
| `concept_explanation_opened` | `name`, `chapterId`, `locale`                        | 解释展开率           |
| `next_chapter_continued`     | `name`, `chapterId`, `locale`, `nextChapterId`       | 完成后继续下一章比例 |

`sanitizeLearningSignal` 继续拒绝未知事件、非法章节、非法语言和不符合事件类型的字段。保留这项站内契约不代表授权联网采集，也不代表已有真实学习者数据。

当前 `ChapterJourney` 会在一次“完成并继续”动作中连续派发 `core_interaction_completed` 与 `next_chapter_continued`。因此，现有事件语义尚不能把“完成核心交互”和“随后选择续学”解释成两个独立行为，也不能直接支撑有意义的完成后续学率。未来若重开观察，必须先重审交互、事件触发点与证据 schema，并为变更后的版本补齐测试；不能仅接入 provider 后沿用当前映射。

## 5. Provider-neutral 证据与观察规则

当前没有正式观察窗口。只有未来的新方案完成独立批准、生产发布和网络复验后，才可以从部署成功后的下一个完整自然日开始计时：

- 首个观察窗口至少 14 个完整自然日；发布当天和不完整结束日不计入。
- 章节级调整至少需要该章节 50 个真实 `chapter_started` 聚合访客；不足则延长窗口，不作“数据驱动”改动。
- 语言或设备分段只在对应 cell 至少 30 个聚合访客时作方向性比较；低于该数只报告样本不足。
- 不使用行业 benchmark；只比较同一站点、同一查询定义下的章节差异，或后续独立窗口的前后变化。
- 第一轮只选择一个有充分样本、且在核心完成率、续学率、首次正确率或解释展开率中出现最大可解释缺口的章节。
- 调整 PR 必须写清假设、目标指标、非目标、改动前窗口、样本量、查询定义和教学简化；一次只改一个主要交互假设。
- 若所有 cell 都未达到样本门槛，P2-05 继续暂停，不用模拟数据、开发者流量或扩大解释范围来宣称完成。

### 5.1 固定指标定义

| 指标           | 分子                                                    | 分母                                             |
| -------------- | ------------------------------------------------------- | ------------------------------------------------ |
| 核心交互完成率 | 完成 `core_interaction_completed` 的顺序漏斗访客        | 完成 `chapter_started` 的顺序漏斗访客            |
| 完成后续学率   | 完成 `next_chapter_continued` 的顺序漏斗访客            | 完成 `core_interaction_completed` 的顺序漏斗访客 |
| 自测首次正确率 | 首次 `concept_check_completed` 且 `correct=true` 的访客 | 首次触发 `concept_check_completed` 的访客        |
| 解释展开率     | 完成 `concept_explanation_opened` 的访客                | 触发 `concept_check_completed` 的访客            |

所有漏斗必须使用 sequential 顺序，并允许学习者在步骤间查看解释或页面内容。查询按 `chapterId` 过滤，并分别输出总体、`locale` 和经过批准且达到门槛的粗粒度 device 维度。

### 5.2 保留的聚合证据分析器

[PR #24](https://github.com/FrankCheungDev/ai-time-machine/pull/24) 已把 provider-neutral 的 aggregate-only 契约、验证器、分析 CLI 和测试合并到 `main`。`pnpm analyze:learning-metrics -- <aggregate-export.json>`：

- 只读取调用者提供的聚合 JSON，不联网、不读取 API key、不启用 provider；
- 拒绝不足 14 天、未确认真实学习者流量、未排除自动化和开发者、包含原始事件或个人数据、出现未知字段或非法漏斗计数的输入；
- 只计算固定指标和样本门槛，不验证外部 attestation 的真实性，不选择产品改动，也不把 P2-05 标记为完成。

拒绝 Plausible 不删除或降级这套 provider-neutral 分析能力，但它当前只是预备性的聚合输入验证器。未来数据来源即使获批，也必须先确认事件语义、查询定义与 schema 版本仍匹配实际交互，再决定沿用或升级该契约。

## 6. P2-05 分批状态

| 批次   | 状态               | 当前证据与恢复条件                                                                                           |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| P2-05A | **未完成，已撤回** | PR #26 已关闭且未合并；`main` 没有 provider loader、adapter、网络权限或运行时 secret。恢复前必须重新批准方案 |
| P2-05B | **未完成，未开始** | 没有获批 provider、可读取的真实聚合数据或有效观察窗口                                                        |
| P2-05C | **未完成，未开始** | 没有达到门槛的 P2-05B 证据，不能选择或声称数据驱动产品调整                                                   |

P2-05A 不会自动因出现免费 provider 或本地导出想法而恢复。任何重开提案必须从最新 `main` 新建独立 PR，并在实施前明确：

1. provider 或数据来源、是否收费、数据驻留、保留、删除和访问控制；
2. 网络端实际接收的字段以及本地、CI、preview、smoke 和开发者流量的发送前排除；
3. 真实学习者流量来源、至少 14 个完整自然日的窗口和 50 / 30 样本门槛；
4. secret 存放方式（若需要），以及不进入浏览器、仓库、PR、日志或构建产物的证明；
5. 双语隐私说明、网络契约测试、生产复验和一键移除路径；
6. 所有者对费用与隐私差异的重新书面批准。

## 7. 当前关闭项

- [x] 2026-07-28 所有者决定不采用需要付费的 Plausible Hosted Business。
- [x] PR #26 已关闭且未合并。
- [x] `main` 的学习采集保持 `disabled`，生产 CSP 保持 `connect-src 'none'`。
- [x] provider-neutral 站内事件契约与聚合证据分析器继续保留。
- [x] P2-05A、P2-05B、P2-05C 均明确为未完成，真实指标闭环暂停。
- [x] Plausible 控制台已移除 `atlas.z-ai.cc`，站点列表不再显示该域名，并提示站点与 page views 删除流程已启动；用户的 Plausible 账户按范围保留。
- [ ] 新 provider 或人工同意导出方案：**未选择、未批准**。

## 8. 历史评审资料

以下链接只说明 2026-07-25 候选比较所依据的功能和数据处理信息，不表示当前采用、推荐或实施 Plausible：

- [Plausible custom events](https://plausible.io/docs/custom-event-goals)
- [Plausible custom properties](https://plausible.io/docs/custom-props/introduction)
- [Plausible funnel analysis](https://plausible.io/docs/funnel-analysis)
- [Plausible Stats API](https://plausible.io/docs/stats-api)
- [Plausible data policy](https://plausible.io/data-policy)
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [Cloudflare Web Analytics dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/)
- [Umami event tracking](https://umami.is/docs/track-events)
- [Umami tracker functions and default payload](https://umami.is/docs/tracker-functions)
- [Umami website statistics API](https://umami.is/docs/api/website-stats)
- [Umami FAQ](https://umami.is/docs/faq)
