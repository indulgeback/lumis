# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumis is a cross-platform desktop media processing application built with Electron + Vue 3 + Vite + Vuetify. It provides video compression, first-frame extraction from videos, and image compression. The core media processing is handled by the `frame-extractor` CLI tool (installed via a shell script) rather than local Python scripts.

## Commands

```bash
# Development
pnpm dev              # Start Vite dev server (web mode)
pnpm electron:dev     # Start Electron in development mode

# Building
pnpm build            # Type check + build for current platform
pnpm build:win        # Build for Windows
pnpm build:mac        # Build for macOS
pnpm build:linux      # Build for Linux

# Code quality
pnpm lint             # Run ESLint with auto-fix
pnpm format           # Format code with Prettier
pnpm test             # Run tests (Vitest)
pnpm test:watch       # Run tests in watch mode
```

## Architecture

### Electron Structure

The app uses a standard Electron multi-process architecture:

- **Main Process** (`electron/main.ts`): Creates the browser window, manages app lifecycle, and registers IPC handlers. Includes custom logging that pipes to DevTools console.
- **Preload Script** (`electron/preload.ts`): Bridges main and renderer processes via `contextBridge`, exposing a typed `window.electronAPI`.
- **IPC Handlers** (`electron/ipc-handlers.ts`): Contains all IPC handlers for dialogs, file operations, tool installation, and media processing.
- **Python Runner** (`electron/pythonRunner.ts`): Detects Python environment (3.8+) and executes Python scripts. Not currently used for media processing.

### Vue Renderer Process

- **Entry**: `src/main.ts` creates the Vue app with Pinia, Vue Router (hash mode), and Vuetify.
- **Routing**: Three views - Home (`/`), Video (`/video`), Image (`/image`).
- **Components**: Common components in `src/components/common/` (CollapsibleCard, ProgressBar, ResultCard, FileDropZone, SplashScreen).
- **Stores**: Uses Pinia for state management (check `src/stores/` if it exists).

### IPC Communication Pattern

The app uses typed IPC communication. Types are duplicated in `preload.ts` and `ipc-handlers.ts`. When adding new IPC handlers:

1. Define the TypeScript interfaces in both `preload.ts` and `ipc-handlers.ts`
2. Add the handler in `registerIPCHandlers()` using `ipcMain.handle()`
3. Expose the method in `electronAPI` object in `preload.ts`
4. Call via `window.electronAPI.methodName()` in Vue components

### External Dependencies

The app depends on an external CLI tool `frame-extractor` that must be installed:

- The tool is installed via a curl shell script from GitHub
- Default install location: `~/.local/bin/frame-extractor`
- The app checks for this tool and provides a one-click install button in the environment dialog
- All media processing operations invoke this tool via `spawn()`

### Build Configuration

- **Vite**: Configured with `vite-plugin-electron` for Electron integration
- **Vuetify**: Auto-imported via `vite-plugin-vuetify`
- **Path Alias**: `@/*` maps to `src/*`
- **Output**: `dist/` for renderer, `dist-electron/` for main process

### TypeScript Configuration

- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- Types: DOM, Node, Vuetify
- Path alias: `@/*` → `src/*`

## Environment Detection

The app checks two dependencies on startup:
1. **Python 3.8+**: Required (checked via `pythonRunner.checkPythonEnvironment()`)
2. **frame-extractor**: Required CLI tool (checked via `tool:checkFrameExtractor`)

Both checks try multiple common paths (Homebrew, pyenv, user local, system PATH) on macOS.

## Logging

Main process logs are piped to:
1. Terminal stdout/stderr
2. Log file at `~/Library/Application Support/Lumis/logs/main.log` (macOS)
3. DevTools console in the renderer process

## Platform-Specific Notes

- **macOS**: The app is unsigned. Users need to right-click "Open" or use `xattr -cr` to bypass Gatekeeper.
- **Python paths**: The Python runner checks `/opt/homebrew/bin/python3` (Apple Silicon), `/usr/local/bin/python3` (Intel), pyenv shims, and system paths.
