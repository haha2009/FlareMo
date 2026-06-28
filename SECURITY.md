# Security Policy

## 支持版本

当前只支持最新 release。FlareMo 仍处于早期版本，安全修复会优先进入最新版本。

## 报告漏洞

请不要把未公开漏洞直接发到公开 issue。

可以通过 GitHub Security Advisory 报告，或联系维护者在 GitHub profile 中公开的联系方式。

报告时请包含：

- 影响版本或 commit。
- 部署方式。
- Cloudflare Access 配置是否启用。
- 复现步骤。
- 影响范围。
- 建议修复方式，如果有。

## 安全边界

- FlareMo 生产实例应该放在 Cloudflare Access 后面。
- 人类访问由 Access identity policy 控制。
- 脚本、MCP 和 Memos-compatible 客户端通过 Access Service Token 访问。
- 公开分享路径可以 bypass Access，但分享内容仍由 FlareMo 的 share token、过期时间和 memo 状态校验。
- FlareMo 不签发应用内 Bearer token，也不维护实例级登录页。

## 不属于漏洞的情况

- 未配置 Cloudflare Access 导致实例公开。
- 公开分享 token 被主动分享后可访问。
- 本地开发环境 `.wrangler/` 或 `.dev.vars` 泄露；这些文件不应提交。
