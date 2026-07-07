---
'@devfortune/core': minor
'devfortune': minor
---

节气改用太阳视黄经天文算法精确计算（修复节气边界前后年柱/月柱错误）；新增时柱推算（五鼠遁，`getHourPillar` / `getGanZhi(date, { includeHour: true })`）；新增 `getJieDay` / `getLiChunDay` 公开 API；修复 `exports` 类型条件顺序。
