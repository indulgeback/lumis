import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as fs from 'fs'
import { spawn } from 'child_process'
import { pythonRunner, PythonEnvironment, ScriptResult } from './pythonRunner'

/**
 * 尝试执行指定路径的工具以检测是否可用
 */
function tryToolPath(toolPath: string): Promise<ToolStatus> {
  return new Promise(resolve => {
    const process = spawn(toolPath, ['--version'])
    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    process.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    process.on('close', (code: number | null) => {
      if (code === 0) {
        const versionMatch = (stdout || stderr).match(/(\d+\.\d+\.\d+)/)
        resolve({
          installed: true,
          version: versionMatch ? versionMatch[1] : undefined
        })
      } else {
        resolve({
          installed: false,
          error: '执行失败'
        })
      }
    })

    process.on('error', () => {
      resolve({
        installed: false,
        error: '无法找到工具'
      })
    })

    setTimeout(() => {
      process.kill()
      resolve({
        installed: false,
        error: '检测超时'
      })
    }, 5000)
  })
}

// 文件过滤器常量
export const VIDEO_FILTERS: Electron.FileFilter[] = [
  { name: '视频文件', extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'] }
]

export const IMAGE_FILTERS: Electron.FileFilter[] = [
  { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'] }
]

// 批量压缩选项接口
export interface BatchCompressOptions {
  inputDir: string
  outputDir: string
  recursive?: boolean
  quality?: number
  minSize?: number
  maxSize?: number
}

// 批量压缩结果接口
export interface BatchCompressResult {
  success: boolean
  totalFiles?: number
  successCount?: number
  failedCount?: number
  message: string
  error?: string
}

// 首帧提取选项接口
export interface ExtractFirstFrameOptions {
  inputDir: string
  outputDir: string
  recursive?: boolean
  compress?: boolean
  webpQuality?: number
  minSize?: number
  maxSize?: number
}

// 首帧提取结果接口
export interface ExtractFirstFrameResult {
  success: boolean
  totalVideos?: number
  successCount?: number
  failedCount?: number
  message: string
  error?: string
}

export const ALL_MEDIA_FILTERS: Electron.FileFilter[] = [
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

/**
 * 注册所有 IPC 处理器
 * @param mainWindow 主窗口实例
 */
export function registerIPCHandlers(mainWindow: BrowserWindow): void {
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

  // 选择目录对话框
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
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
    console.log('[Tool] 检测 frame-extractor 工具...')

    // 尝试不同的工具路径（按优先级排序）
    const toolPaths = [
      // 安装脚本默认安装位置（最优先）
      `${process.env.HOME}/.local/bin/frame-extractor`,
      // 系统命令（通过 PATH，作为备用）
      'frame-extractor'
    ]

    console.log('[Tool] 尝试路径：')
    for (const path of toolPaths) {
      console.log(`[Tool]   尝试: ${path}`)
      try {
        const result = await tryToolPath(path)
        if (result.installed) {
          console.log(`[Tool] ✅ 找到: ${path} (版本 ${result.version || 'unknown'})`)
          return result
        }
      } catch (err) {
        console.log(`[Tool]   失败: ${path} - ${(err as Error).message}`)
        continue
      }
    }

    console.log('[Tool] ❌ 未找到可用的 frame-extractor')
    return {
      installed: false,
      error: 'frame-extractor 未安装'
    }
  })

  // 安装 frame-extractor 工具
  ipcMain.handle('tool:installFrameExtractor', async (): Promise<InstallResult> => {
    console.log('[Install] 开始安装 frame-extractor...')
    return new Promise(resolve => {
      // 使用绝对路径执行安装脚本
      const curlPath = '/usr/bin/curl'
      const bashPath = '/bin/bash'
      const installCmd = `${curlPath} -sSL https://raw.githubusercontent.com/indulgeback/video-frame-extractor/main/install.sh | ${bashPath}`

      console.log(`[Install] 执行命令: ${installCmd}`)
      const installProcess = spawn(bashPath, ['-c', installCmd], {
        env: { ...process.env, PATH: '/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin' }
      })

      console.log('[Install] 进程已创建')

      let installStderr = ''

      // 清理输出的辅助函数（移除 ANSI 码和控制字符）
      const cleanOutput = (text: string): string => {
        // eslint-disable-next-line no-control-regex
        const ansiRegex = /\x1b\[[0-9;]*m/g
        // eslint-disable-next-line no-control-regex
        const controlRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
        return text
          .replace(ansiRegex, '') // ANSI 颜色码
          .replace(controlRegex, '') // 其他控制字符
          .replace(/\r\n/g, '\n') // 统一换行符
      }

      installProcess.stdout?.on('data', (data: Buffer) => {
        const output = cleanOutput(data.toString())
        console.log('[Install] ' + output.trim())
        // 发送安装进度到渲染进程
        mainWindow?.webContents.send('tool:installProgress', output)
      })

      installProcess.stderr?.on('data', (data: Buffer) => {
        const output = cleanOutput(data.toString())
        installStderr += output
        console.log('[Install] ' + output.trim())
        mainWindow?.webContents.send('tool:installProgress', output)
      })

      installProcess.on('close', async (code: number | null) => {
        if (code === 0) {
          // 安装成功，验证工具是否可用
          console.log('[Install] 安装完成，验证工具...')

          // 等待文件系统同步并验证
          const maxRetries = 10
          for (let i = 0; i < maxRetries; i++) {
            await new Promise(r => setTimeout(r, 1000)) // 等待 1 秒

            const checkResult = await tryToolPath(`${process.env.HOME}/.local/bin/frame-extractor`)
            if (checkResult.installed) {
              console.log('[Install] ✅ 工具验证成功')
              resolve({
                success: true,
                message: 'frame-extractor 安装成功！'
              })
              return
            }
            console.log(`[Install] 重试验证 ${i + 1}/${maxRetries}...`)
          }

          // 验证失败，但安装确实完成了
          console.log('[Install] ⚠️ 工具验证超时，但安装可能已完成')
          resolve({
            success: true,
            message: 'frame-extractor 安装完成，请刷新重试'
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
      // 查找工具路径
      const toolPaths = [`${process.env.HOME}/.local/bin/frame-extractor`, 'frame-extractor']

      // 尝试找到可用的工具路径
      for (const path of toolPaths) {
        try {
          const checkResult = await tryToolPath(path)
          if (checkResult.installed) {
            // 找到了，执行命令
            return new Promise(resolve => {
              const execProcess = spawn(path, args)
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
          }
        } catch {
          continue
        }
      }

      return {
        success: false,
        stdout: '',
        stderr: '',
        error: 'frame-extractor 未安装，请先安装'
      }
    }
  )

  // 图片批量压缩
  ipcMain.handle(
    'image:batchCompress',
    async (_event, options: BatchCompressOptions): Promise<BatchCompressResult> => {
      console.log('[BatchCompress] 开始批量压缩:', options)

      // 查找工具路径
      const toolPaths = [`${process.env.HOME}/.local/bin/frame-extractor`, 'frame-extractor']

      // 找到可用的工具
      let toolPath: string | null = null
      for (const path of toolPaths) {
        try {
          const checkResult = await tryToolPath(path)
          if (checkResult.installed) {
            toolPath = path
            break
          }
        } catch {
          continue
        }
      }

      if (!toolPath) {
        return {
          success: false,
          message: '批量压缩失败',
          error: 'frame-extractor 未安装，请先安装'
        }
      }

      // 构建命令参数
      const args = ['compress', '-i', options.inputDir, '-o', options.outputDir]

      if (options.recursive) {
        args.push('-r')
      }

      if (options.quality !== undefined) {
        args.push('-q', String(options.quality))
      }

      if (options.minSize !== undefined) {
        args.push('--min-size', String(options.minSize))
      }

      if (options.maxSize !== undefined) {
        args.push('--max-size', String(options.maxSize))
      }

      console.log('[BatchCompress] 执行命令:', toolPath, args.join(' '))

      return new Promise(resolve => {
        const compressProcess = spawn(toolPath, args)
        let stdout = ''
        let stderr = ''

        compressProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString()
          stdout += output
          console.log('[BatchCompress] ' + output.trim())
          // 发送进度到渲染进程
          mainWindow?.webContents.send('compress:progress', {
            type: 'log',
            message: output
          })
        })

        compressProcess.stderr.on('data', (data: Buffer) => {
          const output = data.toString()
          stderr += output
          console.log('[BatchCompress] ' + output.trim())
          mainWindow?.webContents.send('compress:progress', {
            type: 'log',
            message: output
          })
        })

        compressProcess.on('close', (code: number | null) => {
          if (code === 0) {
            // 解析输出获取统计信息
            const stats = parseCompressOutput(stdout)
            console.log('[BatchCompress] ✅ 完成:', stats)
            resolve({
              success: true,
              ...stats,
              message: '批量压缩完成'
            })
          } else {
            console.log('[BatchCompress] ❌ 失败:', stderr)
            resolve({
              success: false,
              message: '批量压缩失败',
              error: stderr || '未知错误'
            })
          }
        })

        compressProcess.on('error', (error: Error) => {
          console.log('[BatchCompress] ❌ 错误:', error.message)
          resolve({
            success: false,
            message: '批量压缩失败',
            error: error.message
          })
        })
      })
    }
  )

  // 批量提取视频首帧
  ipcMain.handle(
    'video:extractFirstFrame',
    async (_event, options: ExtractFirstFrameOptions): Promise<ExtractFirstFrameResult> => {
      console.log('[ExtractFirstFrame] 开始批量提取首帧:', options)

      // 查找工具路径
      const toolPaths = [`${process.env.HOME}/.local/bin/frame-extractor`, 'frame-extractor']

      // 找到可用的工具
      let toolPath: string | null = null
      for (const path of toolPaths) {
        try {
          const checkResult = await tryToolPath(path)
          if (checkResult.installed) {
            toolPath = path
            break
          }
        } catch {
          continue
        }
      }

      if (!toolPath) {
        return {
          success: false,
          message: '首帧提取失败',
          error: 'frame-extractor 未安装，请先安装'
        }
      }

      // 构建命令参数: frame-extractor dirfirst -i input_dir -o output_dir -r -c --min-size X --max-size Y
      const args = ['dirfirst', '-i', options.inputDir, '-o', options.outputDir]

      if (options.recursive) {
        args.push('-r')
      }

      if (options.compress) {
        args.push('-c')
      }

      if (options.webpQuality !== undefined) {
        args.push('--webp-quality', String(options.webpQuality))
      }

      if (options.minSize !== undefined) {
        args.push('--min-size', String(options.minSize))
      }

      if (options.maxSize !== undefined) {
        args.push('--max-size', String(options.maxSize))
      }

      console.log('[ExtractFirstFrame] 执行命令:', toolPath, args.join(' '))

      return new Promise(resolve => {
        const extractProcess = spawn(toolPath, args)
        let stdout = ''
        let stderr = ''

        extractProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString()
          stdout += output
          console.log('[ExtractFirstFrame] ' + output.trim())
          // 发送进度到渲染进程
          mainWindow?.webContents.send('extract:progress', {
            type: 'log',
            message: output
          })
        })

        extractProcess.stderr?.on('data', (data: Buffer) => {
          const output = data.toString()
          stderr += output
          console.log('[ExtractFirstFrame] ' + output.trim())
          mainWindow?.webContents.send('extract:progress', {
            type: 'log',
            message: output
          })
        })

        extractProcess.on('close', (code: number | null) => {
          if (code === 0) {
            // 解析输出获取统计信息
            const stats = parseExtractOutput(stdout)
            console.log('[ExtractFirstFrame] ✅ 完成:', stats)
            resolve({
              success: true,
              ...stats,
              message: '首帧提取完成'
            })
          } else {
            console.log('[ExtractFirstFrame] ❌ 失败:', stderr)
            resolve({
              success: false,
              message: '首帧提取失败',
              error: stderr || '未知错误'
            })
          }
        })

        extractProcess.on('error', (error: Error) => {
          console.log('[ExtractFirstFrame] ❌ 错误:', error.message)
          resolve({
            success: false,
            message: '首帧提取失败',
            error: error.message
          })
        })
      })
    }
  )
}

/**
 * 解析压缩输出，提取统计信息
 */
function parseCompressOutput(output: string): Partial<BatchCompressResult> {
  // 尝试从输出中提取文件数量信息
  // frame-expressor 的输出格式可能包含类似 "Processed X files" 的信息
  const totalMatch = output.match(/(\d+)\s*files?/i)
  const totalFiles = totalMatch ? parseInt(totalMatch[1], 10) : 0

  // 检查是否有错误信息
  const hasErrors = output.toLowerCase().includes('error') || output.toLowerCase().includes('failed')

  return {
    totalFiles,
    successCount: hasErrors ? undefined : totalFiles,
    failedCount: hasErrors ? 0 : undefined
  }
}

/**
 * 解析首帧提取输出，提取统计信息
 */
function parseExtractOutput(output: string): Partial<ExtractFirstFrameResult> {
  // 尝试从输出中提取视频数量信息
  const totalMatch = output.match(/(\d+)\s*(videos?|files?)/i)
  const totalVideos = totalMatch ? parseInt(totalMatch[1], 10) : 0

  // 检查是否有错误信息
  const hasErrors = output.toLowerCase().includes('error') || output.toLowerCase().includes('failed')

  return {
    totalVideos,
    successCount: hasErrors ? undefined : totalVideos,
    failedCount: hasErrors ? 0 : undefined
  }
}
