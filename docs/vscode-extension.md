# VS Code 扩展文档

> DevFortune for VS Code — 在编辑器中查看程序员每日运势

## 安装

### 从 VS Code Marketplace 安装（推荐）

1. 打开 VS Code
2. 按 `Ctrl+Shift+X`（macOS: `Cmd+Shift+X`）打开扩展面板
3. 搜索 `DevFortune`
4. 点击 **Install**

或通过命令行安装：

```bash
code --install-extension devfortune.devfortune
```

### 手动安装 .vsix

```bash
# 从 GitHub Releases 下载 .vsix 文件后
code --install-extension devfortune-x.x.x.vsix
```

---

## 功能概览

### 1. 状态栏运势摘要

安装后，VS Code 底部状态栏会显示今日运势摘要：

```
🔮 ★★★★☆ 甲木逢生，宜写新功能
```

- 左侧显示运势评分星级
- 右侧显示一句话运势摘要
- 点击状态栏项可展开详细面板

### 2. 侧边栏详细面板

在 Activity Bar（左侧活动栏）中点击 🔮 图标，打开 DevFortune 侧边栏面板：

**面板内容：**

- 📅 **日期信息** — 公历、农历、干支纪日
- ⭐ **运势评分** — 1-5 星可视化评分
- 🔥 **五行分析** — 当日五行旺衰状态
- ✅ **今日宜** — 适合做的编程活动列表
- ❌ **今日忌** — 应避免的编程活动列表
- 💬 **运势寄语** — 完整的运势文案
- 🍀 **幸运元素** — 幸运编程语言、IDE 主题、数字

### 3. 每日通知

每天首次打开 VS Code 时，会弹出运势通知：

```
🔮 今日运势：★★★★☆
甲木逢生，如春笋破土。宜创建新项目，忌重构遗留代码。
[查看详情] [今日不再提醒]
```

### 4. 命令面板

按 `Ctrl+Shift+P`（macOS: `Cmd+Shift+P`）打开命令面板，输入 `DevFortune`：

| 命令 | 说明 |
|------|------|
| `DevFortune: Show Today's Fortune` | 显示今日运势详情面板 |
| `DevFortune: Show Fortune for Date...` | 查看指定日期运势 |
| `DevFortune: Show WuXing Analysis` | 显示详细五行分析 |
| `DevFortune: Copy Fortune to Clipboard` | 复制运势文案到剪贴板 |
| `DevFortune: Share Fortune Card` | 生成运势分享卡片 |
| `DevFortune: Toggle Status Bar` | 开关状态栏运势显示 |
| `DevFortune: Toggle Daily Notification` | 开关每日通知 |
| `DevFortune: Set Personal Bazi...` | 设置个人八字 |
| `DevFortune: Open Settings` | 打开扩展设置 |

### 5. 右键菜单

在编辑器中右键，可以看到 DevFortune 子菜单：

- **Insert Fortune Comment** — 在光标处插入今日运势作为代码注释
- **Check Code Fortune** — 分析当前文件适合做的操作

### 6. 运势分享卡片

通过命令面板执行 `Share Fortune Card`，生成精美的运势图片卡片，可以直接分享到社交媒体。

---

## 配置项

在 VS Code 的 `settings.json` 中配置以下选项：

### 显示设置

```jsonc
{
  // 是否在状态栏显示运势
  "devfortune.showInStatusBar": true,

  // 状态栏显示位置：left | right
  "devfortune.statusBarPosition": "right",

  // 状态栏显示优先级（数字越小越靠左）
  "devfortune.statusBarPriority": 100,

  // 状态栏显示样式：full | compact | score-only
  "devfortune.statusBarStyle": "compact",
  // full:    🔮 ★★★★☆ 甲木逢生，宜写新功能
  // compact: 🔮 ★★★★☆ 宜写新功能
  // score-only: 🔮 ★★★★☆
}
```

### 通知设置

```jsonc
{
  // 是否启用每日运势通知
  "devfortune.dailyNotification": true,

  // 通知弹出时机：onStartup | onFirstEdit | scheduled
  "devfortune.notificationTiming": "onStartup",

  // 计划通知时间（仅 scheduled 模式），格式 HH:mm
  "devfortune.notificationTime": "09:00",

  // 通知详细程度：brief | normal | detailed
  "devfortune.notificationLevel": "normal"
}
```

### 语言与本地化

```jsonc
{
  // 运势显示语言
  "devfortune.locale": "zh-CN",
  // 支持：zh-CN（中文简体）、en-US（English）
}
```

### 个性化

```jsonc
{
  // 个人八字（可选，用于个性化运势）
  "devfortune.personalBazi": {
    "year": "甲子",
    "month": "丙寅",
    "day": "戊辰",
    "hour": "庚午"
  },

  // 使用的运势模板集
  "devfortune.templateSet": "default",

  // 自定义运势模板目录
  "devfortune.customTemplatesPath": ""
}
```

### 高级设置

```jsonc
{
  // 运势数据缓存策略
  "devfortune.cacheStrategy": "daily",
  // daily: 每天缓存一次（推荐）
  // none:  每次重新计算

  // 是否启用遥测（匿名使用统计）
  "devfortune.telemetry": false,

  // 是否在 Debug 模式下显示运势（可能影响专注度）
  "devfortune.showDuringDebug": false,

  // 是否在 Zen 模式下隐藏运势
  "devfortune.hideInZenMode": true
}
```

---

## 快捷键

| 快捷键 | 命令 | 说明 |
|--------|------|------|
| `Ctrl+Shift+F` (自定义) | Show Today's Fortune | 显示今日运势 |

可在 `keybindings.json` 中自定义：

```json
{
  "key": "ctrl+shift+f",
  "command": "devfortune.showTodayFortune",
  "when": "editorTextFocus"
}
```

---

## 与其他扩展的兼容性

| 扩展 | 兼容性 | 说明 |
|------|--------|------|
| Chinese Calendar | 兼容 | 不冲突，DevFortune 使用自有干支推算引擎 |
| vscode-icons | 兼容 | 侧边栏图标正常显示 |
| GitLens | 兼容 | 状态栏位置不冲突 |
| Vim | 兼容 | 命令面板和右键菜单正常工作 |
| Remote - SSH | 兼容 | 运势在本地计算，不影响远程开发 |
| Live Share | 兼容 | 每位参与者看到自己的运势 |

---

## 常见问题

### Q: 状态栏图标不显示？

1. 确认 `devfortune.showInStatusBar` 设置为 `true`
2. 检查状态栏是否被其他扩展挤占（调整 `statusBarPriority`）
3. 尝试重启 VS Code

### Q: 运势什么时候更新？

每天零点自动更新。如果 VS Code 跨天运行，运势会在下一次窗口获得焦点时刷新。

### Q: 如何关闭每日通知？

- 方式一：在通知弹窗中点击"今日不再提醒"
- 方式二：设置 `"devfortune.dailyNotification": false`
- 方式三：命令面板执行 `DevFortune: Toggle Daily Notification`

### Q: 支持 VS Code 的哪些版本？

最低支持 VS Code 1.80.0。推荐使用最新稳定版。

### Q: 扩展体积多大？

打包后约 200KB（核心引擎 + 基础模板）。不包含任何网络请求，所有计算在本地完成。

### Q: 是否收集用户数据？

默认不收集任何数据。如果启用遥测（`devfortune.telemetry: true`），仅收集匿名的功能使用统计（如哪些命令被使用），不收集任何个人信息或运势结果。

---

## 卸载

1. 在扩展面板找到 DevFortune
2. 点击齿轮图标 → Uninstall
3. 重启 VS Code

或通过命令行：

```bash
code --uninstall-extension devfortune.devfortune
```
