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
    <v-icon :size="64" :color="isDragging ? 'primary' : 'grey'" class="mb-4">
      {{ isDragging ? 'mdi-file-download' : 'mdi-file-upload-outline' }}
    </v-icon>

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
import { ref, computed } from 'vue'

interface Props {
  accept?: string
  acceptText?: string
}

const props = withDefaults(defineProps<Props>(), {
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

<style scoped>
.file-drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fffdf7;
}

.file-drop-zone:hover {
  border-color: #f5a623;
  background-color: #fff8e1;
}

.file-drop-zone.is-dragging {
  border-color: #f5a623;
  background-color: #fff3e0;
}

.file-drop-zone.has-file {
  border-color: #66bb6a;
  background-color: #e8f5e9;
}
</style>
