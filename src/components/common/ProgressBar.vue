<template>
  <v-card
    class="progress-card"
    variant="outlined"
  >
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-body-2">{{ label }}</span>
        <span class="text-body-2 font-weight-medium">{{ displayProgress }}%</span>
      </div>

      <v-progress-linear
        :model-value="progress"
        :color="progressColor"
        :indeterminate="indeterminate"
        height="8"
        rounded
      />

      <p
        v-if="statusText"
        class="text-caption text-medium-emphasis mt-2 mb-0"
      >
        {{ statusText }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress?: number
  label?: string
  statusText?: string
  indeterminate?: boolean
  status?: 'processing' | 'success' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  label: '处理进度',
  statusText: '',
  indeterminate: false,
  status: 'processing'
})

const displayProgress = computed(() => {
  return Math.round(props.progress)
})

const progressColor = computed(() => {
  switch (props.status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'primary'
  }
})
</script>

<style scoped>
.progress-card {
  border-radius: 12px;
}
</style>
