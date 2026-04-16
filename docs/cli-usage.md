# CLI 使用文档

> `devfortune` — 在终端中查看程序员每日运势

## 安装

### npm（推荐）

```bash
npm install -g devfortune
```

### Homebrew（macOS / Linux）

```bash
brew install devfortune
```

### 二进制下载

前往 [GitHub Releases](https://github.com/your-username/devfortune/releases) 下载对应平台的预编译二进制文件。

支持的平台：
- macOS (arm64 / x64)
- Linux (x64 / arm64)
- Windows (x64)

---

## 基础用法

### 查看今日运势

```bash
devfortune
```

输出示例：

```
╭──────────────────────────────────────────────╮
│                                              │
│  📅 2026年4月9日  农历三月初三                  │
│  🏛️ 丙午年 壬辰月 甲子日                      │
│                                              │
│  🔥 五行：火旺木相  日主：甲木                  │
│  ⭐ 综合运势：★★★★☆  (4/5)                   │
│                                              │
│  ✅ 宜：                                      │
│     创建新项目 | 搭建脚手架 | 学习新框架        │
│     写技术方案 | 提交 PR                       │
│                                              │
│  ❌ 忌：                                      │
│     重构遗留代码 | 删除线上数据 | 大版本升级      │
│                                              │
│  💬 今日甲木逢生，如春笋破土。                   │
│     新想法纷至沓来，不妨大胆尝试！               │
│                                              │
│  🍀 幸运编程语言：Go                           │
│  🎨 幸运 IDE 主题：Monokai                    │
│  🔢 幸运数字：7                               │
│                                              │
╰──────────────────────────────────────────────╯
```

### 查看指定日期运势

```bash
devfortune --date 2026-04-15
devfortune -d 2026-04-15
```

### 查看详细五行分析

```bash
devfortune --detail
devfortune -D
```

会额外输出五行分布、生克关系分析等详细信息。

### 简洁模式

```bash
devfortune --brief
devfortune -b
```

输出示例：

```
🔮 04/09 ★★★★☆ 宜:写新功能 忌:重构 | 甲木逢生，大胆尝试
```

---

## 命令参数

```
devfortune [选项]

选项：
  -d, --date <date>       指定日期 (格式: YYYY-MM-DD)，默认今天
  -D, --detail            显示详细五行分析
  -b, --brief             简洁模式（单行输出）
  -f, --format <format>   输出格式: text (默认) | json | markdown
  -l, --lang <lang>       语言: zh (默认) | en
  -c, --no-color          禁用彩色输出
  -r, --raw               纯文本输出（无边框装饰）
  -v, --version           显示版本号
  -h, --help              显示帮助信息
```

---

## 输出格式

### JSON 格式

```bash
devfortune --format json
```

```json
{
  "date": "2026-04-09",
  "lunar": "三月初三",
  "ganZhi": {
    "year": "丙午",
    "month": "壬辰",
    "day": "甲子"
  },
  "wuXing": {
    "dayMaster": "wood",
    "state": "supporting"
  },
  "score": 4,
  "summary": "今日甲木逢生，如春笋破土",
  "yi": ["创建新项目", "搭建脚手架", "学习新框架"],
  "ji": ["重构遗留代码", "删除线上数据"],
  "lucky": {
    "language": "Go",
    "color": "Monokai",
    "number": 7,
    "direction": "东方"
  }
}
```

适合与其他工具管道组合：

```bash
# 获取今日运势评分
devfortune -f json | jq '.score'

# 获取宜做事项列表
devfortune -f json | jq '.yi[]'
```

### Markdown 格式

```bash
devfortune --format markdown
```

```markdown
## 📅 2026年4月9日 程序员运势

**干支：** 丙午年 壬辰月 甲子日
**五行：** 火旺木相
**运势：** ★★★★☆

### ✅ 宜
- 创建新项目
- 搭建脚手架
- 学习新框架

### ❌ 忌
- 重构遗留代码
- 删除线上数据

> 今日甲木逢生，如春笋破土。新想法纷至沓来，不妨大胆尝试！
```

---

## Shell 集成

### 每次打开终端显示运势

将以下内容添加到你的 Shell 配置文件中：

**Bash（~/.bashrc）：**

```bash
# DevFortune - 每日运势问候
if command -v devfortune &> /dev/null; then
  devfortune --brief
fi
```

**Zsh（~/.zshrc）：**

```zsh
# DevFortune - 每日运势问候
if (( $+commands[devfortune] )); then
  devfortune --brief
fi
```

**Fish（~/.config/fish/config.fish）：**

```fish
# DevFortune - 每日运势问候
if command -v devfortune &>/dev/null
  devfortune --brief
end
```

**PowerShell（$PROFILE）：**

```powershell
# DevFortune - 每日运势问候
if (Get-Command devfortune -ErrorAction SilentlyContinue) {
  devfortune --brief
}
```

### 作为 Git Hook

每次提交时查看运势（注意：仅供娱乐）：

```bash
# .git/hooks/post-commit
#!/bin/sh
echo ""
devfortune --brief
echo ""
```

### 与 tmux 集成

在 tmux 状态栏显示运势评分：

```bash
# ~/.tmux.conf
set -g status-right '#(devfortune -b -c 2>/dev/null || echo "🔮")'
```

### Cron 定时提醒

每天早上 9 点发送运势到桌面通知（macOS）：

```bash
# crontab -e
0 9 * * * devfortune --raw | terminal-notifier -title "DevFortune"
```

---

## 配置文件

DevFortune CLI 支持通过配置文件自定义默认行为。

### 配置文件位置

按优先级从高到低：
1. `--config <path>` 命令行参数
2. `.devfortunerc` 当前目录
3. `~/.devfortunerc` 用户主目录
4. `~/.config/devfortune/config.json`

### 配置项

```json
{
  "locale": "zh-CN",
  "format": "text",
  "colorEnabled": true,
  "showBorder": true,
  "showLucky": true,
  "showDetail": false,
  "briefMode": false,
  "templateSet": "default",
  "personalBazi": {
    "year": "甲子",
    "month": "丙寅",
    "day": "戊辰",
    "hour": "庚午"
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `locale` | string | `"zh-CN"` | 显示语言 |
| `format` | string | `"text"` | 输出格式 |
| `colorEnabled` | boolean | `true` | 是否启用彩色 |
| `showBorder` | boolean | `true` | 是否显示边框 |
| `showLucky` | boolean | `true` | 是否显示幸运元素 |
| `showDetail` | boolean | `false` | 是否默认显示详情 |
| `briefMode` | boolean | `false` | 是否默认简洁模式 |
| `templateSet` | string | `"default"` | 使用的模板集 |
| `personalBazi` | object | `null` | 个人八字（可选） |

---

## 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 成功 |
| `1` | 一般错误 |
| `2` | 参数错误 |
| `3` | 日期超出支持范围 |

---

## 常见问题

### Q: Windows 终端下图标显示为方块？

请确保终端使用支持 Unicode 的字体（推荐 Cascadia Code 或 Fira Code），或使用 `--raw` 参数禁用图标。

### Q: 运势结果和其他万年历不一致？

DevFortune 采用**立春**作为年界，而非正月初一。这是传统命理学的主流做法，但与部分民俗年历有差异。详见 [ADR-003](../adr/ADR-003-lichun-year-boundary.md)。

### Q: 如何每天自动更新运势？

CLI 工具每次运行都会实时计算，无需手动更新。运势结果是基于日期确定性计算的，同一天运行多次结果相同。

### Q: 支持哪些日期范围？

支持 1900-01-01 至 2100-12-31 的日期。超出范围会报错。

### Q: JSON 输出是否稳定？

在同一主版本内，JSON 输出的字段结构保持向下兼容。新增字段不会移除已有字段。
