# 📱 Telegram iOS 原生 App 去广告 - 快速参考

## 🚀 一键导入

```
https://raw.githubusercontent.com/g1z2f/loon-telegram-adblocker-/main/TelegramAdBlock.plugin
```

**步骤：** Loon → 配置 → 插件 → "+" → 粘贴链接 → 确定 → 启用

## 🎯 支持场景

✅ **尝试拦截：**
- 频道赞助消息（蓝色"广告"标签）
- CDN 广告资源（图片/视频）
- 第三方广告服务

⚠️ **技术限制：**
- MTProto 协议加密，无法解密
- 效果因网络环境而异
- 需要实际测试验证

## 📊 快速测试（3 分钟）

```
1️⃣ 导入插件并启用 (30秒)
2️⃣ 启动 Loon VPN (10秒)
3️⃣ 打开 Telegram，访问大型频道 (1分钟)
4️⃣ 查看 Loon 日志 (30秒)
```

## 🔍 判断是否有效

### ✅ 有效的迹象

```
Loon 日志显示：
[Telegram AdBlocker] [SUCCESS] ✓ 移除了 X 个广告项
[Telegram AdBlocker] [INFO] 📊 数据大小: 15234 → 12456 bytes
```

### ❌ 无效的迹象

```
Loon 日志显示：
[Telegram AdBlocker] [WARN] ⚠️ 检测到二进制数据（可能是 MTProto 协议）

或完全没有 Telegram AdBlocker 相关日志
```

## 🔧 高级配置

**如果基础配置无效，可尝试：**

### 方案 1：启用实验性脚本

编辑插件文件，修改：
```
enable=false → enable=true
```

### 方案 2：添加更多 MITM 域名

修改 `[MITM]` 段：
```
hostname = web.telegram.org, *.cdn.telegram.org
```

## 💰 最可靠方案

### Telegram Premium

```
价格：$4.99/月 或 $49.99/年
效果：100% 移除所有广告
订阅：Telegram → 设置 → Telegram Premium
```

**为什么推荐：**
- ✅ 唯一官方且完全有效的方法
- ✅ 支持 Telegram 的持续发展
- ✅ 获得额外高级功能

## 📖 详细文档

- 📱 **[iOS 原生 App 完整指南](README_IOS_NATIVE.md)** - 详细说明和故障排查
- ⚡ **[3 分钟快速测试](QUICK_TEST_TELEGRAM_IOS.md)** - 快速测试流程
- 🔬 **[技术研究报告](TECHNICAL_RESEARCH.md)** - MTProto 协议深度分析
- 📝 **[更新总结](UPDATE_SUMMARY_IOS.md)** - iOS 支持更新说明

## 🆘 需要帮助？

**常见问题：**
- **Q: 为什么还有广告？** → [查看 Q1](README_IOS_NATIVE.md#q1-为什么还是看到广告)
- **Q: 如何查看日志？** → [查看日志部分](README_IOS_NATIVE.md#-查看日志)
- **Q: 会影响使用吗？** → [查看 Q3](README_IOS_NATIVE.md#q3-会影响-telegram-正常使用吗)

**反馈渠道：**
- GitHub Issues: https://github.com/g1z2f/loon-telegram-adblocker-/issues
- GitHub Discussions: https://github.com/g1z2f/loon-telegram-adblocker-/discussions

## ⚖️ 重要说明

- ⚠️ 本插件为**实验性方案**
- ⚠️ 效果可能有限（取决于 Telegram 的网络实现）
- ⚠️ 建议配合 Telegram Premium 使用
- ✅ 即使无效，也可学习了解技术限制

---

💙 **支持 Telegram，订阅 Premium！**
