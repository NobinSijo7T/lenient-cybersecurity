'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ScrollVideoHero.module.css'

gsap.registerPlugin(ScrollTrigger)

interface ScrollVideoHeroProps {
  src: string
  poster?: string
  /** Extra className applied to the root element (e.g. page-level hero styles) */
  className?: string
  children?: React.ReactNode
}

const ScrollVideoHero = ({ src, poster, className, children }: ScrollVideoHeroProps) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── All scrub state lives in refs — zero React re-renders ──────────
  const targetTimeRef = useRef(0)   // where scroll says we should be
  const smoothTimeRef = useRef(0)   // lerped toward target
  const durationRef = useRef(0)     // video total duration (set on metadata)
  const lastFrameRef = useRef(-1)   // last frame bucket written to DOM

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // React doesn't forward the `muted` prop to the DOM — set it imperatively
    video.muted = true

    // ── Load metadata before mapping progress ──────────────────────
    const onMetadata = () => {
      durationRef.current = video.duration
      video.currentTime = 0
    }
    video.addEventListener('loadedmetadata', onMetadata)
    if (video.readyState >= 1) onMetadata()

    // ── Respect prefers-reduced-motion ─────────────────────────────
    if (prefersReducedMotion) {
      // Hold first frame; no scroll animation
      return () => video.removeEventListener('loadedmetadata', onMetadata)
    }

    // ── Lerp settings ───────────────────────────────────────────────
    // Mobile: slightly faster lerp (less GPU work per frame); lower frame bucket
    const lerpFactor = isMobile ? 0.18 : 0.12
    const framePrecision = isMobile ? 30 : 60  // frame bucket granularity

    // Active flag: pauses ticker without removing it from gsap.ticker
    let isTicking = true

    // ── GSAP ticker — runs in sync with ScrollTrigger's RAF loop ────
    const tickerFn = () => {
      if (!isTicking) return
      const duration = durationRef.current
      if (duration <= 0) return

      // Lerp smooth time toward scroll target
      smoothTimeRef.current +=
        (targetTimeRef.current - smoothTimeRef.current) * lerpFactor

      // Bucket into frame slots — avoid writing video.currentTime redundantly
      const frame = Math.round(smoothTimeRef.current * framePrecision)
      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame
        const t = Math.max(0, Math.min(smoothTimeRef.current, duration))
        if (videoRef.current) videoRef.current.currentTime = t
      }
    }
    gsap.ticker.add(tickerFn)

    // ── ScrollTrigger — pin + progress → video timeline ────────────
    const scrollEnd = isMobile
      ? () => `+=${window.innerHeight * 2.5}`   // 250 vh on mobile
      : () => `+=${window.innerHeight * 4}`      // 400 vh on desktop

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: scrollEnd,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const duration = durationRef.current
        if (duration > 0) {
          targetTimeRef.current = self.progress * duration
        }
      },
    })

    // ── Pause ticker when browser tab hidden ───────────────────────
    const onVisibility = () => {
      isTicking = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Pause ticker when hero scrolled out of viewport ────────────
    const io = new IntersectionObserver(
      ([entry]) => { isTicking = entry.isIntersecting },
      { threshold: 0 }
    )
    io.observe(section)

    return () => {
      isTicking = false
      gsap.ticker.remove(tickerFn)
      st.kill()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadedmetadata', onMetadata)
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className={[styles.heroSection, className].filter(Boolean).join(' ')}
      role="region"
      aria-labelledby="hero-title"
    >
      {/* Scroll-scrubbed background video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={styles.heroVideo}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Stacked content — z-index above video */}
      {children}
    </div>
  )
}

export default ScrollVideoHero
