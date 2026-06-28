# 维护手册

这份文档记录自托管 FlareMo 的日常维护方式。

## 质量门禁

提交和发布前执行：

```bash
pnpm verify
pnpm deploy:dry-run
```

`pnpm verify` 会执行：

- TypeScript check
- Vitest
- production build
- Playwright E2E

`pnpm deploy:dry-run` 会构建前端并让 Wrangler 验证 Worker、Assets、D1、R2 和变量绑定。

## 数据库迁移

本地：

```bash
pnpm migrate:local
```

远端：

```bash
pnpm migrate:remote
```

改 schema 时：

```bash
pnpm db:generate
pnpm verify
```

生成的 SQL migration 必须提交。

## 备份

FlareMo 的主数据在 D1，附件在 R2。备份必须同时覆盖两者。

D1 备份建议使用 Cloudflare dashboard 或 Wrangler 导出能力生成 SQL dump，并把 dump 存到可信位置。

R2 备份建议使用 S3 兼容工具同步 bucket：

```bash
rclone sync flaremo-r2:flaremo-attachments ./backup/flaremo-attachments
```

不要只备份 D1。附件二进制不在 D1 里。

## 恢复

恢复顺序：

1. 创建新的 D1 database 和 R2 bucket。
2. 恢复 D1 dump。
3. 恢复 R2 对象。
4. 更新 `wrangler.jsonc` 的 D1 `database_id` 和 R2 bucket name。
5. 执行 `pnpm deploy:dry-run`。
6. 执行 `pnpm deploy`。
7. 检查 Access policy 和公开分享 bypass policy。

D1 migration 不等于备份。破坏性 migration 发布前必须先做 D1 dump。

## 线上排障

查看 Worker 日志：

```bash
pnpm exec wrangler tail
```

检查 D1 migrations：

```bash
pnpm exec wrangler d1 migrations list DB --remote
```

检查 R2 bucket：

```bash
pnpm exec wrangler r2 bucket list
```

生产实例如果启用了 Cloudflare Access，未带 Access Service Token 的脚本请求被拦截是预期行为。
