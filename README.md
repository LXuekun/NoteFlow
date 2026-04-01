# NoteFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![中文文档](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-blue.svg)](README-CN.md)

A modern, local-first note-taking application built with **Tauri 2.0 + React + Rust + SQLite**.

**Repository**: https://github.com/LXuekun/NoteFlow

**[English](README.md)** | **[简体中文](README-CN.md)**

## Why NoteFlow?

This project was created with two main goals:

1. **AI Coding Practice**: A hands-on exercise to explore AI-assisted software development, learning how to build a complete desktop application from scratch using modern technologies.

2. **Truly Secure Multi-Device Sync**: There's no open-source note app that supports syncing to your own cloud storage. Most note apps either don't sync, or lock you into their proprietary cloud services where you have no control over your data. NoteFlow solves this by:
   - Using your own S3-compatible storage (MinIO, AWS S3, Aliyun OSS, Tencent COS)
   - Giving you complete control over where your data is stored
   - Ensuring absolute data security - your notes stay on your infrastructure
   - Simple, clean, and easy to use

---

## Project Goals

### Primary Objectives

1. **Local-First Architecture**: Data is stored locally with SQLite database, ensuring privacy and offline capability - no external database server required
2. **Modern Markdown Editing**: Full Markdown support with real-time preview, code highlighting, and GFM (GitHub Flavored Markdown)
3. **Zero Configuration**: No login required - just open and start writing
4. **Cross-Platform**: Built with Tauri for lightweight, native performance on Windows, macOS, and Linux
5. **Tag & Folder Organization**: Flexible categorization system with tags and nested folders
6. **Cloud Sync (Optional)**: Sync notes across devices using S3-compatible storage (MinIO, AWS S3, Aliyun OSS, Tencent COS)

### Key Features

- Markdown editor with live preview
- Local SQLite storage (no setup required)
- Tag management with color customization
- Folder organization with nested structure
- Full-text search across notes
- Note pinning and archiving
- Dark/Light theme support
- Auto-save functionality
- Cloud sync with S3-compatible storage

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | UI components |
| Build Tool | Vite 5 | Fast development server |
| Styling | Tailwind CSS | Atomic CSS |
| State | Zustand | Lightweight state management |
| Backend | Tauri 2.0 + Rust | Native app wrapper |
| Database | SQLite (via sqlx) | Local persistent storage |
| Markdown | @uiw/react-md-editor | Editing & preview |
| Search | fuse.js | Fuzzy search |
| Cloud Sync | S3-compatible API | Cross-device sync |

---

## Project Structure

```
note/
├── src/                          # React frontend
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Top navigation
│   │   │   ├── Sidebar.tsx       # Left sidebar
│   │   │   ├── MainContent.tsx   # Note editor/list
│   │   │   └── SettingsPanel.tsx # Theme & sync settings
│   │   └── notes/
│   │       ├── NoteList.tsx      # Note list view
│   │       └── NoteEditor.tsx    # Markdown editor
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   ├── types/                    # TypeScript types
│   └── utils/                    # Helper functions
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry
│   │   ├── commands/
│   │   │   └ mod.rs              # Tauri commands (API)
│   │   ├── models/
│   │   │   └ mod.rs              # Data models
│   │   ├── sync/
│   │   │   ├── mod.rs            # Sync module entry
│   │   │   ├── config.rs         # Sync configuration
│   │   │   ├── s3_client.rs      # S3-compatible client
│   │   │   └── service.rs        # Sync service
│   │   └ database/
│   │   │   └ mod.rs              # SQLite connection
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   └ icons/                      # App icons
│
├── assets/
│   └ wix314-binaries.zip         # WiX tools for MSI build
│
├── build_tauri.bat               # Dev build script
├── build_release.bat             # Release build script
├── package.json                  # Node dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└ README.md                       # This file
└ README-CN.md                    # Chinese documentation
```

---

## Getting Started

### Prerequisites

#### For Windows

1. **Node.js 18+**
   ```bash
   # Download from https://nodejs.org or use winget
   winget install OpenJS.NodeJS.LTS
   ```

2. **Rust (MSVC toolchain)**
   ```bash
   # Install rustup from https://rustup.rs
   rustup-init.exe

   # Set MSVC as default (required for Windows)
   rustup default stable-x86_64-pc-windows-msvc
   ```

3. **Visual Studio Build Tools 2022**
   ```bash
   # Install via winget
   winget install Microsoft.VisualStudio.2022.BuildTools

   # Or manually install with "C++ build tools" workload
   ```

#### For macOS/Linux

1. **Node.js 18+**
   ```bash
   # Using Homebrew (macOS)
   brew install node

   # Using apt (Linux)
   sudo apt install nodejs npm
   ```

2. **Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Additional dependencies (Linux)**
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

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/noteflow.git
   cd noteflow
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

   That's it! No database setup required - SQLite is automatically initialized on first run.

### Development

#### Option 1: Using the batch script (Windows recommended)

```bash
# Run the prepared batch script that sets up VS environment
build_tauri.bat
```

This script:
- Initializes Visual Studio MSVC environment
- Sets cargo PATH
- Runs Tauri development server

#### Option 2: Manual start

```bash
# Start both frontend and Tauri backend
npm run tauri dev
```

#### Option 3: Separate processes

```bash
# Start frontend only (for frontend development)
npm run dev

# Start Tauri backend (in another terminal with VS environment)
npm run tauri dev
```

### Development URLs

- Frontend (Vite): http://localhost:5173
- Tauri window: Opens automatically

---

## Building for Production

### Create Release Build

#### Option 1: Using the release script (Windows)

```bash
# Run the release build script
build_release.bat
```

This script:
- Initializes Visual Studio MSVC environment
- Builds frontend with `npm run build`
- Builds Tauri release package with MSI and NSIS installers

#### Option 2: Manual build

```bash
# Build production-ready application
cd src-tauri
cargo tauri build
```

This generates:
- **Windows**: `.msi` installer and `.exe` in `src-tauri/target/release/bundle/`
- **macOS**: `.dmg` and `.app` in `src-tauri/target/release/bundle/`
- **Linux**: `.deb` and `.AppImage` in `src-tauri/target/release/bundle/`

### Build Output

```
src-tauri/target/release/
├── noteflow.exe                        # Standalone executable (~17 MB)
└── bundle/
    ├── msi/
    │   └── NoteFlow_1.0.0_x64_en-US.msi    # MSI installer (~7 MB)
    └── nsis/
        └── NoteFlow_1.0.0_x64-setup.exe    # NSIS installer (~5 MB)
```

---

## Cloud Sync

NoteFlow supports syncing notes across devices using S3-compatible cloud storage.

### Supported Storage Services

| Service | Endpoint Example |
|---------|------------------|
| MinIO (self-hosted) | `http://localhost:9000` |
| AWS S3 | `https://s3.amazonaws.com` |
| Aliyun OSS | `https://oss-cn-hangzhou.aliyuncs.com` |
| Tencent COS | `https://cos.ap-guangzhou.myqcloud.com` |

### Setup Cloud Sync

1. Open Settings panel in the application
2. Navigate to "Cloud Sync" tab
3. Configure your storage provider:
   - Select provider type
   - Enter endpoint URL
   - Enter region
   - Enter bucket name
   - Enter Access Key ID and Secret Access Key
4. Click "Test Connection" to verify
5. Enable sync and choose auto-sync interval

### Sync Configuration Storage

Sync config is stored in:
- **Windows**: `%APPDATA%\NoteFlow\sync_config.json`
- **macOS**: `~/Library/Application Support/NoteFlow/sync_config.json`
- **Linux**: `~/.config/noteflow/sync_config.json`

### Sync Data Format

All notes, tags, and folders are exported as a single JSON file:

```
Bucket path: noteflow/data.json
```

---

## Deployment & Operations

### Data Storage Location

Application stores data in:
- **Windows**: `%APPDATA%\NoteFlow\noteflow.db`
- **macOS**: `~/Library/Application Support/NoteFlow/noteflow.db`
- **Linux**: `~/.local/share/noteflow/noteflow.db`

### Configuration Location

Application configuration stored in:
- **Windows**: `%APPDATA%\NoteFlow\`
- **macOS**: `~/Library/Application Support/NoteFlow/`
- **Linux**: `~/.config/noteflow/`

### Database Backup

Since SQLite is a single file, backup is simple:

```bash
# Backup database
# Windows
copy "%APPDATA%\NoteFlow\noteflow.db" "noteflow_backup.db"

# macOS/Linux
cp ~/Library/Application\ Support/NoteFlow/noteflow.db noteflow_backup.db

# Restore from backup
# Just copy the backup file back to the data location
```

### Common Operations

#### Update Application

1. Build new version with updated version number in `package.json` and `tauri.conf.json`
2. Distribute new installer
3. Users run installer (settings and data preserved automatically)

#### Migration to New Computer

1. Copy `noteflow.db` file from old computer
2. Place it in the data storage location on new computer
3. All notes, tags, and folders will be preserved

---

## Troubleshooting

### Common Issues

#### 1. `cargo not found`
```
Solution: Add Rust to PATH
Windows: Use build_tauri.bat or add %USERPROFILE%\.cargo\bin to PATH
```

#### 2. `MSVC linker not found`
```
Solution: Install Visual Studio Build Tools 2022
winget install Microsoft.VisualStudio.2022.BuildTools
Select "C++ build tools" workload
```

#### 3. `icon.ico not found`
```
Solution: Generate icons
cargo tauri icon app-icon.png
```

#### 4. Application window not showing
```
Solution: Check frontend build
- Run npm run dev separately
- Check for TypeScript errors
- Verify vite.config.ts
```

#### 5. WiX/NSIS download timeout during release build
```
Problem: Tauri downloads WiX and NSIS tools from GitHub

Solution: Use the bundled WiX tools in assets folder
1. Extract assets/wix314-binaries.zip to %LOCALAPPDATA%\tauri\WixTools314\
2. Re-run build_release.bat

NSIS tools are cached after first successful download.
If download fails, wait and retry.
```

### Debug Mode

```bash
# Run with verbose logging
RUST_LOG=debug npm run tauri dev
```

---

## API Reference

### Tauri Commands (Backend API)

| Command | Description | Parameters |
|---------|-------------|------------|
| `create_note` | Create new note | `request: CreateNoteRequest` |
| `update_note` | Update existing note | `note_id: String, request: UpdateNoteRequest` |
| `get_note` | Get single note | `note_id: String` |
| `get_all_notes` | Get all notes | - |
| `search_notes` | Search notes | `query: String` |
| `delete_note` | Delete note | `note_id: String` |
| `get_sync_config` | Get sync configuration | - |
| `save_sync_config` | Save sync configuration | `config: SyncConfig` |
| `test_sync_connection` | Test cloud connection | `config: SyncConfig` |
| `sync_upload` | Upload notes to cloud | - |
| `sync_download` | Download notes from cloud | - |

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- TypeScript: ESLint configuration in package.json
- Rust: Follow standard Rust conventions (`cargo fmt`)
- Components: Functional components with hooks

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License allows you to:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

For the full license text, see [LICENSE](LICENSE) file or visit [MIT License](https://opensource.org/licenses/MIT).

---

## Roadmap

### v1.0 (Current)
- Basic note CRUD
- Local SQLite storage
- Markdown editor
- Tag management
- Search functionality
- Folder organization
- Cloud sync (S3-compatible)

### v1.1 (Planned)
- Note sharing
- Export to PDF/HTML
- Keyboard shortcuts
- Auto-sync scheduling

### v2.0 (Future)
- End-to-end encryption for cloud sync
- Collaborative editing
- Mobile companion app

---

## Acknowledgments

- [Tauri](https://tauri.app) - Lightweight cross-platform framework
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [sqlx](https://github.com/launchbadge/sqlx) - Rust SQL toolkit
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

## Author

**LXuekun**

- Email: luxuekun2019@gmail.com
- GitHub: https://github.com/LXuekun