<template>
  <v-container class="video-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <img
        src="@/assets/法斗.svg"
        alt=""
        class="page-pet"
      >
      <div class="header-text">
        <h1 class="page-title">
          视频处理
        </h1>
        <p class="page-subtitle">
          压缩视频或提取首帧，轻松高效
        </p>
      </div>
    </div>

    <!-- 功能选择 -->
    <v-row class="mt-6">
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="action-card"
          elevation="2"
          @click="handleSelectVideo('compress')"
        >
          <div class="card-body">
            <div
              class="card-icon-wrapper"
              style="background: linear-gradient(135deg, #fff3e0, #ffe0b2)"
            >
              <v-icon
                size="32"
                color="#f5a623"
              >
                mdi-video-minus
              </v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                视频压缩
              </h3>
              <p class="card-desc">
                减小视频体积，保持画质
              </p>
            </div>
            <v-icon
              class="card-arrow"
              color="grey-lighten-1"
            >
              mdi-arrow-right
            </v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="action-card"
          elevation="2"
          @click="handleSelectVideo('extract')"
        >
          <div class="card-body">
            <div
              class="card-icon-wrapper"
              style="background: linear-gradient(135deg, #e3f2fd, #bbdefb)"
            >
              <v-icon
                size="32"
                color="#42a5f5"
              >
                mdi-image-frame
              </v-icon>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                首帧截取
              </h3>
              <p class="card-desc">
                提取视频第一帧作为封面
              </p>
            </div>
            <v-icon
              class="card-arrow"
              color="grey-lighten-1"
            >
              mdi-arrow-right
            </v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 功能即将推出提示 -->
    <div class="coming-soon">
      <img
        src="@/assets/腊肠犬.svg"
        alt=""
        class="coming-soon-pet"
      >
      <v-alert
        type="info"
        variant="tonal"
        class="mt-4"
      >
        功能即将推出，敬请期待~
      </v-alert>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const handleSelectVideo = (action: 'compress' | 'extract') => {
  console.log('Selected action:', action)
  // TODO: 实现视频选择和处理逻辑
}
</script>

<style scoped>
.video-container {
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.page-pet {
  width: 80px;
  height: 80px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  color: #f5a623;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
  margin: 4px 0 0;
}

/* 功能卡片 */
.action-card {
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
}

.card-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.card-arrow {
  flex-shrink: 0;
}

/* 即将推出区域 */
.coming-soon {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #fff8e1, #ffffff);
  border-radius: 16px;
}

.coming-soon-pet {
  width: 60px;
  height: 60px;
}
</style>
