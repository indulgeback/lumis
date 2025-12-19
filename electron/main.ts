import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { pythonRunner, PythonEnvironment, ScriptResult } from './pythonRunner'

// 禁用 GPU 加速（可选，某些系统上可能需要）
// app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

// 预定义的文件过滤器
const VIDEO_FILTERS: Electron.FileFilter[] = [
  { name: '视频文件', extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'] }
]

const IMAGE_FILTERS: Electron.FileFilter[] = [
  { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'] }
]

const ALL_MEDIA_FILTERS: Electron.FileFilter[] = [
  {
    name: '所有媒体文件',
    extensions: [
      'mp4',
      'avi',
      'mov',
      'mkv',
      'wmv',
      'flv',
      'webm',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'webp',
      'tiff'
    ]
  },
  ...VIDEO_FILTERS,
  ...IMAGE_FILTERS
]

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    titleBarStyle: 'default'
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

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 注册 IPC 处理器
function registerIPCHandlers(): void {
  // 文件选择对话框（通用）
  ipcMain.handle('dialog:selectFile', async (_event, filters: Electron.FileFilter[]) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: filters && filters.length > 0 ? filters : ALL_MEDIA_FILTERS
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // 选择视频文件对话框
  ipcMain.handle('dialog:selectVideo', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: VIDEO_FILTERS
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // 选择图片文件对话框
  ipcMain.handle('dialog:selectImage', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: IMAGE_FILTERS
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // 文件保存对话框（通用）
  ipcMain.handle(
    'dialog:saveFile',
    async (_event, defaultPath: string, filters: Electron.FileFilter[]) => {
      const result = await dialog.showSaveDialog({
        defaultPath,
        filters: filters && filters.length > 0 ? filters : ALL_MEDIA_FILTERS
      })
      return result.canceled ? null : result.filePath
    }
  )

  // 保存图片对话框
  ipcMain.handle('dialog:saveImage', async (_event, defaultPath: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: IMAGE_FILTERS
    })
    return result.canceled ? null : result.filePath
  })

  // 获取文件信息
  ipcMain.handle('file:getInfo', async (_event, filePath: string) => {
    try {
      const stats = fs.statSync(filePath)
      const name = filePath.split(/[\\/]/).pop() || ''
      const format = name.split('.').pop()?.toLowerCase() || ''

      return {
        name,
        path: filePath,
        size: stats.size,
        format,
        lastModified: stats.mtime
      }
    } catch (error) {
      throw new Error(`无法获取文件信息: ${(error as Error).message}`)
    }
  })

  // 检查文件是否存在
  ipcMain.handle('file:exists', async (_event, filePath: string) => {
    try {
      return fs.existsSync(filePath)
    } catch {
      return false
    }
  })

  // 检查 Python 环境
  ipcMain.handle('python:checkEnvironment', async (): Promise<PythonEnvironment> => {
    return pythonRunner.checkPythonEnvironment()
  })

  // 执行 Python 脚本
  ipcMain.handle(
    'python:execute',
    async (_event, scriptPath: string, args: string[]): Promise<ScriptResult> => {
      return pythonRunner.execute(scriptPath, args)
    }
  )
}

// 应用生命周期管理
app.whenReady().then(() => {
  createWindow()
  registerIPCHandlers()

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
