'use client'

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ParallaxHero.module.css'

gsap.registerPlugin(ScrollTrigger)

// ── Particle Interface ───────────────────────────────
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

export interface ParallaxHeroHandle {
  contentOverlay: HTMLDivElement | null
}

interface ParallaxHeroProps {
  children?: React.ReactNode
}

const PARTICLE_COUNT = 150

const ParallaxHero = forwardRef<ParallaxHeroHandle, ParallaxHeroProps>(
  ({ children }, ref) => {
    const parallaxContainer = useRef<HTMLElement>(null)
    const camera = useRef<HTMLDivElement>(null)
    const hero1Layer = useRef<HTMLDivElement>(null)
    const hero2Layer = useRef<HTMLDivElement>(null)
    const fogLayer = useRef<HTMLDivElement>(null)
    const volumetricLayer = useRef<HTMLDivElement>(null)
    const particleCanvas = useRef<HTMLCanvasElement>(null)
    const contentOverlay = useRef<HTMLDivElement>(null)
    const scrollIndicator = useRef<HTMLDivElement>(null)
    const bgVideoRef = useRef<HTMLVideoElement>(null)

    // Expose contentOverlay to parent
    useImperativeHandle(ref, () => ({
      get contentOverlay() {
        return contentOverlay.current
      },
    }))

    // ── Particle System (stored in refs to avoid re-renders) ──
    const particlesRef = useRef<Particle[]>([])
    const animFrameIdRef = useRef<number | null>(null)
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null)
    const isParticleActiveRef = useRef(true)
    const lastTimeRef = useRef(0)

    const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      if (canvasCtxRef.current) {
        canvasCtxRef.current.scale(dpr, dpr)
      }
    }, [])

    const initParticles = useCallback(
      (canvas: HTMLCanvasElement) => {
        canvasCtxRef.current = canvas.getContext('2d')
        if (!canvasCtxRef.current) return

        resizeCanvas(canvas)
        const particles: Particle[] = []

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 0.5,
            speedY: -(Math.random() * 0.6 + 0.15),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.6 + 0.15,
            hue: Math.random() * 30,
            pulseSpeed: Math.random() * 0.02 + 0.005,
            pulseOffset: Math.random() * Math.PI * 2,
          })
        }
        particlesRef.current = particles
      },
      [resizeCanvas]
    )

    const renderParticles = useCallback((time: number) => {
      if (!isParticleActiveRef.current) return
      const ctx = canvasCtxRef.current
      const canvas = particleCanvas.current
      if (!ctx || !canvas) return

      const delta = lastTimeRef.current
        ? (time - lastTimeRef.current) / 16.667
        : 1
      lastTimeRef.current = time

      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height

      ctx.clearRect(0, 0, w, h)

      for (const p of particlesRef.current) {
        p.y += p.speedY * delta
        p.x += p.speedX * delta + Math.sin(time * 0.001 + p.pulseOffset) * 0.08

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        const pulse =
          Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7
        const alpha = p.opacity * pulse

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, 0.9)`
        ctx.shadowBlur = p.size * 6
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, 1)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animFrameIdRef.current = requestAnimationFrame(renderParticles)
    }, [])

    // ── Mount: Particles + ScrollTrigger ──────────────────
    // ── Force video autoplay (React muted prop bug workaround) ────────
    useEffect(() => {
      const vid = bgVideoRef.current
      if (vid) {
        vid.muted = true
        vid.play().catch(() => {
          // Autoplay blocked — retry on first user interaction
          const resume = () => { vid.play(); document.removeEventListener('click', resume) }
          document.addEventListener('click', resume, { once: true })
        })
      }
    }, [])

    useEffect(() => {
      // Initialize particles
      if (particleCanvas.current) {
        initParticles(particleCanvas.current)
        animFrameIdRef.current = requestAnimationFrame(renderParticles)
      }

      // Resize observer for canvas
      let resizeObserver: ResizeObserver | null = null
      if (particleCanvas.current) {
        const canvas = particleCanvas.current
        resizeObserver = new ResizeObserver(() => {
          resizeCanvas(canvas)
        })
        resizeObserver.observe(canvas)
      }

      // Initial state for hero2
      if (hero2Layer.current) {
        gsap.set(hero2Layer.current, { opacity: 0 })
      }

      // ScrollTrigger setup (deferred to ensure layout)
      const rafId = requestAnimationFrame(() => {
        setupParallax()
      })

      return () => {
        cancelAnimationFrame(rafId)
        isParticleActiveRef.current = false
        if (animFrameIdRef.current !== null) {
          cancelAnimationFrame(animFrameIdRef.current)
        }
        resizeObserver?.disconnect()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── ScrollTrigger Parallax ────────────────────────────
    const setupParallax = () => {
      if (!parallaxContainer.current || !camera.current) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReducedMotion) {
        if (hero1Layer.current) gsap.set(hero1Layer.current, { opacity: 0 })
        if (hero2Layer.current) gsap.set(hero2Layer.current, { opacity: 1 })
        return
      }

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: parallaxContainer.current,
          start: 'top top',
          end: '+=250%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const velocity = Math.abs(self.getVelocity()) / 1000
            for (const p of particlesRef.current) {
              p.speedY =
                -(Math.random() * 0.6 + 0.15) * (1 + velocity * 0.3)
            }
          },
        },
      })

      // Camera Zoom
      gsap.set(camera.current, { scale: 1, rotationX: 0 })
      masterTimeline.to(
        camera.current,
        {
          scale: 2.5,
          rotationX: 2,
          transformOrigin: 'center 55%',
          ease: 'none',
          duration: 1,
        },
        0
      )

      // Hero 1 parallax
      if (hero1Layer.current) {
        gsap.set(hero1Layer.current, { yPercent: 0, scale: 1, opacity: 1 })
        masterTimeline.to(
          hero1Layer.current,
          { yPercent: -12, scale: 1.08, ease: 'none', duration: 1 },
          0
        )
        masterTimeline.to(
          hero1Layer.current,
          { opacity: 0, ease: 'none', duration: 0.35 },
          0.45
        )
      }

      // Hero 2 parallax
      if (hero2Layer.current) {
        gsap.set(hero2Layer.current, {
          scale: 1.35,
          yPercent: 5,
          opacity: 0,
        })
        masterTimeline.to(
          hero2Layer.current,
          { scale: 1, yPercent: -8, ease: 'none', duration: 1 },
          0
        )
        masterTimeline.to(
          hero2Layer.current,
          { opacity: 1, ease: 'none', duration: 0.35 },
          0.45
        )
      }

      // Fog intensification
      if (fogLayer.current) {
        gsap.set(fogLayer.current, { opacity: 0.15 })
        masterTimeline.to(
          fogLayer.current,
          { opacity: 0.8, ease: 'power1.in', duration: 1 },
          0
        )
      }

      // Volumetric light
      if (volumetricLayer.current) {
        gsap.set(volumetricLayer.current, { opacity: 0.25 })
        masterTimeline.to(
          volumetricLayer.current,
          { opacity: 0.65, ease: 'none', duration: 1 },
          0
        )
      }

      // Content fadeout
      if (contentOverlay.current) {
        gsap.set(contentOverlay.current, { opacity: 1, yPercent: 0 })
        masterTimeline.to(
          contentOverlay.current,
          { opacity: 0, yPercent: -18, ease: 'power2.in', duration: 0.15 },
          0
        )
      }

      // Scroll indicator fadeout
      if (scrollIndicator.current) {
        gsap.set(scrollIndicator.current, { opacity: 1 })
        masterTimeline.to(
          scrollIndicator.current,
          { opacity: 0, ease: 'power2.in', duration: 0.08 },
          0
        )
      }
    }

    return (
      <section
        ref={parallaxContainer}
        className={styles.parallaxHero}
        aria-label="Cinematic hero"
      >
        {/* 3D Camera Perspective Wrapper */}
        <div className={styles.viewport}>
          <div ref={camera} className={styles.camera}>
            {/* Hero 1: Wide shot */}
            <div ref={hero1Layer} className={`${styles.layer} ${styles.layerHero1}`}>
              <video
                ref={bgVideoRef}
                src="/bg_vid.mp4"
                className={styles.img}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            </div>

            {/* Hero 2: Close-up shot */}
            <div ref={hero2Layer} className={`${styles.layer} ${styles.layerHero2}`}>
              <img
                src="/hero2.png"
                alt=""
                className={styles.img}
                draggable={false}
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Atmospheric Overlays */}
          <div className={styles.vignette} aria-hidden="true" />
          <div ref={fogLayer} className={styles.fog} aria-hidden="true" />
          <div
            ref={volumetricLayer}
            className={styles.volumetric}
            aria-hidden="true"
          />
          <div className={styles.noise} aria-hidden="true" />
        </div>

        {/* Gradient overlays */}
        <div className={styles.gradientLeft} aria-hidden="true" />
        <div className={styles.gradientBottom} aria-hidden="true" />

        {/* Particle canvas */}
        <canvas
          ref={particleCanvas}
          className={styles.particles}
          aria-hidden="true"
        />

        {/* Hero Text Content */}
        <div ref={contentOverlay} className={styles.content}>
          {children}
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicator}
          className={styles.scrollHint}
          aria-hidden="true"
        >
          <div className={styles.scrollHintTrack}>
            <div className={styles.scrollHintThumb} />
          </div>
          <span className={styles.scrollHintText}>Scroll to explore</span>
        </div>
      </section>
    )
  }
)

ParallaxHero.displayName = 'ParallaxHero'

export default ParallaxHero
