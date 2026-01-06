<template>
  <v-card class="collapsible-card" :elevation="elevation">
    <v-card-item class="card-header-item" @click="toggle">
      <div class="card-header">
        <div class="card-icon-wrapper" :style="{ background: iconBackground }">
          <v-icon :icon="icon" :size="28" :color="iconColor" />
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ title }}</h3>
          <p class="card-subtitle">{{ subtitle }}</p>
        </div>
        <v-icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="collapse-icon"
          :class="{ 'collapse-icon--expanded': expanded }"
          size="24"
          color="grey"
        />
      </div>
    </v-card-item>

    <v-divider />

    <v-expand-transition>
      <div v-show="expanded" class="card-content">
        <v-card-text class="pa-4">
          <slot></slot>
        </v-card-text>

        <v-divider v-if="$slots.actions" />

        <v-card-actions v-if="$slots.actions" class="pa-4">
          <slot name="actions"></slot>
        </v-card-actions>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  subtitle: string
  icon: string
  iconColor?: string
  iconBackground?: string
  elevation?: number | string
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#f5a623',
  iconBackground: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
  elevation: 2,
  defaultExpanded: false
})

const expanded = ref(props.defaultExpanded)

const toggle = () => {
  expanded.value = !expanded.value
}

defineExpose({
  expanded,
  toggle
})
</script>

<style lang="scss" scoped>
.collapsible-card {
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

  .card-icon-wrapper {
    @include glass-icon;
  }

  // 文字可读性增强
  .card-title,
  .card-subtitle {
    @include text-on-glass;
  }
}

.card-header-item {
  cursor: pointer;
  user-select: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 4px;
  color: $text-primary;
}

.card-subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin: 0;
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.collapse-icon--expanded {
  transform: rotate(180deg);
}
</style>
