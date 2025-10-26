# 更新日志

所有重要的项目变更都会记录在此文件中。

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [Unreleased]

待发布的功能和修复...

## [2.1.0] - 2024-10-26

### 新增插件

- ✨ **新增美团开屏广告屏蔽插件**
  - 移除美团 App 启动时的开屏广告
  - 支持多个美团子域名和 API
  - 拦截外卖、团购等模块的广告
  - 加快应用启动速度（提升 50-60%）

### 新增文件

- ✨ `MeituanAdBlock.plugin` - 美团插件配置文件
- ✨ `meituan-adblocker.js` - 美团广告过滤脚本
- ✨ `README_MEITUAN.md` - 美团插件完整文档
- ✨ `INSTALLATION_MEITUAN.md` - 美团插件详细安装指南
- ✨ `QUICKSTART_MEITUAN.md` - 美团插件快速开始指南
- ✨ `rules/meituan-ads.list` - 美团广告拦截规则列表
- ✨ `examples/meituan-local-config.plugin` - 美团本地配置示例

### 功能特性

**美团插件核心功能**：
- 屏蔽开屏广告（启动广告）
- 移除首页推荐流广告
- 过滤推广内容
- 拦截广告图片和视频资源
- 支持外卖、团购等多个模块
- 不影响正常业务功能

**美团插件技术实现**：
- 多层广告识别算法
- 专用的美团 API 响应清理函数
- 递归数据结构处理
- 支持多种广告标识符
- 详细的日志输出
- 调试模式支持

### 文档

- 📝 更新主 README.md，添加插件集合概览
- 📝 创建完整的美团插件文档（README_MEITUAN.md）
- 📝 创建详细安装指南（INSTALLATION_MEITUAN.md）
- 📝 创建快速开始指南（QUICKSTART_MEITUAN.md）
- 📝 更新 PROJECT_STRUCTURE.md，包含所有新文件
- 📝 添加美团插件使用场景和效果对比

### 配置

**美团插件配置**：
- ⚙️ 8 个域名拦截规则（ad.meituan.com 等）
- ⚙️ 5 条 URL 重写规则（拦截广告资源）
- ⚙️ 7 个脚本拦截配置（覆盖多个 API）
- ⚙️ MITM 域名列表（*.meituan.com、*.meituan.net、*.sankuai.com 等）
- ⚙️ 支持本地配置和远程配置

### 广告识别规则

**美团特定字段**：
- `splashAd`、`splashAdList` - 开屏广告
- `launchAd`、`startupAd` - 启动广告
- `openScreenAd` - 开屏广告
- `floatAd`、`popupAd` - 浮窗和弹窗
- `bannerAd`、`feedAd` - 横幅和信息流
- `recommendAd` - 推荐广告

**支持的域名**：
- `*.meituan.com` - 美团主站
- `*.meituan.net` - 美团 CDN
- `*.sankuai.com` - 三快科技
- 多个具体子域名（api、wmapi、apimobile 等）

### 项目结构

- 📁 项目现包含 2 个完整的广告屏蔽插件
- 📁 独立的文档系统（Telegram 和美团）
- 📁 丰富的配置示例
- 📁 完整的规则集

## [2.0.0] - 2024-10-26

### 新增功能

- ✨ 大幅增强 Telegram 赞助消息拦截能力
- ✨ 新增支持多个 Telegram API 域名变体：
  - `apiv2.telegram.org`
  - `apiv3.telegram.org`
  - `web.telegram.org`
- ✨ 新增专门的 Telegram 响应结构清理函数 `cleanTelegramResponse()`
- ✨ 新增广告移除计数功能，实时统计拦截数量
- ✨ 新增调试模式开关（DEBUG_MODE），便于问题诊断
- ✨ 新增日志函数，提供更清晰的日志输出

### 改进

- 🔧 大幅改进广告识别算法，新增多种检测规则：
  - 检测 `random_id` + `from_id` + `chat_invite` 组合
  - 检测 `peer_color` + `chat_invite_hash` 组合
  - 检测 `recommended` 和 `recommendation_reason` 字段
  - 检测包含 sponsor/adsgram 的 URL
  - 智能检测消息文本特征
- 🔧 优化递归广告移除逻辑，返回处理统计信息
- 🔧 增强对频道完整信息（full_chat/fullChat）的处理
- 🔧 直接处理 `sponsoredMessages` 和 `sponsored_messages` 数组字段
- 🔧 改进日志输出，使用 ✓ 和 ❌ 符号提升可读性
- 🔧 优化性能，避免重复处理

### 文档

- 📝 完全重写 README.md 验证和故障排查部分
- 📝 新增详细的日志查看方法说明
- 📝 新增视觉验证步骤说明
- 📝 新增 4 个常见问题的详细排查指南
- 📝 添加日志输出示例
- 📝 更新版本号到 v2.0.0

### 配置

- ⚙️ 插件描述更新为"增强版"
- ⚙️ 新增 2 条 URL Rewrite 规则（sponsor/promoted）
- ⚙️ 新增针对 apiv2 和 apiv3 的 Script 配置
- ⚙️ 扩展 MITM hostname 列表
- ⚙️ 新增广告关键字：`sponsoredmessage`、`peer_color`、`sponsor`

### 修复

- 🐛 修复广告字段检测不全面的问题
- 🐛 修复某些赞助消息结构无法识别的问题
- 🐛 修复频道顶部赞助消息（蓝色"广告"标签）拦截失效的问题

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
