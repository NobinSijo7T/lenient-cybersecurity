<template>
  <div class="click-spark-container"></div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const createSpark = (x: number, y: number) => {
  const container = document.querySelector('.click-spark-container')
  if (!container) return

  // Create multiple sparks for better effect
  const sparkCount = 8
  
  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement('div')
    spark.className = 'click-spark'
    
    // Random angle for each spark
    const angle = (Math.PI * 2 * i) / sparkCount
    const velocity = 50 + Math.random() * 50
    
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    
    container.appendChild(spark)
    
    // Animate spark
    gsap.to(spark, {
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity,
      opacity: 0,
      scale: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        spark.remove()
      }
    })
  }
}

onMounted(() => {
  const handleClick = (e: MouseEvent) => {
    createSpark(e.clientX, e.clientY)
  }

  document.addEventListener('click', handleClick)

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClick)
  })
})
</script>

<style scoped>
.click-spark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99998;
  overflow: hidden;
}

:global(.click-spark) {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #ff321e 0%, #ff6b5a 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 
    0 0 10px #ff321e,
    0 0 20px rgba(255, 50, 30, 0.5);
}
</style>
