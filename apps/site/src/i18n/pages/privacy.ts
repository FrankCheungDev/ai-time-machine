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
      "说明交互式人工智能图解史在本地保存什么、当前不收集什么，以及匿名指标的启用门槛。",
    eyebrow: "Privacy",
    heading: "隐私与本地学习记录",
    lede: "本站保持纯静态边界。学习进度和自测记录默认只留在你的浏览器，不需要账号，也不会被发送到项目服务器。",
    localHeading: "这台设备会保存什么",
    localBody: "为了支持续学和自测，本地存储只记录稳定章节 id 与少量学习状态：",
    localItems: [
      "界面语言偏好。",
      "已标记完成的章节 id。",
      "自测是否首次答对、尝试次数，以及是否打开过解释。",
    ],
    analyticsHeading: "客户端学习分析当前保持禁用",
    analyticsBody:
      "本站不主动加载分析 provider、像素或网络 beacon；部署响应还通过 no-transform 与内容安全策略阻止平台自动注入客户端 Web Analytics / RUM。Cloudflare 作为托管与代理服务仍会处理 HTTP 请求，并可能提供聚合边缘流量统计；项目当前不能读取这些统计，也不会把它们当作学习效果指标。自动化测试和发布 smoke 同样不会被冒充为真实学习者数据。",
    signalHeading: "已评审但不联网的信号契约",
    signalBody:
      "页面内部可以发出以下类型化事件，供测试验证交互边界；当前没有监听器把它们发送出浏览器：",
    signalItems: [
      "开始章节。",
      "通过章节旅程标记核心交互完成。",
      "完成概念自测与打开解释。",
      "继续到下一章。",
    ],
    excludedHeading: "明确排除的数据",
    excludedItems: [
      "任何用户输入正文、姓名、邮箱或账号。",
      "项目学习信号中的访客 id、设备指纹、精确时间戳或跨站标识符。",
      "将自动化测试流量解释成真实使用数据。",
    ],
    clearingHeading: "如何清除",
    clearingBody:
      "首页的“重置学习进度”会清除章节完成状态；任意章节自测中的“清除全部自测记录”会删除所有自测结果。浏览器清站点数据也会清除这些本地记录。",
    futureHeading: "当前没有计划启用托管型学习分析",
    futureBody:
      "当前没有获批或排期中的托管型分析服务，客户端学习信号采集及其外发分析请求继续保持禁用。未来若重新提出方案，必须另行批准费用、隐私、数据驻留与保留期，证明字段白名单不含身份或正文，公开更新本页，并取得可读取的真实聚合数据。",
    sourcesHeading: "评审依据",
  },
  en: {
    title: "Privacy And Local Learning Records",
    description:
      "Learn what Interactive Illustrated AI History stores locally, what it does not collect, and the gate for anonymous metrics.",
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
    ],
    analyticsHeading: "Client-side Learning Analytics Remain Disabled",
    analyticsBody:
      "The site does not intentionally load an analytics provider, pixel, or network beacon. Deployment responses also use no-transform and a Content Security Policy to prevent automatic client-side Web Analytics or RUM injection. Cloudflare still processes HTTP requests as the hosting proxy and may expose aggregate edge traffic; the project cannot currently read those statistics and never treats them as learning evidence. Automated tests and release smoke traffic are excluded as well.",
    signalHeading: "Reviewed, In-Page Signal Contract",
    signalBody:
      "Pages can emit these typed events so tests can verify interaction boundaries. No listener currently sends them outside the browser:",
    signalItems: [
      "Chapter started.",
      "Core interaction marked complete through the chapter journey.",
      "Concept check completed and explanation opened.",
      "Continued to the next chapter.",
    ],
    excludedHeading: "Explicitly Excluded Data",
    excludedItems: [
      "User-entered text, names, email addresses, or accounts.",
      "Visitor IDs, device fingerprints, precise timestamps, or cross-site identifiers in project learning signals.",
      "Treating automated test traffic as real usage evidence.",
    ],
    clearingHeading: "How To Clear Records",
    clearingBody:
      "Reset learning progress on the home page to remove chapter completion. Use Clear all self-check records in any chapter check to remove every self-check result. Clearing this site's browser data removes both stores as well.",
    futureHeading: "No Hosted Learning Analytics Are Currently Planned",
    futureBody:
      "No hosted provider is approved or scheduled, so client learning-signal collection and analytics-related outbound requests remain disabled. Any future proposal requires separate approval for cost, privacy, data residency, and retention; proof that the field allowlist excludes identity and input text; a public update to this page; and access to genuine aggregate data.",
    sourcesHeading: "Review Sources",
  },
} satisfies Record<Locale, PrivacyPageCopy>;
