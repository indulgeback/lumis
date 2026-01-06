import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { registerIPCHandlers } from './ipc-handlers'

// 禁用 GPU 加速（可选，某些系统上可能需要）
// app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,

    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      zoomFactor: 1.0, // 强制缩放比例为 1:1
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    titleBarStyle: 'hidden'
  })

  // 窗口准备好后显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 开发环境加载 Vite 开发服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 生产环境：快捷键打开开发者工具 (Cmd+Option+I / Ctrl+Shift+I)
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    const isDevToolsShortcut =
      (input.key === 'i' || input.key === 'I') &&
      (input.meta || input.control) &&
      input.alt &&
      input.shift

    if (isDevToolsShortcut) {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  // 设置日志系统：同时输出到终端、文件和 DevTools
  const logPath = join(app.getPath('userData'), 'logs', 'main.log')
  fs.mkdirSync(join(app.getPath('userData'), 'logs'), { recursive: true })

  const originalLog = console.log
  const originalError = console.error
  const logToFile = (message: string): void => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    fs.appendFileSync(logPath, logMessage)
  }

  // 发送日志到 DevTools
  const sendToDevTools = (level: 'log' | 'error', ...args: unknown[]): void => {
    const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
    mainWindow?.webContents
      .executeJavaScript(
        `
      console.${level}('[Main Process] ${message.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')
    `
      )
      .catch(() => {
        // 忽略错误（DevTools 未打开时）
      })
  }

  console.log = (...args: unknown[]) => {
    originalLog(...args)
    const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
    logToFile(message)
    sendToDevTools('log', ...args)
  }

  console.error = (...args: unknown[]) => {
    originalError(...args)
    const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
    logToFile('ERROR: ' + message)
    sendToDevTools('error', ...args)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 应用生命周期管理
app.whenReady().then(() => {
  createWindow()
  if (mainWindow) {
    registerIPCHandlers(mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
