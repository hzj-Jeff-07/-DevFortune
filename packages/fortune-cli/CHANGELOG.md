# devfortune

## 0.2.0

### Minor Changes

- 1077c1e: CLI 新增 `-t/--time <HH:mm>` 选项，输出附加时柱（text/markdown/json 格式均支持）；`Fortune.ganzhi` 类型增加可选 `hour` 字段。
- 9f8057e: 修复边框输出的 CJK 对齐（按终端显示宽度计算而非 String.length，汉字/全角/emoji 记 2 列），超宽内容自动折行；实现此前未生效的 `-D/--detail` 选项：text 模式附加五行分布/强度/缺失分析段，JSON 模式附加 `detail` 字段。
- 0864fe5: 多语言支持（ADR-008）：core 新增 en-US 运势模板与五行映射（与 zh-CN 同一套 id 体系），`getDailyFortune(date, { locale: 'en-US' })` 输出英文文案；CLI 新增 `-l/--lang <zh|en>` 选项并自动跟随环境语言（LC_ALL/LC_MESSAGES/LANG），界面标签全部本地化。
- d1c9bd5: 节气改用太阳视黄经天文算法精确计算（修复节气边界前后年柱/月柱错误）；新增时柱推算（五鼠遁，`getHourPillar` / `getGanZhi(date, { includeHour: true })`）；新增 `getJieDay` / `getLiChunDay` 公开 API；修复 `exports` 类型条件顺序。

### Patch Changes

- 552ae79: 遵循 `NO_COLOR` 环境变量（https://no-color.org/），并在 stdout 非 TTY（管道/重定向）时自动禁用彩色输出，避免 ANSI 码污染下游。
- 35b7a80: 修复日主强度评分曲线的不连续（原实现在占比 0.1 与 0.5 处跳变、0.5 之后分数反而回升），改为单调分段线性；CLI 选项缺少参数值时告警而非吞掉下一个选项（如 `devfortune -d --brief` 不再把 `--brief` 当日期）。
- Updated dependencies [f7c1fc9]
- Updated dependencies [1077c1e]
- Updated dependencies [0864fe5]
- Updated dependencies [d1c9bd5]
- Updated dependencies [35b7a80]
  - @devfortune/core@0.2.0
