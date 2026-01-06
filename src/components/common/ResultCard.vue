<template>
  <v-card class="result-card" :color="cardColor" variant="tonal">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <v-icon :icon="statusIcon" :color="iconColor" size="24" class="mr-2" />
        <span class="text-subtitle-1 font-weight-medium">{{ title }}</span>
      </div>

      <v-divider class="mb-3" />

      <div v-if="success" class="result-details">
        <div v-if="originalSize !== undefined && compressedSize !== undefined" class="mb-3">
          <div class="d-flex justify-space-between mb-1">
            <span class="text-body-2 text-medium-emphasis">原始大小</span>
            <span class="text-body-2">{{ formatSize(originalSize) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-1">
            <span class="text-body-2 text-medium-emphasis">压缩后大小</span>
            <span class="text-body-2">{{ formatSize(compressedSize) }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-body-2 text-medium-emphasis">压缩比例</span>
            <span class="text-body-2 font-weight-medium text-success">
              {{ compressionRatioText }}
            </span>
          </div>
        </div>

        <div v-if="outputPath" class="output-path">
          <span class="text-body-2 text-medium-emphasis">输出路径</span>
          <p class="text-body-2 mb-0 text-truncate">
            {{ outputPath }}
          </p>
        </div>

        <slot name="preview" />
      </div>

      <div v-else class="error-details">
        <p class="text-body-2 mb-0">
          {{ errorMessage }}
        </p>
      </div>
    </v-card-text>

    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  success: boolean
  title?: string
  originalSize?: number
  compressedSize?: number
  outputPath?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '处理结果',
  errorMessage: '处理失败，请重试'
})

const cardColor = computed(() => {
  return props.success ? 'success' : 'error'
})

const iconColor = computed(() => {
  return props.success ? 'success' : 'error'
})

const statusIcon = computed(() => {
  return props.success ? 'mdi-check-circle' : 'mdi-alert-circle'
})

const compressionRatioText = computed(() => {
  if (props.originalSize === undefined || props.compressedSize === undefined) {
    return '-'
  }
  if (props.originalSize === 0) {
    return '0%'
  }
  const ratio = ((props.originalSize - props.compressedSize) / props.originalSize) * 100
  return `${ratio.toFixed(1)}%`
})

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
</script>

<style lang="scss" scoped>
.result-card {
  @include glass-card;

  // 覆盖 Vuetify 的默认背景色
  :deep(.v-card),
  &.v-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    box-shadow:
      0 4px 30px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
  }

  border-radius: $radius-md;

  // 文字可读性增强
  :deep(.v-card-text),
  :deep(.v-card-title) {
    @include text-on-glass;
  }
}

.output-path {
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: $radius-sm;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
