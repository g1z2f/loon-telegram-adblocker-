# 美团去广告插件

[![Loon](https://img.shields.io/badge/Loon-3.2.0%2B-orange.svg)](https://nsloon.com/)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

基于成熟仓库重写的美团 App 开屏广告拦截插件，格式规范、规则精准、效果显著。

## 📖 参考来源

本插件参考了以下成熟且已验证有效的 Loon 插件仓库：

- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) - 羊毛脚本合集，包含大量成熟的去广告规则
- [PixivCat/Loon](https://github.com/PixivCat/Loon) - 精选 Loon 插件集合，规则准确可靠

通过深入研究这两个仓库中的插件格式、规则写法和脚本结构，确保本插件与成熟方案完全一致。

## ✨ 功能特性

- ✅ **开屏广告拦截** - 屏蔽美团 App 启动时的开屏广告
- ✅ **首页广告过滤** - 移除首页推荐流中的广告卡片
- ✅ **外卖广告屏蔽** - 过滤美团外卖中的推广内容
- ✅ **弹窗广告拦截** - 清理各类弹窗和浮层广告
- ✅ **加速启动** - 减少广告加载，提升应用启动速度
- ✅ **不影响功能** - 保留美团的正常业务功能（浏览、下单、支付等）

## 📋 系统要求

- **iOS 设备**（iPhone/iPad）
- **Loon 版本**: 3.2.0(590) 或更高版本
- **美团 App**: 最新版本
- **已配置 MITM 证书**（必需）

## 🚀 快速安装

### 方法一：直接导入（推荐）

1. **复制插件链接**：
   ```
   https://raw.githubusercontent.com/g1z2f/loon-telegram-adblocker-/main/MeituanAdBlock.plugin
   ```

2. **在 Loon 中导入**：
   - 打开 Loon App
   - 点击底部 **「配置」** 标签
   - 点击 **「插件」**
   - 点击右上角 **「+」** 按钮
   - 粘贴插件链接
   - 点击 **「确定」** 保存

3. **启用插件**：
   - 在插件列表中找到 **「美团去广告」**
   - 打开右侧的开关

### 方法二：手动配置

如果需要自定义配置，可以手动添加规则：

1. 下载 `MeituanAdBlock.plugin` 和 `meituan-adblocker.js`
2. 在 Loon 中添加本地脚本或使用自己的服务器托管
3. 更新 MITM 主机名（见下文）

## 🔧 MITM 证书配置

**重要提示**：本插件需要 MITM（中间人攻击）功能才能正常工作。

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

5. **配置主机名**（如使用直接导入，此步骤会自动完成）：
   ```
   *.meituan.com
   *.meituan.net
   *.sankuai.com
   ```

## 📖 使用说明

### 基本使用

1. 确保插件已启用
2. 确保 Loon 的 VPN 已连接
3. 打开美团 App
4. 启动时的开屏广告将自动被拦截

### 验证效果

#### 方法一：查看日志

1. **开启日志记录**：
   - 打开 Loon App
   - 点击底部 **「工具」** 标签
   - 点击 **「日志」**
   - 确保日志记录已开启

2. **查看拦截效果**：
   - 打开美团 App
   - 返回 Loon 查看日志
   - 查找 `[美团去广告 v2.0.0]` 相关日志
   - 如果看到 `✓ 已移除 X 个广告` 的日志，说明插件正在工作

3. **日志示例**：
   ```
   [美团去广告 v2.0.0] ✓ 已移除 3 个广告 (45678→38901 bytes)
   ```

#### 方法二：视觉验证

1. **测试开屏广告**：
   - 完全关闭美团 App（从后台移除）
   - 重新打开美团 App
   - 插件生效前：会显示几秒的开屏广告
   - 插件生效后：直接进入首页，无开屏广告

2. **测试首页广告**：
   - 浏览美团首页
   - 检查是否还有明显的广告卡片
   - 正常的商家推荐不会被拦截

## 🔍 技术原理

### 插件结构

本插件严格遵循 Loon 插件规范，包含以下部分：

#### 1. [General] 元数据
```
#!name=美团去广告
#!desc=拦截美团App开屏广告及推广内容
#!author=Loon AdBlocker
#!icon=https://...
#!openUrl=https://apps.apple.com/cn/app/id423084029
```

#### 2. [Rule] 域名规则
直接拦截广告相关域名：
- `ad.meituan.com` - 广告服务器
- `ads.meituan.com` - 广告投放
- `analytics.meituan.com` - 数据分析
- `adlog.meituan.com` - 广告日志
- 等等...

#### 3. [URL Rewrite] URL 重写
拦截特定路径的广告请求：
- `/adunion/` - 广告联盟
- `/advertisement/` - 广告内容
- `/splash/` - 开屏广告
- `/launch/` - 启动广告

#### 4. [Script] 脚本处理
使用 JavaScript 脚本过滤 API 响应中的广告数据：
- 解析 JSON 响应
- 递归查找广告字段
- 移除广告内容
- 返回清理后的数据

#### 5. [MITM] 主机名配置
指定需要解密的域名：
```
*.meituan.com, *.meituan.net, *.sankuai.com
```

### 广告识别规则

脚本会检测以下广告特征：

**字段名识别**：
- `splashAd`, `launchAd`, `openScreenAd` - 开屏广告
- `bannerAd`, `floatAd`, `popupAd` - 弹窗和浮层
- `adData`, `adInfo`, `adList` - 广告数据
- `promotionData`, `promotionInfo` - 推广内容

**内容属性识别**：
- `type: "ad"` - 类型标识
- `isAd: true` - 广告标记
- `itemType: "advertisement"` - 项目类型
- `adFlag: 1` - 广告标志

**URL 特征识别**：
- 跳转 URL 包含 `/ad/`, `/ads/`, `/advertisement`
- Splash 图片 URL
- 推广链接

## 🛠️ 故障排查

### 问题 1：开屏广告仍然显示

**可能原因和解决方法**：

1. **MITM 未正确配置**（最常见）
   - ✅ 检查证书是否已安装并信任
   - ✅ 前往 iOS **「设置」** → **「通用」** → **「关于本机」** → **「证书信任设置」**
   - ✅ 确保 Loon 证书已启用完全信任

2. **插件未启用**
   - ✅ 打开 Loon → **「配置」** → **「插件」**
   - ✅ 确保 **「美团去广告」** 插件开关为开启状态

3. **Loon VPN 未连接**
   - ✅ 确保 Loon 的 VPN 连接已启动
   - ✅ 状态栏应显示 VPN 图标

4. **缓存问题**
   - ✅ 完全关闭美团 App（从后台移除）
   - ✅ 重新打开美团 App

### 问题 2：美团无法正常使用

**可能原因和解决方法**：

1. **规则过于严格**
   - ✅ 暂时关闭插件测试
   - ✅ 如果关闭后正常，可能需要调整规则

2. **网络连接问题**
   - ✅ 检查网络连接是否稳定
   - ✅ 尝试切换网络环境

3. **与其他插件冲突**
   - ✅ 暂时关闭其他修改美团流量的插件
   - ✅ 逐个开启测试，找出冲突的插件

### 问题 3：部分广告仍然显示

**可能原因和解决方法**：

1. **美团 API 更新**
   - ✅ 检查是否有插件更新
   - ✅ 前往 [GitHub Issues](https://github.com/g1z2f/loon-telegram-adblocker-/issues) 反馈

2. **新的广告类型**
   - ✅ 提供详细反馈（日志、截图）
   - ✅ 帮助我们改进插件

### 问题 4：如何确认 MITM 是否正常工作？

**验证步骤**：

1. **查看 Loon 日志**：
   - 打开 Loon 日志
   - 使用美团 App
   - 应该能看到 `meituan.com` 相关的请求记录

2. **查看脚本执行日志**：
   - 日志中应该包含 `[美团去广告]` 的输出
   - 如果完全看不到脚本日志，说明 MITM 未生效

## 📝 文件说明

### MeituanAdBlock.plugin
Loon 插件配置文件，定义了：
- 插件元数据
- 域名拦截规则
- URL 重写规则
- 脚本配置
- MITM 主机名

### meituan-adblocker.js
核心 JavaScript 脚本，功能包括：
- 解析 API 响应
- 递归过滤广告内容
- 处理多种数据结构
- 精准识别广告特征

## 🔄 更新日志

### v2.0.0 (2024-10-26)
- ✨ 基于成熟仓库完全重写
- ✅ 参考 [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) 和 [PixivCat/Loon](https://github.com/PixivCat/Loon)
- ✅ 优化插件格式，符合 Loon 最新规范
- ✅ 简化脚本逻辑，提高处理效率
- ✅ 增加更多美团特定域名和规则
- ✅ 改进广告识别算法，减少误判
- ✅ 使用 `reject-dict` 替代 `reject`，减少响应时间
- ✅ 优化日志输出，更清晰的调试信息
- ✅ 完善文档，添加参考来源说明

### v1.0.0
- 🎉 首次发布

## ⚠️ 注意事项

1. **隐私安全**：
   - MITM 会解密 HTTPS 流量，请确保仅在可信设备上使用
   - 不要在公共 WiFi 环境下启用 MITM
   - 建议仅对必要的域名启用 MITM

2. **使用限制**：
   - 本插件仅供学习和个人使用
   - 请遵守美团服务条款
   - 不保证 100% 屏蔽所有广告

3. **兼容性**：
   - 仅支持 iOS 平台的 Loon 应用
   - 美团 API 更新可能影响插件效果
   - 建议定期更新插件以获得最佳效果

4. **性能影响**：
   - 插件会处理 API 响应，可能轻微影响加载速度
   - 对正常使用影响很小，可忽略不计

## 🤝 贡献指南

欢迎提交 Pull Request 或 Issue！

- 🐛 **Bug 报告**：如果发现广告未被屏蔽，请提供详细信息
- 💡 **功能建议**：欢迎提出改进建议
- 🔧 **代码贡献**：Fork 项目并提交 PR

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) - 提供了大量成熟的去广告规则参考
- [PixivCat/Loon](https://github.com/PixivCat/Loon) - 提供了规范的 Loon 插件格式参考
- Loon 开发团队 - 提供强大的网络工具
- 所有贡献者和使用者的支持

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/g1z2f/loon-telegram-adblocker-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/g1z2f/loon-telegram-adblocker-/discussions)

---

**免责声明**：本项目仅供学习交流使用，使用本插件所产生的任何后果由使用者自行承担。请合理使用并遵守相关法律法规。

⭐ 如果这个项目对您有帮助，欢迎 Star！
