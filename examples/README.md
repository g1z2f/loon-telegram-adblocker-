# 配置示例

本目录包含各种配置示例，供不同需求的用户参考。

## 文件说明

### local-config.plugin

**适用场景**：
- 需要使用本地托管的脚本文件
- 无法访问 GitHub
- 需要自定义修改脚本

**使用方法**：
1. 下载 `telegram-adblocker.js` 到本地
2. 将脚本上传到您的服务器或云存储
3. 修改配置文件中的 `YOUR_LOCAL_SERVER_URL` 为实际地址
4. 在 Loon 中导入修改后的配置

**注意事项**：
- 确保脚本 URL 可被设备访问
- 使用 HTTPS 协议更安全
- 定期更新脚本文件

### advanced-config.plugin

**适用场景**：
- 需要更强的广告拦截效果
- 想要屏蔽更多追踪和统计
- 对隐私保护有较高要求

**特点**：
- 包含更多广告域名规则
- 拦截社交媒体追踪
- 屏蔽常见广告网络
- 增加超时时间（适合网络较慢的情况）

**使用方法**：
1. 直接在 Loon 中导入配置 URL
2. 或下载后根据需求自定义
3. 启用并测试效果

**注意事项**：
- 规则较多可能略微影响性能
- 部分正常服务可能被误拦截
- 如遇问题可适当删减规则

## 如何选择配置

### 推荐配置（新手）

使用主目录的 `TelegramAdBlock.plugin`：
- 配置简洁，易于理解
- 规则平衡，不影响正常使用
- 维护及时，定期更新

### 本地托管（进阶用户）

使用 `local-config.plugin`：
- 可以自定义修改脚本
- 不依赖外部链接
- 适合网络受限环境

### 高级配置（高级用户）

使用 `advanced-config.plugin`：
- 拦截规则更全面
- 隐私保护更强
- 需要一定调试经验

## 自定义配置

### 添加规则

在 `[Rule]` 部分添加：

```ini
# 拦截特定域名
DOMAIN-SUFFIX,example.com,REJECT

# 拦截包含关键字的域名
DOMAIN-KEYWORD,advertisement,REJECT

# IP 地址拦截
IP-CIDR,192.168.1.0/24,REJECT
```

### 修改脚本

编辑 `telegram-adblocker.js`：

```javascript
// 添加新的广告关键字
const AD_KEYWORDS = [
    'sponsored',
    'your_custom_keyword',  // 添加自定义关键字
    // ...
];
```

### 调整超时

在 Script 部分修改 `timeout` 参数：

```ini
# 默认 30 秒
timeout=30

# 网络慢时可增加到 60 秒
timeout=60
```

## 测试配置

### 基本测试

1. 导入配置到 Loon
2. 启用插件和 VPN
3. 打开 Telegram 浏览频道
4. 检查广告是否被屏蔽

### 查看日志

1. 打开 Loon
2. 工具 → 日志
3. 筛选 "Telegram" 相关
4. 确认脚本正常执行

### 性能测试

观察以下指标：
- 消息加载速度
- 频道切换流畅度
- 电池消耗情况
- 内存使用情况

如果性能下降明显，考虑使用更简化的配置。

## 常见自定义需求

### 1. 只屏蔽特定类型广告

修改脚本中的过滤逻辑，添加条件判断：

```javascript
if (content.ad_type === 'specific_type') {
    return true;  // 只拦截特定类型
}
```

### 2. 保留某些频道的广告

添加白名单检查：

```javascript
const WHITELIST_CHANNELS = ['channel1', 'channel2'];

function isWhitelisted(content) {
    return WHITELIST_CHANNELS.includes(content.channel_id);
}
```

### 3. 记录拦截统计

在脚本中添加计数器：

```javascript
let adCount = 0;

function removeAds(obj) {
    // ... 过滤逻辑 ...
    if (filtered) {
        adCount++;
        console.log(`已拦截 ${adCount} 个广告`);
    }
}
```

## 故障排查

### 配置不生效

- ✅ 检查插件是否启用
- ✅ 验证 URL 是否正确
- ✅ 确认 MITM 已配置

### 脚本错误

- ✅ 查看 Loon 日志中的错误信息
- ✅ 验证脚本 URL 可访问
- ✅ 检查 JavaScript 语法错误

### 误拦截

- ✅ 暂时禁用插件测试
- ✅ 检查具体被拦截的域名
- ✅ 调整规则或添加白名单

## 更多帮助

- 查看主 [README.md](../README.md)
- 阅读 [INSTALLATION.md](../INSTALLATION.md)
- 访问 [GitHub Issues](https://github.com/loon-telegram-adblocker/issues)

---

**提示**：修改配置后建议先在测试环境验证，确认无问题后再正式使用。
