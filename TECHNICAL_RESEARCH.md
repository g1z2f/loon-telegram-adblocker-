# Telegram 去广告技术研究报告

## 📋 研究目标

根据 ticket 要求，深入研究两个成熟的 Loon 插件仓库，查找是否已有 Telegram 去广告方案，并基于研究结果重写 Telegram 广告屏蔽插件。

## 🔍 参考仓库研究

### 1. fmz200/wool_scripts

**仓库信息：**
- GitHub: https://github.com/fmz200/wool_scripts
- Star: 高人气仓库（数千 star）
- 维护状态：活跃维护中
- 插件数量：730+ 个应用

**研究方法：**
```bash
git clone --depth 1 https://github.com/fmz200/wool_scripts.git
find /tmp/wool_scripts -type f -iname "*telegram*"
grep -ri "telegram" /tmp/wool_scripts --include="*.plugin" --include="*.js" -l
```

**研究结果：**

❌ **没有找到 Telegram 去广告插件**

找到的 Telegram 相关文件：
- `/icons/apps/Telegram_*.png` - 仅图标文件
- `/Scripts/*/sendNotify.js` - 仅通知推送脚本，使用 Telegram Bot API

**关键发现：**
1. 仓库包含 730+ 个应用的去广告规则
2. 包括微博、小红书、知乎、B站、抖音、快手等主流应用
3. 唯独**没有 Telegram 原生 App 去广告插件**
4. 说明：即使是最全面的中文 Loon 插件仓库也无法实现 Telegram 去广告

**借鉴的插件格式规范：**

```plugin
#!name = 插件名称
#!desc = 详细描述
#!author = 作者[链接]
#!homepage = 项目主页
#!icon = 图标地址
#!raw-url = 原始文件地址
#!tg-channel = Telegram 频道
#!category = 分类
#!tag = 标签, 标签2
#!system = iOS, iPadOS
#!loon_version = 版本要求
#!date = 更新日期
#############################################
# 详细的技术说明和注释
#############################################

[Rule]
# 规则段

[Rewrite]
# 重写段

[Script]
# 脚本段

[MITM]
hostname = 域名列表
```

**拒绝策略使用规范：**
- `reject` - 返回 404
- `reject-200` - 返回 200（空内容）
- `reject-img` - 返回 1px gif
- `reject-dict` - 返回空 JSON 对象 `{}`
- `reject-array` - 返回空 JSON 数组 `[]`
- `reject-drop` - 丢弃请求，不返回响应

### 2. PixivCat/Loon (RuCu6)

**仓库信息：**
- GitHub: https://github.com/PixivCat/Loon
- 维护状态：活跃维护
- 插件质量：高质量，代码简洁

**研究方法：**
```bash
git clone --depth 1 https://github.com/PixivCat/Loon.git
find /tmp/Loon -type f -iname "*telegram*"
```

**研究结果：**

✅ **找到 1 个 Telegram 相关插件**：`telegramdc.plugin`

**插件内容分析：**
```plugin
#!name = Telegram DC
#!desc = 电报数据中心分流。
#!author = RuCu6[https://github.com/RuCu6]
#!icon = https://raw.githubusercontent.com/RuCu6/Loon/main/Icons/app/telegram.png
#!date = 2024-04-29 23:55

[Rule]
IP-ASN, 62014, 新加坡时延优选, no-resolve
IP-ASN, 62041, 欧盟时延优选, no-resolve
IP-ASN, 44907, 欧盟时延优选, no-resolve
IP-ASN, 59930, 美国时延优选, no-resolve
IP-ASN, 211157, 美国时延优选, no-resolve
IP-CIDR, 5.28.192.0/18, 欧盟时延优选, no-resolve
IP-CIDR, 109.239.140.0/24, 欧盟时延优选, no-resolve
```

**分析结论：**
- ❌ **这不是去广告插件**
- ✅ 这是数据中心路由优化插件
- 功能：根据 IP-ASN 和 IP-CIDR 将 Telegram 流量分流到最优数据中心
- 目的：提高连接速度，降低延迟
- 与广告拦截无关

**关键发现：**
即使是知名的 Loon 插件作者 RuCu6，也只提供了路由优化，**没有提供去广告方案**。

### 3. 其他插件格式参考

**12306 去广告插件分析：**
```plugin
#!name = 12306去广告
#!desc = 过滤12306应用内广告及开屏广告
#!openUrl = https://apps.apple.com/app/id564818797
#!author = RuCu6[https://github.com/RuCu6]
#!tag = 去广告
#!loon_version = 3.2.1(749)

[Rule]
DOMAIN, ad.12306.cn, DIRECT

[Script]
http-request ^https:\/\/ad\.12306\.cn\/ad\/ser\/getAdList$ script-path=..., tag=移除12306开屏广告
http-response ^https:\/\/mobile\.12306\.cn\/otsmobile\/app\/mgs\/mgw\.htm$ script-path=..., tag=移除12306应用内广告

[MitM]
hostname = ad.12306.cn, mobile.12306.cn
```

**为什么 12306 可以去广告？**
1. 使用标准 HTTPS 协议
2. 广告通过独立的 API 接口加载
3. API 响应为可解析的 JSON 格式
4. 可以通过 MITM 拦截和修改

**为什么 Telegram 不能去广告？**
1. 使用 MTProto 专有加密协议
2. 广告嵌入在加密的消息流中
3. 没有独立的广告 API
4. MITM 无法解密 MTProto

## 🔬 技术深度分析

### MTProto 协议特性

**什么是 MTProto？**

MTProto 是 Telegram 开发的专有协议，具有以下特点：

1. **自定义加密**
   - 不使用标准的 TLS/SSL
   - 使用 AES-256-IGE 加密
   - 具有自己的密钥交换机制

2. **二进制协议**
   - 不是基于文本的 HTTP/JSON
   - 数据以二进制格式传输
   - 高度优化的数据结构

3. **端到端加密**
   - 客户端到服务器全程加密
   - 中间人无法解密内容
   - 即使是 Telegram 服务器也无法解密密聊

**MTProto 与 HTTPS 的对比：**

| 特性 | HTTPS (标准应用) | MTProto (Telegram) |
|------|-----------------|-------------------|
| 协议类型 | 标准 HTTP + TLS | 专有二进制协议 |
| 加密方式 | TLS 1.2/1.3 | AES-256-IGE |
| 可拦截性 | ✅ MITM 可解密 | ❌ MITM 无法解密 |
| 数据格式 | JSON/XML/HTML | 二进制 TL 序列化 |
| 广告拦截 | ✅ 可行 | ❌ 不可行 |

### MITM 工作原理

**标准 HTTPS 拦截（可行）：**

```
[客户端] ←→ [Loon MITM] ←→ [服务器]
    ↓            ↓            ↓
  TLS 握手    解密/修改    TLS 握手
   加密       查看内容      加密
```

1. Loon 作为中间人与客户端建立 TLS 连接
2. Loon 解密客户端发送的 HTTPS 流量
3. Loon 可以查看和修改 HTTP 请求/响应
4. Loon 重新加密并转发给服务器

**MTProto 拦截（不可行）：**

```
[Telegram App] ←→ [Loon MITM] ←→ [Telegram Server]
       ↓               ↓                ↓
  MTProto 加密    无法解密         MTProto 加密
  二进制数据      透明传输         二进制数据
```

1. Telegram 使用 MTProto 而非 TLS
2. Loon 无法识别 MTProto 握手
3. 所有数据对 Loon 来说是不可理解的二进制流
4. Loon 只能透明转发，无法解密或修改

### Telegram 广告加载机制

**赞助消息（Sponsored Messages）特点：**

1. **直接嵌入在消息流中**
   - 不是单独的 API 请求
   - 作为特殊类型的消息对象
   - 与普通消息一起通过 MTProto 传输

2. **服务器端决定**
   - 服务器决定是否显示广告
   - 基于用户是否订阅 Premium
   - 基于频道的订阅人数和活跃度

3. **客户端渲染**
   - 客户端识别 `sponsoredMessage` 类型
   - 显示蓝色"广告"标签
   - 显示"这是什么？"链接

**MTProto 数据包示例（简化）：**

```
[加密的二进制数据]
├─ Message ID: 12345
├─ Message Type: channel_messages
├─ Messages: [
│   ├─ { id: 1, text: "正常消息 1", ... }
│   ├─ { id: 2, text: "正常消息 2", ... }
│   ├─ { id: 3, _type: "sponsoredMessage", ... }  ← 广告
│   └─ { id: 4, text: "正常消息 3", ... }
│ ]
└─ [其他元数据]
```

**问题：**
- 整个数据包都是加密的
- MITM 看到的只是一堆二进制数据
- 无法识别哪部分是广告
- 无法修改或删除特定消息

## 🎯 可行性分析

### 技术方案评估

#### 方案 1：MITM 拦截 MTProto（❌ 不可行）

**尝试：**
- 拦截 api.telegram.org 的流量
- 尝试解析 MTProto 数据包

**结果：**
- ❌ MTProto 使用自定义加密
- ❌ 没有公开的解密工具
- ❌ 即使解密也违反 Telegram 的安全设计
- ❌ 违反加密通讯的基本原则

#### 方案 2：拦截 Telegram Web 版（⚠️ 理论可行，实际效果有限）

**尝试：**
- 拦截 web.telegram.org 的 HTTPS 流量
- 解析 Web API 的 JSON 响应
- 过滤 sponsored 字段

**结果：**
- ✅ Web 版使用标准 HTTPS
- ✅ 可以通过 MITM 解密
- ⚠️ 但大多数用户使用原生 App
- ⚠️ Web 版功能有限，使用率低
- ⚠️ 效果非常有限

#### 方案 3：DNS 拦截（❌ 不可行）

**尝试：**
- 拦截广告相关域名

**结果：**
- ❌ Telegram 广告不是通过独立域名加载
- ❌ 广告数据来自主 Telegram 服务器
- ❌ 拦截主域名会导致应用无法使用

#### 方案 4：修改客户端（⚠️ 可行但不在本插件范围）

**方法：**
- 使用第三方修改版客户端
- 修改源代码移除广告渲染逻辑

**结果：**
- ✅ 技术上可行
- ✅ 第三方客户端如 Nicegram 实现了部分功能
- ❌ 不是 Loon 插件可以实现的
- ❌ 需要用户安装不同的应用

#### 方案 5：Telegram Premium（✅ 官方推荐）

**方法：**
- 订阅官方 Premium 服务

**结果：**
- ✅ 完全移除所有广告
- ✅ 官方支持，稳定可靠
- ✅ 额外获得其他高级功能
- ✅ 支持 Telegram 的持续发展

## 📊 研究结论

### 主要发现

1. **两个成熟仓库都没有 Telegram 原生 App 去广告插件**
   - fmz200/wool_scripts：730+ 个插件，无 Telegram 去广告
   - PixivCat/Loon：仅有路由优化，无去广告

2. **技术原因明确**
   - MTProto 协议无法被 MITM 解密
   - 广告嵌入在加密消息流中
   - 没有独立的广告 API 可拦截

3. **行业共识**
   - 没有任何成熟的 Loon 插件仓库提供此功能
   - 说明这不是技术疏忽，而是技术不可行

### 推荐方案

基于研究结果，对用户的建议：

**✅ 推荐（有效）：**
1. 订阅 Telegram Premium（最佳方案）
2. 使用第三方客户端（如 Nicegram）
3. 使用修改版桌面客户端（谨慎）

**❌ 不推荐（无效）：**
1. 依赖 Loon 插件拦截原生 App 广告
2. 尝试 MITM 拦截 MTProto
3. 使用 DNS 屏蔽

### 本插件的定位

**实际价值：**
1. 提供完整的技术说明
2. 对 Web 版提供有限支持
3. 帮助用户理解技术限制
4. 引导用户使用有效方案

**诚实态度：**
1. 不做虚假宣传
2. 明确说明限制
3. 不误导用户期望
4. 提供真实的替代方案

## 🔗 参考资料

### Telegram 技术文档

1. **MTProto 协议**
   - https://core.telegram.org/mtproto
   - 官方协议文档

2. **Telegram API**
   - https://core.telegram.org/api
   - API 技术规范

3. **Sponsored Messages**
   - https://telegram.org/faq#q-do-you-have-ads
   - 官方关于广告的说明

### Loon 插件开发

1. **Loon 官方文档**
   - https://nsloon.com/
   - 插件开发指南

2. **MITM 原理**
   - 中间人攻击技术说明
   - TLS 拦截机制

### 研究仓库

1. **fmz200/wool_scripts**
   - https://github.com/fmz200/wool_scripts
   - 730+ Loon 插件集合

2. **PixivCat/Loon**
   - https://github.com/PixivCat/Loon
   - 高质量 Loon 插件

## 📝 更新日志

**2024-10-26**
- 完成两个参考仓库的深入研究
- 确认没有 Telegram 原生 App 去广告方案
- 分析 MTProto 协议限制
- 重写插件，明确技术限制
- 编写完整技术研究报告

---

**研究负责人**: loon-telegram-adblocker  
**研究日期**: 2024-10-26  
**报告版本**: 1.0
