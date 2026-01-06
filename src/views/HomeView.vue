<template>
  <v-container class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <img src="@/assets/哈士奇.svg" alt="Lumis" class="welcome-pet" />
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎来到 Lumis</h1>
          <p class="welcome-subtitle">压缩你创造的美</p>
        </div>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <v-row justify="center" class="feature-section">
      <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
        <v-card :to="feature.to" class="feature-card" elevation="2">
          <div class="feature-header" :style="{ background: feature.bgGradient }">
            <img :src="feature.pet" :alt="feature.title" class="feature-pet" />
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

    <!-- 底部装饰和信息 -->
    <div class="footer-section">
      <div class="footer-pets">
        <img src="@/assets/柯基.svg" alt="" class="footer-pet-small" />
        <img src="@/assets/布偶猫.svg" alt="" class="footer-pet-small" />
        <img src="@/assets/边牧.svg" alt="" class="footer-pet-small" />
      </div>
      <v-chip variant="tonal" size="small" class="mt-4"> λύμη + ἴσος — 光的等价形态 </v-chip>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const features = [
  {
    title: '视频压缩',
    subtitle: '智能压缩',
    description: '在保持画质的同时大幅减小视频文件体积，节省存储空间',
    color: 'primary',
    bgGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    pet: new URL('@/assets/金毛.svg', import.meta.url).href,
    to: '/video'
  },
  {
    title: '首帧截取',
    subtitle: '一键提取',
    description: '快速提取视频第一帧作为封面图，支持多种输出格式',
    color: 'secondary',
    bgGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    pet: new URL('@/assets/暹罗猫.svg', import.meta.url).href,
    to: '/video'
  },
  {
    title: '图片压缩',
    subtitle: '批量处理',
    description: '高效压缩图片文件，支持 JPG、PNG、WebP 等多种格式',
    color: 'accent',
    bgGradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    pet: new URL('@/assets/荷兰猪.svg', import.meta.url).href,
    to: '/image'
  }
]
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1100px;
  min-height: 100vh;
}

// 欢迎区域
.welcome-section {
  text-align: center;
  padding: $spacing-xl $spacing-lg;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.welcome-pet {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 8px 16px rgba(245, 166, 35, 0.2));
  @include scale-in-animation(0.8s);

  // 添加悬浮动画
  animation:
    scaleIn 0.8s $ease-bounce both,
    float 4s ease-in-out 1s infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }
}

.welcome-text {
  @include fade-in-animation(0.7s, 0.2s);
}

.welcome-title {
  font-size: 36px;
  font-weight: 600;
  color: $primary-color;
  margin: 0;
  letter-spacing: 0.02em;
  @include text-on-glass;
}

.welcome-subtitle {
  font-size: 15px;
  color: $text-secondary;
  margin: $spacing-sm 0 0;
  font-weight: 400;
  letter-spacing: 0.05em;
  @include text-on-glass;
}

// 功能卡片区域
.feature-section {
  padding: $spacing-sm;
}

.feature-card {
  @include glass-card;
  @include fade-in-animation(0.6s);

  // 为每个卡片添加不同的延迟
  &:nth-child(1) {
    animation-delay: 0.3s;
  }

  &:nth-child(2) {
    animation-delay: 0.4s;
  }

  &:nth-child(3) {
    animation-delay: 0.5s;
  }

  // 覆盖 Vuetify 样式
  :deep(.v-card),
  &.v-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(24px) saturate(190%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
    border: 1px solid rgba(255, 255, 255, 0.6) !important;
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.06),
      0 16px 32px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(255, 255, 255, 0.4) !important;
  }

  // 文字可读性增强
  :deep(.v-card-title),
  :deep(.v-card-subtitle),
  :deep(.v-card-text) {
    @include text-on-glass;
  }

  // 悬停效果
  &:hover {
    transform: translateY(-12px) scale(1.02);

    :deep(.v-card),
    &.v-card {
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.1),
        0 32px 64px rgba(245, 166, 35, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        inset 0 -1px 0 rgba(255, 255, 255, 0.5) !important;
    }

    .feature-pet {
      transform: scale(1.15) rotate(5deg);
    }
  }

  // 点击效果
  &:active {
    transform: translateY(-8px) scale(0.98);
  }
}

.feature-header {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  // 添加光泽效果
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  .feature-card:hover &::after {
    transform: translateX(100%);
  }
}

.feature-pet {
  width: 90px;
  height: 90px;
  transition: all $transition-slow $ease-out;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

// 底部区域
.footer-section {
  text-align: center;
  padding: $spacing-xl $spacing-lg;
  @include fade-in-animation(0.6s, 0.7s);
}

.footer-pets {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  flex-wrap: wrap;
}

.footer-pet-small {
  width: 56px;
  height: 56px;
  opacity: 0.7;
  transition: all $transition-normal $ease-out;
  cursor: pointer;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));

  &:hover {
    opacity: 1;
    transform: scale(1.3) rotate(15deg);
    filter: drop-shadow(0 4px 16px rgba(245, 166, 35, 0.3));
  }

  // 为每个宠物添加不同的悬浮动画延迟
  &:nth-child(1) {
    animation: float 3s ease-in-out infinite;
  }

  &:nth-child(2) {
    animation: float 3.5s ease-in-out 0.5s infinite;
  }

  &:nth-child(3) {
    animation: float 4s ease-in-out 1s infinite;
  }
}

// 芯片样式增强
:deep(.v-chip) {
  @include glass-control;
  font-weight: 500;
  letter-spacing: 0.05em;
}
</style>
