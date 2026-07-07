---
'@devfortune/core': minor
'devfortune': minor
---

多语言支持（ADR-008）：core 新增 en-US 运势模板与五行映射（与 zh-CN 同一套 id 体系），`getDailyFortune(date, { locale: 'en-US' })` 输出英文文案；CLI 新增 `-l/--lang <zh|en>` 选项并自动跟随环境语言（LC_ALL/LC_MESSAGES/LANG），界面标签全部本地化。
