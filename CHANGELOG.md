# 更新日志 / Changelog

本文件记录 DevFortune 项目所有版本的重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本 (Semantic Versioning)](https://semver.org/lang/zh-CN/)。

All notable changes to the DevFortune project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 计划中 / Planned

- 多语言支持（繁体中文、英文、日文）/ Multi-language support (Traditional Chinese, English, Japanese)
- 八字命盘分析模块 / BaZi natal chart analysis module
- 团队运势仪表盘 / Team fortune dashboard
- 自定义运势模板系统 / Custom fortune template system
- GitHub Action 集成 / GitHub Action integration
- 更多节气与传统节日映射 / Expanded solar term and traditional festival mappings
- 运势历史记录与趋势分析 / Fortune history and trend analytics

---

## [0.1.0] - 2026-04-09

首次公开发布。DevFortune 将天干地支与五行理论映射到程序员的日常编程活动中，提供每日运势推算。

Initial public release. DevFortune maps TianGan-DiZhi and WuXing theory onto daily programming activities to generate developer fortunes.

### Added / 新增

#### 核心引擎 / Core Engine

- **干支推算** (GanZhi Calculation)：基于农历日期计算年柱、月柱、日柱、时柱，支持六十甲子循环推算
- **五行分析** (WuXing Analysis)：根据日干支推算五行属性，计算五行之间的相生相克关系
- **运势生成** (Fortune Generation)：将五行生克结果映射到编程活动（编码、调试、重构、部署等），生成「宜」与「忌」建议
- **纳音五行** (NaYin WuXing)：支持六十甲子纳音查表，为运势增加传统纳音维度
- **节气感知** (Solar Term Awareness)：内置二十四节气数据，运势结果随节气变化动态调整

#### CLI 工具 / CLI Tool

- `devfortune` 命令：在终端输出当日运势，包含干支、五行、宜忌信息
- `--format json` 选项：以 JSON 格式输出运势数据，便于脚本集成
- `--format markdown` 选项：以 Markdown 格式输出运势，适合写入日志或文档
- `--date <YYYY-MM-DD>` 选项：查询指定日期的运势
- 彩色终端输出：五行属性使用对应传统色彩（金-白、木-青、水-黑、火-赤、土-黄）

#### VS Code 扩展 / VS Code Extension

- **状态栏运势** (Status Bar Fortune)：在 VS Code 状态栏显示当日运势摘要，包含五行图标
- **侧边栏面板** (Sidebar Panel)：专属侧边栏展示完整运势详情，包括干支信息、五行分析、宜忌列表
- **命令面板集成** (Command Palette)：注册 `DevFortune: 查看今日运势` 等命令，支持快捷键调用
- **每日通知** (Daily Notification)：每日首次打开 VS Code 时弹出运势通知
- **主题适配** (Theme Adaptation)：自动适配浅色和深色主题

#### Web 应用 / Web App

- 基础运势展示页面：展示当日干支、五行属性、运势详情
- 响应式布局：适配桌面端和移动端浏览器
- 五行属性可视化：以传统色彩和图形展示五行生克关系

#### 架构决策记录 / Architecture Decision Records

- **ADR-001**：核心引擎架构 — 选择纯函数式设计，确保运势计算的确定性和可测试性
- **ADR-002**：干支推算算法 — 选择基于天文历法的精确推算而非简化查表
- **ADR-003**：多平台分发策略 — 选择 monorepo 结构统一管理 CLI、VS Code 扩展和 Web 应用
- **ADR-004**：运势模板系统 — 选择数据驱动的模板方案，便于社区贡献运势文案
- **ADR-005**：国际化方案 — 选择 i18n 键值对方案，保留文化术语的原始拼音

#### 文档套件 / Documentation Suite

- 项目 README（中文，含快速开始、功能特性、技术栈说明）
- 贡献指南 (CONTRIBUTING.md)：涵盖代码贡献、运势文案贡献、提交规范
- 行为准则 (CODE_OF_CONDUCT.md)：基于 Contributor Covenant v2.1 的双语行为准则
- 领域术语表 (glossary.md)：天干地支、五行、天文历法、项目专用术语的双语释义
- CLI 使用文档：完整的命令行参数和用法说明
- VS Code 扩展文档：安装、配置和使用指南
- API 参考文档：核心引擎公开接口的完整说明
- 架构决策记录 (ADR)：5 篇架构决策文档

---

[Unreleased]: https://github.com/user/devfortune/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/user/devfortune/releases/tag/v0.1.0
