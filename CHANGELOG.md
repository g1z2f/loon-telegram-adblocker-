# 更新日志

所有重要的项目变更都会记录在此文件中。

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [Unreleased]

待发布的功能和修复...

## [1.0.0] - 2024-01-XX

### 新增功能

- ✨ 首次发布 Telegram 广告屏蔽 Loon 插件
- ✨ 支持屏蔽 Telegram 频道中的 Sponsored Messages（赞助消息）
- ✨ 实现 JavaScript 脚本递归过滤 API 响应中的广告内容
- ✨ 添加广告域名拦截规则集
- ✨ 支持过滤多种广告标识符：
  - `sponsored`、`sponsored_message`
  - `sponsoredMessage`、`ads`
  - `advertisement`、`promotion`
  - `promoted`、`adsgram`
- ✨ 自动处理 MTProto API 响应结构
- ✨ 添加详细的控制台日志输出

### 文档

- 📝 创建完整的 README.md 中文文档
- 📝 添加详细的 INSTALLATION.md 安装指南
- 📝 包含 MITM 证书配置说明
- 📝 提供常见问题排查指南
- 📝 添加技术原理说明

### 配置

- ⚙️ 创建 Loon 插件配置文件（.plugin 格式）
- ⚙️ 配置 URL 重写规则
- ⚙️ 配置 MITM 主机名列表
- ⚙️ 添加脚本引用和超时设置

### 规则

- 📋 创建广告域名拦截规则集
- 📋 添加 Telegram 广告追踪域名
- 📋 添加第三方广告网络拦截规则

### 其他

- 📄 添加 MIT 开源协议
- 📄 创建 .gitignore 文件
- 📄 初始化项目结构

## 版本说明

### 版本格式

版本号格式：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 变更
- **次版本号**：向下兼容的功能新增
- **修订号**：向下兼容的问题修正

### 变更类型

- `新增功能` - 新增的功能特性
- `变更` - 现有功能的变更
- `弃用` - 即将废弃的功能
- `移除` - 已移除的功能
- `修复` - Bug 修复
- `安全` - 安全性相关的修复
- `文档` - 文档变更
- `性能` - 性能改进
- `配置` - 配置文件变更
- `规则` - 规则集更新

## 未来计划

### v1.1.0 计划功能

- [ ] 支持更多 Telegram 广告类型识别
- [ ] 添加白名单功能，允许特定频道的广告
- [ ] 优化脚本性能，减少处理时间
- [ ] 添加统计功能，记录拦截的广告数量
- [ ] 支持配置选项，允许用户自定义过滤规则

### v1.2.0 计划功能

- [ ] 支持 Telegram Premium 特性检测
- [ ] 添加更智能的广告内容识别算法
- [ ] 支持多语言广告识别
- [ ] 优化内存使用
- [ ] 添加自动更新规则集功能

### 长期计划

- [ ] 创建 Web 管理面板
- [ ] 支持云端规则同步
- [ ] 提供 API 接口供第三方集成
- [ ] 开发 Surge、Quantumult X 版本
- [ ] 创建用户社区和反馈平台

## 贡献

欢迎提交 Pull Request 或 Issue 来帮助改进项目！

查看 [README.md](README.md) 了解如何贡献。

## 链接

- [项目主页](https://github.com/g1z2f/loon-telegram-adblocker-)
- [问题反馈](https://github.com/g1z2f/loon-telegram-adblocker-/issues)
- [讨论区](https://github.com/g1z2f/loon-telegram-adblocker-/discussions)

---

**注意**：本项目仅供学习和个人使用，请遵守相关法律法规和服务条款。
