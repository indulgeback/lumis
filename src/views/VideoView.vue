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
                  <v-icon
                    icon="mdi-help-circle-outline"
                    v-bind="props"
                    size="small"
                    color="grey"
                  />
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
                  <v-icon
                    icon="mdi-help-circle-outline"
                    v-bind="props"
                    size="small"
                    color="grey"
                  />
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

    <!-- 视频压缩卡片（即将推出） -->
    <v-card class="compress-card mt-4" elevation="0" :style="{ opacity: 0.6 }">
      <v-card-text class="pa-4">
        <div class="coming-soon-card">
          <div class="coming-soon-content">
            <div
              class="card-icon-wrapper"
              style="background: linear-gradient(135deg, #fff3e0, #ffe0b2)"
            >
              <v-icon icon="mdi-video-minus" size="28" color="#f5a623" />
            </div>
            <div class="coming-soon-text">
              <h3 class="card-title">视频压缩</h3>
              <p class="card-subtitle">减小视频体积，保持画质</p>
              <v-chip size="small" color="info" variant="tonal"> 即将推出 </v-chip>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 底部装饰 -->
    <div class="footer-decoration">
      <img src="@/assets/腊肠犬.svg" alt="" class="footer-pet" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import CollapsibleCard from '@/components/common/CollapsibleCard.vue'

// 状态
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

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeExtractProgressListener()
  }
})
</script>

<style scoped>
.video-container {
  max-width: 800px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.page-pet {
  width: 80px;
  height: 80px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  color: #f5a623;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 4px 0 0;
}

/* 字段标签 */
.label-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

/* 路径显示 */
.path-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: #f5f5f5;
  border-radius: 8px;
}

.path-text {
  flex: 1;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 大小控制 */
.size-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.size-slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.size-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.size-slider {
  flex: 1;
}

/* 进度区域 */
.progress-section {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.extract-log {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
}

.extract-log pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 提示信息 */
.alert-content {
  display: flex;
  gap: 4px;
}

.alert-title {
  font-weight: 500;
}

/* 即将推出卡片 */
.coming-soon-card {
  display: flex;
  align-items: center;
}

.coming-soon-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.coming-soon-text {
  flex: 1;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 4px;
}

.card-subtitle {
  font-size: 13px;
  color: #888;
  margin: 0;
}

/* 底部装饰 */
.footer-decoration {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.footer-pet {
  width: 60px;
  height: 60px;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.footer-pet:hover {
  transform: scale(1.1) rotate(10deg);
  opacity: 1;
}
</style>
