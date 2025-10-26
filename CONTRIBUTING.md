# 贡献指南

感谢您考虑为 Telegram 广告屏蔽 Loon 插件做出贡献！

## 如何贡献

### 报告 Bug

如果您发现了 Bug，请通过 GitHub Issues 报告：

1. 搜索现有 Issues，确认问题未被报告
2. 创建新 Issue，使用清晰的标题
3. 详细描述问题：
   - 预期行为
   - 实际行为
   - 复现步骤
   - 设备信息（iOS 版本、Loon 版本）
   - 截图或日志（如果可能）

### 功能建议

我们欢迎新功能建议：

1. 在 Issues 中创建功能请求
2. 清楚说明功能的用途和价值
3. 如果可能，提供实现思路
4. 参与讨论，收集反馈

### 提交代码

#### 准备工作

1. **Fork 仓库**到您的 GitHub 账号
2. **Clone** 您的 Fork：
   ```bash
   git clone https://github.com/YOUR-USERNAME/loon-telegram-adblocker.git
   cd loon-telegram-adblocker
   ```
3. **创建分支**：
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

#### 开发规范

**JavaScript 代码规范**：

- 使用 4 空格缩进
- 使用驼峰命名法（camelCase）
- 函数和变量使用描述性名称
- 添加 JSDoc 注释说明函数用途
- 保持函数简洁，单一职责
- 使用 `const` 和 `let`，避免 `var`

示例：

```javascript
/**
 * 检查对象是否包含广告内容
 * @param {Object} obj - 要检查的对象
 * @returns {boolean} 是否为广告
 */
function isAdContent(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    // 实现逻辑...
}
```

**插件配置规范**：

- 保持配置文件格式一致
- URL 使用 HTTPS
- 注释使用中文，清晰说明
- 按功能分组规则

**文档规范**：

- 文档使用 Markdown 格式
- 使用中文编写（面向中文用户）
- 保持格式统一，使用标题层级
- 添加代码示例和截图

#### 提交代码

1. **测试您的修改**：
   - 在实际设备上测试插件
   - 确保不会破坏现有功能
   - 验证日志输出正常

2. **提交更改**：
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复某个问题"
   ```

3. **推送到您的 Fork**：
   ```bash
   git push origin feature/your-feature-name
   ```

4. **创建 Pull Request**：
   - 访问原仓库页面
   - 点击 "New Pull Request"
   - 选择您的分支
   - 填写 PR 描述：
     - 说明变更内容
     - 关联相关 Issue
     - 提供测试结果

### Commit 消息规范

使用约定式提交（Conventional Commits）格式：

```
<类型>: <简短描述>

[可选的详细描述]

[可选的脚注]
```

**类型包括**：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建或辅助工具变更

**示例**：

```
feat: 添加白名单功能

允许用户为特定频道启用广告显示

Closes #123
```

```
fix: 修复部分广告未被过滤的问题

- 更新广告关键字列表
- 改进递归过滤逻辑
- 添加更多测试用例
```

## 代码审查流程

1. 维护者会审查您的 PR
2. 可能会提出修改建议
3. 请及时响应反馈
4. 修改后会重新审查
5. 通过后会合并到主分支

## 开发环境

### 推荐工具

- **编辑器**：VS Code
- **插件**：
  - ESLint（代码检查）
  - Prettier（代码格式化）
  - Markdown All in One（文档编写）

### 本地测试

1. **托管脚本文件**：
   - 使用本地服务器（如 Python SimpleHTTPServer）
   - 或使用 GitHub Pages

2. **修改插件 URL**：
   - 在 Loon 中使用本地 URL
   - 测试脚本加载

3. **查看日志**：
   - 在 Loon 中启用日志
   - 观察脚本执行情况

### 调试技巧

**启用调试模式**：

在 `telegram-adblocker.js` 开头添加：

```javascript
const DEBUG = true;
```

这会输出更详细的日志信息。

**查看网络请求**：

使用 Loon 的网络日志功能：
1. 工具 → 网络日志
2. 筛选 Telegram 相关请求
3. 查看请求和响应数据

**测试特定场景**：

创建测试文件，模拟不同的 API 响应：

```javascript
// test-cases.js
const testCases = [
    {
        name: "包含赞助消息的响应",
        input: { /* ... */ },
        expected: { /* ... */ }
    }
];
```

## 文档贡献

文档同样重要！您可以：

- 修正错别字和语法错误
- 改进说明的清晰度
- 添加使用示例
- 翻译文档到其他语言
- 更新截图

文档文件：
- `README.md` - 主要文档
- `INSTALLATION.md` - 安装指南
- `CHANGELOG.md` - 变更日志
- `CONTRIBUTING.md` - 本文件

## 社区准则

### 行为准则

我们致力于提供友好、安全和欢迎的环境：

- ✅ 尊重不同观点和经验
- ✅ 优雅地接受建设性批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心
- ❌ 使用性别化语言或图像
- ❌ 人身攻击或政治攻击
- ❌ 公开或私下骚扰
- ❌ 未经许可发布他人隐私信息

### 沟通渠道

- **GitHub Issues** - Bug 报告和功能请求
- **GitHub Discussions** - 一般讨论和问答
- **Pull Requests** - 代码贡献

## 许可证

贡献的代码将采用项目的 MIT 许可证。

提交 PR 即表示您同意：
- 您的贡献将以 MIT 许可证发布
- 您拥有或有权贡献该代码
- 您的贡献不侵犯任何第三方权利

## 致谢

所有贡献者都会被列在项目的贡献者列表中。

感谢您的贡献！🎉

## 问题？

如果您有任何疑问，欢迎：
- 创建 GitHub Issue
- 在 Discussions 中提问
- 查看现有文档

---

再次感谢您的贡献！❤️
