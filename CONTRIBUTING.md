# Contributing

欢迎提交 issue 和 PR。FlareMo 是 Cloudflare 原生项目，改动要尊重当前架构边界。

## 开发

```bash
pnpm install
pnpm migrate:local
pnpm dev
```

## 提交前

```bash
pnpm verify
```

涉及 Cloudflare 配置、D1、R2 或部署脚本时：

```bash
pnpm deploy:dry-run
```

项目不使用 GitHub Actions 作为 CI。PR 作者需要在本地跑完门禁，并在 PR 里写明结果。

## PR 要求

- 描述用户可见变化。
- 说明是否影响 D1 migration。
- 说明是否影响 Memos 兼容 API。
- 说明是否影响 Cloudflare Access、D1、R2 或部署流程。
- 附上验证命令和结果。

## 架构边界

- D1 是主数据事实源。
- R2 只存附件、导出包和对象文件。
- Memos 兼容层是 adapter，不是第二套业务实现。
- 生产访问由 Cloudflare Access 处理。
- 不新增未实现功能入口。

## Issue

Bug report 请包含：

- 版本或 commit。
- 部署方式。
- Cloudflare 资源：Workers、D1、R2、Access 是否启用。
- 复现步骤。
- 期望结果和实际结果。
- 相关日志或截图。

Memos 兼容问题请说明客户端、请求路径、请求体和返回体。
