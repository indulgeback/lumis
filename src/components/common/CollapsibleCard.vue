<template>
  <v-card class="collapsible-card" :elevation="elevation">
    <v-card-item class="card-header-item" @click="toggle">
      <div class="card-header">
        <div class="card-icon-wrapper" :style="{ background: iconBackground }">
          <v-icon :icon="icon" :size="24" :color="iconColor" />
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ title }}</h3>
          <p class="card-subtitle">{{ subtitle }}</p>
        </div>
        <v-icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="collapse-icon"
          :class="{ 'collapse-icon--expanded': expanded }"
          size="20"
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
  iconColor: '#059669',
  iconBackground: '#d1fae5',
  elevation: 0,
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
@use '@/styles/variables.scss' as *;

.collapsible-card {
  @include fade-in(0.3s);
  @include ios-glass-card;
  border-radius: $radius-xl !important;
}

.card-header-item {
  cursor: pointer;
  user-select: none;
  transition: all $duration-short $ease-standard;
  padding: $spacing-md $spacing-lg;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  &:active {
    background: rgba(255, 255, 255, 0.5);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: $radius-lg;
  transition: transform $duration-short $ease-standard;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.collapsible-card:hover .card-icon-wrapper {
  transform: scale(1.05);
}

.card-title-group {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: $text-primary;
  letter-spacing: -0.01em;
}

.card-subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin: $spacing-xs 0 0;
  font-weight: 400;
}

.collapse-icon {
  transition: transform $duration-medium $ease-emphasized;
  color: $text-tertiary;
  flex-shrink: 0;
}

.collapse-icon--expanded {
  transform: rotate(180deg);
}

:deep(.v-divider) {
  border-color: rgba(0, 0, 0, 0.06);
}

.card-content {
  animation: slideDown 0.25s $ease-decelerated;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
