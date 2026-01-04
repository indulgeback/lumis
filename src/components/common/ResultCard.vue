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

<style scoped>
.result-card {
  border-radius: 12px;
}

.output-path {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 8px;
}
</style>
