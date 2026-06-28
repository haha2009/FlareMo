# 发版规则

FlareMo 使用 Git tag 和 GitHub Release 发布版本。项目不依赖 GitHub Actions；发布前由维护者在本地跑完整门禁。

## 版本号

使用 SemVer。

- `PATCH`：bugfix、文档修正、小 UI 修正，不改变部署方式和兼容 API。
- `MINOR`：新增能力、扩大 Memos 兼容子集、非破坏性 schema 变更。
- `MAJOR`：破坏性 API、破坏性 migration、部署方式或访问边界变化。

当前 `0.x` 版本仍按这个规则发布。只要影响自托管升级，就必须写清楚。

## 发布前门禁

```bash
pnpm verify
pnpm deploy:dry-run
```

涉及数据库变更时，还要检查：

```bash
pnpm exec wrangler d1 migrations list DB --local
```

涉及生产部署时：

```bash
pnpm migrate:remote
pnpm deploy
```

## Release notes 必须包含

- 主要变化。
- Memos 兼容面变化。
- 数据库 migration 说明。
- Cloudflare 资源或 Access 配置变化。
- 升级步骤。
- 已知问题。

## 发版命令

确认版本号后：

```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes-file CHANGELOG.md
```

如果 `CHANGELOG.md` 包含多个版本，不要直接整份作为 release notes。先准备只包含当前版本的 notes 文件。

## 回滚

代码回滚：

```bash
git checkout <previous-tag>
pnpm verify
pnpm deploy
```

D1 migration 回滚不能假设自动可逆。破坏性 migration 必须在 release notes 里写清楚备份和人工恢复方式。
