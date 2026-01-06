<template>
  <v-container class="video-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <img src="@/assets/法斗.svg" alt="" class="page-pet" />
      <div class="header-text">
        <h1 class="page-title">视频处理</h1>
        <p class="page-subtitle">压缩视频或提取首帧，轻松高效</p>
      </div>
    </div>

    <!-- 首帧截取卡片 -->
    <CollapsibleCard
      title="批量首帧截取"
      subtitle="提取视频第一帧并转换为 WebP 格式"
      icon="mdi-image-frame"
      icon-color="#42a5f5"
      icon-background="linear-gradient(135deg, #e3f2fd, #bbdefb)"
    >
      <!-- 目录选择区域 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row">
            <v-icon icon="mdi-folder-open" color="#42a5f5" size="small" class="mr-1" />
            <span class="field-label">输入目录</span>
          </div>
          <div class="path-display">
            <span class="path-text">{{ inputDir || '未选择' }}</span>
            <v-btn variant="tonal" color="primary" size="small" @click="selectInputDir">
              <v-icon icon="mdi-folder-outline" left />
              选择目录
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12">
          <div class="label-row">
            <v-icon icon="mdi-folder-move" color="#42a5f5" size="small" class="mr-1" />
            <span class="field-label">输出目录</span>
          </div>
          <div class="path-display">
            <span class="path-text">{{ outputDir || '未选择' }}</span>
            <v-btn variant="tonal" color="primary" size="small" @click="selectOutputDir">
              <v-icon icon="mdi-folder-outline" left />
              选择目录
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- 提取选项 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row mb-2">
            <v-icon icon="mdi-tune" color="#42a5f5" size="small" class="mr-1" />
            <span class="field-label">提取选项</span>
          </div>

          <!-- 递归处理 -->
          <v-checkbox
            v-model="recursive"
            label="递归处理子目录"
            color="primary"
            density="compact"
            hide-details
            class="mb-2"
          >
            <template #append>
              <v-tooltip location="top" text="勾选后将会处理输入目录及其所有子目录中的视频">
                <template #activator="{ props }">
                  <v-icon icon="mdi-help-circle-outline" v-bind="props" size="small" color="grey" />
                </template>
              </v-tooltip>
            </template>
          </v-checkbox>

          <!-- 压缩转换 -->
          <v-checkbox
            v-model="compress"
            label="压缩转换为 WebP 格式"
            color="primary"
            density="compact"
            hide-details
            class="mb-2"
          >
            <template #append>
              <v-tooltip
                location="top"
                text="勾选后提取的首帧将被压缩并转换为 WebP 格式，自动清理原始图片"
              >
                <template #activator="{ props }">
                  <v-icon icon="mdi-help-circle-outline" v-bind="props" size="small" color="grey" />
                </template>
              </v-tooltip>
            </template>
          </v-checkbox>

          <!-- 文件大小控制（仅在启用压缩时显示） -->
          <template v-if="compress">
            <div class="size-control">
              <div class="size-slider-group">
                <div class="size-label">
                  <span>最小文件大小</span>
                  <v-chip size="small" color="primary" variant="tonal"> {{ minSize }} KB </v-chip>
                </div>
                <v-slider
                  v-model="minSize"
                  :min="10"
                  :max="200"
                  :step="5"
                  color="primary"
                  track-color="grey-lighten-2"
                  hide-details
                  class="size-slider"
                >
                  <template #prepend>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="minSize = Math.max(10, minSize - 5)"
                    >
                      <v-icon icon="mdi-minus" />
                    </v-btn>
                  </template>
                  <template #append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="minSize = Math.min(200, minSize + 5)"
                    >
                      <v-icon icon="mdi-plus" />
                    </v-btn>
                  </template>
                </v-slider>
              </div>

              <div class="size-slider-group">
                <div class="size-label">
                  <span>最大文件大小</span>
                  <v-chip size="small" color="secondary" variant="tonal"> {{ maxSize }} KB </v-chip>
                </div>
                <v-slider
                  v-model="maxSize"
                  :min="50"
                  :max="500"
                  :step="10"
                  color="secondary"
                  track-color="grey-lighten-2"
                  hide-details
                  class="size-slider"
                >
                  <template #prepend>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="maxSize = Math.max(50, maxSize - 10)"
                    >
                      <v-icon icon="mdi-minus" />
                    </v-btn>
                  </template>
                  <template #append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="maxSize = Math.min(500, maxSize + 10)"
                    >
                      <v-icon icon="mdi-plus" />
                    </v-btn>
                  </template>
                </v-slider>
              </div>
            </div>

            <v-alert
              v-if="minSize >= maxSize"
              type="warning"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              最小值应小于最大值
            </v-alert>
          </template>
        </v-col>
      </v-row>

      <!-- 进度显示 -->
      <template v-if="extracting || extractLog">
        <v-divider class="mb-4" />
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-title">处理进度</span>
            <v-chip v-if="extracting" size="small" color="info">
              <v-icon icon="mdi-loading" start size="small" />
              处理中
            </v-chip>
            <v-chip
              v-else-if="extractResult"
              :color="extractResult.success ? 'success' : 'error'"
              size="small"
            >
              <v-icon
                :icon="extractResult.success ? 'mdi-check' : 'mdi-alert'"
                start
                size="small"
              />
              {{ extractResult.success ? '完成' : '失败' }}
            </v-chip>
          </div>

          <v-progress-linear v-if="extracting" indeterminate color="primary" class="mb-3" />

          <div class="extract-log">
            <pre>{{ extractLog }}</pre>
          </div>
        </div>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn v-if="extractResult" variant="text" @click="resetForm"> 重置 </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!canExtract"
          :loading="extracting"
          @click="startExtract"
        >
          <v-icon icon="mdi-image-frame" left />
          开始提取
        </v-btn>
      </template>
    </CollapsibleCard>

    <!-- 支持格式说明 -->
    <v-alert type="info" variant="tonal" class="mt-4" density="compact">
      <div class="alert-content">
        <span class="alert-title">支持格式：</span>
        <span>MP4、AVI、MOV、MKV、WMV、FLV、WebM</span>
      </div>
      <div class="alert-content mt-1">
        <span class="alert-title">说明：</span>
        <span>提取视频第一帧作为图片，可选择压缩转换为 WebP 格式</span>
      </div>
    </v-alert>

    <v-spacer class="my-6" />

    <!-- 视频压缩卡片 -->
    <CollapsibleCard
      title="视频压缩"
      subtitle="H.264 编码压缩，减小视频体积"
      icon="mdi-video-minus"
      icon-color="#f5a623"
      icon-background="linear-gradient(135deg, #fff3e0, #ffe0b2)"
      default-expanded
    >
      <!-- 模式选择 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row mb-2">
            <v-icon icon="mdi-swap-horizontal" color="#f5a623" size="small" class="mr-1" />
            <span class="field-label">处理模式</span>
          </div>
          <v-btn-toggle v-model="compressMode" color="primary" variant="tonal" class="w-100">
            <v-btn value="file" class="flex-grow-1">
              <v-icon icon="mdi-file-video" start />
              单文件
            </v-btn>
            <v-btn value="directory" class="flex-grow-1">
              <v-icon icon="mdi-folder-multiple" start />
              批量目录
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <!-- 单文件模式 -->
      <template v-if="compressMode === 'file'">
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="label-row">
              <v-icon icon="mdi-file" color="#f5a623" size="small" class="mr-1" />
              <span class="field-label">视频文件</span>
            </div>
            <div class="path-display" @click="selectVideoFile">
              <span class="path-text">{{ videoFilePath || '点击选择视频文件' }}</span>
              <v-btn variant="tonal" color="primary" size="small">
                <v-icon icon="mdi-folder-outline" left />
                选择文件
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </template>

      <!-- 目录模式 -->
      <template v-else>
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="label-row">
              <v-icon icon="mdi-folder-open" color="#f5a623" size="small" class="mr-1" />
              <span class="field-label">输入目录</span>
            </div>
            <div class="path-display">
              <span class="path-text">{{ compressInputDir || '未选择' }}</span>
              <v-btn variant="tonal" color="primary" size="small" @click="selectCompressInputDir">
                <v-icon icon="mdi-folder-outline" left />
                选择目录
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12">
            <div class="label-row">
              <v-icon icon="mdi-folder-move" color="#f5a623" size="small" class="mr-1" />
              <span class="field-label">输出目录</span>
            </div>
            <div class="path-display">
              <span class="path-text">{{ compressOutputDir || '未选择' }}</span>
              <v-btn variant="tonal" color="primary" size="small" @click="selectCompressOutputDir">
                <v-icon icon="mdi-folder-outline" left />
                选择目录
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </template>

      <!-- 压缩选项 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row mb-2">
            <v-icon icon="mdi-tune" color="#f5a623" size="small" class="mr-1" />
            <span class="field-label">压缩选项</span>
          </div>

          <!-- 质量控制 -->
          <div class="size-control mb-3">
            <div class="size-slider-group">
              <div class="size-label">
                <span>CRF 质量值</span>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ crfValue }} ({{
                    crfValue <= 23 ? '高质量' : crfValue <= 28 ? '中等' : '高压缩'
                  }})
                </v-chip>
              </div>
              <v-slider
                v-model="crfValue"
                :min="18"
                :max="35"
                :step="1"
                color="primary"
                track-color="grey-lighten-2"
                hide-details
                class="size-slider"
              >
                <template #prepend>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="crfValue = Math.max(18, crfValue - 1)"
                  >
                    <v-icon icon="mdi-minus" />
                  </v-btn>
                </template>
                <template #append>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="crfValue = Math.min(35, crfValue + 1)"
                  >
                    <v-icon icon="mdi-plus" />
                  </v-btn>
                </template>
              </v-slider>
            </div>
          </div>

          <!-- 编码速度预设 -->
          <div class="size-control mb-3">
            <div class="option-row">
              <span class="option-label">编码速度预设</span>
              <v-select
                v-model="presetValue"
                :items="presetOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="preset-select"
              >
                <template #append-inner>
                  <v-tooltip
                    location="top"
                    text="编码速度与压缩效率的平衡，ultrafast 最快但文件较大，veryslow 最慢但文件最小"
                  >
                    <template #activator="{ props }">
                      <v-icon
                        icon="mdi-help-circle-outline"
                        v-bind="props"
                        size="small"
                        color="grey"
                      />
                    </template>
                  </v-tooltip>
                </template>
              </v-select>
            </div>
          </div>

          <!-- 并发线程数 -->
          <div class="size-control mb-3">
            <div class="size-slider-group">
              <div class="size-label">
                <span>并发线程数</span>
                <v-chip size="small" color="secondary" variant="tonal"> {{ workers }} 线程 </v-chip>
              </div>
              <v-slider
                v-model="workers"
                :min="1"
                :max="4"
                :step="1"
                color="secondary"
                track-color="grey-lighten-2"
                hide-details
                class="size-slider"
              >
                <template #prepend>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="workers = Math.max(1, workers - 1)"
                  >
                    <v-icon icon="mdi-minus" />
                  </v-btn>
                </template>
                <template #append>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="workers = Math.min(4, workers + 1)"
                  >
                    <v-icon icon="mdi-plus" />
                  </v-btn>
                </template>
              </v-slider>
            </div>
          </div>

          <!-- 递归处理（仅目录模式） -->
          <v-checkbox
            v-if="compressMode === 'directory'"
            v-model="compressRecursive"
            label="递归处理子目录"
            color="primary"
            density="compact"
            hide-details
            class="mt-2"
          >
            <template #append>
              <v-tooltip location="top" text="勾选后将会处理输入目录及其所有子目录中的视频">
                <template #activator="{ props }">
                  <v-icon icon="mdi-help-circle-outline" v-bind="props" size="small" color="grey" />
                </template>
              </v-tooltip>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>

      <!-- 进度显示 -->
      <template v-if="compressing || compressLog">
        <v-divider class="mb-4" />
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-title">处理进度</span>
            <v-chip v-if="compressing" size="small" color="info">
              <v-icon icon="mdi-loading" start size="small" />
              处理中
            </v-chip>
            <v-chip
              v-else-if="compressResult"
              :color="compressResult.success ? 'success' : 'error'"
              size="small"
            >
              <v-icon
                :icon="compressResult.success ? 'mdi-check' : 'mdi-alert'"
                start
                size="small"
              />
              {{ compressResult.success ? '完成' : '失败' }}
            </v-chip>
          </div>

          <v-progress-linear v-if="compressing" indeterminate color="primary" class="mb-3" />

          <div class="extract-log">
            <pre>{{ compressLog }}</pre>
          </div>
        </div>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn v-if="compressResult" variant="text" @click="resetCompressForm"> 重置 </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!canCompress"
          :loading="compressing"
          @click="startCompress"
        >
          <v-icon icon="mdi-video-minus" left />
          开始压缩
        </v-btn>
      </template>
    </CollapsibleCard>

    <!-- 视频压缩说明 -->
    <v-alert type="info" variant="tonal" class="mt-4" density="compact">
      <div class="alert-content">
        <span class="alert-title">支持格式：</span>
        <span>MP4、AVI、MOV、MKV、WMV、FLV、WebM</span>
      </div>
      <div class="alert-content mt-1">
        <span class="alert-title">说明：</span>
        <span>使用 H.264 编码重新压缩视频，CRF 值越低画质越好但文件越大</span>
      </div>
    </v-alert>

    <!-- 底部装饰 -->
    <div class="footer-decoration">
      <img src="@/assets/腊肠犬.svg" alt="" class="footer-pet" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import CollapsibleCard from '@/components/common/CollapsibleCard.vue'

// ==================== 首帧截取状态 ====================
const inputDir = ref('')
const outputDir = ref('')
const recursive = ref(true)
const compress = ref(true)
const minSize = ref(50)
const maxSize = ref(100)

const extracting = ref(false)
const extractLog = ref('')
const extractResult = ref<any>(null)

// 检查是否可以开始提取
const canExtract = computed(() => {
  const validSize = compress.value ? minSize.value < maxSize.value : true
  return inputDir.value && outputDir.value && validSize && !extracting.value
})

// 选择输入目录
const selectInputDir = async () => {
  if (!window.electronAPI) return
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    inputDir.value = dir
    // 如果输出目录为空，自动设置一个默认值
    if (!outputDir.value) {
      outputDir.value = dir + '_frames'
    }
  }
}

// 选择输出目录
const selectOutputDir = async () => {
  if (!window.electronAPI) return
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    outputDir.value = dir
  }
}

// 开始提取
const startExtract = async () => {
  if (!window.electronAPI || !canExtract.value) return

  extracting.value = true
  extractLog.value = ''
  extractResult.value = null

  // 监听进度
  window.electronAPI.onExtractProgress(progress => {
    extractLog.value += progress.message + '\n'
  })

  try {
    const result = await window.electronAPI.extractFirstFrames({
      inputDir: inputDir.value,
      outputDir: outputDir.value,
      recursive: recursive.value,
      compress: compress.value,
      minSize: compress.value ? minSize.value : undefined,
      maxSize: compress.value ? maxSize.value : undefined
    })

    extractResult.value = result
    if (result.success) {
      extractLog.value += '\n✅ ' + result.message
    } else {
      extractLog.value += '\n❌ ' + (result.error || result.message)
    }
  } catch (error) {
    extractResult.value = {
      success: false,
      message: '提取失败',
      error: (error as Error).message
    }
    extractLog.value += '\n❌ 提取过程出错'
  } finally {
    extracting.value = false
    window.electronAPI?.removeExtractProgressListener()
  }
}

// 重置表单
const resetForm = () => {
  inputDir.value = ''
  outputDir.value = ''
  recursive.value = true
  compress.value = true
  minSize.value = 50
  maxSize.value = 100
  extractLog.value = ''
  extractResult.value = null
}

// ==================== 视频压缩状态 ====================
const compressMode = ref<'file' | 'directory'>('file')
const videoFilePath = ref('')
const compressInputDir = ref('')
const compressOutputDir = ref('')
const crfValue = ref(23)
const presetValue = ref('medium')
const workers = ref(2)
const compressRecursive = ref(true)

const compressing = ref(false)
const compressLog = ref('')
const compressResult = ref<any>(null)

// 编码预设选项
const presetOptions = [
  { label: 'ultrafast (最快)', value: 'ultrafast' },
  { label: 'veryfast (很快)', value: 'veryfast' },
  { label: 'fast (快)', value: 'fast' },
  { label: 'medium (中等)', value: 'medium' },
  { label: 'slow (慢)', value: 'slow' },
  { label: 'slower (更慢)', value: 'slower' },
  { label: 'veryslow (最慢)', value: 'veryslow' }
]

// 检查是否可以开始压缩
const canCompress = computed(() => {
  if (compressing.value) return false
  if (compressMode.value === 'file') {
    return videoFilePath.value !== ''
  } else {
    return compressInputDir.value && compressOutputDir.value
  }
})

// 选择视频文件
const selectVideoFile = async () => {
  if (!window.electronAPI) return
  const file = await window.electronAPI.selectVideo()
  if (file) {
    videoFilePath.value = file
  }
}

// 选择压缩输入目录
const selectCompressInputDir = async () => {
  if (!window.electronAPI) return
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    compressInputDir.value = dir
    // 如果输出目录为空，自动设置一个默认值
    if (!compressOutputDir.value) {
      compressOutputDir.value = dir + '_compressed'
    }
  }
}

// 选择压缩输出目录
const selectCompressOutputDir = async () => {
  if (!window.electronAPI) return
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    compressOutputDir.value = dir
  }
}

// 开始压缩
const startCompress = async () => {
  if (!window.electronAPI || !canCompress.value) return

  compressing.value = true
  compressLog.value = ''
  compressResult.value = null

  // 监听进度
  window.electronAPI.onVCompressProgress(progress => {
    compressLog.value += progress.message + '\n'
  })

  try {
    const options = {
      inputPath: compressMode.value === 'file' ? videoFilePath.value : compressInputDir.value,
      outputPath: compressMode.value === 'file' ? '' : compressOutputDir.value,
      quality: crfValue.value,
      preset: presetValue.value,
      workers: workers.value,
      recursive: compressMode.value === 'directory' ? compressRecursive.value : undefined
    }

    const result = await window.electronAPI.compressVideos(options)

    compressResult.value = result
    if (result.success) {
      compressLog.value += '\n✅ ' + result.message
    } else {
      compressLog.value += '\n❌ ' + (result.error || result.message)
    }
  } catch (error) {
    compressResult.value = {
      success: false,
      message: '压缩失败',
      error: (error as Error).message
    }
    compressLog.value += '\n❌ 压缩过程出错'
  } finally {
    compressing.value = false
    window.electronAPI?.removeVCompressProgressListener()
  }
}

// 重置压缩表单
const resetCompressForm = () => {
  compressMode.value = 'file'
  videoFilePath.value = ''
  compressInputDir.value = ''
  compressOutputDir.value = ''
  crfValue.value = 23
  presetValue.value = 'medium'
  workers.value = 2
  compressRecursive.value = true
  compressLog.value = ''
  compressResult.value = null
}

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeExtractProgressListener()
    window.electronAPI.removeVCompressProgressListener()
  }
})
</script>

<style lang="scss" scoped>
.video-container {
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  padding: $spacing-xl 0;
  @include fade-in-animation(0.5s);
}

.page-pet {
  width: 88px;
  height: 88px;
  filter: drop-shadow(0 4px 12px rgba(68, 165, 245, 0.2));
  transition: all $transition-normal $ease-out;

  &:hover {
    transform: scale(1.05) rotate(5deg);
  }
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: $secondary-color;
  margin: 0;
  @include text-on-glass;
}

.page-subtitle {
  font-size: 14px;
  color: $text-secondary;
  margin: $spacing-sm 0 0;
  @include text-on-glass;
}

// 卡片间距优化
:deep(.v-col) {
  padding: $spacing-md $spacing-sm !important;
}

// 字段标签
.label-row {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  @include text-on-glass;
}

// 路径显示
.path-display {
  @include glass-input;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  transition: all $transition-normal $ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
}

.path-text {
  flex: 1;
  font-size: 13px;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 大小控制
.size-control {
  @include glass-control;

  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.size-slider-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.size-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
}

.size-slider {
  flex: 1;
}

// 进度区域
.progress-section {
  @include glass-control;
  margin-bottom: $spacing-lg;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.extract-log {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: $spacing-md;
  border-radius: $radius-md;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.extract-log pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

// 提示信息
.alert-content {
  display: flex;
  gap: $spacing-xs;
}

.alert-title {
  font-weight: 600;
}

// 选项行
.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.option-label {
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
}

.preset-select {
  flex: 1;
  max-width: 300px;

  :deep(.v-field) {
    @include glass-input;
  }
}

// 底部装饰
.footer-decoration {
  display: flex;
  justify-content: center;
  padding: $spacing-2xl 0;
  @include fade-in-animation(0.5s, 0.8s);
}

.footer-pet {
  width: 64px;
  height: 64px;
  opacity: 0.75;
  transition: all $transition-normal $ease-out;
  cursor: pointer;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));

  &:hover {
    transform: scale(1.2) rotate(15deg);
    opacity: 1;
    filter: drop-shadow(0 4px 16px rgba(68, 165, 245, 0.3));
  }
}

// Vuetify 覆盖样式
:deep(.v-slider) {
  .v-slider-thumb {
    transition: transform $transition-fast $ease-out;

    &:hover {
      transform: scale(1.2);
    }
  }
}

:deep(.v-btn) {
  transition: all $transition-normal $ease-out;

  &:active {
    transform: scale(0.95);
  }
}

:deep(.v-checkbox) {
  .v-selection-control {
    transition: all $transition-normal $ease-out;

    &:hover {
      transform: translateX(4px);
    }
  }
}
</style>
