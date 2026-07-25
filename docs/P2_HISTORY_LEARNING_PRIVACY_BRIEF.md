# P2 历史深度、学习自测与隐私评审

- 状态：本地门禁通过，等待远程门禁与生产发布
- 对应任务：P2-01 / P2-02 / P2-03 / P2-04 / P2-05
- 评审日期：2026-07-25

## 1. 本批次要解决的问题

P1 已经把学习主线延伸到 Safety / Eval，但时间线仍主要是一章一个年代范围，章节完成状态也无法说明学习者是否抓住了机制直觉。本批次增加两层证据：

1. 用有原始来源的事件解释范式为什么转折，而不是只列年代。
2. 用每章一个不阻断学习的概念自测，让学习者获得“为什么”的反馈。

同时完成匿名指标隐私评审。没有真实数据访问能力时，宁可保持收集禁用，也不使用自动化流量或合成数字冒充真实学习者数据。

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

**生产收集保持禁用。** 当前仓库没有分析 provider、API key、后端或数据库；现有 Chrome 与应用内浏览器会话也都无法读取 Cloudflare 项目分析。因此本批次不声称拥有章节完成率、首次正确率或继续率的真实数据。

Cloudflare Web Analytics 官方说明其为 privacy-first 且不收集或使用访客个人数据，但它当前只作为候选 provider 资料，不代表本站已经启用。参见 [Cloudflare Web Analytics overview](https://developers.cloudflare.com/web-analytics/about/)。

### 5.2 已评审事件与字段白名单

代码只在页面内派发类型化 `CustomEvent`，没有网络监听器：

| 事件                         | 允许字段                                            | 决策用途                 |
| ---------------------------- | --------------------------------------------------- | ------------------------ |
| `chapter_started`            | `name`, `chapterId`, `locale`                       | 章节进入基数             |
| `core_interaction_completed` | 上述字段 + 固定 `completionSource`                  | 章节进入到声明完成的转化 |
| `concept_check_completed`    | 上述字段 + `correct`, `attempt` (`first` / `retry`) | 首次正确与重试需求       |
| `concept_explanation_opened` | `name`, `chapterId`, `locale`                       | 解释展开率               |
| `next_chapter_continued`     | 上述字段 + `nextChapterId`                          | 完成后继续比例           |

明确禁止：

- 用户输入正文、答案文字、姓名、邮箱或账号；
- visitor id、设备指纹、精确时间戳、完整 URL、IP、User-Agent 或跨站标识；
- 未经白名单的任意 payload；
- 把 Playwright、CI、开发或 smoke 流量混入真实学习者指标。

### 5.3 未来启用门

只有以下条件全部满足，才可以在独立 PR 中把 collection mode 从 `disabled` 改为启用：

1. 记录 provider、数据驻留、保留期、删除和访问控制。
2. 证明 provider 端也只接收白名单字段，并排除测试/预览环境。
3. 更新 `/privacy/` 与 `/en/privacy/` 的公开说明。
4. 增加网络请求契约测试和一键移除路径。
5. 能读取真实聚合数据，并记录样本量与观察窗口。

## 6. P2-05 真实指标闭环状态

当前可核验事实是“没有可读取的真实学习事件数据”。自动化 smoke 和开发者自测明确排除。因此：

- 不生成合成转化率或首次正确率；
- 不以本批次作者自己的测试操作代表普通学习者；
- 不声称已根据使用数据调整章节；
- 等生产发布、provider 评审通过且积累真实样本后，再启动独立 P2-05 调整 PR。

这不是技术实现遗漏，而是隐私门和证据门的预期结果。要完成 P2-05 的产品调整，仍需要项目所有者提供经过授权的真实聚合指标访问或批准合适的匿名 provider。

## 7. 发布验收

- 22 个事件按年份排序，id 唯一，章节和谱系关联有效。
- 中英文事件结构一致，所有来源使用 HTTPS。
- 11 章、22 个双语路由各有一个三选一自测。
- 答错、解释、重试、本地持久化、跨语言读取、清除和存储失败均有测试。
- 390px 无横向溢出，radio 与按钮可键盘操作且触控高度不低于 44px。
- 生产代码不发送学习信号网络请求。
- `/privacy/` 与 `/en/privacy/` 可索引并进入 sitemap。
