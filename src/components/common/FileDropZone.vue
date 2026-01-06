<template>
  <div
    class="file-drop-zone"
    :class="{ 'is-dragging': isDragging, 'has-file': hasFile }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="openFileDialog"
  >
    <v-icon
      :icon="isDragging ? 'mdi-file-download' : 'mdi-file-upload-outline'"
      :size="64"
      :color="isDragging ? 'primary' : 'grey'"
      class="mb-4"
    />

    <p class="text-body-1 mb-2">
      {{ isDragging ? '释放文件' : '拖拽文件到此处' }}
    </p>
    <p class="text-body-2 text-medium-emphasis">或点击选择文件</p>

    <p v-if="acceptText" class="text-caption text-medium-emphasis mt-2">
      支持格式: {{ acceptText }}
    </p>

    <input ref="fileInput" type="file" :accept="accept" class="d-none" @change="onFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
  acceptText?: string
}

withDefaults(defineProps<Props>(), {
  accept: '*',
  acceptText: ''
})

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const hasFile = ref(false)

const onDragEnter = () => {
  isDragging.value = true
}

const onDragOver = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const handleFile = (file: File) => {
  hasFile.value = true
  emit('file-selected', file)
}

const reset = () => {
  hasFile.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({ reset })
</script>

<style lang="scss" scoped>
.file-drop-zone {
  border: 2px dashed rgba(224, 224, 224, 0.6);
  border-radius: $radius-md;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 2px dashed rgba(200, 200, 200, 0.6) !important;
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;

  &:hover {
    border-color: $primary-color;
    background: rgba(255, 248, 225, 0.7);
    box-shadow:
      0 4px 30px rgba(245, 166, 35, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &.is-dragging {
    border-color: $primary-color;
    background: rgba(255, 243, 224, 0.8);
    box-shadow:
      0 4px 30px rgba(245, 166, 35, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &.has-file {
    border-color: #66bb6a;
    background: rgba(232, 245, 233, 0.7);
    box-shadow:
      0 4px 30px rgba(102, 187, 106, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
}
</style>
