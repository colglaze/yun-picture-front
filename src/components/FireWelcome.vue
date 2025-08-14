<template>
  <div class="fireworks-container">
    <!-- 星空背景 -->
    <div class="stars"></div>

    <!-- 欢迎文字 -->
    <div class="welcome-text">
      <h1 :class="{ 'show': showTitle }">欢迎来到我的网站</h1>
      <p :class="{ 'show': showSubtitle }">愿你在这里找到美好的体验</p>
    </div>

    <!-- 烟花画布 -->
    <canvas ref="fireworksCanvas"></canvas>

    <!-- 交互按钮 -->
    <button
      class="restart-btn"
      @click="restartFireworks"
      :class="{ 'show': showButton }"
    >
      再放一次烟花
    </button>
  </div>
</template>

<script>
export default {
  name: 'FireworksWelcome',
  data() {
    return {
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,
      fireworks: [],
      particles: [],
      sparks: [], // 新增火花粒子
      animationFrame: null,
      showTitle: false,
      showSubtitle: false,
      showButton: false,
      lastFireworkTime: 0,
      fireworkInterval: 1200, // 缩短发射间隔
      hueOffset: 0, // 色调偏移，让烟花颜色渐变
      starPoints: [] // 星空点
    }
  },
  mounted() {
    // 初始化星空背景
    this.initStars()

    // 初始化画布
    this.canvas = this.$refs.fireworksCanvas
    this.ctx = this.canvas.getContext('2d')

    // 设置画布尺寸
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)

    // 开始动画
    this.startAnimation()

    // 文字动画延迟显示
    setTimeout(() => {
      this.showTitle = true
    }, 800)

    setTimeout(() => {
      this.showSubtitle = true
    }, 1300)

    // 显示按钮
    setTimeout(() => {
      this.showButton = true
    }, 4000)
  },
  beforeDestroy() {
    // 清理动画和事件监听
    cancelAnimationFrame(this.animationFrame)
    window.removeEventListener('resize', this.resizeCanvas)
  },
  methods: {
    initStars() {
      // 创建随机星空点
      this.starPoints = []
      const starCount = Math.floor(window.innerWidth * window.innerHeight / 1500)
      for (let i = 0; i < starCount; i++) {
        this.starPoints.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.5 + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          twinkle: Math.random() > 0.7 // 部分星星会闪烁
        })
      }
    },
    resizeCanvas() {
      // 设置画布尺寸为窗口大小
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.canvas.width = this.width
      this.canvas.height = this.height

      // 重新生成星空
      this.initStars()
    },
    startAnimation() {
      // 初始发射更多烟花
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.launchFirework()
        }, i * 600)
      }

      // 开始动画循环
      this.animate()
    },
    animate(timestamp) {
      // 清除画布，使用半透明黑色创建拖尾效果
      this.ctx.fillStyle = 'rgba(10, 10, 30, 0.15)'
      this.ctx.fillRect(0, 0, this.width, this.height)

      // 更新色调偏移，让烟花颜色变化更丰富
      this.hueOffset = (this.hueOffset + 0.2) % 360

      // 定期发射新烟花
      if (!timestamp) timestamp = 0
      if (timestamp - this.lastFireworkTime > this.fireworkInterval) {
        this.launchFirework()
        this.lastFireworkTime = timestamp
      }

      // 更新和绘制所有烟花
      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const firework = this.fireworks[i]
        if (firework.update()) {
          // 烟花到达顶点，爆炸产生粒子
          this.explodeFirework(firework)
          this.fireworks.splice(i, 1)
        } else {
          firework.draw()
        }
      }

      // 更新和绘制所有爆炸粒子
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i]
        if (particle.update()) {
          this.particles.splice(i, 1)
        } else {
          particle.draw()
        }
      }

      // 更新和绘制火花粒子
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const spark = this.sparks[i]
        if (spark.update()) {
          this.sparks.splice(i, 1)
        } else {
          spark.draw()
        }
      }

      // 继续动画循环
      this.animationFrame = requestAnimationFrame(this.animate)
    },
    launchFirework() {
      // 随机位置发射烟花，增加左右分布范围
      const x = Math.random() * (this.width - 100) + 50
      const y = this.height
      // 烟花目标点更分散
      const targetY = Math.random() * (this.height / 3) + 80
      // 加入一些左右偏移的目标点，让轨迹更丰富
      const targetX = x + (Math.random() - 0.5) * 100
      // 基于色调偏移生成颜色，确保多样性
      const hue = (Math.random() * 120 + this.hueOffset) % 360

      this.fireworks.push(new Firework(
        this.ctx,
        x, y,
        targetX, targetY,
        hue
      ))
    },
    explodeFirework(firework) {
      // 增加粒子数量，让爆炸更密集
      const particleCount = Math.floor(Math.random() * 80) + 120

      // 爆炸光效
      this.createExplosionGlow(firework.targetX, firework.targetY, firework.hue)

      for (let i = 0; i < particleCount; i++) {
        // 随机粒子速度和角度
        const angle = Math.random() * Math.PI * 2
        // 粒子速度范围更大，爆炸更散开
        const speed = Math.random() * 8 + 3
        // 随机粒子大小
        const size = Math.random() * 2.5 + 1
        // 让粒子颜色有微妙变化
        const hueVariation = firework.hue + (Math.random() - 0.5) * 30

        this.particles.push(new Particle(
          this.ctx,
          firework.targetX,
          firework.targetY,
          hueVariation,  // 修正：hue参数
          speed,         // 修正：speed参数
          angle,         // 修正：angle参数
          size          // 修正：size参数
        ))

        // 每几个粒子额外生成一个火花
        if (i % 5 === 0) {
          this.sparks.push(new Spark(
            this.ctx,
            firework.targetX,
            firework.targetY,
            angle + (Math.random() - 0.5) * 0.5,
            speed * 1.5,
            hueVariation
          ))
        }
      }
    },
    createExplosionGlow(x, y, hue) {
      // 爆炸中心光效
      const glowSize = Math.random() * 30 + 50
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize)
      gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.8)`)
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, 0.3)`)
      gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(x, y, glowSize, 0, Math.PI * 2)
      this.ctx.fillStyle = gradient
      this.ctx.fill()
    },
    restartFireworks() {
      // 清除现有烟花和粒子
      this.fireworks = []
      this.particles = []
      this.sparks = []

      // 重新发射烟花
      this.lastFireworkTime = 0
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.launchFirework()
        }, i * 500)
      }

      // 按钮动画
      this.showButton = false
      setTimeout(() => {
        this.showButton = true
      }, 500)
    }
  }
}

// 烟花类
class Firework {
  constructor(ctx, startX, startY, targetX, targetY, hue) {
    this.ctx = ctx
    this.x = startX
    this.y = startY
    this.startX = startX
    this.startY = startY
    this.targetX = targetX
    this.targetY = targetY
    this.hue = hue
    this.distanceToTarget = Math.sqrt(
      Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
    )
    this.distanceTraveled = 0
    this.angle = Math.atan2(targetY - startY, targetX - startX)
    this.speed = 8
    this.acceleration = 1.025
    this.brightness = Math.random() * 50 + 50
    this.targetRadius = 1
    this.trail = []
    this.trailLength = 5
  }

  update() {
    this.trail.push([this.x, this.y])
    if (this.trail.length > this.trailLength) {
      this.trail.shift()
    }

    this.speed *= this.acceleration

    const xVel = Math.cos(this.angle) * this.speed
    const yVel = Math.sin(this.angle) * this.speed

    this.distanceTraveled = Math.sqrt(
      Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2)
    )

    if (this.distanceTraveled >= this.distanceToTarget) {
      return true
    }

    this.x += xVel
    this.y += yVel

    return false
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.moveTo(this.trail[0][0], this.trail[0][1])
    for (let i = 1; i < this.trail.length; i++) {
      this.ctx.lineTo(this.trail[i][0], this.trail[i][1])
    }
    this.ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${0.8})`
    this.ctx.lineWidth = this.targetRadius * 2
    this.ctx.stroke()
    this.ctx.closePath()
  }
}

// 粒子类
class Particle {
  constructor(ctx, x, y, hue, speed, angle, size = 2) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.hue = hue
    this.speed = speed
    this.angle = angle
    this.size = size
    this.brightness = Math.random() * 30 + 70
    this.alpha = 1
    this.decay = Math.random() * 0.006 + 0.006  // 进一步减小衰减速度
    this.gravity = 0.3  // 进一步减小重力效果
    this.velocityX = Math.cos(angle) * speed * 0.6  // 进一步降低水平速度
    this.velocityY = Math.sin(angle) * speed * 0.6  // 进一步降低垂直速度
    this.trail = []
    this.trailLength = 5
  }

  update() {
    this.trail.push([this.x, this.y])
    if (this.trail.length > this.trailLength) {
      this.trail.shift()
    }

    this.velocityY += this.gravity
    this.x += this.velocityX
    this.y += this.velocityY
    this.alpha -= this.decay

    return this.alpha <= 0
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.moveTo(this.trail[0][0], this.trail[0][1])
    for (let i = 1; i < this.trail.length; i++) {
      this.ctx.lineTo(this.trail[i][0], this.trail[i][1])
    }
    this.ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`
    this.ctx.lineWidth = this.size
    this.ctx.stroke()
    this.ctx.closePath()
  }
}

// 火花类
class Spark {
  constructor(ctx, x, y, angle, speed, hue) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.hue = hue
    this.angle = angle
    this.speed = speed
    this.friction = 0.98
    this.gravity = 1
    this.alpha = 1
    this.decay = Math.random() * 0.1 + 0.025
    this.velocityX = Math.cos(angle) * speed
    this.velocityY = Math.sin(angle) * speed
  }

  update() {
    this.velocityX *= this.friction
    this.velocityY *= this.friction
    this.velocityY += this.gravity
    this.x += this.velocityX
    this.y += this.velocityY
    this.alpha -= this.decay

    return this.alpha <= 0
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, 1, 0, Math.PI * 2)
    this.ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${this.alpha})`
    this.ctx.fill()
  }
}
</script>

<style scoped>
.fireworks-container {
  position: relative;
  width: 100vw;
  height: calc(100vh - 20px);  /* 页面整体向上移动 */
  overflow: hidden;
  background: #0a0a1a;
}

/* 星空背景 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 20px 30px, #ffffff20, rgba(0, 0, 0, 0)),
  radial-gradient(2px 2px at 40px 70px, #ffffff20, rgba(0, 0, 0, 0)),
  radial-gradient(2px 2px at 50px 160px, #ffffff20, rgba(0, 0, 0, 0)),
  radial-gradient(2px 2px at 90px 40px, #ffffff20, rgba(0, 0, 0, 0)),
  radial-gradient(2px 2px at 130px 80px, #ffffff20, rgba(0, 0, 0, 0)),
  radial-gradient(2px 2px at 160px 120px, #ffffff20, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 200px 200px;
  z-index: 1;
  animation: starPulse 10s infinite alternate;
}

@keyframes starPulse {
  0% { background-opacity: 0.6; }
  100% { background-opacity: 1; }
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.welcome-text {
  position: absolute;
  top: 35%; /* 距离顶部更小 */
  left: 42%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 3;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 0 20px;
}

.welcome-text h1 {
  font-size: 3.5rem;
  margin: 0 0 1.5rem 0;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1.2s ease, transform 1.2s ease;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6),
  0 0 30px rgba(255, 215, 0, 0.3);
}

.welcome-text p {
  font-size: 1.4rem;
  margin: 0;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1.2s ease 0.6s, transform 1.2s ease 0.6s;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.restart-btn {
  position: fixed;  /* 改为 fixed 定位 */
  left: 50%;
  bottom: 60px;  /* 按钮距离底部上移到60px */
  transform: translateX(-50%);
  padding: 0.9rem 1.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 3;
  opacity: 0;
  transition: all 0.5s ease;
  backdrop-filter: blur(8px);
  letter-spacing: 0.5px;
  text-align: center;
  display: block;  /* 确保按钮是块级元素 */
  min-width: fit-content;  /* 确保按钮宽度适应内容 */
}

.restart-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-50%) translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
}

.restart-btn:active {
  transform: translateX(-50%) translateY(0);
}

/* 显示动画类 */
.show {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-text h1 {
    font-size: 2.2rem;
  }

  .welcome-text p {
    font-size: 1.1rem;
  }

  .restart-btn {
    padding: 0.7rem 1.4rem;
    font-size: 1rem;
  }
}
</style>
