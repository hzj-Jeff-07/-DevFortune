# 安全政策 / Security Policy

## 支持的版本 / Supported Versions

| 版本 | 支持状态 |
|------|----------|
| 0.1.x (最新) | :white_check_mark: 安全更新支持 |
| < 0.1 | :x: 不再支持 |

我们只为最新的次版本提供安全更新。建议用户始终使用最新版本。

---

## 报告漏洞 / Reporting a Vulnerability

**请勿通过 GitHub Issues 公开报告安全漏洞。**

如果你发现了安全问题，请通过以下方式私密报告：

### 推荐方式：GitHub Security Advisory

1. 前往项目的 [Security Advisories](../../security/advisories) 页面
2. 点击 **"Report a vulnerability"**
3. 填写漏洞详情

### 备选方式：邮件

发送邮件至：**security@devfortune.dev**

### 报告内容

请在报告中包含以下信息：

- **漏洞描述** — 问题的简要说明
- **影响范围** — 受影响的组件（Core / CLI / Web / VS Code）
- **复现步骤** — 如何触发该漏洞
- **潜在影响** — 你认为该漏洞可能造成的危害
- **建议修复** — 如果你有修复建议（可选）

### 响应时间

| 阶段 | 时间 |
|------|------|
| 确认收到 | 48 小时内 |
| 初步评估 | 5 个工作日内 |
| 修复发布 | 视严重程度，通常 7-30 天 |

---

## 安全设计原则

DevFortune 在设计上遵循以下安全原则：

### 1. 零网络依赖

Core 引擎不发起任何网络请求。所有运势计算在本地完成，不收集、不传输任何用户数据。

```
用户 → 本地计算引擎 → 运势结果
        ↑ 无网络请求
```

### 2. 最小权限

- **CLI 工具**：仅读取配置文件（`~/.devfortunerc`），不写入任何文件
- **VS Code 扩展**：仅使用 `ExtensionContext.globalState` 存储设置，不访问工作区文件
- **Web 应用**：无用户认证，无数据库，无持久化存储

### 3. 输入验证

所有外部输入都经过严格验证：

```typescript
// 日期输入验证
if (date < MIN_DATE || date > MAX_DATE) {
  throw new DateOutOfRangeError(date);
}

// 配置文件解析使用 JSON Schema 验证
// 命令行参数使用类型安全的解析器
```

### 4. 依赖安全

- Core 包**零运行时依赖**，从根本上消除供应链攻击风险
- 开发依赖定期通过 `npm audit` 检查
- 使用 Dependabot 自动更新依赖
- CI 中集成安全扫描

### 5. 模板安全

运势模板通过 JSON Schema 验证，防止注入恶意内容：

- 模板内容为纯文本，不包含可执行代码
- 社区贡献的模板需经过 Code Review
- Web 应用对模板内容进行 HTML 转义输出

---

## 安全考量清单

### Web 应用

| 检查项 | 状态 | 说明 |
|--------|------|------|
| XSS 防护 | :white_check_mark: | React 默认转义 + CSP headers |
| CSRF 防护 | :white_check_mark: | API 为只读，无状态修改 |
| SQL 注入 | N/A | 不使用数据库 |
| 速率限制 | :white_check_mark: | API 限制 100 req/min/IP |
| HTTPS | :white_check_mark: | Vercel 默认强制 HTTPS |
| CORS | :white_check_mark: | 配置允许的 origin |

### CLI 工具

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 命令注入 | :white_check_mark: | 不执行外部命令 |
| 路径遍历 | :white_check_mark: | 配置文件路径受限 |
| 信息泄露 | :white_check_mark: | 不输出敏感信息 |

### VS Code 扩展

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 最小权限 | :white_check_mark: | 不请求工作区访问权限 |
| 数据存储 | :white_check_mark: | 仅使用 ExtensionContext API |
| 遥测 | :white_check_mark: | 默认关闭，可选启用 |

---

## 遥测与隐私

- 所有功能**默认不收集任何数据**
- 可选的匿名遥测（`devfortune.telemetry: true`）仅收集：
  - 使用的命令（如 `showTodayFortune` 被调用的次数）
  - 运行环境信息（OS 类型、VS Code 版本）
- **绝不收集**：
  - 个人八字信息
  - 运势查询的具体日期
  - 任何可识别个人身份的信息
- 遥测数据使用匿名 UUID，无法追溯到具体用户

---

## 已知安全边界

以下是项目已知的安全边界，不视为漏洞：

1. **运势结果可预测** — 相同日期总是产生相同运势。这是设计如此（确定性计算），不是安全缺陷。
2. **本地配置文件明文存储** — `~/.devfortunerc` 中的个人八字信息以明文存储。八字信息不属于高敏感数据，且仅存在于用户本地。
3. **模板内容可自定义** — 用户可以使用自定义模板目录。自定义模板的内容安全由用户自己负责。

---

## 致谢

我们感谢所有负责任地报告安全问题的研究者。发现并报告有效漏洞的人员将在此致谢（经本人同意）。

| 报告者 | 漏洞 | 日期 |
|--------|------|------|
| *暂无* | — | — |
