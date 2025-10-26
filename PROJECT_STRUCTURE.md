# 项目结构说明

本文档说明项目的文件组织结构和各文件的用途。

## 目录结构

```
loon-telegram-adblocker/
├── .git/                           # Git 版本控制目录
├── .gitignore                      # Git 忽略文件配置
├── LICENSE                         # MIT 开源许可证
├── README.md                       # 项目主文档（中文）
├── INSTALLATION.md                 # 详细安装指南
├── CHANGELOG.md                    # 版本更新日志
├── CONTRIBUTING.md                 # 贡献指南
├── PROJECT_STRUCTURE.md            # 本文件 - 项目结构说明
├── TelegramAdBlock.plugin          # 主插件配置文件
├── telegram-adblocker.js           # 核心 JavaScript 脚本
├── examples/                       # 配置示例目录
│   ├── README.md                   # 示例说明文档
│   ├── local-config.plugin         # 本地托管配置示例
│   └── advanced-config.plugin      # 高级配置示例
└── rules/                          # 规则集目录
    └── telegram-ads.list           # Telegram 广告拦截规则

```

## 核心文件

### TelegramAdBlock.plugin

**用途**：Loon 插件主配置文件

**包含内容**：
- 插件元信息（名称、描述、作者等）
- 域名拦截规则（Rule 部分）
- URL 重写规则（URL Rewrite 部分）
- 脚本引用配置（Script 部分）
- MITM 主机名列表（MITM 部分）

**使用方式**：
```
在 Loon 中直接导入此文件的 URL
```

### telegram-adblocker.js

**用途**：核心广告过滤脚本

**主要功能**：
- 拦截 Telegram API 响应
- 解析 JSON 数据结构
- 递归识别和移除广告内容
- 处理多种广告标识符
- 输出日志信息

**关键函数**：
- `handleResponse()` - 主处理函数
- `removeAds()` - 递归广告移除
- `isAdContent()` - 广告内容识别
- `isAdField()` - 广告字段识别

**运行环境**：
- Loon 脚本引擎
- 支持 ES6 语法
- 可访问 `$response` 和 `$done` 对象

## 文档文件

### README.md

**用途**：项目主文档

**内容**：
- 项目简介和功能特性
- 系统要求
- 快速安装步骤
- 基本使用说明
- MITM 配置指引
- 常见问题解答
- 技术原理说明
- 贡献指南链接

**受众**：所有用户

### INSTALLATION.md

**用途**：详细安装和配置指南

**内容**：
- 分步安装说明（带截图说明位置）
- MITM 证书详细配置流程
- 验证插件工作的方法
- 详细的问题排查步骤
- 高级配置选项
- 卸载方法

**受众**：新手用户、需要详细指导的用户

### CHANGELOG.md

**用途**：版本更新记录

**内容**：
- 版本历史
- 每个版本的新增功能
- Bug 修复记录
- 重大变更说明
- 未来计划

**受众**：所有用户、贡献者

### CONTRIBUTING.md

**用途**：贡献者指南

**内容**：
- 如何报告 Bug
- 如何提交功能建议
- 代码贡献流程
- 代码规范要求
- 提交消息格式
- 开发环境配置
- 测试方法

**受众**：开发者、贡献者

### PROJECT_STRUCTURE.md

**用途**：项目结构说明（本文件）

**内容**：
- 目录结构图
- 各文件用途说明
- 文件关系说明
- 开发工作流

**受众**：开发者、新贡献者

## 配置示例

### examples/README.md

**用途**：配置示例说明

**内容**：
- 各示例文件的使用场景
- 配置选择建议
- 自定义配置方法
- 测试方法

### examples/local-config.plugin

**用途**：本地托管配置示例

**适用场景**：
- 需要自定义脚本
- 无法访问 GitHub
- 使用私有服务器

### examples/advanced-config.plugin

**用途**：高级配置示例

**特点**：
- 更多拦截规则
- 增强的隐私保护
- 扩展的域名列表

## 规则文件

### rules/telegram-ads.list

**用途**：广告域名拦截规则集

**格式**：Loon/Surge/Quantumult X 通用格式

**内容**：
- Telegram 广告域名
- 第三方追踪域名
- 广告网络域名
- URL 正则匹配规则

**使用方式**：
可以单独导入到 Loon 或其他代理工具

## 其他文件

### .gitignore

**用途**：Git 版本控制忽略规则

**包含**：
- 操作系统临时文件
- 编辑器配置文件
- 日志文件
- 临时文件

### LICENSE

**用途**：开源许可证

**类型**：MIT License

**允许**：
- 商业使用
- 修改
- 分发
- 私用

**要求**：
- 保留版权声明
- 保留许可证声明

## 文件关系

### 依赖关系

```
TelegramAdBlock.plugin
  ├─→ telegram-adblocker.js (脚本引用)
  └─→ rules/telegram-ads.list (规则引用)

README.md
  ├─→ INSTALLATION.md (详细指南链接)
  ├─→ CONTRIBUTING.md (贡献指南链接)
  └─→ CHANGELOG.md (版本历史链接)

examples/
  ├─→ telegram-adblocker.js (脚本引用)
  └─→ TelegramAdBlock.plugin (基础配置参考)
```

### 用户流程

```
1. 用户阅读 README.md
   ↓
2. 查看 INSTALLATION.md 了解详细步骤
   ↓
3. 导入 TelegramAdBlock.plugin 到 Loon
   ↓
4. Loon 自动下载 telegram-adblocker.js
   ↓
5. 插件开始工作，拦截广告
```

### 开发流程

```
1. 开发者阅读 CONTRIBUTING.md
   ↓
2. Fork 项目并创建分支
   ↓
3. 修改核心文件 (telegram-adblocker.js 等)
   ↓
4. 本地测试（使用 examples/ 中的配置）
   ↓
5. 更新 CHANGELOG.md
   ↓
6. 提交 Pull Request
```

## 添加新文件

### 添加新脚本

1. 在根目录创建新的 `.js` 文件
2. 在对应的 `.plugin` 文件中引用
3. 更新 README.md 说明新功能
4. 在 CHANGELOG.md 记录变更

### 添加新规则

1. 在 `rules/` 目录创建新的 `.list` 文件
2. 按照 Loon 规则格式编写
3. 在插件配置中引用（如需要）
4. 更新文档说明用途

### 添加新示例

1. 在 `examples/` 目录创建新配置
2. 在 `examples/README.md` 中说明用途
3. 提供使用方法和注意事项

## 维护指南

### 定期维护任务

**每周**：
- 检查 Issues 和 PR
- 更新广告域名列表
- 测试插件功能

**每月**：
- 审查代码质量
- 更新文档
- 发布小版本更新

**每季度**：
- 重构优化代码
- 添加新功能
- 发布大版本更新

### 版本发布流程

1. 更新 `CHANGELOG.md`
2. 测试所有功能
3. 更新版本号
4. 创建 Git Tag
5. 发布 GitHub Release
6. 更新文档中的链接

## 文件命名规范

### 通用规范

- 使用描述性名称
- 文档使用大写开头（如 `README.md`）
- 配置文件使用小写（如 `telegram-adblocker.js`）
- 多个单词使用连字符分隔（kebab-case）

### 插件文件

- `.plugin` 后缀
- 首字母大写驼峰命名
- 示例：`TelegramAdBlock.plugin`

### 脚本文件

- `.js` 后缀
- 全小写，连字符分隔
- 示例：`telegram-adblocker.js`

### 规则文件

- `.list` 后缀
- 全小写，连字符分隔
- 示例：`telegram-ads.list`

## 代码组织

### JavaScript 文件结构

```javascript
// 1. 文件头注释
/**
 * 文件说明
 */

// 2. 常量定义
const CONSTANT = 'value';

// 3. 工具函数
function utilityFunction() { }

// 4. 核心功能函数
function coreFunction() { }

// 5. 主执行代码
const result = mainFunction();
$done(result);
```

### 插件文件结构

```ini
# 1. 元信息
#!name=插件名称
#!desc=插件描述

# 2. 规则部分
[Rule]
...

# 3. URL 重写
[URL Rewrite]
...

# 4. 脚本
[Script]
...

# 5. MITM
[MITM]
...
```

## 总结

本项目采用清晰的文件组织结构：

- **核心文件**在根目录，便于快速访问
- **文档文件**详细完整，便于用户和开发者理解
- **示例配置**独立目录，提供参考
- **规则集**独立管理，便于维护更新

这种结构既便于用户使用，也便于开发者维护和扩展。

---

**最后更新**：2024-01-XX  
**维护者**：项目贡献者
