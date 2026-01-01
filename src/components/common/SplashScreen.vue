<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="splash-screen">
      <div class="splash-content">
        <!-- 光芒动画 -->
        <div class="sun-rays">
          <div
            v-for="i in 12"
            :key="i"
            class="ray"
            :style="{ transform: `rotate(${i * 30}deg)` }"
          />
        </div>

        <!-- Logo 图标 - 可爱的柴犬 -->
        <div class="logo-container">
          <img src="@/assets/柴犬.svg" alt="Lumis" class="logo-image" />
        </div>

        <!-- 应用名称 -->
        <h1 class="app-name">Lumis</h1>
        <p class="app-tagline">压缩你创造的美</p>

        <!-- 加载指示器 -->
        <div class="loading-bar">
          <div class="loading-progress" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

const emit = defineEmits<{
  (e: 'complete'): void
}>()

onMounted(() => {
  setTimeout(() => {
    visible.value = false
    setTimeout(() => {
      emit('complete')
    }, 500)
  }, 3000)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5a623 0%, #ffca28 50%, #ffd54f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-content {
  text-align: center;
  position: relative;
}

/* 光芒动画 */
.sun-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  animation: rotate-rays 20s linear infinite;
}

.ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 100px;
  background: linear-gradient(to top, transparent, rgba(255, 255, 255, 0.4));
  transform-origin: bottom center;
  margin-left: -1px;
}

@keyframes rotate-rays {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Logo 容器 */
.logo-container {
  position: relative;
  z-index: 1;
  width: 140px;
  height: 140px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-glow 2s ease-in-out infinite;
  backdrop-filter: blur(10px);
}

.logo-image {
  width: 100px;
  height: 100px;
  animation: icon-bounce 1s ease-out;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
  }
}

@keyframes icon-bounce {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(30px);
  }
  50% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 应用名称 */
.app-name {
  font-size: 48px;
  font-weight: 300;
  color: white;
  margin: 0 0 8px;
  letter-spacing: 8px;
  animation: text-appear 0.8s ease-out 0.3s both;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-tagline {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px;
  letter-spacing: 4px;
  animation: text-appear 0.8s ease-out 0.5s both;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

@keyframes text-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载条 */
.loading-bar {
  width: 200px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
  animation: text-appear 0.8s ease-out 0.7s both;
}

.loading-progress {
  height: 100%;
  background: white;
  border-radius: 2px;
  animation: loading 1.8s ease-in-out;
}

@keyframes loading {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

/* 淡出动画 */
.splash-fade-leave-active {
  transition: opacity 0.5s ease;
}

.splash-fade-leave-to {
  opacity: 0;
}
</style>
