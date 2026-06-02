<template>
  <section ref="parallaxContainer" class="parallax-hero" aria-label="Cinematic hero">
    <!-- 3D Camera Perspective Wrapper -->
    <div class="parallax-hero__viewport">
      <div ref="camera" class="parallax-hero__camera">
        <!-- Hero 1: Wide shot (fades out) -->
        <div ref="hero1Layer" class="parallax-hero__layer parallax-hero__layer--hero1">
          <img
            src="/hero.png"
            alt=""
            class="parallax-hero__img"
            draggable="false"
            fetchpriority="high"
          />
        </div>

        <!-- Hero 2: Close-up shot (fades in) -->
        <div ref="hero2Layer" class="parallax-hero__layer parallax-hero__layer--hero2">
          <img
            src="/hero2.png"
            alt=""
            class="parallax-hero__img"
            draggable="false"
            fetchpriority="high"
          />
        </div>
      </div>

      <!-- Atmospheric Overlays (inside viewport, affected by perspective but not camera zoom) -->
      <div class="parallax-hero__vignette" aria-hidden="true"></div>
      <div ref="fogLayer" class="parallax-hero__fog" aria-hidden="true"></div>
      <div ref="volumetricLayer" class="parallax-hero__volumetric" aria-hidden="true"></div>
      <div class="parallax-hero__noise" aria-hidden="true"></div>
    </div>

    <!-- Gradient overlays for text readability and scene blending -->
    <div class="parallax-hero__gradient-left" aria-hidden="true"></div>
    <div class="parallax-hero__gradient-bottom" aria-hidden="true"></div>

    <!-- Particle canvas (screen-space, not affected by camera) -->
    <canvas ref="particleCanvas" class="parallax-hero__particles" aria-hidden="true"></canvas>

    <!-- Hero Text Content (fades out early in scroll) -->
    <div ref="contentOverlay" class="parallax-hero__content">
      <slot />
    </div>

    <!-- Scroll indicator -->
    <div ref="scrollIndicator" class="parallax-hero__scroll-hint" aria-hidden="true">
      <div class="parallax-hero__scroll-hint-track">
        <div class="parallax-hero__scroll-hint-thumb"></div>
      </div>
      <span class="parallax-hero__scroll-hint-text">Scroll to explore</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Refs ──────────────────────────────────────────────
const parallaxContainer = ref<HTMLElement | null>(null)
const camera = ref<HTMLElement | null>(null)
const hero1Layer = ref<HTMLElement | null>(null)
const hero2Layer = ref<HTMLElement | null>(null)
const fogLayer = ref<HTMLElement | null>(null)
const volumetricLayer = ref<HTMLElement | null>(null)
const particleCanvas = ref<HTMLCanvasElement | null>(null)
const contentOverlay = ref<HTMLElement | null>(null)
const scrollIndicator = ref<HTMLElement | null>(null)

// Expose content ref so parent can animate it after loader
defineExpose({ contentOverlay })

// ── Particle System ───────────────────────────────────
interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  hue: number
  pulseSpeed: number
  pulseOffset: number
}

let particles: Particle[] = []
let animFrameId: number | null = null
let canvasCtx: CanvasRenderingContext2D | null = null
let isParticleActive = true

const PARTICLE_COUNT = 150

function initParticles(canvas: HTMLCanvasElement) {
  canvasCtx = canvas.getContext('2d')
  if (!canvasCtx) return

  resizeCanvas(canvas)
  particles = []

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 0.5,
      speedY: -(Math.random() * 0.6 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.15,
      hue: Math.random() * 30, // 0-30 = red to orange
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2
    })
  }
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  if (canvasCtx) {
    canvasCtx.scale(dpr, dpr)
  }
}

let lastTime = 0

function renderParticles(time: number) {
  if (!isParticleActive) return
  if (!canvasCtx || !particleCanvas.value) return

  const delta = lastTime ? (time - lastTime) / 16.667 : 1
  lastTime = time

  const canvas = particleCanvas.value
  const w = canvas.getBoundingClientRect().width
  const h = canvas.getBoundingClientRect().height

  canvasCtx.clearRect(0, 0, w, h)

  for (const p of particles) {
    // Update position
    p.y += p.speedY * delta
    p.x += p.speedX * delta + Math.sin(time * 0.001 + p.pulseOffset) * 0.08

    // Wrap around
    if (p.y < -10) {
      p.y = h + 10
      p.x = Math.random() * w
    }
    if (p.x < -10) p.x = w + 10
    if (p.x > w + 10) p.x = -10

    // Pulsing opacity
    const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7
    const alpha = p.opacity * pulse

    // Draw particle with glow
    canvasCtx.save()
    canvasCtx.globalAlpha = alpha
    canvasCtx.shadowColor = `hsla(${p.hue}, 100%, 55%, 0.9)`
    canvasCtx.shadowBlur = p.size * 6
    canvasCtx.fillStyle = `hsla(${p.hue}, 100%, 65%, 1)`
    canvasCtx.beginPath()
    canvasCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    canvasCtx.fill()
    canvasCtx.restore()
  }

  animFrameId = requestAnimationFrame(renderParticles)
}

// ── ScrollTrigger Setup ───────────────────────────────
let scrollTriggerInstance: ScrollTrigger | null = null
let masterTimeline: gsap.core.Timeline | null = null

function setupParallax() {
  if (!parallaxContainer.value || !camera.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    // Graceful degradation: show hero2 directly, no animation
    if (hero1Layer.value) gsap.set(hero1Layer.value, { opacity: 0 })
    if (hero2Layer.value) gsap.set(hero2Layer.value, { opacity: 1 })
    return
  }

  // Master timeline pinned to scroll
  masterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: parallaxContainer.value,
      start: 'top top',
      end: '+=250%',
      scrub: true,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Update particle speed based on scroll velocity for a more dynamic feel
        const velocity = Math.abs(self.getVelocity()) / 1000
        for (const p of particles) {
          p.speedY = -(Math.random() * 0.6 + 0.15) * (1 + velocity * 0.3)
        }
      }
    }
  })

  // ── Camera Zoom: Scale 1 → 2.5 ──
  gsap.set(camera.value, { scale: 1, rotationX: 0 })
  masterTimeline.to(
    camera.value,
    {
      scale: 2.5,
      rotationX: 2,
      transformOrigin: 'center 55%',
      ease: 'none',
      duration: 1
    },
    0
  )

  // ── Hero 1 (wide shot) parallax motion ──
  if (hero1Layer.value) {
    // Hero1 drifts slowly upward as we "fly forward"
    gsap.set(hero1Layer.value, { yPercent: 0, scale: 1, opacity: 1 })
    masterTimeline.to(
      hero1Layer.value,
      { yPercent: -12, scale: 1.08, ease: 'none', duration: 1 },
      0
    )

    // Hero1 crossfade out: opacity 1→0 over [0.45, 0.8]
    masterTimeline.to(
      hero1Layer.value,
      { opacity: 0, ease: 'none', duration: 0.35 },
      0.45
    )
  }

  // ── Hero 2 (close-up) parallax motion ──
  if (hero2Layer.value) {
    // Hero2 starts slightly scaled up (simulating it's "closer") and settles to 1
    gsap.set(hero2Layer.value, { scale: 1.35, yPercent: 5, opacity: 0 })
    masterTimeline.to(
      hero2Layer.value,
      { scale: 1, yPercent: -8, ease: 'none', duration: 1 },
      0
    )

    // Hero2 crossfade in: opacity 0→1 over [0.45, 0.8]
    masterTimeline.to(
      hero2Layer.value,
      { opacity: 1, ease: 'none', duration: 0.35 },
      0.45
    )
  }

  // ── Fog intensification ──
  if (fogLayer.value) {
    gsap.set(fogLayer.value, { opacity: 0.15 })
    masterTimeline.to(
      fogLayer.value,
      { opacity: 0.8, ease: 'power1.in', duration: 1 },
      0
    )
  }

  // ── Volumetric light pulse ──
  if (volumetricLayer.value) {
    gsap.set(volumetricLayer.value, { opacity: 0.25 })
    masterTimeline.to(
      volumetricLayer.value,
      { opacity: 0.65, ease: 'none', duration: 1 },
      0
    )
  }

  // ── Content fadeout (first 15% of scroll) ──
  if (contentOverlay.value) {
    gsap.set(contentOverlay.value, { opacity: 1, yPercent: 0 })
    masterTimeline.to(
      contentOverlay.value,
      { opacity: 0, yPercent: -18, ease: 'power2.in', duration: 0.15 },
      0
    )
  }

  // ── Scroll indicator fadeout ──
  if (scrollIndicator.value) {
    gsap.set(scrollIndicator.value, { opacity: 1 })
    masterTimeline.to(
      scrollIndicator.value,
      { opacity: 0, ease: 'power2.in', duration: 0.08 },
      0
    )
  }

  scrollTriggerInstance = masterTimeline.scrollTrigger ?? null
}

// ── Lifecycle ─────────────────────────────────────────
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // Initialize particles
  if (particleCanvas.value) {
    initParticles(particleCanvas.value)
    animFrameId = requestAnimationFrame(renderParticles)

    // Resize handling
    resizeObserver = new ResizeObserver(() => {
      if (particleCanvas.value) {
        resizeCanvas(particleCanvas.value)
      }
    })
    resizeObserver.observe(particleCanvas.value)
  }

  // Set initial state for hero2 (invisible)
  if (hero2Layer.value) {
    gsap.set(hero2Layer.value, { opacity: 0 })
  }

  // Small delay to ensure layout is settled before ScrollTrigger measures
  nextTick(() => {
    setupParallax()
  })
})

onBeforeUnmount(() => {
  // Clean up particle loop
  isParticleActive = false
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
  }

  // Clean up resize observer
  resizeObserver?.disconnect()

  // Clean up ScrollTrigger
  scrollTriggerInstance?.kill()
  masterTimeline?.kill()
})
</script>

<style>
/* ── Container ──────────────────────────────────────── */
.parallax-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #070101;
  isolation: isolate;
}

/* ── 3D Viewport ────────────────────────────────────── */
.parallax-hero__viewport {
  position: absolute;
  inset: 0;
  perspective: 2000px;
  perspective-origin: center 55%;
  overflow: hidden;
}

/* ── Camera (receives zoom + rotation transforms) ──── */
.parallax-hero__camera {
  position: absolute;
  inset: -10%; /* overflow room so zoom doesn't show edges */
  transform-style: preserve-3d;
  transform-origin: center 55%;
  will-change: transform;
}

/* ── Image Layers ───────────────────────────────────── */
.parallax-hero__layer {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}

.parallax-hero__layer--hero1 {
  z-index: 1;
}

.parallax-hero__layer--hero2 {
  z-index: 2;
  opacity: 0;
}

.parallax-hero__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
}

.parallax-hero__layer--hero1 .parallax-hero__img {
  filter: saturate(1.2) contrast(1.08) brightness(1.12);
}

.parallax-hero__layer--hero2 .parallax-hero__img {
  filter: saturate(1.25) contrast(1.05) brightness(1.08);
}

/* ── Atmospheric: Vignette ──────────────────────────── */
.parallax-hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: radial-gradient(
    ellipse at center,
    transparent 30%,
    rgba(7, 1, 1, 0.35) 65%,
    rgba(7, 1, 1, 0.85) 100%
  );
  pointer-events: none;
}

/* ── Atmospheric: Red Fog ───────────────────────────── */
.parallax-hero__fog {
  position: absolute;
  inset: 0;
  z-index: 11;
  background:
    radial-gradient(ellipse at 50% 80%, rgba(180, 20, 10, 0.35) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 60%, rgba(120, 10, 5, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 50%, rgba(160, 15, 8, 0.18) 0%, transparent 55%);
  opacity: 0.15;
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: opacity;
}

/* ── Atmospheric: Volumetric Light ──────────────────── */
.parallax-hero__volumetric {
  position: absolute;
  inset: 0;
  z-index: 12;
  background:
    conic-gradient(
      from 170deg at 50% 15%,
      transparent 0deg,
      rgba(255, 60, 30, 0.06) 15deg,
      rgba(255, 90, 40, 0.1) 25deg,
      transparent 50deg,
      transparent 130deg,
      rgba(255, 50, 20, 0.05) 145deg,
      rgba(255, 80, 35, 0.08) 160deg,
      transparent 180deg,
      transparent 310deg,
      rgba(255, 60, 30, 0.07) 330deg,
      rgba(255, 100, 50, 0.1) 345deg,
      transparent 360deg
    );
  opacity: 0.25;
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: opacity;
  animation: volumetricPulse 6s ease-in-out infinite alternate;
}

@keyframes volumetricPulse {
  0% { transform: scale(1); filter: brightness(1); }
  100% { transform: scale(1.04); filter: brightness(1.15); }
}

/* ── Atmospheric: Film Grain Noise ──────────────────── */
.parallax-hero__noise {
  position: absolute;
  inset: -50%;
  z-index: 13;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  opacity: 0.5;
  mix-blend-mode: overlay;
  pointer-events: none;
  animation: noiseShift 0.15s steps(3) infinite;
}

@keyframes noiseShift {
  0% { transform: translate(0, 0); }
  33% { transform: translate(-5%, -5%); }
  66% { transform: translate(5%, 2%); }
  100% { transform: translate(-2%, 5%); }
}

/* ── Gradient Overlays (text readability) ───────────── */
.parallax-hero__gradient-left {
  position: absolute;
  inset: 0;
  z-index: 14;
  background:
    linear-gradient(
      90deg,
      rgba(3, 0, 0, 0.62) 0%,
      rgba(4, 0, 0, 0.38) 25%,
      rgba(4, 0, 0, 0.08) 55%,
      rgba(4, 0, 0, 0.25) 100%
    );
  pointer-events: none;
}

.parallax-hero__gradient-bottom {
  position: absolute;
  inset: 0;
  z-index: 14;
  background:
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 35%,
      transparent 60%,
      rgba(7, 1, 1, 0.5) 100%
    );
  pointer-events: none;
}

/* ── Particle Canvas ────────────────────────────────── */
.parallax-hero__particles {
  position: absolute;
  inset: 0;
  z-index: 15;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ── Content Overlay ────────────────────────────────── */
.parallax-hero__content {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: clamp(7rem, 10vw, 9rem) clamp(1.25rem, 5vw, 5rem) clamp(2rem, 5vw, 4rem);
  will-change: transform, opacity;
}

/* ── Scroll Indicator ───────────────────────────────── */
.parallax-hero__scroll-hint {
  position: absolute;
  bottom: clamp(1.5rem, 4vh, 2.5rem);
  left: 50%;
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  transform: translateX(-50%);
  opacity: 1;
  will-change: opacity;
  animation: scrollHintPulse 2.5s ease-in-out infinite;
}

.parallax-hero__scroll-hint-track {
  width: 1.5px;
  height: 2.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.parallax-hero__scroll-hint-thumb {
  width: 100%;
  height: 40%;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 80, 50, 0.9), rgba(255, 40, 30, 0.4));
  box-shadow: 0 0 8px rgba(255, 50, 30, 0.6);
  animation: scrollThumbBounce 2.5s ease-in-out infinite;
}

.parallax-hero__scroll-hint-text {
  color: rgba(255, 240, 235, 0.45);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@keyframes scrollHintPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes scrollThumbBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(120%); }
}

/* ── Grid overlay (matches existing hero__grid style) ─ */
.parallax-hero__content::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-position: center;
  background-size: 7rem 7rem;
  mask-image: linear-gradient(90deg, rgba(0,0,0,0.95), rgba(0,0,0,0.18) 62%, transparent);
  opacity: 0.32;
  animation: gridDrift 18s linear infinite;
  pointer-events: none;
}

/* ── Scan lines (matches existing hero__scan style) ─── */
.parallax-hero__content::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 1.1rem,
      rgba(255, 255, 255, 0.035) 1.16rem,
      transparent 1.28rem
    );
  mix-blend-mode: screen;
  opacity: 0.26;
  animation: scanTravel 5.5s linear infinite;
  pointer-events: none;
}

/* ── Mobile Responsive ──────────────────────────────── */
@media (max-width: 700px) {
  .parallax-hero__content {
    align-items: flex-start;
    padding: 7.25rem 1.25rem 2rem;
  }

  .parallax-hero__camera {
    inset: -15%;
  }
}
</style>
