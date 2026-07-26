import type { Locale } from "../locales";

export interface PrivacyPageCopy {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lede: string;
  localHeading: string;
  localBody: string;
  localItems: string[];
  analyticsHeading: string;
  analyticsBody: string;
  providerHeading: string;
  providerBody: string;
  providerItems: string[];
  signalHeading: string;
  signalBody: string;
  signalItems: string[];
  excludedHeading: string;
  excludedItems: string[];
  clearingHeading: string;
  clearingBody: string;
  futureHeading: string;
  futureBody: string;
  sourcesHeading: string;
}

export const privacyPageCopy = {
  "zh-CN": {
    title: "隐私与本地学习记录",
    description:
      "说明交互式人工智能图解史在本地保存什么，以及正式域名如何使用 Plausible 处理匿名学习指标。",
    eyebrow: "Privacy",
    heading: "隐私与本地学习记录",
    lede: "本站保持纯静态边界。学习进度和自测记录默认只留在你的浏览器，不需要账号，也不会被发送到项目服务器。",
    localHeading: "这台设备会保存什么",
    localBody: "为了支持续学和自测，本地存储只记录稳定章节 id 与少量学习状态：",
    localItems: [
      "界面语言偏好。",
      "已标记完成的章节 id。",
      "自测是否首次答对、尝试次数，以及是否打开过解释。",
      "开发者或测试参与者主动设置的 plausible_ignore 排除标记；本站不会用它识别学习者。",
    ],
    analyticsHeading: "匿名学习指标仅在正式域名启用",
    analyticsBody:
      "仅当页面位于 https://atlas.z-ai.cc、浏览器不是自动化环境且没有主动设置排除标记时，本站才会向 Plausible Hosted Business 发送五类已评审学习事件。不会自动记录页面浏览、出站链接、表单、下载或 Cloudflare Web Analytics；本地、PR 预览、CI、Playwright、发布 smoke 和已排除的开发者在请求发出前即被阻止。",
    providerHeading: "Plausible 如何处理请求",
    providerBody:
      "浏览器直接把最小事件发送到 Plausible 的欧盟托管端点。网络请求不可避免地携带 IP 与 User-Agent；Plausible 临时使用它们进行 bot 过滤、粗粒度设备与地区派生，并结合每日轮换 salt 生成只在当天有效的匿名标识。原始 IP、User-Agent 和旧 salt 不会被存储。",
    providerItems: [
      "不使用 cookie、持久访客 id、项目生成的会话 id、设备指纹或跨站追踪。",
      "Plausible 会派生浏览器、操作系统、设备类型和地区；项目只读取章节、语言及 Desktop / Laptop / Tablet / Mobile 聚合分段，不导出地区、浏览器版本或单个访问轨迹。",
      "聚合数据保留在项目所有者的 Plausible 账户中，直至所有者删除站点或账户；Plausible 承诺在删除后无不当延迟地永久清除。",
    ],
    signalHeading: "发送到 Plausible 的严格信号契约",
    signalBody:
      "正式域名上的严格适配器会再次清洗页面内部事件，只发送规范章节路径以及对应的白名单属性：",
    signalItems: [
      "开始章节。",
      "通过章节旅程标记核心交互完成。",
      "完成概念自测与打开解释。",
      "继续到下一章。",
    ],
    excludedHeading: "明确排除的数据",
    excludedItems: [
      "任何用户输入正文、姓名、邮箱或账号。",
      "访客 id、项目设备指纹、精确时间戳、完整 URL、query、hash、referrer 或跨站标识符。",
      "自动页面浏览、自动化测试、预览、发布 smoke 或开发者流量。",
    ],
    clearingHeading: "如何清除",
    clearingBody:
      "首页的“重置学习进度”会清除章节完成状态；任意章节自测中的“清除全部自测记录”会删除所有自测结果。浏览器清站点数据也会清除这些本地记录。",
    futureHeading: "真实数据如何用于迭代",
    futureBody:
      "首轮观察必须覆盖至少 14 个完整自然日；章节总体至少 50 位访客、语言或设备分段至少 30 位访客才可用于决策。项目只保存查询定义、窗口、样本量和聚合结果，不保存 API key 或个人级事件；证据充分后只调整一个章节中的一个主要问题，并开启新的独立观察窗口。",
    sourcesHeading: "评审依据",
  },
  en: {
    title: "Privacy And Local Learning Records",
    description:
      "Learn what Interactive Illustrated AI History stores locally and how its production domain uses Plausible for anonymous learning metrics.",
    eyebrow: "Privacy",
    heading: "Privacy And Local Learning Records",
    lede: "The site keeps a static boundary. Learning progress and self-check records remain in your browser by default, require no account, and are not sent to a project server.",
    localHeading: "What This Device Stores",
    localBody:
      "To support resuming and reflection, local storage contains only stable chapter IDs and a small amount of learning state:",
    localItems: [
      "Interface language preference.",
      "IDs of chapters marked complete.",
      "Whether a self-check was correct first time, attempt count, and whether its explanation was opened.",
      "A plausible_ignore exclusion flag deliberately set by a developer or research participant; the site does not use it to identify learners.",
    ],
    analyticsHeading: "Anonymous Learning Metrics Run Only On Production",
    analyticsBody:
      "Only pages on https://atlas.z-ai.cc send the five reviewed learning events to Plausible Hosted Business, and only when the browser is not automated and has not deliberately enabled the exclusion flag. The site does not automatically track pageviews, outbound links, forms, downloads, or Cloudflare Web Analytics. Local development, pull-request previews, CI, Playwright, release smoke, and excluded developer traffic are blocked before any request is made.",
    providerHeading: "How Plausible Processes A Request",
    providerBody:
      "The browser sends each minimal event directly to Plausible's EU-hosted endpoint. Network requests necessarily carry an IP address and User-Agent. Plausible temporarily uses them for bot filtering, coarse device and location derivation, and a daily identifier generated with a rotating salt. Raw IP addresses, full User-Agents, and old salts are not stored.",
    providerItems: [
      "No cookies, persistent visitor IDs, project session IDs, device fingerprints, or cross-site tracking are used.",
      "Plausible derives browser, operating system, device type, and location. The project reads only chapter, locale, and aggregate Desktop / Laptop / Tablet / Mobile segments; it does not export location, browser version, or individual journeys.",
      "Aggregate data remains in the project owner's Plausible account until the owner deletes the site or account; Plausible commits to permanent deletion without undue delay.",
    ],
    signalHeading: "The Strict Contract Sent To Plausible",
    signalBody:
      "The production adapter sanitizes every in-page event again and sends only a canonical chapter path with its allowed properties:",
    signalItems: [
      "Chapter started.",
      "Core interaction marked complete through the chapter journey.",
      "Concept check completed and explanation opened.",
      "Continued to the next chapter.",
    ],
    excludedHeading: "Explicitly Excluded Data",
    excludedItems: [
      "User-entered text, names, email addresses, or accounts.",
      "Visitor IDs, project device fingerprints, precise timestamps, full URLs, queries, hashes, referrers, or cross-site identifiers.",
      "Automatic pageviews, automation, previews, release smoke, or developer traffic.",
    ],
    clearingHeading: "How To Clear Records",
    clearingBody:
      "Reset learning progress on the home page to remove chapter completion. Use Clear all self-check records in any chapter check to remove every self-check result. Clearing this site's browser data removes both stores as well.",
    futureHeading: "How Real Data Can Inform An Iteration",
    futureBody:
      "The first observation must span at least 14 complete calendar days. A chapter needs at least 50 visitors overall and a locale or device segment needs at least 30 before it can support a decision. The project keeps only query definitions, windows, sample sizes, and aggregate results—not API keys or person-level events. Sufficient evidence may change one primary issue in one chapter, followed by a separate observation window.",
    sourcesHeading: "Review Sources",
  },
} satisfies Record<Locale, PrivacyPageCopy>;
