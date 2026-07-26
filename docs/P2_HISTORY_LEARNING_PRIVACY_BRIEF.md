# P2 历史深度、学习自测与隐私评审

- 状态：P2-01 至 P2-04 已发布；Plausible 于 2026-07-26 获批，P2-05A 实现中；真实聚合数据与观察窗口仍待完成
- 对应任务：P2-01 / P2-02 / P2-03 / P2-04 / P2-05
- 评审日期：2026-07-25

## 1. 本批次要解决的问题

P1 已经把学习主线延伸到 Safety / Eval，但时间线仍主要是一章一个年代范围，章节完成状态也无法说明学习者是否抓住了机制直觉。本批次增加两层证据：

1. 用有原始来源的事件解释范式为什么转折，而不是只列年代。
2. 用每章一个不阻断学习的概念自测，让学习者获得“为什么”的反馈。

同时完成匿名指标隐私评审。没有真实数据访问能力时，不使用自动化流量或合成数字冒充真实学习者数据；Provider 获批后也必须先完成站点配置、排除和发布验证，才能启动观察窗口。

## 2. 事件级时间线契约

每个事件必须包含：

- 稳定 id、排序年份和显示年份；
- 论文、专著、系统、数据、算力转折、范式转折或标准类型；
- 中英文标题、摘要和后续影响；
- 至少一个章节 id 和一个谱系节点 id；
- 至少一份原始论文、专著、官方档案或正式标准；
- 对容易被过度解释的事件写出边界。

事件是代表性选择，不是完整 AI 百科。章节级时间线继续承担学习顺序，事件层承担事实证据和因果解释。

## 3. 历史声明 fact-check

| 年份      | 事件               | 本站采用的可核验声明                                                                 | 原始来源                                                                                                                                          | 边界                                                       |
| --------- | ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1950      | 图灵模仿游戏       | 论文用模仿游戏讨论机器智能，把问题转向可观察行为                                     | [Computing Machinery and Intelligence](https://doi.org/10.1093/mind/LIX.236.433)                                                                  | 不把测试等同于完整智能定义                                 |
| 1955–1956 | Dartmouth 提案     | 提案明确使用 artificial intelligence，并列出语言、抽象、问题求解、自我改进和神经网络 | [Dartmouth proposal](https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html)                                                        | 是共同议程形成，不声称会议独自创造全部领域                 |
| 1958      | 感知机             | Rosenblatt 提出可从输入调整连接并进行识别的概率模型                                  | [The Perceptron](https://doi.org/10.1037/h0042519)                                                                                                | 不把单层感知机写成现代深网                                 |
| 1959      | Samuel 跳棋        | 原论文报告程序能通过机器对弈改善，并超过编写者的跳棋水平                             | [Machine Learning Using Checkers](https://doi.org/10.1147/rd.33.0210)                                                                             | 是窄任务学习，不是通用自我改进                             |
| 1966–1972 | Shakey             | SRI 记录其能感知环境、规划路线并移动简单物体                                         | [SRI Shakey archive](https://www.sri.com/hoi/shakey-the-robot/)                                                                                   | 环境和物体受限，不能类比开放世界机器人                     |
| 1968      | A*                 | 论文把领域启发信息纳入图搜索并证明一类策略的最优性质                                 | [A Formal Basis for Heuristic Minimum-Cost Paths](https://doi.org/10.1109/TSSC.1968.300136)                                                       | 最优性依赖论文中的条件，不声称任意启发式都保证最优         |
| 1972–1973 | Lighthill 报告     | 报告记录早期承诺落差，并强调组合爆炸                                                 | [Artificial Intelligence: A General Survey](https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf)                                         | 作为英国评审与第一次寒冬背景材料，不写成全球衰退的单一原因 |
| 1976      | MYCIN              | MYCIN 以规则、置信因子和解释机制处理受限医疗咨询                                     | [Computer-Based Medical Consultations: MYCIN](https://doi.org/10.1016/B978-0-444-00179-5.X5001-X)                                                 | 教学只讨论知识工程，不提供医疗建议                         |
| 1986      | 反向传播           | 论文描述从输出误差反复调权，并让隐藏单元形成任务特征                                 | [Learning Representations by Back-Propagating Errors](https://doi.org/10.1038/323533a0)                                                           | 不声称 1986 年首次出现所有反向传播思想                     |
| 1988      | Bayesian network   | Pearl 系统化用图表达条件依赖并传播概率证据                                           | [Probabilistic Reasoning in Intelligent Systems](https://www.sciencedirect.com/book/9780080514895/probabilistic-reasoning-in-intelligent-systems) | 章节自测只覆盖证据更新直觉，不覆盖完整图模型推断           |
| 1995      | SVM                | 论文用支持向量与最大间隔构造高维特征空间中的决策面                                   | [Support-Vector Networks](https://doi.org/10.1007/BF00994018)                                                                                     | 不把二维 demo 当成真实训练过程                             |
| 1997      | Deep Blue          | IBM 记录其在标准赛制六局赛中击败在位世界冠军，并评估每秒约两亿局面                   | [IBM Deep Blue](https://www.ibm.com/history/deep-blue)                                                                                            | 窄域超人表现不等于通用智能                                 |
| 1998      | LeNet              | 论文显示卷积网络在手写字符与支票读取系统中的工程应用                                 | [Gradient-Based Learning Applied to Document Recognition](https://doi.org/10.1109/5.726791)                                                       | 章节省略多模块训练、偏置和真实数据复杂度                   |
| 2009      | ImageNet           | 原论文建立基于 WordNet 层级的大规模图像数据库                                        | [ImageNet CVPR paper](https://www.image-net.org/static_files/papers/imagenet_cvpr09.pdf)                                                          | 数据规模与基准是条件之一，不是深度学习复兴的唯一原因       |
| 2012      | AlexNet            | 论文在 130 万训练图像、1000 类任务上使用深层 CNN 与 GPU 实现并显著降低错误率         | [ImageNet Classification with Deep CNNs](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)       | 把算法、数据和算力视为共同转折                             |
| 2016      | AlphaGo            | 论文组合策略网络、价值网络、自我对弈和 Monte Carlo 树搜索                            | [Mastering the Game of Go](https://doi.org/10.1038/nature16961)                                                                                   | 说明学习与搜索协同，不把比赛胜利写成通用推理解决           |
| 2017      | Transformer        | 论文提出仅基于 attention 的序列转换架构，去除循环与卷积主干                          | [Attention Is All You Need](https://papers.nips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html)                    | Attention 权重不等于因果或人类解释                         |
| 2020      | GPT-3              | 论文报告 1750 亿参数模型通过文本说明和少量示例执行多类任务，无需梯度更新             | [Language Models Are Few-Shot Learners](https://papers.nips.cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract.html)                    | 同时保留论文报告的失败数据集与方法限制                     |
| 2020      | RAG                | 论文组合参数化生成模型与 Wikipedia 稠密索引的非参数记忆                              | [Retrieval-Augmented Generation](https://papers.nips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html)                           | 检索不保证答案正确，也不等同查询时重训模型                 |
| 2022–2023 | ReAct              | 论文交错生成推理轨迹、环境动作和观察                                                 | [ReAct](https://arxiv.org/abs/2210.03629)                                                                                                         | 章节 Agent 状态为脚本化教学路径，不调用真实工具            |
| 2023      | NIST AI RMF        | 框架用 Govern、Map、Measure、Manage 组织生命周期风险管理                             | [NIST AI 100-1](https://doi.org/10.6028/NIST.AI.100-1)                                                                                            | 自愿框架，不替代具体法律与领域要求                         |
| 2024      | NIST GenAI Profile | Profile 将红队、事件记录、持续评估和风险处置映射到 AI RMF                            | [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1)                                                                                            | 通过一个回归用例不代表全部风险消失                         |

## 4. 每章自测教学契约

| 章节          | 只检验的核心直觉                             |
| ------------- | -------------------------------------------- |
| 总览          | 后来的系统会重新组合旧机制，不是线性替代     |
| 搜索          | A* 同时考虑已走成本 `g` 与估计 `h`           |
| 专家系统      | 规则依赖完整前提和例外边界                   |
| Bayes         | 中性证据不会凭空覆盖先验                     |
| 决策边界      | 样本几何会影响学习到的分隔方式               |
| CNN           | 局部窗口与参数共享                           |
| Attention     | token 可建立上下文相关的直接信息路径         |
| LLM 系统      | 模型、知识、工具、记忆、权限与评估职责不同   |
| RAG           | 检索片段进入上下文，不等于查询时更新模型权重 |
| Agent         | 工具结果必须通过 observation 改变下一步      |
| Safety / Eval | 已知回归通过不等于未知风险消失               |

每个自测固定三个选项，只存在一个最符合本章机制的答案。提交后先给方向反馈，再由学习者主动展开“为什么”；答错可重试，继续学习按钮始终可用。

本地记录仅保存章节 id、首次是否答对、尝试次数和是否打开解释。记录与界面语言共享，可从任意章节清除全部自测记录。

## 5. 匿名指标隐私评审

### 5.1 决策

**P2-04 的发布结论是客户端学习收集保持禁用。** 当时仓库没有分析 provider、API key、后端或数据库；现有 Chrome 与应用内浏览器会话也都无法读取 Cloudflare 项目分析。因此该批次不声称拥有章节完成率、首次正确率或继续率的真实数据。

PR #20 合并后的生产浏览器 smoke 发现，Cloudflare Pages 虽然没有对应仓库代码，仍通过 automatic setup 注入 `beacon.min.js` 并向 `/cdn-cgi/rum` 发送请求。这与最初“生产无网络分析”的假设冲突，也说明本地 Playwright 不能替代部署层网络检查。

[PR #21](https://github.com/FrankCheungDev/ai-time-machine/pull/21) 增加两层强制边界：

1. `apps/site/public/_headers` 对全部 HTML 路由设置 `Cache-Control: ... no-transform`，阻止 Cloudflare 改写静态响应并自动插入 Web Analytics。
2. 同一文件设置只允许本站脚本且 `connect-src 'none'` 的 Content Security Policy；即使托管设置再次尝试注入，浏览器也不能下载 beacon 或发送 RUM。

Cloudflare 作为托管代理仍会处理 HTTP 请求，并可能提供无法由客户端关闭的聚合 edge analytics。这类平台运行指标不属于本站学习信号，项目当前也无法读取，不能用于完成 P2-05。参见 [automatic setup 与 Disable 控制](https://developers.cloudflare.com/web-analytics/get-started/)、[beacon 与 edge analytics 边界](https://developers.cloudflare.com/web-analytics/faq/) 以及 [Pages `_headers` 配置](https://developers.cloudflare.com/pages/configuration/headers/)。

[PR #21](https://github.com/FrankCheungDev/ai-time-machine/pull/21) 以 merge commit [`c8693c8`](https://github.com/FrankCheungDev/ai-time-machine/commit/c8693c8581a18b17722304cba89aacaea38e6650) 进入 `main` 后，[GitHub CI run 30142645267](https://github.com/FrankCheungDev/ai-time-machine/actions/runs/30142645267) 与 Cloudflare Pages 生产部署均成功。部署后的 `pnpm smoke:production:privacy` 检查 29 个请求、22 个双语章节路由和 28 个 HTML 响应策略，三类响应头缺失计数均为 0；真实浏览器完成自测、解释和续学时，`forbiddenRequests` 与 `failures` 均为空。由此关闭 P2-04，但该 smoke 明确不作为 P2-05 的真实学习数据。

项目所有者于 2026-07-26 对此前逐项列出的费用、欧盟处理、临时 IP/User-Agent、每日匿名标识、设备派生、14 天窗口和 50/30 样本门槛明确回复“批准 Plausible 方案”。P2-05A 因此把 CSP 从拒绝全部连接收窄调整为只允许 `https://plausible.io/api/event`，并继续用 `no-transform` 和仅本站脚本策略阻止 Cloudflare 自动 RUM。批准不代替 Plausible 账户、Dashboard / Stats API 访问、真实流量或观察窗口证据。

### 5.2 已评审事件与字段白名单

代码继续在页面内派发类型化 `CustomEvent`。只有精确正式 origin、非 WebDriver 且未设置官方排除标记的浏览器，才会动态加载严格适配器并发送下表事件：

| 事件                         | 允许字段                                            | 决策用途                 |
| ---------------------------- | --------------------------------------------------- | ------------------------ |
| `chapter_started`            | `name`, `chapterId`, `locale`                       | 章节进入基数             |
| `core_interaction_completed` | 上述字段 + 固定 `completionSource`                  | 章节进入到声明完成的转化 |
| `concept_check_completed`    | 上述字段 + `correct`, `attempt` (`first` / `retry`) | 首次正确与重试需求       |
| `concept_explanation_opened` | `name`, `chapterId`, `locale`                       | 解释展开率               |
| `next_chapter_continued`     | 上述字段 + `nextChapterId`                          | 完成后继续比例           |

明确禁止：

- 用户输入正文、答案文字、姓名、邮箱或账号；
- payload 中的 visitor id、设备指纹、精确时间戳、完整 URL、query、hash、referrer、IP、User-Agent 或跨站标识；
- 未经白名单的任意 payload；
- 把 Playwright、CI、开发或 smoke 流量混入真实学习者指标。

浏览器网络连接必然向 Plausible 暴露来源 IP 与 User-Agent；所有者已批准 Plausible 临时使用它们做 bot 过滤、每日匿名访客计算和粗粒度设备/地区派生。原始值不进入事件 JSON，项目不生成 visitor/session id，也不查询地区、浏览器版本或单人轨迹。请求固定使用规范章节 URL、`credentials: omit` 与 `referrerPolicy: no-referrer`。

### 5.3 获批实施门

独立 P2-05A PR 必须同时完成：

1. 记录 provider、数据驻留、保留期、删除和访问控制。
2. 证明 provider 端也只接收白名单字段，并排除测试/预览环境。
3. 更新 `/privacy/` 与 `/en/privacy/` 的公开说明。
4. 增加网络请求契约测试和一键移除路径。
5. 在同一 PR 中显式调整 `no-transform` 与 Content Security Policy，并完成生产网络复验。
6. 确认 Dashboard / Stats API 责任人和安全 key 存放方式；真实流量入口就绪后再记录观察窗口开始日。

## 6. P2-05 真实指标闭环状态

当前可核验事实仍是“没有可读取的真实学习事件数据”。所有者批准和适配器测试都不是学习者数据；自动化 smoke 和开发者自测明确排除。因此：

- 不生成合成转化率或首次正确率；
- 不以本批次作者自己的测试操作代表普通学习者；
- 不声称已根据使用数据调整章节；
- 等 P2-05A 发布、Dashboard 验证且积累真实样本后，再启动独立 P2-05C 调整 PR。

这不是技术实现遗漏，而是证据门的预期结果。要完成 P2-05 的产品调整，仍需要配置获批 Plausible 账户、Stats API 安全访问、真实流量来源和至少 14 个完整自然日的聚合指标。

候选 provider 的官方资料比较、获批方案、事件映射、测试流量排除、观察窗口、指标分母和所有者批准项详见
[`P2_METRICS_PROVIDER_DECISION.md`](P2_METRICS_PROVIDER_DECISION.md)。具体账户配置、排除、发布、观察与移除流程见 [`P2_PLAUSIBLE_RUNBOOK.md`](P2_PLAUSIBLE_RUNBOOK.md)。

## 7. 发布验收

- 22 个事件按年份排序，id 唯一，章节和谱系关联有效。
- 中英文事件结构一致，所有来源使用 HTTPS。
- 11 章、22 个双语路由各有一个三选一自测。
- 答错、解释、重试、本地持久化、跨语言读取、清除和存储失败均有测试。
- 390px 无横向溢出，radio 与按钮可键盘操作且触控高度不低于 44px。
- 本地、PR preview、CI、WebDriver、production smoke 和设置 `plausible_ignore=true` 的开发者不发送学习信号网络请求。
- 正式域名真实浏览器只向 `https://plausible.io/api/event` 发送五类白名单事件；payload 契约有单元和浏览器网络测试。
- 生产 HTML 响应包含 `no-transform`、仅本站脚本和 Plausible-only `connect-src`。
- 真实浏览器与排除 smoke 均不请求 `static.cloudflareinsights.com` 或 `/cdn-cgi/rum`。
- `/privacy/` 与 `/en/privacy/` 可索引并进入 sitemap。
