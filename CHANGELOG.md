# Changelog

FlareMo 使用 SemVer。每个 release 都要写清楚升级影响、Cloudflare 资源变化和 Memos 兼容面变化。

## v0.1.0

首个公开可部署版本。这个版本把 FlareMo 收口成 Cloudflare-native、Memos-compatible 的自托管笔记系统，并补齐开源项目所需的部署、协作、Agent、发版和安全文档。

### 已包含

- Cloudflare Worker + Workers Static Assets 一体部署。
- D1 schema 和 Drizzle migrations。
- R2 附件存储。
- memo、user、attachment、relation、share、setting 基础领域服务。
- Memos 兼容 `/api/v1` 子集。
- Flomo 风格的快速记录和时间线 UI。
- 搜索、标签筛选、归档、回收站、活动热力图。
- Memos 数据导入导出。
- OpenAPI 输出。
- MCP 端点。
- 中英文界面。
- Cloudflare Access 作为生产访问边界。
- Deploy to Cloudflare 按钮。
- 人工部署文档和 Agent 部署 runbook。
- 维护、备份和恢复手册。
- Memos 兼容矩阵。
- 发版规则、贡献指南、安全策略、issue template 和 PR template。
- `pnpm verify`、`pnpm migrate:local`、`pnpm migrate:remote`、`pnpm deploy:dry-run` 质量门禁。
- 本地 Vitest 配置排除 `dist`，避免构建产物重复进入测试。
- Playwright E2E 覆盖创建 memo 和标签筛选主路径。

### 约束

- 项目不使用 GitHub Actions 作为 CI。
- 发布前由维护者在本地执行 `pnpm verify` 和 `pnpm deploy:dry-run`。
- D1 是主数据事实源；R2 只存对象文件。
- 生产访问边界由 Cloudflare Access 处理。

### 升级说明

- 生产部署前执行 `pnpm migrate:remote`。
- 生产实例建议放在 Cloudflare Access 后面。
- 脚本、Memos-compatible 客户端和 MCP 使用 Access Service Token。
