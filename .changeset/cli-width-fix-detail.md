---
'devfortune': minor
---

修复边框输出的 CJK 对齐（按终端显示宽度计算而非 String.length，汉字/全角/emoji 记 2 列），超宽内容自动折行；实现此前未生效的 `-D/--detail` 选项：text 模式附加五行分布/强度/缺失分析段，JSON 模式附加 `detail` 字段。
