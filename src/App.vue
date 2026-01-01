<template>
  <v-app>
    <!-- 启动动画 -->
    <SplashScreen
      v-if="showSplash"
      @complete="onSplashComplete"
    />

    <template v-if="appReady">
      <v-navigation-drawer
        permanent
        class="app-drawer"
      >
        <!-- 头部 Logo -->
        <div class="drawer-header">
          <img
            src="@/assets/柴犬.svg"
            alt="Lumis"
            class="drawer-logo"
          >
          <div class="drawer-title">
            <h1 class="title-text">
              Lumis
            </h1>
            <p class="title-subtitle">
              压缩你创造的美
            </p>
          </div>
        </div>

        <v-divider class="my-2" />

        <v-list
          density="compact"
          nav
        >
          <v-list-item
            prepend-icon="mdi-home"
            title="首页"
            value="home"
            to="/"
          />
          <v-list-item
            prepend-icon="mdi-video"
            title="视频处理"
            value="video"
            to="/video"
          />
          <v-list-item
            prepend-icon="mdi-image"
            title="图片处理"
            value="image"
            to="/image"
          />
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
          <div class="drawer-footer">
            <img
              src="@/assets/金毛.svg"
              alt=""
              class="footer-pet"
            >
          </div>
        </template>
      </v-navigation-drawer>

      <v-main>
        <router-view />
      </v-main>

      <!-- 环境详情对话框 -->
      <v-dialog
        v-model="showEnvDialog"
        max-width="480"
      >
        <v-card>
          <v-card-title>环境状态</v-card-title>

          <v-card-text>
            <!-- Python 环境 -->
            <div class="env-section">
              <div class="env-header">
                <v-icon
                  :color="pythonAvailable ? 'success' : 'warning'"
                  class="mr-2"
                >
                  {{ pythonAvailable ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                </v-icon>
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
                <v-alert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  {{ pythonError }}
                </v-alert>
              </template>
            </div>

            <v-divider class="my-4" />

            <!-- frame-extractor 工具 -->
            <div class="env-section">
              <div class="env-header">
                <v-icon
                  :color="toolInstalled ? 'success' : 'warning'"
                  class="mr-2"
                >
                  {{ toolInstalled ? 'mdi-check-circle' : 'mdi-package-down' }}
                </v-icon>
                <span class="text-subtitle-1">frame-extractor 工具</span>
              </div>

              <template v-if="toolInstalled">
                <div class="env-info">
                  <span class="label">状态</span>
                  <v-chip
                    color="success"
                    size="small"
                  >
                    已安装
                  </v-chip>
                </div>
                <div
                  v-if="toolVersion"
                  class="env-info"
                >
                  <span class="label">版本</span>
                  <span>{{ toolVersion }}</span>
                </div>
              </template>
              <template v-else>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-2 mb-3"
                >
                  视频首帧提取和图片压缩功能需要安装此工具
                </v-alert>

                <!-- 安装进度 -->
                <template v-if="installing">
                  <v-progress-linear
                    indeterminate
                    color="primary"
                    class="mb-2"
                  />
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
                  <v-icon left>
                    mdi-download
                  </v-icon>
                  一键安装
                </v-btn>

                <v-alert
                  v-if="!pythonAvailable"
                  type="warning"
                  variant="tonal"
                  density="compact"
                >
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
            <v-btn
              variant="text"
              @click="recheckEnv"
            >
              重新检测
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              @click="showEnvDialog = false"
            >
              确定
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SplashScreen from './components/common/SplashScreen.vue'

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

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 滚动条轨道 - 透明不占空间 */
::-webkit-scrollbar-track {
  background: transparent;
}

/* 滚动条滑块 - 半透明主题色，悬浮在内容上 */
::-webkit-scrollbar-thumb {
  background: rgba(245, 166, 35, 0.5);
  border-radius: 4px;
}

/* 滚动条滑块悬停 */
::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 166, 35, 0.7);
}

/* Firefox 滚动条 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(245, 166, 35, 0.5) transparent;
}
</style>

<style scoped>
/* 侧边栏样式 */
.app-drawer {
  background: linear-gradient(180deg, #fff8e1 0%, #ffffff 100%);
}

.drawer-header {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 22px;
  font-weight: 600;
  color: #f5a623;
  margin: 0;
  line-height: 1.2;
}

.title-subtitle {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
  line-height: 1.2;
}

.drawer-footer {
  padding: 16px;
  text-align: center;
}

.footer-pet {
  width: 80px;
  height: 80px;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.footer-pet:hover {
  transform: scale(1.1) rotate(5deg);
}

/* 环境状态样式 */
.env-ready :deep(.v-list-item-title) {
  color: #66bb6a;
}

.env-error :deep(.v-list-item-title) {
  color: #ef5350;
}

.env-warning :deep(.v-list-item-title) {
  color: #ffa726;
}

.env-section {
  margin-bottom: 8px;
}

.env-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.env-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.env-info .label {
  color: #888;
  font-size: 14px;
}

.env-info code {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.install-log {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  margin-bottom: 12px;
}

.install-log pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
