<template>
  <v-container>
    <!-- 顶部欢迎区域 -->
    <div class="text-center py-8">
      <v-avatar size="100" color="primary" class="mb-4">
        <v-icon size="56" color="white"> mdi-white-balance-sunny </v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-light mb-2">Lumis</h1>
      <p class="text-subtitle-1 text-medium-emphasis">压缩你创造的美</p>
    </div>

    <!-- 功能卡片区域 -->
    <v-row justify="center" class="mt-4">
      <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
        <v-card :to="feature.to" :color="feature.color" variant="tonal" class="pa-4">
          <v-card-item>
            <template #prepend>
              <v-avatar :color="feature.color" size="56">
                <v-icon size="28" color="white">
                  {{ feature.icon }}
                </v-icon>
              </v-avatar>
            </template>
            <v-card-title>
              {{ feature.title }}
            </v-card-title>
            <v-card-subtitle>
              {{ feature.subtitle }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            {{ feature.description }}
          </v-card-text>

          <v-card-actions>
            <v-btn :color="feature.color" variant="tonal" append-icon="mdi-arrow-right" block>
              开始使用
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 底部信息 -->
    <div class="text-center mt-12">
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
    icon: 'mdi-video-minus',
    color: 'primary',
    to: '/video'
  },
  {
    title: '首帧截取',
    subtitle: '一键提取',
    description: '快速提取视频第一帧作为封面图，支持多种输出格式',
    icon: 'mdi-image-frame',
    color: 'secondary',
    to: '/video'
  },
  {
    title: '图片压缩',
    subtitle: '批量处理',
    description: '高效压缩图片文件，支持 JPG、PNG、WebP 等多种格式',
    icon: 'mdi-image-size-select-small',
    color: 'accent',
    to: '/image'
  }
]
</script>
