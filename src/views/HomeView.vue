<template>
  <v-container class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎来到 Lumis</h1>
        <p class="welcome-subtitle">压缩你创造的美</p>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <v-row justify="center" class="feature-section">
      <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
        <v-card :to="feature.to" class="feature-card" elevation="2">
          <div class="feature-header" :style="{ background: feature.bgGradient }">
            <v-icon :icon="feature.icon" size="64" :color="feature.color" class="feature-icon" />
          </div>
          <v-card-item class="pa-4">
            <v-card-title class="text-h6">
              {{ feature.title }}
            </v-card-title>
            <v-card-subtitle>{{ feature.subtitle }}</v-card-subtitle>
          </v-card-item>
          <v-card-text class="px-4 pb-4">
            {{ feature.description }}
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn
              :color="feature.color"
              variant="tonal"
              append-icon="mdi-arrow-right"
              block
              size="small"
            >
              开始使用
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 底部信息 -->
    <div class="footer-section">
      <v-chip variant="tonal" size="small"> λύμη + ἴσος — 光的等价形态 </v-chip>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const features = [
  {
    title: '视频压缩',
    subtitle: '智能压缩',
    description: '在保持画质的同时大幅减小视频文件体积，节省存储空间',
    color: '#059669',
    icon: 'mdi-video-minus',
    bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    to: '/video'
  },
  {
    title: '首帧截取',
    subtitle: '一键提取',
    description: '快速提取视频第一帧作为封面图，支持多种输出格式',
    color: '#f97316',
    icon: 'mdi-image-frame',
    bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    to: '/video'
  },
  {
    title: '图片压缩',
    subtitle: '批量处理',
    description: '高效压缩图片文件，支持 JPG、PNG、WebP 等多种格式',
    color: '#0891b2',
    icon: 'mdi-image-multiple',
    bgGradient: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
    to: '/image'
  }
]
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.home-container {
  max-width: 1200px;
  min-height: 100vh;
}

// 欢迎区域
.welcome-section {
  text-align: center;
  padding: $spacing-3xl $spacing-lg $spacing-xl;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
}

.welcome-title {
  font-size: 42px;
  font-weight: 500;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.03em;
  @include slide-in('bottom', 0.5s);
}

.welcome-subtitle {
  font-size: 16px;
  color: $text-secondary;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.01em;
  @include fade-in(0.5s, 0.1s);
}

// 功能卡片区域
.feature-section {
  padding: $spacing-lg $spacing-md;
}

.feature-card {
  @include slide-in('bottom', 0.5s);
  height: 100%;
  text-decoration: none;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  :deep(.v-card) {
    @include ios-glass-card;
    height: 100%;
  }

  &:hover :deep(.v-card) {
    transform: translateY(-4px);
  }

  &:active :deep(.v-card) {
    transform: translateY(-2px) scale(0.98);
  }
}

.feature-header {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
    transition: opacity $duration-medium $ease-standard;
  }

  .feature-card:hover &::before {
    opacity: 1;
  }
}

.feature-icon {
  transition: transform $duration-medium $ease-emphasized;
  z-index: 1;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

// 卡片内容样式
.feature-card :deep(.v-card-item) {
  padding: $spacing-lg;
}

.feature-card :deep(.v-card-title) {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: $text-primary;
}

.feature-card :deep(.v-card-subtitle) {
  font-size: 13px;
  color: $primary-color;
  font-weight: 500;
  margin-top: $spacing-xs;
}

.feature-card :deep(.v-card-text) {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.5;
  margin-top: $spacing-sm;
}

.feature-card :deep(.v-card-actions) {
  padding: $spacing-md $spacing-lg $spacing-lg;
}

.feature-card :deep(.v-btn) {
  border-radius: $radius-full;
  font-weight: 500;
  letter-spacing: 0.01em;
}

// 底部区域
.footer-section {
  text-align: center;
  padding: $spacing-2xl $spacing-lg $spacing-xl;
  @include fade-in(0.5s, 0.4s);
}

.footer-section :deep(.v-chip) {
  border-radius: $radius-sm;
  font-weight: 500;
  background: $surface-container-high;
  color: $text-secondary;
}
</style>
