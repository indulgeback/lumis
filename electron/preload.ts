import { contextBridge, ipcRenderer } from 'electron'

// 定义文件过滤器类型
interface FileFilter {
  name: string
  extensions: string[]
}

// 定义文件信息类型
interface FileInfo {
  name: string
  path: string
  size: number
  format: string
  lastModified: Date
}

// 定义压缩结果类型
interface CompressionResult {
  success: boolean
  originalSize: number
  compressedSize: number
  compressionRatio: number
  outputPath: string
  error?: string
}

// 定义首帧截取结果类型
interface FrameResult {
  success: boolean
  outputPath: string
  dimensions: {
    width: number
    height: number
  }
  error?: string
}

// 定义视频选项类型
interface VideoOptions {
  quality?: number
  codec?: string
}

// 定义图片选项类型
interface ImageOptions {
  quality?: number
  format?: string
}

// 定义 Python 环境信息类型
interface PythonEnvironment {
  available: boolean
  version?: string
  path?: string
  error?: string
}

// 定义 Python 脚本执行结果类型
interface ScriptResult {
  success: boolean
  data?: unknown
  error?: string
  stdout: string
  stderr: string
}

// 暴露给渲染进程的 API
const electronAPI = {
  // 文件选择对话框（通用）
  selectFile: (filters: FileFilter[]): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectFile', filters)
  },

  // 选择视频文件对话框
  selectVideo: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectVideo')
  },

  // 选择图片文件对话框
  selectImage: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:selectImage')
  },

  // 文件保存对话框（通用）
  saveFile: (defaultPath: string, filters: FileFilter[]): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:saveFile', defaultPath, filters)
  },

  // 保存图片对话框
  saveImage: (defaultPath: string): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:saveImage', defaultPath)
  },

  // 获取文件信息
  getFileInfo: (filePath: string): Promise<FileInfo> => {
    return ipcRenderer.invoke('file:getInfo', filePath)
  },

  // 检查文件是否存在
  fileExists: (filePath: string): Promise<boolean> => {
    return ipcRenderer.invoke('file:exists', filePath)
  },

  // 视频压缩
  compressVideo: (
    inputPath: string,
    outputPath: string,
    options?: VideoOptions
  ): Promise<CompressionResult> => {
    return ipcRenderer.invoke('video:compress', inputPath, outputPath, options)
  },

  // 首帧截取
  extractFirstFrame: (videoPath: string, outputPath: string): Promise<FrameResult> => {
    return ipcRenderer.invoke('video:extractFrame', videoPath, outputPath)
  },

  // 图片压缩
  compressImage: (
    inputPath: string,
    outputPath: string,
    options?: ImageOptions
  ): Promise<CompressionResult> => {
    return ipcRenderer.invoke('image:compress', inputPath, outputPath, options)
  },

  // 监听进度更新
  onProgress: (callback: (progress: number) => void): void => {
    ipcRenderer.on('progress:update', (_event, progress) => {
      callback(progress)
    })
  },

  // 移除进度监听
  removeProgressListener: (): void => {
    ipcRenderer.removeAllListeners('progress:update')
  },

  // 检查 Python 环境
  checkPythonEnvironment: (): Promise<PythonEnvironment> => {
    return ipcRenderer.invoke('python:checkEnvironment')
  },

  // 执行 Python 脚本
  executePythonScript: (scriptPath: string, args: string[] = []): Promise<ScriptResult> => {
    return ipcRenderer.invoke('python:execute', scriptPath, args)
  }
}

// 通过 contextBridge 安全地暴露 API
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
