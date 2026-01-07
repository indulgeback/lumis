<template>
  <v-container class="image-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">图片处理</h1>
        <p class="page-subtitle">高效压缩图片，节省存储空间</p>
      </div>
    </div>

    <!-- 批量压缩卡片 -->
    <CollapsibleCard
      title="批量图片压缩"
      subtitle="将图片转换为 WebP 格式并压缩"
      icon="mdi-folder-multiple-image"
      icon-color="#0891b2"
      icon-background="#cffafe"
    >
      <!-- 目录选择区域 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row">
            <v-icon icon="mdi-folder-open" color="#0891b2" size="small" class="mr-1" />
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
            <v-icon icon="mdi-folder-move" color="#0891b2" size="small" class="mr-1" />
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

      <!-- 压缩选项 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="label-row mb-2">
            <v-icon icon="mdi-tune" color="#0891b2" size="small" class="mr-1" />
            <span class="field-label">压缩选项</span>
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
              <v-tooltip location="top" text="勾选后将会处理输入目录及其所有子目录中的图片">
                <template #activator="{ props }">
                  <v-icon icon="mdi-help-circle-outline" v-bind="props" size="small" color="grey" />
                </template>
              </v-tooltip>
            </template>
          </v-checkbox>

          <!-- 文件大小控制 -->
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

          <div class="compress-log">
            <pre>{{ compressLog }}</pre>
          </div>
        </div>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn v-if="compressResult" variant="text" @click="resetForm"> 重置 </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!canCompress"
          :loading="compressing"
          @click="startCompress"
        >
          <v-icon icon="mdi-image-auto-adjust" left />
          开始压缩
        </v-btn>
      </template>
    </CollapsibleCard>

    <!-- 支持格式说明 -->
    <v-alert type="info" variant="tonal" class="mt-4" density="compact">
      <div class="alert-content">
        <span class="alert-title">支持格式：</span>
        <span>JPG、PNG、GIF、BMP、WebP、TIFF → WebP</span>
      </div>
      <div class="alert-content mt-1">
        <span class="alert-title">说明：</span>
        <span>输出文件将自动调整压缩质量，使文件大小控制在指定范围内</span>
      </div>
    </v-alert>

    <!-- 底部装饰 -->
    <div class="footer-decoration" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import CollapsibleCard from '@/components/common/CollapsibleCard.vue'

// 状态
const inputDir = ref('')
const outputDir = ref('')
const recursive = ref(true)
const minSize = ref(50)
const maxSize = ref(100)

const compressing = ref(false)
const compressLog = ref('')
const compressResult = ref<any>(null)

// 检查是否可以开始压缩
const canCompress = computed(() => {
  return inputDir.value && outputDir.value && minSize.value < maxSize.value && !compressing.value
})

// 选择输入目录
const selectInputDir = async () => {
  if (!window.electronAPI) return
  const dir = await window.electronAPI.selectDirectory()
  if (dir) {
    inputDir.value = dir
    // 如果输出目录为空，自动设置一个默认值
    if (!outputDir.value) {
      outputDir.value = dir + '_webp'
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

// 开始压缩
const startCompress = async () => {
  if (!window.electronAPI || !canCompress.value) return

  compressing.value = true
  compressLog.value = ''
  compressResult.value = null

  // 监听进度
  window.electronAPI.onCompressProgress(progress => {
    compressLog.value += progress.message + '\n'
  })

  try {
    const result = await window.electronAPI.batchCompressImages({
      inputDir: inputDir.value,
      outputDir: outputDir.value,
      recursive: recursive.value,
      minSize: minSize.value,
      maxSize: maxSize.value
    })

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
    window.electronAPI?.removeCompressProgressListener()
  }
}

// 重置表单
const resetForm = () => {
  inputDir.value = ''
  outputDir.value = ''
  recursive.value = true
  minSize.value = 50
  maxSize.value = 100
  compressLog.value = ''
  compressResult.value = null
}

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeCompressProgressListener()
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.image-container {
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-2xl 0 $spacing-xl;
  @include slide-in('bottom', 0.4s);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 500;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: $text-secondary;
  margin: $spacing-xs 0 0;
}

// 卡片间距
:deep(.v-col) {
  padding: $spacing-sm !important;
}

// 字段标签
.label-row {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
}

// 路径显示
.path-display {
  @include input-field;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  cursor: pointer;
}

.path-text {
  flex: 1;
  font-size: 13px;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 大小控制
.size-control {
  @include ios-glass-control;

  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
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
  @include ios-glass-control;
  margin-bottom: $spacing-md;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.progress-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}

.compress-log {
  background: #1a1a1a;
  color: #e0e0e0;
  padding: $spacing-md;
  border-radius: $radius-sm;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.compress-log pre {
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
  font-weight: 500;
}

// 分隔线
:deep(.v-divider) {
  border-color: $divider;
}
</style>
