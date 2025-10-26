# Telegram 广告屏蔽 Loon 插件

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Loon](https://img.shields.io/badge/Loon-3.2.0%2B-orange.svg)](https://nsloon.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Supported-blue.svg)](https://telegram.org/)

一个用于 iOS Loon 应用的 Telegram 广告屏蔽插件，能够有效移除 Telegram 频道中的赞助广告和推广内容。

## ✨ 功能特性

- ✅ 屏蔽 Telegram 频道中的 **Sponsored Messages**（赞助消息）
- ✅ 移除推广内容和广告追踪
- ✅ 过滤广告相关的 API 响应数据
- ✅ 不影响 Telegram 正常消息功能
- ✅ 自动处理 API 响应，无需手动配置
- ✅ 轻量级设计，不影响应用性能

## 📋 系统要求

- **iOS 设备**（iPhone/iPad）
- **Loon 版本**: 3.2.0 或更高版本
- **已配置 MITM 证书**（必需）

## 🚀 安装步骤

### 方法一：直接导入插件（推荐）

1. **复制插件链接**：
   ```
   https://raw.githubusercontent.com/loon-telegram-adblocker/main/TelegramAdBlock.plugin
   ```

2. **在 Loon 中导入插件**：
   - 打开 Loon App
   - 点击底部 **「配置」** 标签
   - 点击 **「插件」**
   - 点击右上角 **「+」** 按钮
   - 粘贴插件链接
   - 点击 **「确定」** 保存

3. **启用插件**：
   - 在插件列表中找到 **「Telegram 广告屏蔽」**
   - 打开右侧的开关

### 方法二：手动配置

如果您希望自定义配置，可以手动添加规则：

1. **下载文件**：
   - 下载 `TelegramAdBlock.plugin` 和 `telegram-adblocker.js`

2. **配置脚本**：
   - 在 Loon 中添加本地脚本或使用自己的服务器托管脚本文件

3. **更新 MITM 主机名**：
   - 在 Loon 的 MITM 设置中添加：
     ```
     *.telegram.org
     api.telegram.org
     ```

## 🔧 MITM 证书配置

**重要提示**：本插件需要 MITM（中间人攻击）功能才能正常工作，请确保已正确配置证书。

### 配置步骤

1. **生成证书**：
   - 打开 Loon App
   - 进入 **「配置」** → **「MITM」**
   - 点击 **「证书管理」**
   - 点击 **「生成新的 CA 证书」**

2. **安装证书**：
   - 点击 **「安装证书」**
   - 前往 iOS 系统 **「设置」** → **「已下载描述文件」**
   - 点击安装并输入密码

3. **信任证书**：
   - 前往 iOS **「设置」** → **「通用」** → **「关于本机」** → **「证书信任设置」**
   - 找到 Loon 证书并启用完全信任

4. **启用 MITM**：
   - 返回 Loon App
   - 在 **「MITM」** 页面打开开关

## 📖 使用说明

### 基本使用

1. 确保插件已启用
2. 确保 Loon 的 VPN 已连接
3. 打开 Telegram 应用
4. 浏览频道时，赞助广告将自动被屏蔽

### 验证插件是否工作

1. **查看日志**：
   - 打开 Loon App
   - 点击 **「工具」** → **「日志」**
   - 浏览 Telegram 频道
   - 查找 `[Telegram AdBlocker]` 相关日志

2. **测试频道**：
   - 访问一些大型公开频道（通常有赞助广告）
   - 检查是否还能看到 "Sponsored" 标签的消息
   - 如果广告消失，说明插件工作正常

### 常见问题排查

**问题 1：插件不生效**
- ✅ 检查插件是否已启用
- ✅ 检查 Loon VPN 是否已连接
- ✅ 检查 MITM 是否已开启并信任证书
- ✅ 确认 MITM 主机名中包含 `*.telegram.org`

**问题 2：Telegram 无法连接**
- ✅ 暂时关闭插件测试
- ✅ 检查 MITM 证书是否正确安装
- ✅ 检查网络连接是否正常

**问题 3：部分广告仍然显示**
- ✅ Telegram 可能更新了广告 API
- ✅ 请提交 Issue 反馈，我们会及时更新

## 🔍 技术原理

### 工作机制

1. **请求拦截**：通过 MITM 拦截 Telegram API 请求
2. **响应过滤**：JavaScript 脚本解析 API 响应数据
3. **广告识别**：检测响应中的赞助内容标识符
4. **内容移除**：从响应中移除广告相关字段和消息
5. **返回处理**：将清理后的数据返回给 Telegram 客户端

### 广告识别规则

插件会检测以下广告标识：

- `sponsored`、`sponsored_message`
- `sponsoredMessage`、`ads`
- `advertisement`、`promotion`
- `promoted`、`adsgram`
- 特定的 API 字段：`is_sponsored`、`sponsored_peer` 等

### 文件说明

- **TelegramAdBlock.plugin**: Loon 插件配置文件
  - 定义拦截规则
  - 配置脚本引用
  - 指定 MITM 主机名

- **telegram-adblocker.js**: 核心 JavaScript 脚本
  - 解析 API 响应
  - 递归过滤广告内容
  - 处理多种数据结构

## 📝 开发说明

### 本地开发

如果您想修改或测试插件：

1. **克隆仓库**：
   ```bash
   git clone https://github.com/loon-telegram-adblocker/loon-telegram-adblocker.git
   cd loon-telegram-adblocker
   ```

2. **修改脚本**：
   - 编辑 `telegram-adblocker.js` 添加新的过滤规则
   - 编辑 `TelegramAdBlock.plugin` 更新配置

3. **本地测试**：
   - 将文件托管到本地服务器或使用 GitHub
   - 在 Loon 中使用本地/测试 URL 导入

### 贡献指南

欢迎提交 Pull Request 或 Issue！

- 🐛 **Bug 报告**：如果发现广告未被屏蔽，请提供详细信息
- 💡 **功能建议**：欢迎提出改进建议
- 🔧 **代码贡献**：Fork 项目并提交 PR

### 更新日志

**v1.0.0** (2024-01-XX)
- ✨ 首次发布
- ✅ 支持基本的赞助消息屏蔽
- ✅ 递归过滤 API 响应
- ✅ 完整的文档和安装说明

## ⚠️ 注意事项

1. **隐私安全**：
   - MITM 会解密 HTTPS 流量，请确保仅在可信设备上使用
   - 不要在公共 WiFi 环境下启用 MITM
   - 建议仅对必要的域名启用 MITM

2. **使用限制**：
   - 本插件仅供学习和个人使用
   - 请遵守 Telegram 服务条款
   - 不保证 100% 屏蔽所有广告

3. **兼容性**：
   - 仅支持 iOS 平台的 Loon 应用
   - Telegram API 更新可能影响插件效果
   - 建议定期更新插件以获得最佳效果

4. **性能影响**：
   - 插件会处理 API 响应，可能轻微影响加载速度
   - 对正常使用影响很小，可忽略不计

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- Loon 开发团队提供的强大网络工具
- Telegram 为全球用户提供的优质即时通讯服务
- 所有贡献者和使用者的支持

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/loon-telegram-adblocker/loon-telegram-adblocker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/loon-telegram-adblocker/loon-telegram-adblocker/discussions)

---

**免责声明**：本项目仅供学习交流使用，使用本插件所产生的任何后果由使用者自行承担。请合理使用并遵守相关法律法规。

⭐ 如果这个项目对您有帮助，欢迎 Star！
