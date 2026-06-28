# 交互式人工智能图解史：产品与技术方案文档

文档版本：v0.1  
目标读者：项目发起人、贡献者、Codex / 开发代理  
用途：作为后续仓库初始化、MVP 开发验证、交互 demo 原型实现的交付说明  
项目暂定名：`interactive-ai-history` / `interactive-illustrated-ai-atlas`  
中文标题：交互式人工智能图解史 / 人工智能技术演化图谱

---

## 1. 一句话定位

这是一个中文优先的开源知识库，用图解、动画和轻量交互解释人工智能技术从符号主义、统计学习、深度学习到大模型与智能体的发展脉络。

它不是 AI 资源清单，不是论文列表，不是在线 AI 实验平台，也不是大模型应用框架。

它是一个 explorable explanation 项目：通过可点击、可拖动、可对比、可分步播放的教学型案例，让学习者理解每项 AI 技术为什么出现、如何工作、解决了什么问题、又留下了什么问题。

---

## 2. 项目背景与动机

当前 AI 学习材料已经非常丰富，但常见形态存在明显缺口：

1. 资源清单很多，但用户很难建立完整技术地图。
2. 课程很多，但通常按教学顺序组织，不强调历史演化与范式迁移。
3. 论文时间线不少，但常常缺少图解、故事线和工程解释。
4. 单点交互 explainer 很强，但通常只解释 CNN、GAN、Transformer、Diffusion 等单个技术，不覆盖 AI 发展主线。
5. 中文 AI 内容多偏工具、应用、路线和实战，少有“中文优先 + 图解优先 + 历史因果 + 轻交互”的系统知识库。

本项目希望填补的空白是：

```text
AI 技术史
+ 技术谱系图
+ 教学型微交互
+ 中文解释
+ 工程师视角
+ 可复用图源
+ 开源协作
```

项目核心目标不是让用户体验真实 AI，而是帮助用户形成机制直觉：

```text
为什么专家系统会遇到瓶颈？
为什么机器学习转向数据驱动？
为什么神经网络经历低潮后复兴？
为什么 CNN 在视觉任务上突破？
为什么 Attention 和 Transformer 改变 NLP？
为什么 LLM 还需要 RAG？
为什么 Agent 需要计划、工具、观察和修正循环？
```

---

## 3. 产品边界

### 3.1 这个项目是什么

本项目是：

- 中文优先的 AI 技术演化图谱；
- 交互式图解知识库；
- 面向学习者和软件工程师的 AI 技术解释系统；
- 可复用的教学图源与交互案例库；
- 可以 build in public 的开源学习项目；
- 可静态部署的网站；
- 可逐步扩展为中英双语的 AI Atlas。

### 3.2 这个项目不是什么

本项目不是：

- AI 在线训练平台；
- 真实模型推理服务；
- 大模型应用框架；
- 向量数据库 / Agent 框架 / RAG 框架；
- AI 工具导航；
- 论文列表；
- awesome list；
- 真实 AI benchmark 平台；
- 需要后端、API key、GPU 或云服务的在线实验系统。

### 3.3 教学真实原则

项目追求的是：

```text
教学上真实
机制上可信
表现上简化
实现上可控
```

不追求：

```text
真实训练
真实推理
真实向量检索
真实 LLM 工具调用
真实生产环境复杂度
```

每个交互 demo 都可以是 scripted / precomputed / illustrative，但必须明确标注简化边界。例如：

```text
本案例是教学示意，不调用真实向量数据库或大模型。
```

或者：

```text
本案例中的 attention 权重为教学预设，不来自真实 Transformer 模型。
```

---

## 4. 目标用户

### 4.1 主要用户

1. **软件工程师**  
   已经会编程，希望系统理解 AI 技术从哪里来、今天的 LLM/RAG/Agent 在历史中处于什么位置。

2. **AI 初学者**  
   对 AI 名词感到混乱，需要用图、动画和小交互建立全局地图。

3. **技术内容创作者 / 讲师**  
   需要可复用图源、课件素材、可嵌入解释页面。

4. **产品经理 / 技术管理者**  
   希望理解 AI 技术演化逻辑，而不只是追逐热点名词。

### 4.2 用户核心收益

用户完成一个章节后，应该获得以下收益：

```text
知道这项技术在 AI 历史中的位置；
理解它之前的问题；
通过交互案例掌握一个核心直觉；
知道它解决了什么；
知道它没有解决什么；
理解它如何推动下一阶段技术。
```

---

## 5. 产品形态

项目由五层组成：

```text
1. AI 技术演化总览图
2. 分时代章节
3. 每章核心图解
4. 教学型交互案例
5. 参考资料与可复用源文件
```

### 5.1 页面类型

| 页面类型 | 作用 |
|---|---|
| 首页 | 项目定位、AI 发展总览、MVP demo 入口 |
| 时间线页面 | 按时间展示技术、论文、模型、系统、产品事件 |
| 技术谱系页面 | 按范式展示符号主义、统计学习、神经网络、基础模型、Agent |
| 章节页面 | 系统解释一个阶段或技术族 |
| Demo 页面 | 单个交互解释案例，可独立分享 |
| 图源页面 | 提供 SVG / PNG / 源文件下载说明 |
| 贡献指南 | 说明如何贡献图、文案、demo、校对 |

### 5.2 技术主线

建议全站主线为：

```text
规则与搜索
→ 专家系统
→ 概率推理
→ 经典机器学习
→ 神经网络
→ 深度学习
→ Attention / Transformer
→ 基础模型 / LLM
→ RAG
→ Agent
→ Safety / Evaluation
```

---

## 6. MVP 范围

### 6.1 MVP 目标

第一版不追求覆盖全部 AI 技术，而是验证这个产品形态是否成立。

MVP 应达到：

```text
1 条 AI 技术演化主线
8 个核心章节
8 个教学型交互案例
12 张核心图解
静态站点可部署
代码结构可扩展
贡献规范可执行
```

### 6.2 第一版章节

| 编号 | 章节 | 核心问题 | MVP |
|---:|---|---|---|
| 00 | 总览 | AI 为什么不是突然变成大模型的？ | 是 |
| 01 | 符号主义与搜索 | 机器能否通过搜索和规则表现出智能？ | 是 |
| 02 | 专家系统 | 专家知识能否写成 if-then 规则？ | 是 |
| 03 | 概率推理 | 机器如何处理不确定性？ | 是 |
| 04 | 经典机器学习 | 机器如何从数据中学习决策边界？ | 是 |
| 05 | 深度学习与 CNN | 机器如何从图像中学习局部特征？ | 是 |
| 06 | Attention 与 Transformer | token 为什么可以直接互相关注？ | 是 |
| 07 | LLM 与现代 AI 系统 | 为什么大模型还需要外部知识和工具？ | 是 |
| 08 | RAG | 大模型如何连接外部知识？ | 是 |
| 09 | Agent | 大模型如何执行多步任务？ | 是 |
| 10 | Safety / Eval | 如何判断 AI 是否可靠？ | 后续 |

### 6.3 第一版交互案例

| 优先级 | Demo | 阶段 | 推荐实现 | 是否真实 AI |
|---:|---|---|---|---:|
| P0 | RAG Pipeline | 现代 AI 系统 | SVG + Svelte + GSAP | 否 |
| P0 | Attention Map | Transformer | SVG + Svelte | 否 |
| P0 | Agent Loop | Agentic AI | SVG + Svelte + StoryBranch | 否 |
| P1 | 专家系统规则推理 | 专家系统 | Cards + Svelte | 否 |
| P1 | 搜索树 / A* 迷宫 | 符号主义 | SVG + D3 hierarchy + GSAP | 否 |
| P1 | Bayes 更新 | 概率推理 | SVG + Svelte spring | 否 |
| P2 | 决策边界 | 经典 ML | Canvas + Svelte | 否 |
| P2 | CNN 卷积核 | 深度学习 | SVG + Canvas + GSAP | 否 |

### 6.4 MVP 最小开发验证顺序

建议 Codex 先实现最小闭环：

```text
Astro 站点
+ MDX 页面
+ Svelte 交互 island
+ SVG 图
+ StepperExplainer 通用组件
+ RAG Pipeline Demo
+ 静态构建成功
```

验证闭环成功后，再扩展 Attention Map 和 Agent Loop。

---

## 7. 交互设计原则

### 7.1 每个 demo 只教一个核心直觉

一个 demo = 一个核心问题 + 一个关键操作 + 一个可见结果。

示例：

| 技术 | 核心问题 | 用户动作 | 可见结果 |
|---|---|---|---|
| Bayes | 证据如何改变信念？ | 拖动先验 / 证据强度 | 后验概率变化 |
| 搜索 | 为什么搜索会组合爆炸？ | 展开搜索节点 | frontier 快速膨胀 |
| 专家系统 | 规则为什么脆弱？ | 添加例外条件 | 规则冲突 |
| 决策边界 | 数据如何决定分类边界？ | 拖动数据点 | 边界变化 |
| CNN | 卷积核检测什么？ | 切换 kernel | feature map 改变 |
| Attention | token 如何互相关注？ | 点击 token | 连接权重高亮 |
| RAG | 检索质量如何影响回答？ | 切换检索场景 | 答案与引用变化 |
| Agent | 为什么需要循环？ | 点击执行步骤 | plan-tool-observe-revise 展开 |

### 7.2 每个 demo 控制在 3 分钟内理解

每个 demo 的产品标准：

```text
用户 3 分钟内必须获得一个明确 aha moment。
```

交互控件限制：

```text
每个 demo 的主要控件不超过 3 个。
```

推荐控件：

```text
下一步 / 上一步
切换方案
拖动滑块
点击节点
展开解释
```

不推荐：

```text
复杂参数面板
真实训练配置
大段表单
需要用户输入 API key
需要用户理解模型内部所有细节
```

### 7.3 交互类型

| 类型 | 说明 | 适合案例 |
|---|---|---|
| Hover 注释型 | 鼠标悬停节点显示解释 | 时间线、技术树、架构图 |
| Stepper 分步型 | 点击下一步展开流程 | RAG、Transformer、CNN、Agent |
| 对比切换型 | 切换旧方案 / 新方案 | RNN vs Attention、无 RAG vs 有 RAG |
| 参数滑块型 | 拖动参数观察变化 | Bayes、temperature、chunk size |
| 故事分支型 | 选择路径观察失败或修正 | Agent、prompt injection、专家系统冲突 |

---

## 8. 推荐技术栈

### 8.1 总体方案

推荐主栈：

```text
Astro + MDX + Svelte + TypeScript
+ SVG
+ GSAP
+ 少量 D3
+ 少量 Canvas
+ Tailwind / CSS Variables
+ 静态部署
```

技术口号：

```text
用静态站点的速度，做产品级的交互图解体验。
```

### 8.2 分层选型

| 层级 | 推荐选型 | 用途 |
|---|---|---|
| 站点框架 | Astro | 文档站、路由、静态构建、局部交互加载 |
| 内容格式 | MDX | 文章中嵌入交互组件 |
| 交互组件 | Svelte + TypeScript | demo 状态、控件、响应式 UI |
| 高级动画 | GSAP Timeline | 分步解释、路径动画、复杂时间轴 |
| 轻量动画 | CSS transition / Svelte motion | hover、fade、spring、滑块反馈 |
| 主图形 | SVG | 架构图、流程图、token 连接、RAG 图 |
| 辅助数据映射 | D3 模块 | scale、tree、layout、path |
| 密集图形 | Canvas | 决策边界、像素网格、噪声场、大量点 |
| 样式 | Tailwind + CSS Variables | 快速开发 + 设计 token |
| 数据校验 | Zod | demo manifest / timeline 数据校验 |
| 测试 | Vitest + Playwright | 单元测试、交互冒烟测试 |
| 部署 | GitHub Pages / Cloudflare Pages / Vercel | 无后端静态部署 |

### 8.3 不建议第一版使用

第一版不建议使用：

```text
真实 AI 模型运行
后端服务
数据库
向量数据库
用户系统
Three.js 作为主视觉
WebGL 作为所有 demo 基础
大量 Lottie 动画
复杂 CMS
大型状态管理库
```

后续可选：

```text
Rive：用于首页 mascot 或高质感状态机插画
Lottie：用于装饰性小动画
PixiJS：用于大量粒子或高性能 2D 场景
View Transition API：用于页面之间的视觉连续转场
```

---

## 9. 架构设计

### 9.1 推荐仓库结构

```text
interactive-ai-history/
├── README.zh-CN.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── ROADMAP.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── DESIGN.md
│   ├── MOTION.md
│   ├── DIAGRAM_GUIDE.md
│   ├── DEMO_GUIDE.md
│   └── CODEX_HANDOFF.md
├── apps/
│   └── site/
│       ├── package.json
│       ├── astro.config.mjs
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   ├── timeline.astro
│       │   │   ├── demos/[id].astro
│       │   │   └── chapters/[slug].astro
│       │   ├── content/
│       │   │   └── chapters/
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   ├── prose/
│       │   │   ├── timeline/
│       │   │   └── ui/
│       │   ├── demos/
│       │   │   ├── rag-pipeline/
│       │   │   ├── attention-map/
│       │   │   ├── agent-loop/
│       │   │   ├── expert-system/
│       │   │   ├── search-tree/
│       │   │   ├── bayes-update/
│       │   │   ├── decision-boundary/
│       │   │   └── cnn-kernel/
│       │   ├── lib/
│       │   │   ├── animation/
│       │   │   ├── data/
│       │   │   └── utils/
│       │   └── styles/
│       │       ├── tokens.css
│       │       ├── typography.css
│       │       ├── motion.css
│       │       └── diagrams.css
│       └── public/
│           ├── diagrams/
│           ├── images/
│           └── data/
├── packages/
│   ├── demo-core/
│   │   ├── package.json
│   │   └── src/
│   │       ├── StepperDemo.svelte
│   │       ├── CompareDemo.svelte
│   │       ├── SliderDemo.svelte
│   │       ├── StoryBranchDemo.svelte
│   │       ├── SvgScene.svelte
│   │       ├── CanvasScene.svelte
│   │       ├── DemoShell.svelte
│   │       ├── types.ts
│   │       └── motionPresets.ts
│   ├── diagrams/
│   │   ├── source/
│   │   ├── svg/
│   │   └── png/
│   ├── data/
│   │   ├── demos.yaml
│   │   ├── concepts.yaml
│   │   ├── timeline.yaml
│   │   └── references.yaml
│   └── ui/
├── scripts/
│   ├── optimize-svg.ts
│   ├── validate-demo-data.ts
│   └── generate-demo-index.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### 9.2 Monorepo 建议

使用 pnpm workspace：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

根目录脚本建议：

```json
{
  "scripts": {
    "dev": "pnpm --filter site dev",
    "build": "pnpm --filter site build",
    "preview": "pnpm --filter site preview",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "prettier --write .",
    "validate:data": "tsx scripts/validate-demo-data.ts"
  }
}
```

---

## 10. Demo 数据模型

### 10.1 设计原则

每个 demo 不应写死在组件里，而应拆为：

```text
metadata
states
transitions
highlights
annotations
controls
simplification note
references
```

组件负责渲染和交互，数据负责解释内容。

### 10.2 TypeScript 类型草案

```ts
export type DemoType =
  | "stepper"
  | "compare"
  | "slider"
  | "story-branch"
  | "hover-map";

export type RendererType = "svg" | "canvas" | "hybrid" | "cards";

export interface DemoManifest {
  id: string;
  title: string;
  subtitle?: string;
  stage: string;
  type: DemoType;
  renderer: RendererType;
  realAi: false;
  teachingMode: "scripted" | "precomputed" | "illustrative";
  coreQuestion: string;
  learningGoals: string[];
  simplificationNote: string;
  steps?: DemoStep[];
  branches?: DemoBranch[];
  controls?: DemoControl[];
  references?: DemoReference[];
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  highlights?: string[];
  dims?: string[];
  activeArrows?: string[];
  callouts?: DemoCallout[];
}

export interface DemoCallout {
  target: string;
  title: string;
  body: string;
}

export interface DemoControl {
  id: string;
  type: "button" | "toggle" | "slider" | "select";
  label: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
}

export interface DemoBranch {
  id: string;
  label: string;
  description: string;
  next?: string;
  outcome?: string;
}

export interface DemoReference {
  title: string;
  type: "paper" | "book" | "docs" | "article" | "course";
  url?: string;
}
```

### 10.3 RAG demo manifest 示例

```yaml
id: rag-pipeline
title: "RAG：大模型如何连接外部知识？"
subtitle: "从问题到检索，再到带引用的回答"
stage: "现代 AI 系统"
type: "stepper"
renderer: "svg"
realAi: false
teachingMode: "scripted"
coreQuestion: "为什么只靠模型参数回答问题不够？"
learningGoals:
  - "理解 RAG 的基本流程"
  - "理解检索质量如何影响回答质量"
  - "理解 RAG 的优势和局限"
simplificationNote: "本案例是教学示意，不调用真实向量数据库或大模型。"
steps:
  - id: query
    title: "用户提出问题"
    description: "用户的问题先进入系统，而不是直接交给模型回答。"
    highlights:
      - node-query
  - id: embedding
    title: "问题转成向量"
    description: "系统把问题转换成 embedding，用来和文档片段比较语义相似度。"
    highlights:
      - node-embedding
      - vector-query
    activeArrows:
      - arrow-query-embedding
  - id: retrieval
    title: "检索相关文档"
    description: "系统从知识库中召回最相关的文档片段。"
    highlights:
      - node-vector-db
      - doc-1
      - doc-2
    activeArrows:
      - arrow-embedding-db
  - id: rerank
    title: "重新排序"
    description: "reranker 把更相关、更可靠的文档排在前面。"
    highlights:
      - node-reranker
      - doc-2
      - doc-1
    activeArrows:
      - arrow-db-reranker
  - id: prompt
    title: "构造上下文"
    description: "系统把用户问题和检索文档一起放入 prompt。"
    highlights:
      - node-prompt
      - context-window
    activeArrows:
      - arrow-reranker-prompt
  - id: answer
    title: "生成带引用的答案"
    description: "LLM 根据问题和上下文生成答案，并附带来源引用。"
    highlights:
      - node-llm
      - node-answer
      - citation-chip
    activeArrows:
      - arrow-prompt-llm
      - arrow-llm-answer
references:
  - title: "Retrieval-Augmented Generation"
    type: "paper"
```

---

## 11. 核心组件设计

### 11.1 `DemoShell`

统一所有 demo 外壳。

职责：

```text
标题区
核心问题
交互区域
解释面板
简化说明
参考资料入口
移动端布局
```

建议 props：

```ts
interface DemoShellProps {
  title: string;
  subtitle?: string;
  coreQuestion: string;
  simplificationNote: string;
}
```

### 11.2 `StepperDemo`

用于分步流程型 demo。

适合：

```text
RAG Pipeline
Transformer token flow
CNN convolution
Agent loop
搜索树
专家系统推理
```

职责：

```text
当前 step 状态
上一步 / 下一步
进度条
自动播放，可选
高亮 SVG 节点
显示 step 文案
```

### 11.3 `SvgScene`

统一 SVG 场景控制。

职责：

```text
渲染 SVG slot
根据 step.highlights 高亮节点
根据 step.dims 降低节点透明度
根据 activeArrows 播放箭头动画
提供 tooltip 绑定
```

SVG 约定：

```xml
<g id="node-query" data-role="node" data-step="1"></g>
<path id="arrow-query-embedding" data-role="arrow"></path>
```

### 11.4 `CompareDemo`

用于左右或模式切换对比。

适合：

```text
无 RAG vs 有 RAG
RNN vs Attention
规则系统 vs 机器学习
普通 LLM vs Agent
```

### 11.5 `SliderDemo`

用于单变量解释。

适合：

```text
Bayes 更新
temperature
chunk size
diffusion timestep
context window
```

### 11.6 `StoryBranchDemo`

用于失败路径和修正路径。

适合：

```text
Agent 执行流程
prompt injection
专家系统规则冲突
RAG 错误检索
reward hacking
```

---

## 12. 动效设计规范

### 12.1 动效目标

动效不是装饰，而是解释的一部分。

每个动效应服务于以下至少一个目的：

```text
引导注意力
表现数据流
表现因果关系
表现状态变化
表现失败 / 修正
降低复杂图的认知负担
```

### 12.2 动效语义

| 动效 | 含义 |
|---|---|
| fade in | 新信息出现 |
| stroke draw | 数据流 / 关系建立 |
| pulse | 当前关注点 |
| scale up | 被选中 / 被激活 |
| dim | 暂时不重要 |
| shake | 错误 / 冲突 |
| red flash | 失败路径 |
| green glow | 修正 / 成功 |
| slide from left | 输入进入系统 |
| slide to right | 输出生成 |
| loop arrow | 反馈循环 |

### 12.3 时长规范

```text
极快反馈：80-120ms
按钮 / hover：120-180ms
卡片切换：180-260ms
步骤切换：300-500ms
主视觉转场：600-900ms
复杂剧情动画：900-1600ms
```

### 12.4 实现原则

优先动画：

```text
transform
opacity
stroke-dashoffset
```

避免频繁动画：

```text
width
height
top
left
margin
padding
大面积 filter
大面积 blur
```

### 12.5 reduced motion

必须支持用户系统设置：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

更理想的实现：

```text
normal mode：有位移、连线、缩放
reduced mode：只保留 opacity、highlight、step change
```

---

## 13. 视觉设计规范

### 13.1 整体风格

建议风格：

```text
清晰
温暖
现代
克制
可截图传播
像科普图册，不像论文图
像产品说明页，不像游戏界面
```

不建议：

```text
过度赛博朋克
过度霓虹
粒子乱飞
复杂 3D
过度玻璃拟态
默认 Tailwind 模板感
```

### 13.2 视觉隐喻

| 技术概念 | 视觉隐喻 |
|---|---|
| 搜索 | 迷宫 / 树 |
| 规则系统 | 条件卡片 / 多米诺链 |
| 概率 | 信念条 / 天平 |
| 决策边界 | 地图分区 |
| 神经网络 | 信号流 |
| 卷积 | 放大镜 / 滑动窗口 |
| Attention | 聚光灯 / 连线 |
| Transformer | token 工厂流水线 |
| 预训练 | 填词游戏 |
| RAG | 图书馆检索 |
| Agent | 任务执行循环 |
| Alignment | 偏好调校 |
| Safety | 红队闯关 |

### 13.3 Design tokens 示例

```css
:root {
  --color-bg: #f8f7f3;
  --color-panel: #ffffff;
  --color-text: #1f2933;
  --color-muted: #667085;

  --color-symbolic: #7c3aed;
  --color-statistical: #0f766e;
  --color-neural: #2563eb;
  --color-foundation: #ea580c;
  --color-agent: #db2777;
  --color-failure: #dc2626;
  --color-success: #16a34a;

  --radius-card: 18px;
  --radius-node: 12px;

  --shadow-soft: 0 12px 40px rgba(15, 23, 42, 0.08);

  --motion-fast: 160ms;
  --motion-normal: 260ms;
  --motion-slow: 520ms;

  --ease-standard: cubic-bezier(.2, .8, .2, 1);
  --ease-emphasized: cubic-bezier(.16, 1, .3, 1);
}
```

### 13.4 图形语义

| 图形元素 | 含义 |
|---|---|
| 实线箭头 | 数据流 / 计算流 |
| 虚线箭头 | 影响 / 启发 |
| 粗箭头 | 主路径 |
| 发光节点 | 当前激活步骤 |
| 灰色节点 | 未激活 / 背景信息 |
| 红色边框 | 失败 / 局限 |
| 绿色标记 | 改进 / 解决 |
| 紫色节点 | 符号主义 |
| 蓝色节点 | 神经网络 |
| 橙色节点 | 基础模型 |
| 粉色节点 | Agent |

---

## 14. 图源工作流

### 14.1 推荐流程

```text
Figma / Excalidraw 画图
→ 导出 SVG
→ SVGO 优化
→ 手动补 id / data-role
→ Svelte 组件加载
→ GSAP / CSS 控制状态
```

### 14.2 图源类型

| 类型 | 推荐工具 | 说明 |
|---|---|---|
| 精致架构图 | Figma | 首页图、RAG 图、Agent 图 |
| 概念草图 | Excalidraw | 亲和力强，适合初学者 |
| 自动流程图 | Mermaid / D2 | 内部文档、贡献者说明 |
| 动态交互图 | SVG 手工整理 | 便于绑定 id 和动画 |

### 14.3 SVG 命名规范

元素 id 约定：

```text
node-*
arrow-*
label-*
group-*
highlight-*
background-*
```

示例：

```xml
<g id="node-query" data-role="node" data-step="1"></g>
<g id="node-embedding" data-role="node" data-step="2"></g>
<path id="arrow-query-embedding" data-role="arrow" data-step="2"></path>
<g id="node-vector-db" data-role="node" data-step="3"></g>
```

---

## 15. 性能与可访问性要求

### 15.1 性能预算

建议第一版性能预算：

```text
首屏 JS：尽量小于 150KB gzip
单个 demo JS：尽量小于 80KB gzip
单个 SVG：尽量小于 200KB
单页总图片：尽量小于 1MB
动画目标：60fps
交互响应：100ms 内有反馈
长任务：避免超过 50ms
移动端：中端手机可流畅使用
```

### 15.2 加载策略

Astro island 加载建议：

| 组件类型 | 推荐加载方式 |
|---|---|
| 首屏核心交互 | `client:load` |
| 文章中部 demo | `client:visible` |
| 次要装饰动画 | `client:idle` |
| 重 Canvas demo | `client:visible` + dynamic import |

### 15.3 Canvas 性能要求

Canvas 动画必须：

```text
使用 requestAnimationFrame
离屏时暂停
支持 devicePixelRatio
避免每帧分配大量对象
避免不受控无限循环
```

高分屏 Canvas 初始化示例：

```ts
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available.");
  }
  ctx.scale(dpr, dpr);
  return ctx;
}
```

### 15.4 可访问性要求

必须支持：

```text
键盘导航
按钮 aria-label
图解文本说明
demo 简化说明
prefers-reduced-motion
足够文本对比度
移动端可点击区域不小于 44px
```

每个 demo 必须有：

```text
文字版解释
当前 step 标题
当前 step 描述
简化说明
```

即使用户无法观看动画，也应能通过文字理解核心概念。

---

## 16. 首批 demo 详细说明

### 16.1 RAG Pipeline Demo

优先级：P0  
推荐技术：SVG + Svelte + GSAP  
实现方式：scripted stepper  
是否真实 AI：否

核心问题：

```text
为什么大模型需要连接外部知识？
```

用户操作：

```text
点击下一步，观察问题如何经过 embedding、检索、重排、prompt、LLM 和答案引用。
切换场景：无 RAG / 正确检索 / 错误检索 / 检索过多。
```

核心 aha moment：

```text
LLM 本身不是知识库。RAG 把外部文档放进上下文，提高答案事实性和可更新性，但检索质量决定最终效果。
```

步骤：

```text
1. 用户提出问题
2. 问题转成向量
3. 检索相关文档
4. reranker 重新排序
5. 构造上下文 prompt
6. LLM 生成答案
7. 显示引用
8. 总结优势和局限
```

### 16.2 Attention Map Demo

优先级：P0  
推荐技术：SVG + Svelte，必要时 Canvas 画 heatmap  
是否真实 AI：否

核心问题：

```text
为什么 Attention 比 RNN 更适合建模长距离依赖？
```

用户操作：

```text
点击一个 token，看到它关注哪些 token。
切换 RNN 模式和 Attention 模式。
```

核心 aha moment：

```text
RNN 通过链式传递信息，远距离关系容易变弱；Attention 让 token 之间直接建立连接。
```

### 16.3 Agent Loop Demo

优先级：P0  
推荐技术：SVG + Svelte + StoryBranchDemo  
是否真实 AI：否

核心问题：

```text
为什么 Agent 不是一次回答，而是一个循环控制系统？
```

用户操作：

```text
点击执行任务步骤。
观察 plan → tool call → observation → revise → final answer。
选择失败路径，看 Agent 如何修正。
```

核心 aha moment：

```text
Agent 把 LLM 放入行动循环中，使它能够计划、调用工具、观察结果并修正下一步。
```

### 16.4 专家系统 Demo

优先级：P1  
推荐技术：Svelte cards + CSS transition  
是否真实 AI：否

核心问题：

```text
专家知识能否写成规则？为什么规则系统会脆弱？
```

用户操作：

```text
选择条件，触发 if-then 规则。
添加例外条件，观察规则冲突。
```

核心 aha moment：

```text
规则系统在结构明确的问题中有效，但维护大量例外和模糊情况会变得困难。
```

### 16.5 搜索树 Demo

优先级：P1  
推荐技术：SVG + D3 hierarchy + GSAP  
是否真实 AI：否

核心问题：

```text
早期 AI 为什么依赖搜索？为什么会遭遇组合爆炸？
```

用户操作：

```text
点击展开搜索节点。
切换 BFS / DFS / A* 的预设搜索路径。
```

核心 aha moment：

```text
搜索可以在明确规则空间中找到解，但状态空间变大后，搜索成本会急剧增长。
```

### 16.6 Bayes 更新 Demo

优先级：P1  
推荐技术：Svelte + SVG + Svelte spring  
是否真实 AI：否

核心问题：

```text
证据如何改变信念？
```

用户操作：

```text
拖动先验概率和证据强度，观察后验概率变化。
```

核心 aha moment：

```text
统计推理不是给出绝对确定的规则，而是根据证据更新不确定性。
```

### 16.7 决策边界 Demo

优先级：P2  
推荐技术：Canvas + Svelte controls  
是否真实 AI：否

核心问题：

```text
机器如何从数据中学习分类边界？
```

用户操作：

```text
拖动数据点。
切换线性 / 非线性 / 过拟合边界。
```

核心 aha moment：

```text
数据驱动模型不再依赖人手写所有规则，而是从样本中学习边界；不同模型具有不同归纳偏置。
```

### 16.8 CNN 卷积 Demo

优先级：P2  
推荐技术：SVG + Canvas + GSAP  
是否真实 AI：否

核心问题：

```text
机器如何从图像中识别局部特征？
```

用户操作：

```text
选择卷积核。
观察 kernel 在图像上滑动，右侧 feature map 逐步生成。
```

核心 aha moment：

```text
CNN 通过局部感受野和参数共享，让模型能从边缘、纹理到形状逐层组合视觉特征。
```

---

## 17. 开发实施计划

### 17.1 阶段 0：项目初始化

目标：建立可运行仓库骨架。

任务：

```text
初始化 pnpm workspace
创建 apps/site Astro 项目
添加 Svelte 和 MDX 支持
创建 packages/demo-core
创建 packages/data
创建基础布局和首页
添加全局 CSS tokens
添加格式化和 lint 工具
```

验收标准：

```text
pnpm install 成功
pnpm dev 成功
pnpm build 成功
首页可打开
MDX 页面可渲染
Svelte island 可运行
```

### 17.2 阶段 1：最小 demo 闭环

目标：实现第一个可用的交互图解 demo。

优先实现：RAG Pipeline Demo。

任务：

```text
实现 DemoShell
实现 StepperDemo
实现 SvgScene
实现 RAG demo manifest
实现 RAG SVG 场景
实现 step 高亮与箭头动画
在 MDX 章节中嵌入 RAG demo
```

验收标准：

```text
用户可点击上一步 / 下一步
当前步骤标题和描述正确变化
SVG 中对应节点高亮
非当前节点 dim
箭头有流动或 draw-in 动效
移动端可使用
reduced motion 可降级
```

### 17.3 阶段 2：现代 AI 三件套

目标：实现三个最能体现项目差异化的 demo。

任务：

```text
完成 RAG Pipeline Demo
完成 Attention Map Demo
完成 Agent Loop Demo
完成三个对应章节
完成首页 demo 入口
```

验收标准：

```text
三个 demo 都可独立访问
每个 demo 都有简化说明
每个 demo 都有核心问题和 learning goals
每个 demo 3 分钟内可理解
```

### 17.4 阶段 3：历史主线补齐

目标：让项目不只覆盖现代 AI，也覆盖早期历史主线。

任务：

```text
专家系统 Demo
搜索树 Demo
Bayes 更新 Demo
决策边界 Demo
CNN 卷积 Demo
AI 总览时间线
技术谱系图
```

### 17.5 阶段 4：视觉与体验打磨

目标：产品级体验。

任务：

```text
统一图形风格
统一动效语义
优化移动端布局
优化可访问性
加入暗色模式，可选
加入截图友好的图源导出说明
加入贡献指南
加入 demo 创建模板
```

---

## 18. Codex 开发验证指令

以下内容可以直接交给 Codex 作为第一轮开发验证任务。

### 18.1 Codex 任务目标

请基于本方案创建一个最小可运行原型，验证以下技术闭环：

```text
Astro 静态站点
+ MDX 章节
+ Svelte 交互组件
+ SVG 场景
+ GSAP 分步动画
+ 数据驱动 demo manifest
+ RAG Pipeline Demo
```

### 18.2 强约束

请遵守以下约束：

```text
不要接入任何真实 AI API。
不要实现真实 embedding、真实向量数据库或真实 LLM 推理。
不要添加后端服务。
不要引入数据库。
不要引入复杂状态管理库。
不要使用 Three.js 或 WebGL 作为第一版主实现。
不要把 demo 逻辑完全写死在组件中；应尽量数据驱动。
```

### 18.3 技术要求

请使用：

```text
pnpm workspace
Astro
MDX
Svelte
TypeScript
GSAP
CSS Variables
可选 Tailwind
Zod 用于 manifest 校验，可选
```

### 18.4 Codex 应创建的最小文件

```text
interactive-ai-history/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── apps/site/package.json
├── apps/site/astro.config.mjs
├── apps/site/src/pages/index.astro
├── apps/site/src/pages/chapters/rag.astro 或 rag.mdx
├── apps/site/src/components/layout/BaseLayout.astro
├── apps/site/src/styles/tokens.css
├── apps/site/src/demos/rag-pipeline/RagPipelineDemo.svelte
├── packages/demo-core/src/DemoShell.svelte
├── packages/demo-core/src/StepperDemo.svelte
├── packages/demo-core/src/SvgScene.svelte
├── packages/demo-core/src/types.ts
├── packages/data/demos/rag-pipeline.yaml 或 .ts
└── README.zh-CN.md
```

### 18.5 RAG 原型验收标准

RAG demo 必须包含：

```text
标题：RAG：大模型如何连接外部知识？
核心问题：为什么只靠模型参数回答问题不够？
一个 SVG 流程图：Query → Embedding → Vector DB → Reranker → Prompt → LLM → Answer
至少 6 个 step
上一步 / 下一步按钮
当前 step 文案
对应节点高亮
对应箭头高亮
非当前节点 dim
简化说明
```

视觉要求：

```text
卡片清晰
节点圆角统一
箭头清晰
当前步骤有明显高亮
动画不刺眼
移动端能正常堆叠显示
```

性能要求：

```text
pnpm build 成功
没有控制台错误
页面加载后交互响应即时
动画不卡顿
```

### 18.6 Codex 输出要求

Codex 完成后，应输出：

```text
实现了哪些文件
如何运行
哪些技术假设被验证
哪些地方仍是 mock / scripted
下一步建议
```

---

## 19. 代码实现片段参考

### 19.1 StepperDemo 思路

```svelte
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { DemoStep } from "./types";

  export let steps: DemoStep[] = [];
  export let current = 0;

  const dispatch = createEventDispatcher<{ change: number }>();

  $: activeStep = steps[current];

  function goTo(index: number) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    dispatch("change", current);
  }
</script>

<div class="stepper-demo">
  <div class="stepper-demo__scene">
    <slot name="scene" {activeStep} {current} />
  </div>

  <aside class="stepper-demo__panel">
    <div class="stepper-demo__count">{current + 1} / {steps.length}</div>
    <h3>{activeStep.title}</h3>
    <p>{activeStep.description}</p>

    <div class="stepper-demo__controls">
      <button on:click={() => goTo(current - 1)} disabled={current === 0}>上一步</button>
      <button on:click={() => goTo(current + 1)} disabled={current === steps.length - 1}>下一步</button>
    </div>
  </aside>
</div>
```

### 19.2 SVG 高亮思路

```ts
import gsap from "gsap";
import type { DemoStep } from "./types";

export function applySvgStep(root: SVGSVGElement, step: DemoStep) {
  const all = root.querySelectorAll("[data-role='node'], [data-role='arrow']");

  gsap.to(all, {
    opacity: 0.22,
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });

  const activeIds = [
    ...(step.highlights ?? []),
    ...(step.activeArrows ?? [])
  ];

  for (const id of activeIds) {
    const el = root.querySelector(`#${id}`);
    if (!el) continue;

    gsap.to(el, {
      opacity: 1,
      scale: 1.03,
      transformOrigin: "center center",
      duration: 0.35,
      ease: "power3.out"
    });
  }
}
```

### 19.3 RAG SVG 节点约定

```xml
<svg id="rag-scene" viewBox="0 0 1000 520" role="img" aria-label="RAG pipeline diagram">
  <g id="node-query" data-role="node">
    <rect x="40" y="220" width="120" height="72" rx="16" />
    <text x="100" y="262" text-anchor="middle">Question</text>
  </g>

  <path id="arrow-query-embedding" data-role="arrow" d="M160 256 L250 256" />

  <g id="node-embedding" data-role="node">
    <rect x="250" y="220" width="140" height="72" rx="16" />
    <text x="320" y="262" text-anchor="middle">Embedding</text>
  </g>

  <!-- 其余节点略 -->
</svg>
```

---

## 20. 测试与验收

### 20.1 开发验收

必须满足：

```text
pnpm install 成功
pnpm dev 成功
pnpm build 成功
无 TypeScript 错误
无明显控制台错误
首页可打开
至少一个章节可打开
RAG demo 可完整交互
```

### 20.2 体验验收

每个 demo 必须满足：

```text
核心问题明确
首屏知道自己要看什么
交互控件不超过 3 个主要操作
每一步都有解释文案
图中当前重点明确
不需要真实 AI 知识即可看懂
3 分钟内获得 aha moment
```

### 20.3 内容验收

每个章节必须包含：

```text
一句话解释
历史位置
它之前的问题
交互图解
用户应该观察到什么
它解决了什么
它没有解决什么
后续影响
参考资料
简化说明
```

### 20.4 可维护性验收

必须避免：

```text
demo 文案全部写死在组件中
SVG 元素没有稳定 id
动画使用大量 setTimeout
样式散落在各处且无 token
组件只能服务一个 demo
真实 AI 逻辑混入教学 demo
```

---

## 21. 风险与应对

### 21.1 范围爆炸

风险：试图为每个技术名词都做完整 demo。

应对：

```text
每个阶段至少一个代表性交互。
每个技术族复用一种交互模式。
第一版只做 8 个 demo。
```

### 21.2 交互炫技压过解释

风险：动画很好看，但用户不知道学到了什么。

应对：

```text
每个 demo 必须有核心问题和 aha moment。
动效必须服务于解释目的。
```

### 21.3 技术实现过重

风险：引入后端、AI API、WebGL、真实模型后维护成本失控。

应对：

```text
第一版坚持纯静态。
所有 demo 默认为 scripted / illustrative。
真实 AI 不进入 MVP。
```

### 21.4 视觉风格不统一

风险：贡献者多后，图和动画风格分裂。

应对：

```text
维护 DESIGN.md、MOTION.md、DIAGRAM_GUIDE.md。
所有图遵循视觉 token 和 SVG 命名规范。
```

### 21.5 内容可信度不足

风险：AI 历史解释变成印象流。

应对：

```text
每章必须给出参考资料。
关键历史节点绑定论文、书籍、课程或官方资料。
贡献流程加入 fact-check label。
```

---

## 22. 后续路线图

### 22.1 v0.1

```text
项目骨架
首页
RAG Pipeline Demo
基础视觉系统
基础贡献指南
```

### 22.2 v0.2

```text
Attention Map Demo
Agent Loop Demo
三个现代 AI 章节
demo manifest 校验
```

### 22.3 v0.3

```text
专家系统 Demo
搜索树 Demo
Bayes Demo
AI 技术演化总览图
```

### 22.4 v0.4

```text
决策边界 Demo
CNN 卷积 Demo
技术谱系页面
图源下载说明
```

### 22.5 v1.0

```text
8 个核心 demo
10 个章节
12 张核心图
统一视觉规范
完整贡献指南
静态网站公开发布
```

---

## 23. README 推荐开头

```markdown
# 交互式人工智能图解史

这是一个中文优先的开源知识库，用图解、动画和轻量交互解释人工智能技术的发展脉络。

它不是 AI 资源清单，不是论文列表，也不是在线 AI 实验平台。

它的目标是回答：AI 为什么会从规则系统、专家系统、统计学习、神经网络，发展到 Transformer、大模型、RAG 和 Agent？

每个主题都会包含：

- 一张清晰图解；
- 一个教学型交互案例；
- 一段历史解释；
- 一个“它解决了什么，又留下了什么问题”的总结；
- 可复用的图源和参考资料。
```

---

## 24. 最终建议

本项目最值得验证的不是“能否实现复杂 AI demo”，而是：

```text
能否用轻量、精美、丝滑的交互图解，让用户真正理解 AI 技术演化。
```

第一轮 Codex 开发不应追求完整功能，而应验证最小闭环：

```text
Astro + MDX + Svelte + SVG + GSAP + RAG Pipeline Demo
```

只要这个闭环成立，后续 Attention、Agent、专家系统、搜索树、Bayes、CNN 等 demo 都可以复用同一套交互组件和设计规范继续扩展。
