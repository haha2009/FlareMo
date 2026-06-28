# Deploy Button 实测记录

这份记录只保存当前公开入口的实测结论。每次修改 `wrangler.jsonc`、部署脚本、D1/R2 binding 或 README 部署入口后，都应该更新这份文档。

## 测试入口

[Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/realchendahuang/FlareMo)

## 当前结论

- 状态：部分通过
- 复测日期：2026-06-28
- 测试入口：内置浏览器打开公开 Deploy Button URL
- 结果：Cloudflare 正确重定向到 Workers 创建流程，并在 Dashboard URL 中携带 FlareMo 仓库地址；当前浏览器未登录 Cloudflare Dashboard，完整创建资源流程停在登录页。

已确认的跳转目标：

```text
https://dash.cloudflare.com/?to=/%3Aaccount/workers-and-pages/create/deploy-to-workers&repository=https%3A%2F%2Fgithub.com%2Frealchendahuang%2FFlareMo
```

完整新账号路径继续跟踪在 [issue #1](https://github.com/realchendahuang/FlareMo/issues/1)。

## 验收标准

- Cloudflare 能打开 Deploy Button 页面并识别 FlareMo 仓库。
- Cloudflare 能读取 Workers 项目配置。
- D1 database 和 R2 bucket 绑定能被部署流程识别。
- 部署完成后可以执行远端 D1 migrations。
- 生产访问由 Cloudflare Access 接管，FlareMo 不要求应用内 Bearer token。

## 部署后仍需人工确认

- Cloudflare Access application 和 policy 是否按自己的域名配置。
- 公开分享路径是否配置 bypass policy。
- 自定义域名、DNS 和证书是否完成。
- 首次导入真实数据前是否做过备份恢复演练。
