# Loon 广告屏蔽插件集合

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Loon](https://img.shields.io/badge/Loon-3.2.0%2B-orange.svg)](https://nsloon.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Limited-yellow.svg)](https://telegram.org/)
[![Meituan](https://img.shields.io/badge/Meituan-Supported-yellow.svg)](https://www.meituan.com/)

iOS Loon 应用的广告屏蔽插件集合，包含多个常用 App 的广告屏蔽功能。

## 📦 包含的插件

### 1. Telegram 去广告插件 ⚠️ 🆕 支持 iOS 原生 App

尝试屏蔽 iOS Telegram **原生 App** 频道中的赞助广告。采用实验性多层拦截策略，效果需实测验证。

**🎯 目标用户：** iOS Telegram 原生应用用户  
**⚡ 技术方案：** 多层过滤 + 实验性 HTTPS 拦截  
**⚠️ 重要说明：** 由于 MTProto 协议限制，效果可能有限，建议配合 Telegram Premium 使用

**[iOS 原生 App 专用指南](README_IOS_NATIVE.md)** | **[技术说明](#telegram-去广告-重要技术说明)**

### 2. 美团去广告插件 ✅

基于成熟仓库重写的美团 App 开屏广告拦截插件，格式规范、规则精准、效果显著。

参考来源：
- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)
- [PixivCat/Loon](https://github.com/PixivCat/Loon)

**[查看详细文档](README_MEITUAN.md)**

---

## Telegram 去广告 - 重要技术说明

## ⚠️ 技术限制与现实情况

### 🔒 MTProto 协议的限制

**Telegram 原生应用使用 MTProto 协议，这是一个：**

1. **端到端加密的专有协议**
   - 不是标准的 HTTPS/TLS 协议
   - 使用自定义的加密方式
   - 无法通过 MITM（中间人攻击）解密

2. **无法拦截的原因**
   - MITM 只能拦截标准 HTTPS 流量
   - MTProto 流量对 MITM 工具完全透明
   - 广告数据嵌入在加密的 MTProto 数据包中
   - Loon 无法解密或修改 MTProto 数据

3. **这意味着**
   - ❌ **无法拦截原生 iOS Telegram App 的频道赞助消息**
   - ❌ **无法移除蓝色"广告"标签的赞助内容**
   - ❌ **无法通过 MITM 修改 MTProto 传输的任何数据**

### 📊 研究结果

根据对两个成熟 Loon 插件仓库的深入研究：

1. **[fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)**
   - 包含 730+ 个 App 的去广告规则
   - ❌ **没有 Telegram 去广告插件**
   - 原因：技术上不可行

2. **[PixivCat/Loon](https://github.com/PixivCat/Loon)**
   - 包含多个 App 的优化插件
   - 仅有 Telegram DC 路由优化插件（用于选择最快的数据中心）
   - ❌ **没有 Telegram 去广告插件**
   - 原因：MTProto 协议限制

**结论：成熟的 Loon 插件仓库都没有提供 Telegram 原生 App 去广告方案，因为技术上无法实现。**

### ✅ 本插件能做什么

本插件可以尝试拦截：

1. **Telegram Web 版本** (web.telegram.org)
   - Web 版使用 HTTPS API
   - 理论上可以通过 MITM 拦截
   - ⚠️ 但效果非常有限

2. **第三方广告域名**
   - 拦截可能的外部广告服务
   - 防止第三方追踪

3. **某些第三方客户端**
   - 如果使用 HTTPS API 的第三方客户端
   - 可能有一定效果

### ❌ 本插件无法做什么

1. **原生 Telegram App**
   - ❌ 无法拦截 iOS/Android 官方 App 的赞助消息
   - ❌ 无法移除频道顶部的"广告"标签
   - ❌ 无法修改大型频道中的赞助内容

2. **MTProto 流量**
   - ❌ 无法解密 MTProto 协议
   - ❌ 无法修改加密的消息数据

## 💡 有效的替代方案

如果您想移除 Telegram 广告，建议使用以下方法：

### 1. Telegram Premium（推荐）✅

**官方订阅服务**
- 价格：约 $4.99/月
- 功能：完全移除所有广告
- 额外功能：
  - 更大的文件上传限制（4GB）
  - 更快的下载速度
  - 独特的贴纸和表情
  - 更多频道和群组
  - 语音转文字
- **这是唯一官方且完全有效的方法**

### 2. 第三方客户端 ⚠️

**iOS 平台：**

- **[Nicegram](https://nicegram.app/)**
  - 功能增强版 Telegram
  - 可能有广告过滤功能
  - 需要从 App Store 下载

- **[Telegram X](https://telegram.org/dl/ios/alternative)**
  - Telegram 官方实验版
  - 界面更现代
  - 广告显示可能不同

**注意事项：**
- 第三方客户端可能不如官方稳定
- 部分功能可能缺失
- 需要自行评估安全性

### 3. 桌面客户端修改版 ⚠️

- 某些第三方修改的桌面版可能移除了广告
- ⚠️ 使用非官方版本有安全风险
- 不推荐用于敏感通讯

## 🚀 如何使用本插件（效果有限）

### 系统要求

- **iOS 设备**（iPhone/iPad）
- **Loon 版本**: 3.2.0 或更高版本
- **已配置 MITM 证书**（必需）

### 安装步骤

#### 方法一：直接导入插件

1. **复制插件链接**：
   ```
   https://raw.githubusercontent.com/g1z2f/loon-telegram-adblocker-/main/TelegramAdBlock.plugin
   ```

2. **在 Loon 中导入插件**：
   - 打开 Loon App
   - 点击底部 **「配置」** 标签
   - 点击 **「插件」**
   - 点击右上角 **「+」** 按钮
   - 粘贴插件链接
   - 点击 **「确定」** 保存

3. **启用插件**：
   - 在插件列表中找到 **「Telegram 去广告」**
   - 打开右侧的开关

### MITM 证书配置

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

## 🔍 技术原理

### 插件工作方式

1. **拦截 Web 流量**
   - 通过 MITM 拦截 web.telegram.org 的 HTTPS 请求
   - 解析 JSON 响应数据

2. **过滤广告内容**
   - 识别响应中的赞助消息标识
   - 移除广告相关字段

3. **返回清理后的数据**
   - 将处理后的数据返回给浏览器
   - 用户看到的内容中广告被移除

### 为什么对原生 App 无效？

```
┌─────────────────┐
│  Telegram App   │
└────────┬────────┘
         │
         │ MTProto 加密协议
         │ (无法解密)
         │
         ↓
    ┌────────────────┐
    │  Loon (MITM)   │  ← 无法拦截
    └────────────────┘
         │
         ↓
    ┌────────────────┐
    │ Telegram 服务器 │
    └────────────────┘
```

**对比 Web 版本：**

```
┌─────────────────┐
│   浏览器/Web    │
└────────┬────────┘
         │
         │ HTTPS/JSON API
         │ (可以解密)
         │
         ↓
    ┌────────────────┐
    │  Loon (MITM)   │  ← 可以拦截 ✓
    └────────────────┘
         │
         ↓
    ┌────────────────┐
    │ Telegram 服务器 │
    └────────────────┘
```

## 📝 文件说明

### TelegramAdBlock.plugin

Loon 插件配置文件，包含：
- **[Rule]**: 域名拦截规则（第三方广告域名）
- **[Rewrite]**: URL 重写规则（Web 版广告路径）
- **[Script]**: JavaScript 脚本引用（处理 Web API 响应）
- **[MITM]**: 需要拦截的域名（仅 web.telegram.org）

### telegram-adblocker.js

核心 JavaScript 脚本，功能：
- 解析 Telegram Web API 响应
- 识别赞助消息标识
- 过滤广告相关字段
- 返回清理后的数据

**注意**：此脚本仅对 Web 版本有效。

## ❓ 常见问题

### Q1: 为什么原生 App 中仍然看到广告？

**A**: 这是正常的，因为：
- Telegram 原生 App 使用 MTProto 协议
- MITM 无法解密 MTProto 流量
- 本插件技术上无法拦截原生 App 的广告
- 这是协议层面的限制，无法通过插件解决

### Q2: 有没有办法拦截原生 App 的广告？

**A**: 目前没有通过 Loon 插件实现的方法。有效方案：
1. 订阅 Telegram Premium（推荐）
2. 使用第三方客户端（如 Nicegram）
3. 接受广告的存在（Telegram 用广告维持免费服务）

### Q3: 为什么其他 Loon 插件仓库没有 Telegram 去广告？

**A**: 因为：
- 成熟的插件开发者都知道 MTProto 无法拦截
- 技术上不可行，所以没有人开发
- 本仓库的 fmz200 和 PixivCat 都没有提供 Telegram 去广告

### Q4: Web 版本有效吗？

**A**: 理论上有效，但：
- 大多数人使用原生 App，不使用 Web 版
- Web 版功能相对有限
- 效果需要实际测试验证

### Q5: 插件会影响 Telegram 正常使用吗？

**A**: 不会，因为：
- 插件只拦截 web.telegram.org
- 不影响原生 App 的 MTProto 流量
- 如有问题可随时关闭插件

## 📊 参考研究

本插件基于以下仓库的深入研究：

### 1. fmz200/wool_scripts

- **仓库地址**: https://github.com/fmz200/wool_scripts
- **插件数量**: 730+ 个 App
- **研究结果**: 没有 Telegram 去广告插件
- **借鉴内容**: 
  - 插件格式规范（头部元数据、注释风格）
  - 规则编写方式（Rule、Rewrite、Script 分段）
  - 拒绝策略使用（reject-dict、reject-drop 等）

### 2. PixivCat/Loon

- **仓库地址**: https://github.com/PixivCat/Loon
- **研究结果**: 仅有 Telegram DC 路由插件，没有去广告插件
- **借鉴内容**:
  - 简洁的插件结构
  - 清晰的 MITM 配置
  - 元数据标注方式

### 技术结论

两个成熟仓库都没有 Telegram 原生 App 去广告方案，证明了：
- 这不是插件开发者的疏忽
- 而是技术上确实无法实现
- MTProto 协议是不可跨越的障碍

## 🎯 插件定位

**本插件的真实价值：**

1. ✅ 提供完整的技术说明，帮助用户理解限制
2. ✅ 对 Telegram Web 版本提供有限的广告拦截
3. ✅ 拦截第三方广告域名
4. ✅ 推荐用户使用真正有效的方案（Telegram Premium）
5. ✅ 教育用户了解 MTProto 协议的特性

**不做虚假宣传：**
- ❌ 不声称能拦截原生 App 广告
- ❌ 不误导用户产生不切实际的期望
- ❌ 不隐瞒技术限制

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- Loon 开发团队提供的强大网络工具
- Telegram 为全球用户提供的优质即时通讯服务
- fmz200/wool_scripts 和 PixivCat/Loon 提供的参考
- 所有贡献者和使用者的支持

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/g1z2f/loon-telegram-adblocker-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/g1z2f/loon-telegram-adblocker-/discussions)

---

**免责声明**：

1. 本项目仅供学习交流使用
2. Telegram 原生 App 的广告由 MTProto 协议传输，技术上无法通过 MITM 拦截
3. 建议使用 Telegram Premium 以获得最佳的无广告体验
4. 使用本插件所产生的任何后果由使用者自行承担
5. 请合理使用并遵守相关法律法规

⭐ 如果这个项目对您有帮助（即使效果有限），欢迎 Star 支持诚实的技术说明！
