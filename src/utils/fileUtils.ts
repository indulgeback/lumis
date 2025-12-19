/**
 * 文件工具函数
 * 提供文件信息提取和格式验证功能
 */

// 支持的视频格式
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm']

// 支持的图片格式
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif']

/**
 * 文件信息接口
 */
export interface FileInfo {
  name: string
  path: string
  size: number
  format: string
  lastModified: Date
}

/**
 * 视频文件信息接口
 */
export interface VideoFileInfo extends FileInfo {
  duration?: number
  resolution?: {
    width: number
    height: number
  }
  codec?: string
}

/**
 * 图片文件信息接口
 */
export interface ImageFileInfo extends FileInfo {
  dimensions?: {
    width: number
    height: number
  }
}

/**
 * 从文件路径中提取文件名
 * @param filePath 文件路径
 * @returns 文件名
 */
export function getFileName(filePath: string): string {
  if (!filePath) return ''
  // 处理 Windows 和 Unix 路径分隔符
  const normalizedPath = filePath.replace(/\\/g, '/')
  const parts = normalizedPath.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * 从文件路径中提取文件扩展名（格式）
 * @param filePath 文件路径
 * @returns 文件扩展名（小写，不含点号）
 */
export function getFileFormat(filePath: string): string {
  if (!filePath) return ''
  const fileName = getFileName(filePath)
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return ''
  }
  return fileName.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 从文件路径提取基本文件信息
 * 注意：此函数仅从路径字符串提取信息，不访问文件系统
 * @param filePath 文件路径
 * @param size 文件大小（字节）
 * @param lastModified 最后修改时间
 * @returns 文件信息对象
 */
export function getFileInfo(filePath: string, size: number, lastModified?: Date): FileInfo {
  return {
    name: getFileName(filePath),
    path: filePath,
    size: size,
    format: getFileFormat(filePath),
    lastModified: lastModified || new Date()
  }
}

/**
 * 验证文件是否为支持的视频格式
 * @param filePath 文件路径
 * @returns 是否为支持的视频格式
 */
export function isValidVideoFormat(filePath: string): boolean {
  const format = getFileFormat(filePath)
  return SUPPORTED_VIDEO_FORMATS.includes(format)
}

/**
 * 验证文件是否为支持的图片格式
 * @param filePath 文件路径
 * @returns 是否为支持的图片格式
 */
export function isValidImageFormat(filePath: string): boolean {
  const format = getFileFormat(filePath)
  return SUPPORTED_IMAGE_FORMATS.includes(format)
}

/**
 * 验证文件是否为支持的媒体格式（视频或图片）
 * @param filePath 文件路径
 * @returns 是否为支持的媒体格式
 */
export function isValidMediaFormat(filePath: string): boolean {
  return isValidVideoFormat(filePath) || isValidImageFormat(filePath)
}

/**
 * 获取文件类型
 * @param filePath 文件路径
 * @returns 'video' | 'image' | 'unknown'
 */
export function getFileType(filePath: string): 'video' | 'image' | 'unknown' {
  if (isValidVideoFormat(filePath)) return 'video'
  if (isValidImageFormat(filePath)) return 'image'
  return 'unknown'
}

/**
 * 格式化文件大小为人类可读格式
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const index = Math.min(i, units.length - 1)

  const size = bytes / Math.pow(k, index)
  return `${size.toFixed(2)} ${units[index]}`
}

// ============================================
// 压缩结果计算工具
// ============================================

/**
 * 压缩结果接口
 */
export interface CompressionResult {
  success: boolean
  originalSize: number
  compressedSize: number
  compressionRatio: number
  outputPath: string
  error?: string
}

/**
 * 格式化的压缩结果接口
 */
export interface FormattedCompressionResult {
  success: boolean
  originalSizeFormatted: string
  compressedSizeFormatted: string
  compressionRatioFormatted: string
  savedSize: number
  savedSizeFormatted: string
  outputPath: string
  error?: string
}

/**
 * 计算压缩比例
 * 压缩比例 = (原始大小 - 压缩后大小) / 原始大小
 * @param originalSize 原始文件大小（字节）
 * @param compressedSize 压缩后文件大小（字节）
 * @returns 压缩比例（0-1之间的小数）
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize <= 0) return 0
  if (compressedSize < 0) return 0
  if (compressedSize > originalSize) return 0

  return (originalSize - compressedSize) / originalSize
}

/**
 * 创建压缩结果对象
 * @param originalSize 原始文件大小（字节）
 * @param compressedSize 压缩后文件大小（字节）
 * @param outputPath 输出文件路径
 * @returns 压缩结果对象
 */
export function createCompressionResult(
  originalSize: number,
  compressedSize: number,
  outputPath: string
): CompressionResult {
  const compressionRatio = calculateCompressionRatio(originalSize, compressedSize)

  return {
    success: true,
    originalSize,
    compressedSize,
    compressionRatio,
    outputPath
  }
}

/**
 * 创建失败的压缩结果对象
 * @param error 错误信息
 * @returns 失败的压缩结果对象
 */
export function createFailedCompressionResult(error: string): CompressionResult {
  return {
    success: false,
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    outputPath: '',
    error
  }
}

/**
 * 格式化压缩比例为百分比字符串
 * @param ratio 压缩比例（0-1之间的小数）
 * @returns 格式化后的百分比字符串
 */
export function formatCompressionRatio(ratio: number): string {
  if (ratio < 0) return '0%'
  if (ratio > 1) return '100%'
  return `${(ratio * 100).toFixed(1)}%`
}

/**
 * 格式化压缩结果为人类可读格式
 * @param result 压缩结果对象
 * @returns 格式化后的压缩结果对象
 */
export function formatCompressionResult(result: CompressionResult): FormattedCompressionResult {
  const savedSize = result.originalSize - result.compressedSize

  return {
    success: result.success,
    originalSizeFormatted: formatFileSize(result.originalSize),
    compressedSizeFormatted: formatFileSize(result.compressedSize),
    compressionRatioFormatted: formatCompressionRatio(result.compressionRatio),
    savedSize: savedSize > 0 ? savedSize : 0,
    savedSizeFormatted: formatFileSize(savedSize > 0 ? savedSize : 0),
    outputPath: result.outputPath,
    error: result.error
  }
}
