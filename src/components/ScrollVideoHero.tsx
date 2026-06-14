'use client'

import { useLayoutEffect, useRef } from 'react'
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
  const spacerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── All scrub state lives in refs — zero React re-renders ──────────
  const targetTimeRef = useRef(0)   // where scroll says we should be
  const currentTimeRef = useRef(0)  // current interpolated time
  const durationRef = useRef(0)     // video total duration (set on metadata)
  const rafIdRef = useRef<number | null>(null)  // animation frame ID
  const lastUpdateTimeRef = useRef(0)  // throttle video updates

  useLayoutEffect(() => {
    const spacer = spacerRef.current
    const video = videoRef.current
    const section = sectionRef.current
    if (!spacer || !video || !section) return

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
      currentTimeRef.current = 0
    }
    video.addEventListener('loadedmetadata', onMetadata)
    if (video.readyState >= 1) onMetadata()

    // ── Respect prefers-reduced-motion ─────────────────────────────
    if (prefersReducedMotion) {
      // Hold first frame; no scroll animation
      return () => video.removeEventListener('loadedmetadata', onMetadata)
    }

    // Pre-decode video frames for smoother playback
    video.play().then(() => video.pause()).catch(() => {})

    // Active flag
    let isTicking = true

    // ── Frame interpolation settings per best practices ────────────
    const lerpFactor = 0.08  // Recommended value from optimization guide
    const maxUpdatesPerSecond = isMobile ? 24 : 30  // Limit update frequency
    const minFrameDelta = 1000 / maxUpdatesPerSecond  // Time between updates
    const seekThreshold = 0.01  // Ignore tiny updates (10ms)

    // ── Single RAF loop for smooth interpolation ────────────────────
    const updateVideo = (timestamp: number) => {
      if (!isTicking) return

      const duration = durationRef.current
      if (duration > 0 && videoRef.current) {
        const targetTime = targetTimeRef.current
        
        // Linear interpolation toward target (Apple-style smoothing)
        const delta = targetTime - currentTimeRef.current
        
        // Snap to target if very close
        if (Math.abs(delta) < 0.001) {
          currentTimeRef.current = targetTime
        } else {
          currentTimeRef.current += delta * lerpFactor
        }
        
        // Throttle video seeking to maxUpdatesPerSecond
        const timeSinceLastUpdate = timestamp - lastUpdateTimeRef.current
        
        if (timeSinceLastUpdate >= minFrameDelta) {
          const videoCurrentTime = videoRef.current.currentTime
          const timeDiff = Math.abs(currentTimeRef.current - videoCurrentTime)
          
          // Only update if difference exceeds threshold
          if (timeDiff > seekThreshold) {
            videoRef.current.currentTime = Math.max(0, Math.min(currentTimeRef.current, duration))
            lastUpdateTimeRef.current = timestamp
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(updateVideo)
    }

    rafIdRef.current = requestAnimationFrame(updateVideo)

    // ── ScrollTrigger — pin + progress → video timeline ────────────
    // Mobile: reduced scroll distance for performance
    const scrollEnd = isMobile
      ? () => `+=${window.innerHeight * 2.5}`   // 250vh on mobile
      : () => `+=${window.innerHeight * 4}`      // 400vh on desktop

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: scrollEnd,
      pin: true,
      pinSpacer: spacer,
      anticipatePin: 1,
      scrub: 1,  // Recommended scrub value for smooth motion
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const duration = durationRef.current
        if (duration > 0) {
          // CRITICAL: Only store target, never update video here
          targetTimeRef.current = self.progress * duration
        }
      },
    })

    // ── Pause ticker when browser tab hidden ───────────────────────
    const onVisibility = () => {
      isTicking = !document.hidden
      if (isTicking && !rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateVideo)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Pause ticker when hero scrolled out of viewport ────────────
    const io = new IntersectionObserver(
      ([entry]) => {
        isTicking = entry.isIntersecting
        if (isTicking && !rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(updateVideo)
        } else if (!isTicking && rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
      },
      { threshold: 0 }
    )
    io.observe(section)

    return () => {
      isTicking = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      st.kill()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadedmetadata', onMetadata)
    }
  }, [])

  return (
    <div ref={spacerRef} className={styles.heroPinSpacer}>
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
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          crossOrigin="anonymous"
        />

        {/* Stacked content — z-index above video */}
        {children}
      </div>
    </div>
  )
}

export default ScrollVideoHero
