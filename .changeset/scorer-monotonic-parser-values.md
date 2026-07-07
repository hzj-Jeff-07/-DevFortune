---
'@devfortune/core': patch
'devfortune': patch
---

修复日主强度评分曲线的不连续（原实现在占比 0.1 与 0.5 处跳变、0.5 之后分数反而回升），改为单调分段线性；CLI 选项缺少参数值时告警而非吞掉下一个选项（如 `devfortune -d --brief` 不再把 `--brief` 当日期）。
