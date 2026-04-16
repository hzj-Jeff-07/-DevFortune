# ADR-001: 采用 Monorepo + 共享核心库架构

## 状态

已采纳

## 日期

2026-04-09

## 背景

DevFortune 项目需要同时交付三个端：Web 应用、CLI 命令行工具和 VS Code 扩展。三个端共享同一套天干地支推算引擎（core engine）、五行生克映射规则以及运势文案模板。如果将它们拆分为独立仓库，核心逻辑的修改需要在多个仓库之间同步版本、协调发布，开发效率会大幅下降。

团队当前规模较小（1-3 人），没有独立团队分别负责各端，因此不存在组织层面拆分仓库的需求。

## 决策

采用 pnpm workspace + Turborepo 构建 Monorepo，目录结构如下：

```
packages/
  core/          # 天干地支推算引擎，纯 TypeScript
  shared-types/  # 共享类型定义
apps/
  web/           # Web 前端应用
  cli/           # 命令行工具
  vscode/        # VS Code 扩展
```

所有端通过 workspace 协议（`workspace:*`）依赖 `@devfortune/core`，确保始终使用本地最新版本。Turborepo 负责构建编排、缓存和任务并行化。

## 备选方案

### 方案 B：Multi-repo（多仓库）

- **优点**：各端可以独立发布周期；CI/CD 互不影响；权限管控更灵活。
- **缺点**：核心引擎变更需要先发布 npm 包，再逐一更新各端的依赖版本；无法做到跨端的原子提交（atomic commit）；共享类型容易出现版本不一致导致的运行时错误。

### 方案 C：Git Submodules

- **优点**：表面上保持了独立仓库的灵活性，同时可以引用共享代码。
- **缺点**：submodule 的工作流复杂度高，开发者体验极差；版本固定在特定 commit，容易忘记更新导致版本漂移；CI 配置复杂，需要递归克隆。

## 后果

### 正面

- 核心引擎的任何变更可以在一个 PR 中同时更新所有端，保证一致性。
- pnpm 的硬链接机制节省磁盘空间，安装速度快。
- Turborepo 的远程缓存可以显著加速 CI 构建。
- 统一的 lint、测试、格式化配置，降低维护成本。
- 新贡献者只需克隆一个仓库即可开始开发。

### 负面

- 仓库体积会随时间增长，克隆时间变长。
- CI 需要配置变更检测（affected packages），避免每次都全量构建。
- 所有端共享一个 issue tracker，需要用 label 区分。

### 风险

- 如果未来团队规模扩大到需要独立发布节奏，可能需要迁移到多仓库。但 Monorepo 到 Multi-repo 的迁移路径是成熟的（可使用 git filter-branch 或 git subtree split）。

## 参考

- [pnpm Workspaces 文档](https://pnpm.io/workspaces)
- [Turborepo 官方文档](https://turbo.build/repo)
- Nrwl 团队关于 Monorepo 策略的技术博客
