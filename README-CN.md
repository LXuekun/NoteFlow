# NoteFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个现代化的本地优先笔记本应用，基于 **Tauri 2.0 + React + Rust + SQLite** 构建。

**[English](README.md)** | **[简体中文](README-CN.md)**

## 为什么开发 NoteFlow？

开发这个项目有两个主要目的：

1. **AI 编程练习**：通过实际开发一个完整的桌面应用，探索 AI 辅助软件开发的可能性，学习如何从零开始使用现代技术栈构建应用。

2. **真正安全的多设备同步**：市面上没有一个开源的笔记软件，支持同步到自己的云存储。大多数笔记软件要么不支持同步，要么强制使用厂商的云服务，用户对数据没有任何控制权。NoteFlow 解决了这个问题：
   - 使用你自己的 S3 兼容存储（MinIO、AWS S3、阿里云 OSS、腾讯云 COS）
   - 数据存储位置完全由你控制
   - 确保数据绝对安全——笔记永远保存在你的基础设施上
   - 简单、干净、易用

---

## 项目目标

### 核心目标

1. **本地优先架构**：数据存储在本地 SQLite 数据库，确保隐私保护和离线可用 - 无需外部数据库服务器
2. **现代化 Markdown 编辑**：完整支持 Markdown，实时预览、代码高亮、GFM（GitHub 风格 Markdown）
3. **零配置体验**：无需登录注册 - 打开即用
4. **跨平台支持**：基于 Tauri 构建，在 Windows、macOS 和 Linux 上提供轻量原生性能
5. **标签与文件夹组织**：灵活的分类系统，支持标签和嵌套文件夹
6. **云端同步（可选）**：使用 S3 兼容存储同步笔记（支持 MinIO、AWS S3、阿里云 OSS、腾讯云 COS）

### 主要功能

- Markdown 编辑器，实时预览
- 本地 SQLite 存储（无需配置）
- 标签管理，支持自定义颜色
- 文件夹组织，支持嵌套结构
- 笔记全文搜索
- 笔记置顶与归档
- 深色/浅色主题支持
- 自动保存功能
- 云端同步（S3 兼容存储）

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 | React 18 + TypeScript | UI 组件 |
| 构建工具 | Vite 5 | 快速开发服务器 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端 | Tauri 2.0 + Rust | 原生应用封装 |
| 数据库 | SQLite（通过 sqlx） | 本地持久化存储 |
| Markdown | @uiw/react-md-editor | 编辑与预览 |
| 搜索 | fuse.js | 模糊搜索 |
| 云同步 | S3 兼容 API | 跨设备同步 |

---

## 项目结构

```
note/
├── src/                          # React 前端
│   ├── main.tsx                  # 入口文件
│   ├── App.tsx                   # 根组件
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # 顶部导航
│   │   │   ├── Sidebar.tsx       # 左侧边栏
│   │   │   ├── MainContent.tsx   # 笔记编辑器/列表
│   │   │   └── SettingsPanel.tsx # 主题设置与同步配置
│   │   └── notes/
│   │       ├── NoteList.tsx      # 笔记列表视图
│   │       └── NoteEditor.tsx    # Markdown 编辑器
│   ├── hooks/                    # 自定义 React Hooks
│   ├── stores/                   # Zustand 状态存储
│   ├── types/                    # TypeScript 类型定义
│   └── utils/                    # 辅助函数
│
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs               # Tauri 入口
│   │   ├── commands/
│   │   │   └── mod.rs            # Tauri 命令（API）
│   │   ├── models/
│   │   │   └── mod.rs            # 数据模型
│   │   ├── sync/
│   │   │   ├── mod.rs            # 同步模块入口
│   │   │   ├── config.rs         # 同步配置
│   │   │   ├── s3_client.rs      # S3 兼容客户端
│   │   │   └── service.rs        # 同步服务
│   │   └── database/
│   │   │   └── mod.rs            # SQLite 连接管理
│   ├── Cargo.toml                # Rust 依赖配置
│   ├── tauri.conf.json           # Tauri 配置
│   └── icons/                    # 应用图标
│
├── assets/
│   └── wix314-binaries.zip       # WiX 工具（MSI 构建所需）
│
├── build_tauri.bat               # 开发构建脚本
├── build_release.bat             # 发布构建脚本
├── package.json                  # Node 依赖配置
├── vite.config.ts                # Vite 配置
├── tailwind.config.js            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 英文文档
└── README-CN.md                  # 中文文档（本文件）
```

---

## 快速开始

### 环境要求

#### Windows 环境

1. **Node.js 18+**
   ```bash
   # 从 https://nodejs.org 下载安装
   # 或使用 winget 安装
   winget install OpenJS.NodeJS.LTS
   ```

2. **Rust（MSVC 工具链）**
   ```bash
   # 从 https://rustup.rs 安装 rustup
   rustup-init.exe

   # 设置 MSVC 为默认工具链（Windows 必需）
   rustup default stable-x86_64-pc-windows-msvc
   ```

3. **Visual Studio Build Tools 2022**
   ```bash
   # 使用 winget 安装
   winget install Microsoft.VisualStudio.2022.BuildTools

   # 或手动安装，选择 "C++ 构建工具" 工作负载
   ```

#### macOS/Linux 环境

1. **Node.js 18+**
   ```bash
   # macOS (Homebrew)
   brew install node

   # Linux (apt)
   sudo apt install nodejs npm
   ```

2. **Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **额外依赖（Linux）**
   ```bash
   # Ubuntu/Debian
   sudo apt install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/noteflow.git
   cd noteflow
   ```

2. **安装前端依赖**
   ```bash
   npm install
   ```

   就这样！无需数据库配置 - SQLite 在首次运行时自动初始化。

### 开发运行

#### 方式一：使用批处理脚本（Windows 推荐）

```bash
# 运行准备好的批处理脚本，自动配置 VS 环境
build_tauri.bat
```

此脚本会：
- 初始化 Visual Studio MSVC 环境
- 设置 cargo PATH
- 运行 Tauri 开发服务器

#### 方式二：手动启动

```bash
# 同时启动前端和 Tauri 后端
npm run tauri dev
```

#### 方式三：分开启动

```bash
# 仅启动前端（用于前端开发）
npm run dev

# 启动 Tauri 后端（在另一个终端，需配置 VS 环境）
npm run tauri dev
```

### 开发地址

- 前端（Vite）：http://localhost:5173
- Tauri 窗口：自动打开

---

## 生产构建

### 创建发布版本

#### 方式一：使用发布构建脚本（Windows）

```bash
# 运行发布构建脚本
build_release.bat
```

此脚本会：
- 初始化 Visual Studio MSVC 环境
- 使用 `npm run build` 构建前端
- 使用 `cargo tauri build` 构建 MSI 和 NSIS 安装包

#### 方式二：手动构建

```bash
# 构建生产环境应用
cd src-tauri
cargo tauri build
```

生成的文件：
- **Windows**：`.msi` 安装包和 `.exe` 文件，位于 `src-tauri/target/release/bundle/`
- **macOS**：`.dmg` 和 `.app` 文件，位于 `src-tauri/target/release/bundle/`
- **Linux**：`.deb` 和 `.AppImage` 文件，位于 `src-tauri/target/release/bundle/`

### 构建输出

```
src-tauri/target/release/
├── noteflow.exe                        # 独立可执行文件（约 17 MB）
└── bundle/
    ├── msi/
    │   └── NoteFlow_1.0.0_x64_en-US.msi    # MSI 安装包（约 7 MB）
    └── nsis/
        └── NoteFlow_1.0.0_x64-setup.exe    # NSIS 安装包（约 5 MB）
```

---

## 云端同步

NoteFlow 支持使用 S3 兼容的云存储服务同步笔记，实现多设备间数据同步。

### 支持的存储服务

| 服务 | Endpoint 示例 |
|------|---------------|
| MinIO（自建） | `http://localhost:9000` |
| AWS S3 | `https://s3.amazonaws.com` |
| 阿里云 OSS | `https://oss-cn-hangzhou.aliyuncs.com` |
| 腾讯云 COS | `https://cos.ap-guangzhou.myqcloud.com` |

### 配置云端同步

1. 在应用中打开设置面板
2. 切换到"云同步"选项卡
3. 配置存储服务：
   - 选择服务商类型
   - 输入 Endpoint 地址
   - 输入 Region
   - 输入 Bucket 名称
   - 输入 Access Key ID 和 Secret Access Key
4. 点击"测试连接"验证配置
5. 启用同步，可选择自动同步间隔

### 同步配置存储位置

同步配置保存在：
- **Windows**：`%APPDATA%\NoteFlow\sync_config.json`
- **macOS**：`~/Library/Application Support/NoteFlow/sync_config.json`
- **Linux**：`~/.config/noteflow/sync_config.json`

### 同步数据格式

所有笔记、标签和文件夹导出为单个 JSON 文件：

```
Bucket 路径: noteflow/data.json
```

---

## 部署与运维

### 数据存储位置

应用数据存储在：
- **Windows**：`%APPDATA%\NoteFlow\noteflow.db`
- **macOS**：`~/Library/Application Support/NoteFlow/noteflow.db`
- **Linux**：`~/.local/share/noteflow/noteflow.db`

### 配置存储位置

应用配置存储在：
- **Windows**：`%APPDATA%\NoteFlow\`
- **macOS**：`~/Library/Application Support/NoteFlow/`
- **Linux**：`~/.config/noteflow/`

### 数据库备份

SQLite 是单文件数据库，备份非常简单：

```bash
# 备份数据库
# Windows
copy "%APPDATA%\NoteFlow\noteflow.db" "noteflow_backup.db"

# macOS/Linux
cp ~/Library/Application\ Support/NoteFlow/noteflow.db noteflow_backup.db

# 从备份恢复
# 将备份文件复制回数据存储位置即可
```

### 常用运维操作

#### 更新应用

1. 更新 `package.json` 和 `tauri.conf.json` 中的版本号
2. 构建新版本
3. 分发新安装包（设置和数据自动保留）

#### 迁移到新电脑

1. 从旧电脑复制 `noteflow.db` 文件
2. 放置到新电脑的数据存储位置
3. 所有笔记、标签和文件夹都会保留

---

## 常见问题排查

### 常见错误

#### 1. `cargo not found`
```
解决方案：将 Rust 添加到 PATH
Windows：使用 build_tauri.bat 或将 %USERPROFILE%\.cargo\bin 添加到 PATH
```

#### 2. `MSVC linker not found`
```
解决方案：安装 Visual Studio Build Tools 2022
winget install Microsoft.VisualStudio.2022.BuildTools
选择 "C++ 构建工具" 工作负载
```

#### 3. `icon.ico not found`
```
解决方案：生成图标
cargo tauri icon app-icon.png
```

#### 4. 应用窗口不显示
```
解决方案：检查前端构建
- 单独运行 npm run dev
- 检查 TypeScript 错误
- 验证 vite.config.ts 配置
```

#### 5. WiX 下载超时（发布构建时）
```
问题：中国大陆网络访问 GitHub 较慢，Tauri 需要从 GitHub 下载 WiX 工具

解决方案：使用项目自带的 WiX 工具
1. 解压 assets/wix314-binaries.zip
2. 将内容放置到：%LOCALAPPDATA%\tauri\WixTools314\
   或执行：unzip -o assets/wix314-binaries.zip -d "$LOCALAPPDATA/tauri/WixTools314"
3. 重新运行 build_release.bat
```

#### 6. 批处理文件编码问题（中文乱码）
```
问题：Windows CMD 期望 CP936/ANSI 编码，UTF-8 编码的批处理文件会显示乱码

解决方案：build_release.bat 使用英文注释避免编码问题。
如需创建自定义批处理文件，请避免使用中文字符，或保存为 ANSI 编码。
```

#### 7. NSIS 下载超时（发布构建时）
```
问题：中国大陆网络访问 GitHub releases 较慢

解决方案：首次成功下载后会缓存到本地。
如下载失败，请等待后重试，或使用 VPN/代理。
```

### 调试模式

```bash
# 启用详细日志运行
RUST_LOG=debug npm run tauri dev
```

---

## API 参考

### Tauri 命令（后端 API）

| 命令 | 描述 | 参数 |
|------|------|------|
| `create_note` | 创建新笔记 | `request: CreateNoteRequest` |
| `update_note` | 更新笔记 | `note_id: String, request: UpdateNoteRequest` |
| `get_note` | 获取单个笔记 | `note_id: String` |
| `get_all_notes` | 获取所有笔记 | 无 |
| `search_notes` | 搜索笔记 | `query: String` |
| `delete_note` | 删除笔记 | `note_id: String` |
| `get_sync_config` | 获取同步配置 | 无 |
| `save_sync_config` | 保存同步配置 | `config: SyncConfig` |
| `test_sync_connection` | 测试云存储连接 | `config: SyncConfig` |
| `sync_upload` | 上传笔记到云端 | 无 |
| `sync_download` | 从云端下载笔记 | 无 |

---

## 参与贡献

欢迎参与贡献！本项目 MIT 开源。

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

### 代码规范

- TypeScript：遵循 package.json 中的 ESLint 配置
- Rust：遵循标准 Rust 规范（`cargo fmt`）
- 组件：使用函数式组件和 Hooks

---

## 许可证

[MIT License](LICENSE) - 开源免费，可自由使用、修改和分发。

---

## 版本规划

### v1.0（当前版本）
- 基础笔记 CRUD
- 本地 SQLite 存储
- Markdown 编辑器
- 标签管理
- 搜索功能
- 文件夹组织
- 云端同步（S3 兼容）

### v1.1（计划中）
- 笔记分享
- 导出为 PDF/HTML
- 快捷键支持
- 自动同步调度

### v2.0（未来规划）
- 云同步端到端加密
- 协同编辑
- 移动端伴侣应用

---

## 致谢

- [Tauri](https://tauri.app) - 轻量级跨平台框架
- [React](https://react.dev) - UI 库
- [Tailwind CSS](https://tailwindcss.com) - 样式框架
- [sqlx](https://github.com/launchbadge/sqlx) - Rust SQL 工具包
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理