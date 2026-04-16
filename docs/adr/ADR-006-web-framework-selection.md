# ADR-006: Web 框架选型 — Next.js (App Router)

## 状态

已采纳

## 日期

2026-04-09

## 背景

DevFortune 需要一个 Web 前端应用来展示每日程序员运势。这个 Web 端有几个核心需求：

1. **SEO 友好**：运势页面需要被搜索引擎收录，用户搜索「程序员今日运势」时能找到我们。每天的运势内容是确定性的（同一天所有人看到的基础运势相同），非常适合预渲染。
2. **首屏加载快**：运势是轻量信息消费场景，用户期望打开即看到结果，不能等待大量 JavaScript 加载和执行。
3. **未来扩展性**：后续可能增加用户系统（保存生日、个性化运势）、API 端点（供第三方调用）、国际化（中英文切换）等功能。
4. **部署简单**：团队规模小，不希望在运维上投入过多精力。

当前团队对 React 生态更为熟悉，且项目其他端（VS Code 扩展的 Webview 部分）也可能复用 React 组件。

## 决策

采用 **Next.js（App Router）** 作为 Web 端框架，搭配 React 18+ 构建用户界面。具体技术选择如下：

- **路由模式**：使用 App Router（`app/` 目录），而非 Pages Router。App Router 是 Next.js 的未来方向，支持 React Server Components、流式渲染和更灵活的布局嵌套。
- **渲染策略**：运势主页面采用 SSG（Static Site Generation）+ ISR（Incremental Static Regeneration），每天重新生成一次。`revalidate` 设为 86400 秒（24 小时）。
- **API 路由**：使用 Next.js Route Handlers（`app/api/`）暴露 RESTful 端点，供未来第三方集成使用。
- **国际化**：使用 `next-intl` 实现中英文切换，与 ADR-008 的国际化策略保持一致。
- **部署**：首选 Vercel（Next.js 的原生托管平台），零配置部署，自动 Preview Deployment。

项目结构：

```
apps/web/
  app/
    [locale]/
      page.tsx          # 运势主页面（SSG + ISR）
      layout.tsx        # 根布局
    api/
      fortune/
        route.ts        # 运势 API 端点
  components/           # UI 组件
  lib/                  # 工具函数、core 引擎适配层
  messages/             # i18n 翻译文件
  next.config.js
```

## 备选方案

### 方案 B：Nuxt.js (Vue 3)

- **优点**：Vue 学习曲线更平缓；Nuxt 3 的自动导入和约定式路由开发体验优秀；生态成熟，SSG/SSR 支持完善。
- **缺点**：团队对 Vue 不如 React 熟悉，切换技术栈有学习成本；VS Code 扩展的 Webview 通常使用 React，选择 Vue 会导致前端技术栈分裂；Vue 在海外开发者社区的使用比例低于 React，对项目国际化推广不利。

### 方案 C：Astro

- **优点**：默认零 JavaScript 输出，性能极致；内容优先的设计哲学与运势展示场景高度吻合；支持多框架组件（React、Vue、Svelte 混用）。
- **缺点**：交互性功能需要显式添加 `client:*` 指令，对未来的用户系统、个性化设置等交互密集场景略显繁琐；API 路由能力弱于 Next.js；生态规模和社区支持不如 Next.js 成熟；团队没有 Astro 项目经验。

### 方案 D：纯 React SPA（Vite + React）

- **优点**：架构最简单，无服务端渲染的复杂度；Vite 开发体验极快；完全的客户端渲染，部署为纯静态文件。
- **缺点**：没有 SSR/SSG 能力，SEO 严重受限；首屏需要等待 JavaScript 下载和执行，白屏时间长；如需 API 端点，需要额外部署后端服务；路由、数据获取等基础能力需要手动组装。

## 后果

### 正面

- SSG + ISR 策略完美契合运势页面的特性：内容每天更新一次，预渲染后首屏加载极快，SEO 效果好。
- Next.js Route Handlers 可以直接实现 API 端点，无需独立的后端服务。
- Vercel 部署零配置，每个 PR 自动生成 Preview URL，便于团队协作和 Code Review。
- React Server Components 允许在服务端直接调用 `@devfortune/core` 进行运势计算，减少客户端 bundle 体积。
- 与 monorepo 中其他可能使用 React 的部分（VS Code Webview）共享组件成为可能。
- `next-intl` 的类型安全国际化方案与 TypeScript 项目契合度高。

### 负面

- Next.js 框架学习成本较高，App Router 与 Pages Router 的概念模型差异容易造成困惑，新贡献者需要时间适应。
- 项目对 Vercel 平台有一定程度的绑定，虽然 Next.js 可以自托管，但部分功能（Edge Runtime、Image Optimization）在非 Vercel 环境下需要额外配置。
- Next.js 的 bundle 体积大于 Astro，对于一个相对简单的运势展示页面来说可能有些「大炮打蚊子」。
- App Router 仍在快速演进中，API 可能在小版本间发生变化，需要关注升级。

### 风险

- Next.js 版本更新频繁，App Router 部分 API 尚未完全稳定。建议锁定主版本号（如 `^14.0.0`），避免跨大版本自动升级。定期评估升级收益和风险。
- 如果未来运势页面的交互性始终很低，Next.js 的框架开销可能显得不值得。可以在 v1.0 之后根据实际需求重新评估是否迁移到更轻量的方案（如 Astro）。

## 参考

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [next-intl 国际化方案](https://next-intl-docs.vercel.app/)
- [Vercel 部署文档](https://vercel.com/docs)
- ADR-001：Monorepo 架构（`apps/web/` 目录结构）
- ADR-008：国际化策略
