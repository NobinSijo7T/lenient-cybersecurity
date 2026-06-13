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
  const durationRef = useRef(0)     // video total duration (set on metadata)
  const rafIdRef = useRef<number | null>(null)  // animation frame ID

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

    // Pre-decode video frames for smoother playback
    video.play().then(() => video.pause()).catch(() => {})

    // Active flag
    let isTicking = true

    // ── Direct RAF loop for immediate video updates ────────────────
    const updateVideo = () => {
      if (!isTicking) return

      const duration = durationRef.current
      if (duration > 0 && videoRef.current) {
        const targetTime = targetTimeRef.current
        const currentTime = videoRef.current.currentTime
        
        // Direct update with minimal threshold
        if (Math.abs(currentTime - targetTime) > 0.001) {
          videoRef.current.currentTime = targetTime
        }
      }

      rafIdRef.current = requestAnimationFrame(updateVideo)
    }

    rafIdRef.current = requestAnimationFrame(updateVideo)

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
      scrub: 0.5,  // Use built-in scrub for smoothness
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const duration = durationRef.current
        if (duration > 0) {
          // Directly map scroll progress to video time
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
        style={{
          willChange: 'auto',
        }}
      />

      {/* Stacked content — z-index above video */}
      {children}
    </div>
  )
}

export default ScrollVideoHero
