# Lumis

> **λύμη (lymē, 光) + ἴσος (isos, 等同) — 光的等价形态**

/ˈluːmɪs/ (卢米斯)

视频是光的动态流，首帧是光的静态等价形态，WebP 是光的压缩形态。

---

## 简介

Lumis 是一个跨平台桌面媒体处理工具，提供视频压缩、视频首帧截取和图片压缩功能。基于 Electron + Vue 3 + Vite + Vuetify 构建，核心媒体处理通过本地 Python 脚本实现。

## 功能特性

- 🎬 **视频压缩** — 减小视频文件体积，保持画质
- 🖼️ **首帧截取** — 从视频中提取第一帧作为预览图
- 📷 **图片压缩** — 优化图片大小，支持多种格式

## 技术栈

| 层级      | 技术        |
| --------- | ----------- |
| 运行时    | Electron    |
| 前端框架  | Vue 3       |
| 构建工具  | Vite        |
| UI 组件库 | Vuetify 3   |
| 包管理器  | pnpm        |
| 脚本语言  | Python 3.8+ |

## 支持格式

**视频**: MP4, AVI, MOV, MKV, WMV, FLV, WebM

**图片**: JPG, JPEG, PNG, GIF, BMP, WebP, TIFF

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Python >= 3.8
- pnpm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd lumis

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 启动 Electron 开发模式
pnpm electron:dev
```

### 构建

```bash
# 构建应用
pnpm build

# 构建 Electron 应用
pnpm electron:build
```

### 测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test:watch
```

## 项目结构

```
lumis/
├── electron/           # Electron 主进程
│   ├── main.ts         # 主进程入口
│   ├── preload.ts      # 预加载脚本
│   └── pythonRunner.ts # Python 脚本执行器
├── src/                # Vue 前端
│   ├── components/     # 组件
│   ├── views/          # 页面视图
│   ├── utils/          # 工具函数
│   └── plugins/        # 插件配置
├── scripts/            # Python 脚本
└── tests/              # 测试文件
```

## 许可证

MIT

## macOS 安全提示

由于本项目未使用 Apple Developer 证书进行签名，首次打开应用时 macOS 可能会提示"已损坏"或阻止打开。

### ⚡ 一键解决（推荐）

打开终端，复制粘贴以下命令并回车：

```bash
xattr -cr /Applications/Lumis.app && open /Applications/Lumis.app
```

应用会自动启动，之后就可以正常双击打开了。

---

### 其他方法

**右键打开**

1. 右键点击应用图标
2. 选择"打开"
3. 点击"打开"确认

**系统设置允许**

1. 打开"系统设置" > "隐私与安全性"
2. 找到提示"Lumis"被阻止的信息
3. 点击"仍要打开"

> **注意**：这些提示是因为应用未经过 Apple 官方签名认证，但不代表应用不安全。本项目代码完全开源，您可以自行审查源码。
