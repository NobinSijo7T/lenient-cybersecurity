<template>
  <div v-if="!isTouch" class="custom-cursor-wrap">
    <div
      ref="cursorDot"
      class="custom-cursor-dot"
      :class="{ 'is-hovering': isHovering }"
    ></div>
    <div
      ref="cursorRing"
      class="custom-cursor-ring"
      :class="{ 'is-hovering': isHovering }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const cursorDot = ref<HTMLElement | null>(null)
const cursorRing = ref<HTMLElement | null>(null)
const isHovering = ref(false)
const isTouch = ref(false)

const mouse = { x: 0, y: 0 }
const dotPos = { x: 0, y: 0 }
const ringPos = { x: 0, y: 0 }

onMounted(() => {
  // Check if touch device
  isTouch.value = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
  if (isTouch.value) return

  // Hide default cursor globally
  document.documentElement.classList.add('custom-cursor-active')

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX
    mouse.y = e.clientY

    // Position inner dot instantly (low latency)
    gsap.to(dotPos, {
      x: mouse.x,
      y: mouse.y,
      duration: 0.06,
      ease: 'power2.out',
      onUpdate: () => {
        if (cursorDot.value) {
          cursorDot.value.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`
        }
      }
    })

    // Position outer ring with smooth lag
    gsap.to(ringPos, {
      x: mouse.x,
      y: mouse.y,
      duration: 0.32,
      ease: 'power3.out',
      onUpdate: () => {
        if (cursorRing.value) {
          cursorRing.value.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`
        }
      }
    })
  }

  // Handle interactive hovers
  const addHoverEffects = () => {
    const interactives = document.querySelectorAll(
      'a, button, [role="button"], .menu-bar__button, .nav-brand, .hero__copy-card'
    )
    
    interactives.forEach((el) => {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
      
      el.addEventListener('mouseenter', onMouseEnter)
      el.addEventListener('mouseleave', onMouseLeave)
    })
  }

  const onMouseEnter = () => {
    isHovering.value = true
    gsap.to(cursorRing.value, {
      scale: 1.8,
      borderColor: 'rgba(255, 50, 30, 0.95)',
      backgroundColor: 'rgba(255, 40, 20, 0.1)',
      boxShadow: '0 0 20px rgba(255, 30, 10, 0.6), inset 0 0 10px rgba(255, 30, 10, 0.3)',
      duration: 0.25,
      ease: 'power2.out'
    })
    gsap.to(cursorDot.value, {
      scale: 2.2,
      backgroundColor: '#ffffff',
      boxShadow: '0 0 16px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 50, 30, 0.8)',
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  const onMouseLeave = () => {
    isHovering.value = false
    gsap.to(cursorRing.value, {
      scale: 1.0,
      borderColor: 'rgba(255, 60, 30, 0.6)',
      backgroundColor: 'transparent',
      boxShadow: '0 0 0px rgba(0,0,0,0), inset 0 0 0px rgba(0,0,0,0)',
      duration: 0.25,
      ease: 'power2.out'
    })
    gsap.to(cursorDot.value, {
      scale: 1.0,
      backgroundColor: '#ff321e',
      boxShadow: '0 0 10px rgba(255, 50, 30, 0.8), 0 0 20px rgba(255, 50, 30, 0.5)',
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  window.addEventListener('mousemove', onMouseMove)
  
  // Apply hover effects with slight delay to ensure elements exist
  setTimeout(() => {
    addHoverEffects()
  }, 200)

  // Watch for dynamic DOM changes
  const observer = new MutationObserver(() => {
    addHoverEffects()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    document.documentElement.classList.remove('custom-cursor-active')
    observer.disconnect()
  })
})
</script>

<style scoped>
/* Hide native cursor globally */
:global(html.custom-cursor-active),
:global(html.custom-cursor-active *) {
  cursor: none !important;
}

.custom-cursor-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
}

.custom-cursor-dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  background-color: #ff321e;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10001;
  box-shadow: 
    0 0 10px rgba(255, 50, 30, 0.8),
    0 0 20px rgba(255, 50, 30, 0.5);
  will-change: transform, background-color, box-shadow;
}

.custom-cursor-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 34px;
  border: 2px solid rgba(255, 60, 30, 0.6);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10000;
  will-change: transform, border-color, background-color, box-shadow;
}

/* Hover state enhancements */
.custom-cursor-dot.is-hovering {
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.custom-cursor-ring.is-hovering {
  animation: pulse-ring 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
