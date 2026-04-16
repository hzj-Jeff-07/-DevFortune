# ADR-007: 运势更新策略 — 实时计算 + 按日缓存

## 状态

已采纳

## 日期

2026-04-09

## 背景

DevFortune 的核心功能是根据当天的天干地支和五行生克关系生成程序员运势。需要决定运势数据的更新机制：

1. **实时计算**：每次请求时现场推算当天的天干地支，然后生成运势。
2. **预生成**：通过定时任务（cron job）提前计算好未来一段时间的运势数据，存入数据库或文件系统，请求时直接读取。

决策需要考虑以下约束条件：

- 运势是**确定性的**：同一个日期，无论何时计算、由谁计算，天干地支推算结果完全相同。五行映射和模板选择也是确定性函数。换言之，`fortune(2026-04-09)` 永远返回相同结果。
- 推算性能很高：天干地支计算本质上是数学公式（取模运算 + 查表），单次计算耗时 < 10ms。
- 项目有三个端（Web、CLI、VS Code），每个端的运行环境和资源限制不同。
- 当前阶段不涉及个性化运势（即所有用户同一天看到相同结果），未来可能基于用户生日生成个性化内容。

## 决策

采用**实时计算 + 按日缓存**的策略。各端的具体实现方式如下：

### Web 端

利用 Next.js 的 ISR（Incremental Static Regeneration）机制：

```typescript
// app/[locale]/page.tsx
export const revalidate = 86400; // 每 24 小时重新生成

export default async function FortunePage() {
  const today = getTodayInCST(); // 北京时间今天的日期
  const fortune = calculateFortune(today); // 调用 @devfortune/core
  return <FortuneDisplay fortune={fortune} />;
}
```

- 首次访问时服务端计算运势并生成静态 HTML，后续访问直接返回缓存页面。
- 24 小时后下一次访问触发重新生成。
- API 路由（`/api/fortune`）同样采用 HTTP 缓存头（`Cache-Control: public, s-maxage=86400`）。

### CLI 端

每次调用时实时计算，不设缓存：

```typescript
// apps/cli/src/index.ts
const today = getTodayInCST();
const fortune = calculateFortune(today);
printFortune(fortune);
```

- CLI 是短生命周期进程，计算耗时 < 10ms，用户无感知。
- 无需维护本地缓存文件，实现最简单。

### VS Code 扩展端

每天首次激活时计算一次，结果缓存在 `ExtensionContext.globalState` 中：

```typescript
// apps/vscode/src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  const cachedDate = context.globalState.get<string>('fortuneDate');
  const today = getTodayInCST();

  if (cachedDate !== today) {
    const fortune = calculateFortune(today);
    context.globalState.update('fortuneDate', today);
    context.globalState.update('fortuneData', fortune);
  }

  const fortune = context.globalState.get('fortuneData');
  showFortuneInStatusBar(fortune);
}
```

- VS Code 扩展在后台常驻运行，如果每次显示运势都重新计算，虽然性能上没有问题，但缓存可以避免不必要的重复工作。
- `globalState` 由 VS Code 管理，自动持久化，重启编辑器后缓存依然有效。
- 当日期变更时（用户跨日工作），下次触发运势展示时会自动刷新。

### 缓存失效的统一原则

所有端使用北京时间（CST, UTC+8）作为日期判断基准，与 ADR-003 中天干地支推算的时区设定一致。缓存 key 统一为 `YYYY-MM-DD` 格式的日期字符串。

## 备选方案

### 方案 B：预生成 + 数据库存储

- **优点**：请求时只需读库，延迟最低且最稳定；可以提前生成数月甚至数年的运势数据；便于审核和人工编辑预生成的结果。
- **缺点**：需要引入数据库（PostgreSQL / SQLite / Redis），增加了基础设施复杂度和运维负担；需要定时任务（cron）定期生成数据，多一个需要维护的组件；当映射配置或模板变更时，需要重新生成所有受影响的数据；CLI 和 VS Code 端无法直接连接数据库，需要通过 API 中转，引入了网络依赖。

### 方案 C：预生成 + 静态文件（JSON）

- **优点**：无数据库依赖，JSON 文件可直接部署到 CDN；CLI 和 VS Code 端可以打包预生成数据，离线可用。
- **缺点**：需要提前决定预生成的时间范围（一年？十年？），存储量线性增长；当映射配置或模板变更时，需要重新生成全部文件并重新部署；生成逻辑本身的变更（如 core 引擎 bug 修复）需要触发全量重新生成。

### 方案 D：纯实时计算（无任何缓存）

- **优点**：实现最简单，没有缓存一致性问题。
- **缺点**：Web 端在高并发场景下会产生大量重复计算（虽然单次 < 10ms，但不必要）；无法利用 CDN 缓存静态页面，每次请求都需要服务端计算和渲染。

## 后果

### 正面

- 不需要数据库、不需要定时任务、不需要预生成流水线——架构极简，运维成本趋近于零。
- 运势内容始终由 `@devfortune/core` 当场计算，模板或映射配置变更后，下次缓存失效时自动生效，无需手动触发数据重生成。
- 各端可以独立实现最适合自己运行环境的缓存策略，不存在跨端的数据同步问题。
- CLI 端无需网络连接即可工作（完全离线可用）。
- 缓存策略对用户透明，用户始终看到正确的当日运势。

### 负面

- 如果未来引入个性化运势（基于用户生日的八字推算），缓存策略需要升级——缓存 key 需要加入用户唯一标识，缓存空间和失效策略都会变得更复杂。
- Web 端的 ISR 策略依赖 Next.js 和部署平台（Vercel），如果迁移到其他平台，需要重新实现缓存层。
- VS Code 端的 `globalState` 存储容量有限（通常数 MB），如果未来运势数据量增长（如加入详细解读、每日变化的配图），可能需要迁移到文件系统缓存。

### 风险

- 跨日工作场景：如果用户从 23:50（北京时间）工作到 00:10，需要确保日期切换时运势正确刷新。VS Code 端建议注册一个每日午夜触发的定时器（`setInterval` 或利用 `vscode.workspace.onDidChangeConfiguration`），主动检查日期变更。
- 时区边界问题：海外用户的本地时间与北京时间可能差异很大。需要在文档中明确说明运势以北京时间为准，并在 UI 上显示对应的日期。

## 参考

- [Next.js ISR 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [VS Code ExtensionContext.globalState API](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext)
- ADR-002：核心引擎零依赖约束（纯函数设计保证了确定性计算）
- ADR-003：立春为年界（时区统一使用北京时间）
