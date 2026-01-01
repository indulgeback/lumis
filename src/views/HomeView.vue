<template>
  <v-container class="home-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <img
          src="@/assets/哈士奇.svg"
          alt="Lumis"
          class="welcome-pet"
        >
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎来到 Lumis
          </h1>
          <p class="welcome-subtitle">
            压缩你创造的美
          </p>
        </div>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <v-row
      justify="center"
      class="feature-section"
    >
      <v-col
        v-for="feature in features"
        :key="feature.title"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          :to="feature.to"
          class="feature-card"
          elevation="2"
        >
          <div
            class="feature-header"
            :style="{ background: feature.bgGradient }"
          >
            <img
              :src="feature.pet"
              :alt="feature.title"
              class="feature-pet"
            >
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
        <img
          src="@/assets/柯基.svg"
          alt=""
          class="footer-pet-small"
        >
        <img
          src="@/assets/布偶猫.svg"
          alt=""
          class="footer-pet-small"
        >
        <img
          src="@/assets/边牧.svg"
          alt=""
          class="footer-pet-small"
        >
      </div>
      <v-chip
        variant="tonal"
        size="small"
        class="mt-4"
      >
        λύμη + ἴσος — 光的等价形态
      </v-chip>
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

<style scoped>
.home-container {
  max-width: 1000px;
  min-height: 100vh;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  padding: 32px 16px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.welcome-pet {
  width: 100px;
  height: 100px;
  animation: bounce-in 0.8s ease-out;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    transform: scale(1.05) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.welcome-text {
  animation: fade-up 0.6s ease-out 0.3s both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-title {
  font-size: 32px;
  font-weight: 300;
  color: #f5a623;
  margin: 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #888;
  margin: 4px 0 0;
}

/* 功能卡片 */
.feature-section {
  padding: 16px;
}

.feature-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-header {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-pet {
  width: 80px;
  height: 80px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-pet {
  transform: scale(1.1);
}

/* 底部区域 */
.footer-section {
  text-align: center;
  padding: 32px 16px;
}

.footer-pets {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-pet-small {
  width: 48px;
  height: 48px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.footer-pet-small:hover {
  opacity: 1;
  transform: scale(1.2) rotate(10deg);
}
</style>
