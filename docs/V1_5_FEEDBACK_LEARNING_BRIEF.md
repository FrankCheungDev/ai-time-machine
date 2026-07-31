# v1.5 Feedback Learning And Guided Causal Path Brief

- 状态：研发完成，等待 PR 评审、预览验证与生产发布
- 日期：2026-07-31
- 基线：`main` @ `3c879ae`（v1.4）
- 实现分支：`codex/v1-5-feedback-learning`
- 范围：P0 发布记录收口、P1 反馈学习教学章节、P2 引导式因果路径

## 1. 决策摘要

v1.4 已把时间线、技术谱系与章节连接为可分享的因果导航，并补齐基础模型从预训练、
指令微调、偏好反馈到运行时上下文的职责边界。下一轮不继续堆叠独立的现代应用
Demo，而是补上当前主线中最明显的机制桥梁：

> 系统如何根据行动结果改变未来策略？这与监督学习、偏好训练，以及 Agent 在一次
> 运行中根据 observation 改变下一步有什么不同？

当前站点已经分别提到 Samuel checkers、AlphaGo、InstructGPT、偏好反馈和 Agent
循环，但章节注册表与技术谱系没有一个节点把“搜索、神经网络、反馈学习、后训练与
运行时闭环”明确连接起来。v1.5 用一个新章节和一条策展式故事路径补齐这个断层。

本迭代是基于现有课程结构和来源覆盖做出的内容决策，不声称由真实使用指标驱动。
P2-05 仍然暂停；不启用 provider、不改变 CSP，也不把 CI、preview、smoke 或开发者
行为解释成学习者证据。

## 2. 学习目标

### 2.1 核心直觉

学习者应能区分四类信号及其作用时机：

| 机制               | 输入信号                             | 发生阶段 | 本站要建立的边界                                                  |
| ------------------ | ------------------------------------ | -------- | ----------------------------------------------------------------- |
| 监督学习           | 输入对应的目标标签或目标输出         | 训练时   | 目标直接描述期望答案，但不等于环境中的长期结果                    |
| 强化学习           | 动作后的 observation、reward、return | 训练时   | 结果信号用于改变价值估计或策略；并非每一步都给出唯一正确动作      |
| 偏好后训练         | 示范、候选比较或排序                 | 训练时   | 偏好数据可进入不同优化流程，不应把所有偏好优化都等同为同一种 RLHF |
| Runtime Agent 循环 | 工具回执、环境状态或失败 observation | 运行时   | observation 改变当前任务的下一步；普通运行不会自动更新模型权重    |

### 2.2 三分钟完成标准

完成交互后，学习者能够：

1. 说明 reward 是对行动结果的反馈，而不是每一步的标准答案；
2. 指出一次训练 episode 何时才会更新示意策略；
3. 解释 Agent 根据 observation 改计划不等于模型在线学习；
4. 说出 AlphaGo 同时使用学习与搜索，不能被概括为“强化学习取代了搜索”；
5. 说明人类偏好是受任务、标注说明和样本分布限制的信号，不是普遍真理。

## 3. P0：v1.4 发布记录收口

本方案文档所在 PR 同步完成以下记录工作，不等待 v1.5 功能实现：

- 将 `ROADMAP.md` 与 v1.4 brief 从“评审中”更新为“完成并发布”；
- 记录 PR #29、合并提交 `3c879ae`、GitHub CI run `30512850773` 与生产
  privacy smoke；
- 保留 P2-05 的 provider、真实流量和观察窗口门槛；
- 把 v1.5 标记为计划中的教学切片，而不是已经交付的功能。

## 4. P1：强化学习与反馈闭环章节

### 4.1 章节位置与注册契约

- 新章节 id：`reinforcement-learning`。
- 新路由：`/chapters/reinforcement-learning/` 与
  `/en/chapters/reinforcement-learning/`。
- 学习顺序：放在 CNN 之后、Attention 之前。该位置先建立深度表示与反馈学习的
  基础，再进入 Transformer、基础模型和现代系统。
- 现有 URL 与 localStorage 中基于 chapter id 的完成记录保持有效；只调整派生编号、
  前后章导航和“首个未完成章节”的顺序。
- 首页、学习路径、时间线章节筛选、谱系、概念自测、图源清单和路由测试继续从章节
  registry 派生，不新增手写平行顺序表。

发布后预期表面为 13 章、12 个交互 Demo、26 个双语章节路由、12 组图源，以及每章
一个双语概念自测。

### 4.2 固定教学场景

Demo 暂定名为 `Feedback Learning Loop`。它使用一个固定的两阶段路径选择任务和两个
脚本化训练 episode：

- baseline episode 走左侧，立即得到小奖励并进入终点；
- exploration episode 固定走右侧，第一步没有奖励，第二步得到更高的延迟奖励；
- 初始示意策略偏向左侧；比较两个 episode 的 return 后，右侧动作概率上升；
- 所有动作、概率、reward 与 update 都是审核过的脚本数据，不调用随机采样或真实
  优化器。

这个场景只用于解释“结果反馈如何影响后续策略”。它不模拟真实机器人、游戏环境、
神经网络训练或通用决策问题。

### 4.3 六步交互契约

拓扑固定为：

`State → Policy → Action → Environment → Observation + Reward → Return / Update → Updated Policy`

六个步骤为：

1. **读取状态：** 展示当前 state 与策略对两个动作的示意概率；
2. **运行 baseline：** 固定执行当前更常见的左侧动作并得到即时小奖励，不把概率
   动画伪装成真实采样；
3. **运行 exploration：** 固定展示一次右侧探索，环境先返回零 reward 的 observation，
   再在第二步返回较高 reward；
4. **比较结果：** 对比两个 episode 的 return，解释 delayed reward 与 credit
   assignment 是真实问题，但本 Demo 不实现算法；
5. **更新策略：** 只在训练边界内改变示意参数，使高 return 路径在下一 episode 更
   常见；
6. **比较运行时：** 切换到 Agent 边界图，展示 observation 可以改变当前任务的下一
   个动作，但权重保持不变，除非另有明确训练管线。

控件只包括“上一步 / 下一步 / 重置”和一个训练时—运行时比较开关。不得加入可任意
编辑 reward、学习率或模型参数的实验面板，以免把教学范围扩成算法沙盒。

### 4.4 边界对照

交互旁保留一张始终可见的对照表：

- **Target label：** 告诉系统期望输出是什么；
- **Reward / return：** 评价动作序列结果，不保证逐步给出正确答案；
- **Preference comparison：** 表示特定标注协议下哪个候选更受偏好，后续可以进入
  奖励模型加 RL，也可以进入其他直接偏好目标；
- **Runtime observation：** 是当前任务的新状态，不自动成为训练样本或权重更新。

页面必须明确说明：RL 是一类问题设定与方法族，不等于某个单一算法；RLHF 是偏好
后训练的一条历史路径，不等于全部后训练，也不等于完整 alignment。

### 4.5 概念自测

题目只检查一个边界：

> Agent 调用工具失败后，根据错误回执修改参数并重试。这一事实本身说明了什么？

正确答案应表达“当前运行中的 observation 改变了下一步动作”，并明确指出它不能
单独证明模型权重已在线更新。错误选项分别代表“失败回执自动成为梯度”和“出现
reward 文案就一定运行了强化学习”。

### 4.6 谱系与既有事件连接

- 新谱系节点 id：`reinforcement-learning`，复用 statistical 学习分组的视觉语言，
  不为单个章节新增一套颜色系统；
- 固定关系为 `statistical → reinforcement-learning`（结果反馈）、
  `neural → reinforcement-learning`（深度表示）和
  `reinforcement-learning → agent`（行动反馈）；
- 搜索与 RL 的组合通过 AlphaGo 事件和 feedback-learning story 表达，不增加一条
  暗示“搜索演化成 RL”的直接谱系边；
- 基础模型偏好后训练的关系通过 InstructGPT 事件、章节边界表和 story 表达，不画出
  暗示“RL 导致基础模型出现”的边；
- P1-01 重新审核 Samuel、AlphaGo 与 InstructGPT 的 chapter / lineage 关联，P2-01
  再增加 Q-learning 与 DQN 事件。

## 5. 来源计划与声明边界

正式实现前必须逐条读取原始来源并把最终页面声明限制在来源范围内。候选事实合同
如下：

| 来源                                                                                                      | 可以支持的限定声明                                                                | 不作出的推论                                           |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [Q-learning](https://doi.org/10.1007/BF00992698)                                                          | Watkins 与 Dayan 给出 Q-learning 更新规则，并证明其在文中条件下收敛到最优动作价值 | 所有 RL 都使用 Q-learning，或有限 Demo 证明收敛        |
| [Human-level control through deep reinforcement learning](https://doi.org/10.1038/nature14236)            | 论文把深度网络、经验回放与 Q-learning 用于从像素学习 Atari 控制策略               | Atari 成绩等于通用智能或现实世界可靠控制               |
| [Mastering the game of Go with deep neural networks and tree search](https://doi.org/10.1038/nature16961) | AlphaGo 组合策略网络、价值网络、监督学习、强化学习与蒙特卡洛树搜索                | 强化学习单独造成胜利，或学习已经取代搜索               |
| [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)   | InstructGPT 使用示范、候选排序、奖励模型与 PPO 塑造所评估分布中的行为             | 人类偏好是客观真理，或偏好提升保证事实与完整安全       |
| [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)                                        | 偏好比较也可以通过不显式训练奖励模型、不给出在线 RL rollout 的目标优化            | 所有直接偏好方法都更优，或 preference data 就是 reward |

Samuel checkers、AlphaGo 与 InstructGPT 已有的事件来源可以复用，但新增文案必须重新核对
原始页码、实验范围和时间信息。若候选来源无法稳定访问或不能支持页面中的精确措辞，应替换
来源或收缩声明，而不是把二手摘要当作事实依据。

## 6. P2：引导式反馈学习因果路径

### 6.1 用户问题

v1.4 的章节与谱系筛选可以回答“与某个对象直接相关的事件有哪些”，但仍要求初学者
自己把跨年代事件组织成故事。v1.5 只增加一条经过审核的策展路径：

`Samuel Checkers → Q-learning → DQN → AlphaGo → InstructGPT → Agent / Safety boundary`

路径表达的是“反馈信号如何逐步进入学习与系统闭环”的教学主线，不声称这些事件构成
唯一或完整的历史因果链。Samuel 节点只表达“搜索、评估函数与经验更新”的早期组合，
不把 1959 年的工作倒推标记为后来才形成的完整强化学习范式。

### 6.2 数据合同

新增类型化 story manifest，每条路径至少包含：

- 稳定 `id`、中英文标题、核心问题与简化说明；
- 有顺序的 event id、lineage node id 和 chapter id；
- 每一步“继承了什么 / 解决了什么 / 仍缺什么”的中英文说明；
- 至少一个进入章节的动作，以及返回时间线或谱系的稳定链接；
- 引用完整性、id 唯一性与关联对象存在性的单元测试。

首版只允许 `feedback-learning` 一条路径，不提前抽象通用故事编辑器。

### 6.3 URL 与交互合同

- 时间线和谱系使用 `?story=feedback-learning` 恢复故事状态；
- 故事模式按顺序高亮相关事件与节点，其他历史内容降噪但不删除；
- 用户主动选择 chapter/lineage 筛选时清除 `story`，选择 story 时清除已有筛选，避免
  多套状态叠加后含义不明；
- 中英文切换保留有效的 query 与当前 story fragment；
- 无 JavaScript 时页面仍渲染完整历史、来源和章节链接，不依赖 story 模式才能访问
  内容；
- 不提供自动寻路、最短路径、权重计算或“AI 推断因果关系”。

## 7. 交付切片

### P1-01：章节与 Demo

- 完成来源 fact-check、双语教学文案和简化边界；
- 注册新章节、路由、Demo 数据、概念自测与学习路径；
- 实现脚本化 SVG 交互并提供第十二组 SVG / PNG 图源；
- 增加专用单元测试与 `feedback-learning.spec.ts`，避免继续扩大无关综合 spec；
- 独立发布后，站点即使没有故事路径也保持完整可用。

### P2-01：反馈学习故事路径

- 增加 story manifest、时间线/谱系故事视图和双语 URL 状态；
- 新增 Q-learning 与 DQN 事件，并复用既有 Samuel、AlphaGo 与 InstructGPT 事件；
- 验证故事、普通筛选、语言切换、fragment 与无 JavaScript fallback；
- 作为第二个独立 PR 发布，不与章节实现维持长期未合并依赖。

### P3-01：发布收口

- 更新 README、ROADMAP、过程记录和 production smoke 预期数量；
- 记录 CI、Cloudflare Pages、生产交互、隐私响应头与视觉证据；
- 只有完成生产 smoke 后才把 v1.5 从“计划中”改为“完成并发布”。

## 8. 验收门禁

每个实现 PR 至少运行：

    pnpm format:check
    pnpm validate:data
    pnpm lint
    pnpm build
    pnpm test
    pnpm render:diagrams
    git diff --check

完整 v1.5 还必须证明：

- 13 章、12 个 Demo、26 个双语章节路由、27 个来源事件、12 组图源与每章一个
  概念自测；
- 新章节在中文桌面、英文移动端和 reduced-motion 下可用且无横向溢出；
- 控件支持键盘操作，步骤、活动节点、解释和重置状态同步变化；
- 训练更新与 runtime observation 的边界在页面、图源、自测和测试中使用同一合同；
- 既有完成记录在章节插入后仍按 id 保留，新章节成为正确的首个未完成项；
- story 深链可刷新、可跨语言切换、可清除，非法 story id 安全回退；
- Q-learning、DQN、AlphaGo、InstructGPT 与偏好优化的页面声明完成原始来源审查；
- 视觉证据至少包含中文桌面的策略更新、英文移动端的运行时边界，以及桌面端故事
  路径聚焦。

### 8.1 本地研发门禁（2026-07-31）

- `pnpm format:check`、`pnpm validate:data`、`pnpm lint` 与 `pnpm build` 均通过；
  Astro 共检查 150 个文件，构建 37 个静态页面；
- `pnpm test` 通过：`demo-core` 5 项、`data` 61 项、`site` 126 项单元测试，以及
  Chromium 170 项浏览器回归；
- `pnpm render:diagrams` 成功生成 12 组 SVG / PNG 图源，`git diff --check` 通过；
- 已留存中文桌面策略更新、英文移动端运行时边界和桌面故事聚焦三张视觉证据；
- GitHub CI、Cloudflare Pages 预览与生产 smoke 仍须在 PR / 合并部署阶段完成，因此
  本文档状态继续保持“等待 PR 评审、预览验证与生产发布”。

## 9. 风险与控制

| 风险                          | 控制                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| 把 RL、RLHF 与 Agent 混成一类 | 始终展示训练时 / 运行时边界，并用四类信号对照表固定术语          |
| 玩具概率被误认为真实训练      | 使用“示意策略”措辞、固定脚本值和简化说明，不展示伪造 loss 曲线   |
| 把 AlphaGo 写成纯 RL 成果     | 同时展示策略网络、价值网络、监督学习、强化学习与树搜索           |
| 因果故事被误读为历史定论      | 页面保留策展与非唯一原因声明，其他事件只降噪不删除               |
| 插入章节破坏既有进度          | 完成记录继续按 chapter id 存储，增加旧记录迁移与首个缺口回归测试 |
| 谱系继续横向膨胀              | 在实现前先评审节点坐标、移动端 fit/detail 行为与英文标签几何     |
| 测试文件继续集中增长          | 新行为进入独立领域 spec；跨章节合同继续由 registry 派生          |
| 借内容迭代绕过指标审批        | collection mode、CSP 与 provider 状态不变，P2-05 保持暂停        |

## 10. 非范围

- 不运行真实强化学习、神经网络训练、reward model、LLM 或工具 API；
- 不提供可编辑学习率、reward function、环境或任意算法参数；
- 不实现 Gym、仿真后端、数据库、用户账户或排行榜；
- 不声称一条故事路径覆盖强化学习史、alignment 史或 Agent 史；
- 不新增学习信号、不联网采集、不重开 provider 选择；
- 不在出现三次稳定重复前新增通用 story builder 或新的共享 Demo 原语。

## 11. 开始实现前的决策门

进入 P1-01 前需同时满足：

- 核心问题、两阶段路径场景与六步交互经过教学评审；
- 来源表中的精确声明完成 fact-check，并决定是否保留 DPO 对照；
- 确认章节插入 CNN 与 Attention 之间，以及现有完成记录的兼容策略；
- 确认首版 story 只包含 `feedback-learning`，不扩成通用路径系统；
- 从最新 `main` 创建新的短生命周期 `codex/*` worktree，避免复用本方案分支。

## 12. 实施状态

v1.5 的研发内容已经在独立实现分支完成，包含强化学习章节、固定双 episode 的六步
交互、训练时与运行时边界、Q-learning 与 DQN 事件、新谱系节点、一条
`feedback-learning` 策展路径、双语 URL 状态、概念自测、第十二组图源及专用回归测试。

当前状态只表示“实现候选完成”，不表示已经发布。只有 PR 合并、GitHub 与 Cloudflare
检查完成，并对正式站点执行 production smoke 后，才会补充 PR、合并提交、CI、部署和
生产证据，并把本节状态改为“完成并发布”。P2-05 仍保持暂停，客户端采集与 CSP 没有
改变。
