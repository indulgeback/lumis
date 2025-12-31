import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'

/**
 * Python 脚本执行结果接口
 */
export interface ScriptResult {
  success: boolean
  data?: unknown
  error?: string
  stdout: string
  stderr: string
}

/**
 * Python 环境信息接口
 */
export interface PythonEnvironment {
  available: boolean
  version?: string
  path?: string
  error?: string
}

/**
 * 进度回调函数类型
 */
export type ProgressCallback = (progress: number) => void

/**
 * Python 脚本执行器类
 * 负责检测 Python 环境和执行 Python 脚本
 */
export class PythonRunner {
  private pythonCommand: string = 'python3'
  private progressCallback: ProgressCallback | null = null
  private currentProcess: ChildProcess | null = null

  /**
   * 检查 Python 环境是否可用
   * @returns Promise<PythonEnvironment> Python 环境信息
   */
  async checkPythonEnvironment(): Promise<PythonEnvironment> {
    // 尝试不同的 Python 命令和路径
    // 优先尝试常见安装路径（Homebrew、pyenv、用户安装等）
    const pythonCommands = [
      // macOS Homebrew (Apple Silicon)
      '/opt/homebrew/bin/python3',
      '/opt/homebrew/bin/python',
      // macOS Homebrew (Intel)
      '/usr/local/bin/python3',
      '/usr/local/bin/python',
      // pyenv
      `${process.env.HOME}/.pyenv/shims/python3`,
      `${process.env.HOME}/.pyenv/shims/python`,
      // 用户本地 bin
      `${process.env.HOME}/.local/bin/python3`,
      `${process.env.HOME}/.local/bin/python`,
      // 系统命令（通过 PATH）
      'python3',
      'python'
    ]

    console.log('[Python] 检测 Python 环境，尝试路径：')
    for (const cmd of pythonCommands) {
      console.log(`[Python]   尝试: ${cmd}`)
      try {
        const result = await this.tryPythonCommand(cmd)
        if (result.available) {
          this.pythonCommand = cmd
          console.log(`[Python] ✅ 找到: ${cmd} (版本 ${result.version})`)
          return result
        }
      } catch (err) {
        console.log(`[Python]   失败: ${cmd} - ${(err as Error).message}`)
        // 继续尝试下一个命令
        continue
      }
    }

    console.log('[Python] ❌ 未找到可用的 Python 环境')
    return {
      available: false,
      error: 'Python 环境不可用。请确保已安装 Python 3.8 或更高版本，并已添加到系统 PATH 中。'
    }
  }

  /**
   * 尝试执行指定的 Python 命令以检测环境
   * @param cmd Python 命令
   * @returns Promise<PythonEnvironment> Python 环境信息
   */
  private tryPythonCommand(cmd: string): Promise<PythonEnvironment> {
    return new Promise(resolve => {
      const process = spawn(cmd, ['--version'])
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
          // 解析版本号，格式通常为 "Python 3.x.x"
          const versionMatch = (stdout || stderr).match(/Python\s+(\d+\.\d+\.\d+)/)
          const version = versionMatch ? versionMatch[1] : undefined

          // 检查版本是否满足最低要求 (3.8+)
          if (version) {
            const [major, minor] = version.split('.').map(Number)
            if (major < 3 || (major === 3 && minor < 8)) {
              resolve({
                available: false,
                version,
                error: `Python 版本过低 (${version})。请安装 Python 3.8 或更高版本。`
              })
              return
            }
          }

          resolve({
            available: true,
            version,
            path: cmd
          })
        } else {
          resolve({
            available: false,
            error: `Python 命令 "${cmd}" 执行失败`
          })
        }
      })

      process.on('error', () => {
        resolve({
          available: false,
          error: `无法找到 Python 命令 "${cmd}"`
        })
      })

      // 设置超时
      setTimeout(() => {
        process.kill()
        resolve({
          available: false,
          error: `Python 命令 "${cmd}" 执行超时`
        })
      }, 5000)
    })
  }

  /**
   * 获取当前使用的 Python 命令
   * @returns string Python 命令
   */
  getPythonCommand(): string {
    return this.pythonCommand
  }

  /**
   * 设置进度回调函数
   * @param callback 进度回调函数
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback
  }

  /**
   * 移除进度回调函数
   */
  removeProgressCallback(): void {
    this.progressCallback = null
  }

  /**
   * 执行 Python 脚本
   * @param scriptPath 脚本路径（相对于 scripts 目录或绝对路径）
   * @param args 脚本参数
   * @returns Promise<ScriptResult> 执行结果
   */
  async execute(scriptPath: string, args: string[] = []): Promise<ScriptResult> {
    // 首先检查 Python 环境
    const env = await this.checkPythonEnvironment()
    if (!env.available) {
      return {
        success: false,
        error: env.error || 'Python 环境不可用',
        stdout: '',
        stderr: ''
      }
    }

    // 解析脚本路径
    const resolvedScriptPath = this.resolveScriptPath(scriptPath)

    return new Promise(resolve => {
      let stdout = ''
      let stderr = ''

      try {
        this.currentProcess = spawn(this.pythonCommand, [resolvedScriptPath, ...args], {
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        })

        // 捕获标准输出
        this.currentProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString()
          stdout += output

          // 尝试解析进度信息
          this.parseProgressFromOutput(output)
        })

        // 捕获错误输出
        this.currentProcess.stderr?.on('data', (data: Buffer) => {
          stderr += data.toString()
        })

        // 进程关闭
        this.currentProcess.on('close', (code: number | null) => {
          this.currentProcess = null

          if (code === 0) {
            // 尝试解析 JSON 结果
            const result = this.parseJsonResult(stdout)
            resolve({
              success: result.success,
              data: result.data,
              error: result.error,
              stdout,
              stderr
            })
          } else {
            resolve({
              success: false,
              error: stderr || `脚本执行失败，退出码: ${code}`,
              stdout,
              stderr
            })
          }
        })

        // 进程错误
        this.currentProcess.on('error', (error: Error) => {
          this.currentProcess = null
          resolve({
            success: false,
            error: `脚本执行错误: ${error.message}`,
            stdout,
            stderr
          })
        })
      } catch (error) {
        resolve({
          success: false,
          error: `启动脚本失败: ${(error as Error).message}`,
          stdout,
          stderr
        })
      }
    })
  }

  /**
   * 解析脚本路径
   * @param scriptPath 脚本路径
   * @returns string 解析后的绝对路径
   */
  private resolveScriptPath(scriptPath: string): string {
    // 如果是绝对路径，直接返回
    if (path.isAbsolute(scriptPath)) {
      return scriptPath
    }

    // 否则相对于 scripts 目录
    // 在开发环境中，scripts 目录在项目根目录
    // 在生产环境中，scripts 目录在应用资源目录
    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL

    if (isDev) {
      return path.join(process.cwd(), 'scripts', scriptPath)
    } else {
      // 生产环境：使用 app.getAppPath() 或 __dirname
      return path.join(__dirname, '..', 'scripts', scriptPath)
    }
  }

  /**
   * 从输出中解析进度信息
   * 期望格式: {"progress": 50} 或 PROGRESS:50
   * @param output 输出字符串
   */
  private parseProgressFromOutput(output: string): void {
    if (!this.progressCallback) return

    // 尝试解析 JSON 格式的进度
    const jsonProgressMatch = output.match(/\{"progress":\s*(\d+(?:\.\d+)?)\}/)
    if (jsonProgressMatch) {
      const progress = parseFloat(jsonProgressMatch[1])
      this.progressCallback(Math.min(100, Math.max(0, progress)))
      return
    }

    // 尝试解析简单格式的进度 PROGRESS:50
    const simpleProgressMatch = output.match(/PROGRESS:(\d+(?:\.\d+)?)/)
    if (simpleProgressMatch) {
      const progress = parseFloat(simpleProgressMatch[1])
      this.progressCallback(Math.min(100, Math.max(0, progress)))
    }
  }

  /**
   * 解析 JSON 结果
   * 从标准输出中提取最后一个有效的 JSON 对象
   * @param stdout 标准输出
   * @returns 解析结果
   */
  private parseJsonResult(stdout: string): { success: boolean; data?: unknown; error?: string } {
    // 尝试找到最后一个完整的 JSON 对象
    // Python 脚本应该在最后输出一个 JSON 结果
    const lines = stdout.trim().split('\n')

    // 从后往前查找有效的 JSON
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const parsed = JSON.parse(line)
          return {
            success: parsed.success !== false,
            data: parsed.data ?? parsed,
            error: parsed.error
          }
        } catch {
          // 继续尝试上一行
          continue
        }
      }
    }

    // 尝试解析整个输出作为 JSON
    try {
      // 查找 JSON 对象的开始和结束
      const jsonStart = stdout.lastIndexOf('{')
      const jsonEnd = stdout.lastIndexOf('}')

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = stdout.substring(jsonStart, jsonEnd + 1)
        const parsed = JSON.parse(jsonStr)
        return {
          success: parsed.success !== false,
          data: parsed.data ?? parsed,
          error: parsed.error
        }
      }
    } catch {
      // 解析失败
    }

    // 如果没有找到 JSON，返回原始输出
    return {
      success: true,
      data: stdout.trim()
    }
  }

  /**
   * 取消当前正在执行的脚本
   */
  cancel(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM')
      this.currentProcess = null
    }
  }

  /**
   * 检查是否有脚本正在执行
   * @returns boolean 是否正在执行
   */
  isRunning(): boolean {
    return this.currentProcess !== null
  }
}

// 导出单例实例
export const pythonRunner = new PythonRunner()

// 导出默认实例
export default pythonRunner
