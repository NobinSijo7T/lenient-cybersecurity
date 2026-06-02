<template>
  <div class="page-loader">
    <div class="cyber-grid"></div>
    <div class="glow-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="logo-wrapper">
      <img src="/white.png" alt="Lenient Cyber" class="logo" />
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Clean, simple loader component
</script>

<style scoped>
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: radial-gradient(ellipse at center, #0f0303 0%, #070101 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Animated cyber grid background */
.cyber-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 50, 50, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 50, 50, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridScroll 20s linear infinite;
  opacity: 0.4;
}

@keyframes gridScroll {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* Glowing orbs */
.glow-orbs {
  position: absolute;
  inset: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation-duration: 8s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 30, 30, 0.6) 0%, transparent 70%);
  top: 20%;
  left: 10%;
  animation-name: float1;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(200, 20, 20, 0.5) 0%, transparent 70%);
  bottom: 20%;
  right: 15%;
  animation-name: float2;
  animation-duration: 10s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(150, 30, 40, 0.4) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-name: float3;
  animation-duration: 12s;
}

@keyframes float1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-40px, 40px) scale(1.15);
  }
}

@keyframes float3 {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Logo and loading bar */
.logo-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo {
  width: 220px;
  height: auto;
  filter: drop-shadow(0 0 30px rgba(255, 40, 40, 0.6));
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.loader-bar {
  width: 240px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 
    0 0 10px rgba(255, 40, 40, 0.3),
    inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.loader-progress {
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 50, 50, 0.8) 0%,
    rgba(255, 100, 100, 1) 50%,
    rgba(255, 50, 50, 0.8) 100%
  );
  background-size: 200% 100%;
  border-radius: 10px;
  animation: 
    progressGrow 3s ease-out forwards,
    progressShine 1.5s linear infinite;
  box-shadow: 
    0 0 15px rgba(255, 50, 50, 0.8),
    0 0 30px rgba(255, 50, 50, 0.4);
}

@keyframes progressGrow {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes progressShine {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .logo {
    width: 160px;
  }
  
  .loader-bar {
    width: 180px;
  }
  
  .orb-1 {
    width: 250px;
    height: 250px;
  }
  
  .orb-2 {
    width: 200px;
    height: 200px;
  }
  
  .orb-3 {
    width: 180px;
    height: 180px;
  }
}
</style>
