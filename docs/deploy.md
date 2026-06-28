# 部署 FlareMo

FlareMo 部署到 Cloudflare Workers。Worker 同时承载前端静态资源和 API，D1 保存主数据，R2 保存附件。

## 一键部署

点击按钮会让 Cloudflare 从当前仓库创建一份新仓库，读取 `wrangler.jsonc`，自动创建需要的 D1 和 R2 资源，并配置 Workers Builds。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/realchendahuang/FlareMo)

公开入口的实测记录见 [deploy-button-test.md](./deploy-button-test.md)。

如果 Cloudflare Dashboard 还没有连接 GitHub 或 GitLab provider，创建页会先提示 `Connect a Git account to continue.`。这是 Cloudflare Workers Builds 的 Git 集成前置条件。

一键部署完成后还要做两件事：

- 在 Cloudflare Access 里保护 Worker 域名或自定义域名。
- 对远端 D1 执行 migrations。

```bash
pnpm migrate:remote
```

## 手动部署

安装依赖：

```bash
pnpm install
```

创建 D1 和 R2：

```bash
pnpm exec wrangler d1 create flaremo
pnpm exec wrangler r2 bucket create flaremo-attachments
```

把 D1 输出的 `database_id` 写到 `wrangler.jsonc`。

应用远端 migrations：

```bash
pnpm migrate:remote
```

部署：

```bash
pnpm deploy
```

部署前建议跑：

```bash
pnpm verify
pnpm deploy:dry-run
```

## Cloudflare Access

FlareMo 不在应用里做实例级登录。生产实例应该由 Cloudflare Access 保护。

建议配置：

- 人类访问：Access identity policy。
- 脚本、MCP 和 Memos-compatible 客户端：Access Service Token。
- 公开分享：对公开分享路径配置 bypass policy。

脚本访问示例：

```bash
curl "$FLAREMO_URL/api/v1/memos" \
  -H "CF-Access-Client-Id: $FLAREMO_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $FLAREMO_ACCESS_CLIENT_SECRET"
```

建议 bypass 的路径：

- `/share/*`
- `/api/public/shares/*`
- `/assets/*`

Bypass 只跳过 Cloudflare Access，不跳过 FlareMo 的 share token、过期时间和 memo 状态校验。

## 本地开发

```bash
pnpm migrate:local
pnpm dev
```

默认地址：

```text
http://localhost:8787
```

## 升级

升级前先看 `CHANGELOG.md` 和 release notes。只要 release notes 里提到 database migration，就先执行：

```bash
pnpm migrate:remote
```

再执行：

```bash
pnpm deploy
```

## 验证

部署完成后检查：

```bash
curl -I "$FLAREMO_URL"
curl "$FLAREMO_URL/openapi.json"
```

如果生产实例启用了 Cloudflare Access，未登录访问应看到 Access 登录页；脚本请求必须带 `CF-Access-Client-Id` 和 `CF-Access-Client-Secret`。
