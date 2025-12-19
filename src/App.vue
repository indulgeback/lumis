<template>
  <v-app>
    <!-- 启动动画 -->
    <SplashScreen v-if="showSplash" @complete="onSplashComplete" />

    <template v-if="appReady">
      <v-navigation-drawer permanent>
        <v-list-item
          prepend-icon="mdi-white-balance-sunny"
          title="Lumis"
          subtitle="压缩你创造的美"
        />

        <v-divider />

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home" title="首页" value="home" to="/" />
          <v-list-item prepend-icon="mdi-video" title="视频处理" value="video" to="/video" />
          <v-list-item prepend-icon="mdi-image" title="图片处理" value="image" to="/image" />
        </v-list>

        <!-- Python 环境状态 -->
        <template v-if="pythonChecked">
          <v-divider class="my-2" />
          <v-list-item
            :prepend-icon="pythonAvailable ? 'mdi-check-circle' : 'mdi-alert-circle'"
            :title="pythonAvailable ? 'Python 就绪' : 'Python 未就绪'"
            :subtitle="pythonVersion || pythonError"
            :class="pythonAvailable ? 'python-ready' : 'python-error'"
            density="compact"
            @click="showPythonDialog = true"
          />
        </template>
      </v-navigation-drawer>

      <v-main>
        <router-view />
      </v-main>

      <!-- Python 环境详情对话框 -->
      <v-dialog v-model="showPythonDialog" max-width="420">
        <v-card class="python-dialog">
          <v-card-title class="d-flex align-center">
            <v-icon :color="pythonAvailable ? 'success' : 'warning'" class="mr-2">
              {{ pythonAvailable ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            Python 环境
          </v-card-title>

          <v-card-text>
            <template v-if="pythonAvailable">
              <div class="status-item">
                <span class="label">状态</span>
                <v-chip color="success" size="small"> 已就绪 </v-chip>
              </div>
              <div class="status-item">
                <span class="label">版本</span>
                <span class="value">{{ pythonVersion }}</span>
              </div>
              <div class="status-item">
                <span class="label">命令</span>
                <code>{{ pythonPath }}</code>
              </div>
            </template>

            <template v-else>
              <v-alert type="warning" variant="tonal" class="mb-4">
                {{ pythonError }}
              </v-alert>
              <p class="text-body-2 mb-2">
                请确保已安装 Python 3.8 或更高版本，并已添加到系统 PATH。
              </p>
              <p class="text-body-2 text-medium-emphasis">安装完成后，请重启应用。</p>
            </template>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn v-if="!pythonAvailable" variant="text" @click="recheckPython"> 重新检测 </v-btn>
            <v-btn color="primary" variant="flat" @click="showPythonDialog = false"> 确定 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SplashScreen from './components/common/SplashScreen.vue'

const showSplash = ref(true)
const appReady = ref(false)

// Python 环境状态
const pythonChecked = ref(false)
const pythonAvailable = ref(false)
const pythonVersion = ref('')
const pythonPath = ref('')
const pythonError = ref('')
const showPythonDialog = ref(false)

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
      // 非 Electron 环境（开发时浏览器预览）
      pythonAvailable.value = false
      pythonError.value = '仅在 Electron 环境中可用'
    }
  } catch (error) {
    pythonAvailable.value = false
    pythonError.value = '检测失败'
  } finally {
    pythonChecked.value = true
  }
}

const recheckPython = () => {
  pythonChecked.value = false
  checkPythonEnvironment()
}

onMounted(() => {
  // 延迟检测，等待应用完全加载
  setTimeout(checkPythonEnvironment, 500)
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.python-ready :deep(.v-list-item-title) {
  color: #66bb6a;
}

.python-error :deep(.v-list-item-title) {
  color: #ffa726;
}

.python-dialog {
  border-radius: 16px !important;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  color: #888;
  font-size: 14px;
}

.status-item .value {
  font-weight: 500;
}

.status-item code {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
