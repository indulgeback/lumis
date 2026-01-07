<template>
  <canvas ref="canvas" class="bg-canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null
let time = 0

// 流动形状类
class FloatingShape {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
  phase: number

  constructor(w: number, h: number, color: string) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.radius = Math.random() * 200 + 100
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.3
    this.color = color
    this.phase = Math.random() * Math.PI * 2
  }

  update(w: number, h: number) {
    this.x += this.vx
    this.y += this.vy

    // 边界反弹
    if (this.x < -this.radius) this.vx = Math.abs(this.vx)
    if (this.x > w + this.radius) this.vx = -Math.abs(this.vx)
    if (this.y < -this.radius) this.vy = Math.abs(this.vy)
    if (this.y > h + this.radius) this.vy = -Math.abs(this.vy)

    // 呼吸效果
    this.phase += 0.01
  }

  draw(ctx: CanvasRenderingContext2D) {
    const breathingRadius = this.radius + Math.sin(this.phase) * 30

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      breathingRadius
    )

    // 解析颜色并添加透明度
    gradient.addColorStop(0, this.color.replace('1)', '0.15)'))
    gradient.addColorStop(0.5, this.color.replace('1)', '0.05)'))
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, breathingRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}

const shapes: FloatingShape[] = []

const initCanvas = () => {
  const cvs = canvas.value
  if (!cvs) return

  const ctx = cvs.getContext('2d')
  if (!ctx) return

  const resize = () => {
    cvs.width = window.innerWidth
    cvs.height = window.innerHeight
  }

  resize()
  window.addEventListener('resize', resize)

  // 创建流动形状 - 使用主题色
  shapes.length = 0
  const colors = [
    'rgba(5, 150, 105, 1)',   // 绿色
    'rgba(249, 115, 22, 1)',  // 橙色
    'rgba(8, 145, 178, 1)',   // 青色
  ]

  for (let i = 0; i < 8; i++) {
    shapes.push(new FloatingShape(cvs.width, cvs.height, colors[i % colors.length]))
  }

  const animate = () => {
    time += 0.01

    ctx.clearRect(0, 0, cvs.width, cvs.height)

    // 绘制背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, cvs.width, cvs.height)
    bgGradient.addColorStop(0, '#fafafa')
    bgGradient.addColorStop(0.5, '#f5f5f5')
    bgGradient.addColorStop(1, '#fafafa')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, cvs.width, cvs.height)

    // 绘制流动形状
    shapes.forEach(shape => {
      shape.update(cvs.width, cvs.height)
      shape.draw(ctx)
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
