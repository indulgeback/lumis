<template>
  <v-app>
    <!-- 窗口拖动条 -->
    <div class="titlebar-drag-area" />

    <!-- 背景动画 -->
    <BackgroundAnimation />

    <!-- 启动动画 -->
    <SplashScreen v-if="showSplash" @complete="onSplashComplete" />

    <template v-if="appReady">
      <v-navigation-drawer permanent class="app-drawer">
        <!-- 头部 Logo -->
        <div class="drawer-header">
          <Vue3Lottie
            :animation-data="logoAnimation"
            :loop="true"
            :auto-play="true"
            :height="48"
            :width="48"
            class="drawer-logo"
          />
          <div class="drawer-title">
            <h1 class="title-text">Lumis</h1>
            <p class="title-subtitle">压缩你创造的美</p>
          </div>
        </div>

        <v-divider class="my-2" />

        <v-list class="nav-list" density="compact" nav>
          <v-list-item prepend-icon="mdi-home" title="首页" value="home" to="/" />
          <v-list-item prepend-icon="mdi-video" title="视频处理" value="video" to="/video" />
          <v-list-item prepend-icon="mdi-image" title="图片处理" value="image" to="/image" />
        </v-list>

        <!-- 环境状态 -->
        <template v-if="envChecked">
          <v-divider class="my-2" />

          <!-- Python 状态 -->
          <v-list-item
            :prepend-icon="pythonAvailable ? 'mdi-language-python' : 'mdi-alert-circle'"
            :title="pythonAvailable ? 'Python' : 'Python 未就绪'"
            :subtitle="pythonVersion || pythonError"
            :class="pythonAvailable ? 'env-ready' : 'env-error'"
            density="compact"
            @click="showEnvDialog = true"
          />

          <!-- 工具状态 -->
          <v-list-item
            :prepend-icon="toolInstalled ? 'mdi-package-check' : 'mdi-package-down'"
            :title="toolInstalled ? 'frame-extractor' : '工具未安装'"
            :subtitle="toolInstalled ? toolVersion : '点击安装'"
            :class="toolInstalled ? 'env-ready' : 'env-warning'"
            density="compact"
            @click="showEnvDialog = true"
          />
        </template>

        <!-- 底部装饰 -->
        <template #append>
          <div class="drawer-footer" />
        </template>
      </v-navigation-drawer>

      <v-main>
        <router-view />
      </v-main>

      <!-- 环境详情对话框 -->
      <v-dialog v-model="showEnvDialog" max-width="480">
        <v-card class="env-dialog">
          <v-card-title>环境状态</v-card-title>

          <v-card-text>
            <!-- Python 环境 -->
            <div class="env-section">
              <div class="env-header">
                <v-icon
                  :icon="pythonAvailable ? 'mdi-check-circle' : 'mdi-alert-circle'"
                  :color="pythonAvailable ? 'success' : 'warning'"
                  class="mr-2"
                />
                <span class="text-subtitle-1">Python 环境</span>
              </div>

              <template v-if="pythonAvailable">
                <div class="env-info">
                  <span class="label">版本</span>
                  <span>{{ pythonVersion }}</span>
                </div>
                <div class="env-info">
                  <span class="label">命令</span>
                  <code>{{ pythonPath }}</code>
                </div>
              </template>
              <template v-else>
                <v-alert type="warning" variant="tonal" density="compact" class="mt-2">
                  {{ pythonError }}
                </v-alert>
              </template>
            </div>

            <v-divider class="my-4" />

            <!-- frame-extractor 工具 -->
            <div class="env-section">
              <div class="env-header">
                <v-icon
                  :icon="toolInstalled ? 'mdi-check-circle' : 'mdi-package-down'"
                  :color="toolInstalled ? 'success' : 'warning'"
                  class="mr-2"
                />
                <span class="text-subtitle-1">frame-extractor 工具</span>
              </div>

              <template v-if="toolInstalled">
                <div class="env-info">
                  <span class="label">状态</span>
                  <v-chip color="success" size="small"> 已安装 </v-chip>
                </div>
                <div v-if="toolVersion" class="env-info">
                  <span class="label">版本</span>
                  <span>{{ toolVersion }}</span>
                </div>
              </template>
              <template v-else>
                <v-alert type="info" variant="tonal" density="compact" class="mt-2 mb-3">
                  视频首帧提取和图片压缩功能需要安装此工具
                </v-alert>

                <!-- 安装进度 -->
                <template v-if="installing">
                  <v-progress-linear indeterminate color="primary" class="mb-2" />
                  <div class="install-log">
                    <pre>{{ installLog }}</pre>
                  </div>
                </template>

                <!-- 安装按钮 -->
                <v-btn
                  v-if="!installing && pythonAvailable"
                  color="primary"
                  variant="tonal"
                  block
                  @click="installTool"
                >
                  <v-icon icon="mdi-download" left />
                  一键安装
                </v-btn>

                <v-alert v-if="!pythonAvailable" type="warning" variant="tonal" density="compact">
                  请先安装 Python 环境
                </v-alert>

                <!-- 安装结果 -->
                <v-alert
                  v-if="installError"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  {{ installError }}
                </v-alert>
              </template>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="recheckEnv"> 重新检测 </v-btn>
            <v-btn color="primary" variant="tonal" @click="showEnvDialog = false"> 确定 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SplashScreen from './components/common/SplashScreen.vue'
import BackgroundAnimation from './components/common/BackgroundAnimation.vue'
import logoAnimation from '@/assets/lottie/logo.json'

const showSplash = ref(true)
const appReady = ref(false)

// 环境状态
const envChecked = ref(false)
const showEnvDialog = ref(false)

// Python 环境
const pythonAvailable = ref(false)
const pythonVersion = ref('')
const pythonPath = ref('')
const pythonError = ref('')

// frame-extractor 工具
const toolInstalled = ref(false)
const toolVersion = ref('')

// 安装状态
const installing = ref(false)
const installLog = ref('')
const installError = ref('')

const onSplashComplete = () => {
  showSplash.value = false
  appReady.value = true
}

// 检查 Python 环境
const checkPythonEnvironment = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.checkPythonEnvironment()
      pythonAvailable.value = result.available
      pythonVersion.value = result.version ? `Python ${result.version}` : ''
      pythonPath.value = result.path || ''
      pythonError.value = result.error || ''
    } else {
      pythonAvailable.value = false
      pythonError.value = '仅在 Electron 环境中可用'
    }
  } catch {
    pythonAvailable.value = false
    pythonError.value = '检测失败'
  }
}

// 检查 frame-extractor 工具
const checkFrameExtractor = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.checkFrameExtractor()
      toolInstalled.value = result.installed
      toolVersion.value = result.version ? `v${result.version}` : ''
    } else {
      toolInstalled.value = false
    }
  } catch {
    toolInstalled.value = false
  }
}

// 检查所有环境
const checkAllEnv = async () => {
  await checkPythonEnvironment()
  if (pythonAvailable.value) {
    await checkFrameExtractor()
  }
  envChecked.value = true
}

// 重新检测
const recheckEnv = () => {
  envChecked.value = false
  installError.value = ''
  checkAllEnv()
}

// 安装工具
const installTool = async () => {
  if (!window.electronAPI) return

  installing.value = true
  installLog.value = ''
  installError.value = ''

  // 监听安装进度
  window.electronAPI.onInstallProgress((output: string) => {
    installLog.value += output
  })

  try {
    const result = await window.electronAPI.installFrameExtractor()

    if (result.success) {
      // 安装成功，重新检测
      await checkFrameExtractor()
      installLog.value += '\n✅ 安装完成！'
    } else {
      installError.value = result.error || result.message
    }
  } catch (error) {
    installError.value = '安装过程出错'
  } finally {
    installing.value = false
    window.electronAPI.removeInstallProgressListener()
  }
}

onMounted(() => {
  setTimeout(checkAllEnv, 500)
})

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeInstallProgressListener()
  }
})
</script>

<style>
html,
body {
  width: 100vw; /* 占满视口宽度 */
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
}

/* 全局滚动条隐藏 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* Firefox 滚动条隐藏 */
* {
  scrollbar-width: none;
}

/* 窗口拖动条 */
.titlebar-drag-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  -webkit-app-region: drag;
  z-index: 9999;
  pointer-events: none;
}
</style>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

/* 主内容区域 - 透明背景 */
:deep(.v-main) {
  background: transparent;
  position: relative;
  z-index: 1;
}

/* 侧边栏样式 - iOS 液态玻璃 */
.app-drawer {
  @include ios-glass-sidebar;

  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
  }
}

.drawer-header {
  padding: $spacing-3xl $spacing-lg $spacing-xl;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  -webkit-app-region: drag;
}

.drawer-logo {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.drawer-title {
  flex: 1;
  min-width: 0;
}

.title-text {
  font-size: 20px;
  font-weight: 600;
  color: $primary-color;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.title-subtitle {
  font-size: 12px;
  color: $text-secondary;
  margin: 2px 0 0;
  line-height: 1.2;
}

.drawer-footer {
  padding: $spacing-lg;
  text-align: center;
}

.footer-pet {
  width: 64px;
  height: 64px;
  opacity: 0.6;
  transition: all $duration-medium $ease-standard;
}

.footer-pet:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 环境状态样式 */
.env-ready :deep(.v-list-item-title) {
  color: $success-color;
}

.env-error :deep(.v-list-item-title) {
  color: $error-color;
}

.env-warning :deep(.v-list-item-title) {
  color: $warning-color;
}

.env-section {
  margin-bottom: $spacing-md;
}

.env-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

.env-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
}

.env-info .label {
  color: $text-secondary;
  font-size: 14px;
}

.env-info code {
  background: $surface-container-high;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-primary;
}

.install-log {
  background: #1a1a1a;
  color: #e0e0e0;
  padding: $spacing-md;
  border-radius: $radius-md;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  margin-bottom: $spacing-md;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.install-log pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 导航列表样式 */
.nav-list {
  padding: $spacing-sm $spacing-md;

  :deep(.v-list-item) {
    border-radius: $radius-full;
    margin-bottom: $spacing-xs;
    padding: 0 $spacing-md;

    &::before {
      border-radius: inherit;
    }

    .v-list-item__overlay {
      border-radius: inherit;
    }

    &.v-list-item--active {
      background: $primary-container;
      color: $on-primary-container;

      .v-list-item__prepend {
        .v-icon {
          color: $on-primary-container;
        }
      }
    }

    &:hover:not(.v-list-item--active) {
      background: $surface-container-high;
    }
  }
}

/* 对话框样式 - iOS 液态玻璃 */
.env-dialog {
  @include ios-glass-card;

  :deep(.v-card-title) {
    padding: $spacing-lg $spacing-lg $spacing-sm;
    font-size: 20px;
    font-weight: 600;
  }

  :deep(.v-card-text) {
    padding: 0 $spacing-lg $spacing-lg;
  }

  :deep(.v-card-actions) {
    padding: $spacing-sm $spacing-lg $spacing-lg;
  }
}

/* 分隔线 - 半透明 */
:deep(.v-navigation-drawer .v-divider) {
  border-color: rgba(0, 0, 0, 0.06);
}
</style>
