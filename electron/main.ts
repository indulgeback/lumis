import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { spawn } from 'child_process'
import { pythonRunner, PythonEnvironment, ScriptResult } from './pythonRunner'

/**
 * frame-extractor 工具状态接口
 */
export interface ToolStatus {
  installed: boolean
  version?: string
  error?: string
}

/**
 * 安装结果接口
 */
export interface InstallResult {
  success: boolean
  message: string
  error?: string
}

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

  // 检查 frame-extractor 工具是否已安装
  ipcMain.handle('tool:checkFrameExtractor', async (): Promise<ToolStatus> => {
    return new Promise(resolve => {
      // 先用 which 找到工具的完整路径
      const whichProcess = spawn('which', ['frame-extractor'], { shell: true })

      let toolPath = ''

      whichProcess.stdout?.on('data', (data: Buffer) => {
        toolPath = data.toString().trim()
      })

      whichProcess.on('close', (code: number | null) => {
        if (code !== 0 || !toolPath) {
          resolve({
            installed: false,
            error: 'frame-extractor 未安装'
          })
          return
        }

        // 使用找到的完整路径执行版本检查
        const versionProcess = spawn(toolPath, ['--version'])

        let stdout = ''
        let stderr = ''

        versionProcess.stdout.on('data', (data: Buffer) => {
          stdout += data.toString()
        })

        versionProcess.stderr.on('data', (data: Buffer) => {
          stderr += data.toString()
        })

        versionProcess.on('close', (code: number | null) => {
          if (code === 0) {
            // 尝试解析版本号
            const versionMatch = (stdout || stderr).match(/(\d+\.\d+\.\d+)/)
            resolve({
              installed: true,
              version: versionMatch ? versionMatch[1] : undefined
            })
          } else {
            resolve({
              installed: false,
              error: 'frame-extractor 未安装'
            })
          }
        })

        versionProcess.on('error', () => {
          resolve({
            installed: false,
            error: 'frame-extractor 命令不可用'
          })
        })

        // 超时处理
        setTimeout(() => {
          versionProcess.kill()
          resolve({
            installed: false,
            error: '检测超时'
          })
        }, 5000)
      })

      whichProcess.on('error', () => {
        resolve({
          installed: false,
          error: '无法查找 frame-extractor'
        })
      })
    })
  })

  // 安装 frame-extractor 工具
  ipcMain.handle('tool:installFrameExtractor', async (): Promise<InstallResult> => {
    return new Promise(resolve => {
      // 使用 curl 执行一键安装脚本
      const installCmd =
        'curl -sSL https://raw.githubusercontent.com/indulgeback/video-frame-extractor/main/install.sh | bash'

      const installProcess = spawn('bash', ['-c', installCmd], {
        shell: true
      })

      let installStderr = ''

      installProcess.stdout?.on('data', (data: Buffer) => {
        // 发送安装进度到渲染进程
        mainWindow?.webContents.send('tool:installProgress', data.toString())
      })

      installProcess.stderr?.on('data', (data: Buffer) => {
        installStderr += data.toString()
        mainWindow?.webContents.send('tool:installProgress', data.toString())
      })

      installProcess.on('close', (code: number | null) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'frame-extractor 安装成功！'
          })
        } else {
          resolve({
            success: false,
            message: '安装失败',
            error: installStderr || '未知错误'
          })
        }
      })

      installProcess.on('error', (error: Error) => {
        resolve({
          success: false,
          message: '安装失败',
          error: error.message
        })
      })

      // 安装超时（2分钟）
      setTimeout(() => {
        installProcess.kill()
        resolve({
          success: false,
          message: '安装超时',
          error: '安装时间过长，请检查网络连接后重试'
        })
      }, 120000)
    })
  })

  // 执行 frame-extractor 命令
  ipcMain.handle(
    'tool:executeFrameExtractor',
    async (_event, args: string[]): Promise<ScriptResult> => {
      return new Promise(resolve => {
        // 先用 which 找到工具的完整路径
        const whichProcess = spawn('which', ['frame-extractor'], { shell: true })

        let toolPath = ''

        whichProcess.stdout?.on('data', (data: Buffer) => {
          toolPath = data.toString().trim()
        })

        whichProcess.on('close', (code: number | null) => {
          if (code !== 0 || !toolPath) {
            resolve({
              success: false,
              stdout: '',
              stderr: '',
              error: 'frame-extractor 未安装，请先安装'
            })
            return
          }

          // 使用找到的完整路径执行
          const execProcess = spawn(toolPath, args)

          let execStdout = ''
          let execStderr = ''

          execProcess.stdout?.on('data', (data: Buffer) => {
            execStdout += data.toString()
          })

          execProcess.stderr.on('data', (data: Buffer) => {
            execStderr += data.toString()
          })

          execProcess.on('close', (code: number | null) => {
            resolve({
              success: code === 0,
              stdout: execStdout,
              stderr: execStderr,
              error: code !== 0 ? execStderr || '执行失败' : undefined
            })
          })

          execProcess.on('error', (error: Error) => {
            resolve({
              success: false,
              stdout: execStdout,
              stderr: execStderr,
              error: error.message
            })
          })
        })

        whichProcess.on('error', () => {
          resolve({
            success: false,
            stdout: '',
            stderr: '',
            error: '无法查找 frame-extractor'
          })
        })
      })
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
