# 监控与可观测性

> DevFortune 项目的监控、告警与可观测性方案

## 概述

DevFortune 是一个以本地计算为核心的轻量级项目，监控需求相对简单。主要关注点：

1. **Web 应用** — 可用性、性能、错误率
2. **npm / VS Code 发布** — 发布成功率、下载趋势
3. **社区健康** — Issue 响应时间、PR 合并效率

---

## Web 应用监控

### 基础设施监控（Vercel）

Vercel 平台提供内置监控能力：

| 指标 | 阈值 | 告警 |
|------|------|------|
| 可用性 | > 99.9% | Vercel 自动处理 |
| 响应时间 (P50) | < 100ms | — |
| 响应时间 (P95) | < 500ms | 邮件告警 |
| 响应时间 (P99) | < 1000ms | 邮件告警 |
| 构建时间 | < 120s | — |
| 带宽 | Hobby 计划限额 | 接近限额时告警 |

### 应用性能监控

#### Vercel Analytics（推荐）

```typescript
// next.config.js
module.exports = {
  // Vercel Analytics 自动启用
};

// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 核心 Web 指标 (Core Web Vitals)

| 指标 | 目标 | 说明 |
|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 运势卡片渲染完成 |
| FID (First Input Delay) | < 100ms | 用户交互响应 |
| CLS (Cumulative Layout Shift) | < 0.1 | 运势内容加载稳定性 |
| TTFB (Time to First Byte) | < 200ms | 服务器响应速度 |

### 错误追踪

#### 方案：Sentry（免费层）

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% 采样
  environment: process.env.NODE_ENV,
  
  // 忽略已知的非关键错误
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error exception captured',
  ],
});
```

#### 告警规则

| 条件 | 级别 | 通知方式 |
|------|------|----------|
| 错误率 > 1% | Warning | 邮件 |
| 错误率 > 5% | Critical | 邮件 + Discord |
| 新错误类型出现 | Info | 邮件 |
| P95 延迟 > 1s 持续 5 分钟 | Warning | 邮件 |

### API 监控

```
GET /api/v1/fortune/today — 核心健康检查端点

成功响应：200 + 完整运势 JSON
失败响应：500 + 错误详情
```

#### 健康检查端点

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // 验证核心引擎可用
    const fortune = getDailyFortune(new Date());
    
    return Response.json({
      status: 'healthy',
      version: process.env.APP_VERSION,
      timestamp: new Date().toISOString(),
      engine: {
        score: fortune.score,
        ganZhi: fortune.ganZhi.day.name,
      },
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

#### 外部可用性监控

使用免费的 UptimeRobot 或 Better Uptime：

- 每 5 分钟检查 `/api/health`
- 状态页面：`status.devfortune.dev`
- 当宕机时通知 Discord + 邮件

---

## 运势引擎性能监控

### 计算性能基准

Core 引擎应保持毫秒级性能，通过 CI 中的性能测试持续监控：

```typescript
// benchmark.test.ts
import { bench, describe } from 'vitest';
import { getDailyFortune } from '@devfortune/core';

describe('Fortune Engine Performance', () => {
  bench('getDailyFortune', () => {
    getDailyFortune(new Date('2026-04-09'));
  }, {
    time: 1000,     // 运行 1 秒
    iterations: 100, // 至少 100 次迭代
  });
});

// 性能门槛：单次计算 < 10ms
// CI 中如果超过阈值则标记 Warning
```

### 包体积监控

```yaml
# .github/workflows/size.yml
- name: Check bundle size
  uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

| 包 | 体积上限 | 说明 |
|----|----------|------|
| @devfortune/core | < 50KB (gzip) | 纯计算引擎 |
| fortune-cli | < 200KB | 含模板数据 |
| fortune-vscode | < 200KB | 含模板 + 扩展代码 |

---

## CI/CD 监控

### GitHub Actions 监控

| 指标 | 目标 | 说明 |
|------|------|------|
| CI 通过率 | > 95% | main 分支 |
| CI 平均耗时 | < 5 分钟 | 全流程 |
| 部署成功率 | 100% | 自动部署 |

### 发布监控

每次发布后自动验证：

```yaml
# .github/workflows/post-release.yml
post-release-check:
  steps:
    - name: Verify npm publish
      run: npm view devfortune version

    - name: Verify web deployment
      run: curl -f https://devfortune.dev/api/health

    - name: Notify Discord
      run: |
        curl -X POST $DISCORD_WEBHOOK \
          -H "Content-Type: application/json" \
          -d '{"content": "v${{ github.ref_name }} 发布成功！"}'
```

---

## 社区健康指标

### GitHub 指标

| 指标 | 目标 | 追踪方式 |
|------|------|----------|
| Issue 首次响应时间 | < 48h | GitHub Insights |
| PR 审核时间 | < 72h | GitHub Insights |
| Issue 关闭率 | > 80%/月 | 月度统计 |
| 贡献者活跃度 | 月活 > 5 | GitHub Insights |

### 下载与安装指标

| 平台 | 追踪工具 | 频率 |
|------|----------|------|
| npm | npm-stat.com | 每周 |
| VS Code Marketplace | 扩展管理面板 | 每周 |
| GitHub Releases | Release 下载数 | 每版本 |
| Homebrew | brew audit 日志 | 每月 |

---

## 告警通知渠道

### 通知矩阵

| 事件 | 邮件 | Discord | GitHub Issue |
|------|------|---------|-------------|
| Web 宕机 | :white_check_mark: | :white_check_mark: | — |
| 错误率飙升 | :white_check_mark: | :white_check_mark: | — |
| CI 连续失败 | :white_check_mark: | — | — |
| 发布失败 | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 安全漏洞 | :white_check_mark: | — | :white_check_mark: |
| 依赖更新 | — | — | :white_check_mark: (Dependabot) |

### Discord Webhook 配置

```typescript
// 告警发送示例
async function sendAlert(level: 'info' | 'warning' | 'critical', message: string) {
  const colors = { info: 0x3498db, warning: 0xf39c12, critical: 0xe74c3c };
  
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `[${level.toUpperCase()}] DevFortune Alert`,
        description: message,
        color: colors[level],
        timestamp: new Date().toISOString(),
      }],
    }),
  });
}
```

---

## 成本控制

DevFortune 作为开源项目，优先使用免费或低成本的监控方案：

| 工具 | 用途 | 费用 |
|------|------|------|
| Vercel Analytics | Web 性能 | 免费（Hobby） |
| Sentry | 错误追踪 | 免费（5K events/月） |
| UptimeRobot | 可用性 | 免费（50 monitors） |
| GitHub Actions | CI/CD | 免费（公开仓库） |
| Discord Webhook | 告警通知 | 免费 |
| **合计** | | **¥0/月** |

---

## 仪表盘

### 项目概览仪表盘

建议在项目 README 或 Wiki 中维护一个实时状态面板：

```markdown
## 项目状态

[![CI](badge)](link) [![npm](badge)](link) [![Coverage](badge)](link)

| 指标 | 当前值 |
|------|--------|
| npm 周下载 | ![downloads](badge) |
| VS Code 安装 | ![installs](badge) |
| 构建状态 | ![build](badge) |
| 代码覆盖率 | ![coverage](badge) |
| 网站状态 | ![uptime](badge) |
```

### Grafana 仪表盘（可选，后期）

当项目规模增长后，可考虑搭建 Grafana 仪表盘整合所有指标。初期不需要，免费工具足够。
