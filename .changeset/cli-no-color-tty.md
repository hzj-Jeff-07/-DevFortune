---
'devfortune': patch
---

遵循 `NO_COLOR` 环境变量（https://no-color.org/），并在 stdout 非 TTY（管道/重定向）时自动禁用彩色输出，避免 ANSI 码污染下游。
