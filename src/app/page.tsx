'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Lenis from 'lenis'
import Navigation from '@/components/Navigation'
import ParallaxHero from '@/components/ParallaxHero'
import CustomCursorAlternate from '@/components/CustomCursorAlternate'
import ClickSpark from '@/components/ClickSpark'
import PageLoader from '@/components/PageLoader'
import styles from './page.module.css'

export default function HomePage() {
  const heroContentRef = useRef<HTMLElement>(null)
  const heroKickerRef = useRef<HTMLParagraphElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroCopyRef = useRef<HTMLDivElement>(null)
  const nextSectionRef = useRef<HTMLElement>(null)
  const heroBackdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ── Lenis smooth scrolling ──────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // ── GSAP entrance animations ────────────────────────
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

    timeline
      .from(`.${styles.heroBackdrop}`, {
        scale: 1.08,
        opacity: 0,
        duration: 1.4,
        ease: 'power2.out',
      })
      .from(
        heroContentRef.current,
        {
          opacity: 0,
          y: 26,
          duration: 0.9,
        },
        '-=0.85'
      )
      .from(
        [heroKickerRef.current, heroTitleRef.current, heroCopyRef.current],
        {
          opacity: 0,
          y: 34,
          duration: 0.8,
          stagger: 0.14,
        },
        '-=0.55'
      )

    // Backdrop float
    gsap.to(`.${styles.heroBackdrop}`, {
      scale: 1.045,
      xPercent: -1.15,
      yPercent: 0.65,
      duration: 16,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    // ── Sticky scroll effect ────────────────────────────
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = window.innerHeight

      if (scrollY > heroHeight * 0.5) {
        nextSectionRef.current?.classList.add(styles.isVisible)
        const scrollProgress = Math.min(
          Math.max((scrollY - heroHeight * 0.5) / (heroHeight * 0.5), 0),
          1
        )
        if (heroBackdropRef.current) {
          heroBackdropRef.current.style.setProperty(
            '--hero2-opacity',
            scrollProgress.toString()
          )
        }
      } else {
        nextSectionRef.current?.classList.remove(styles.isVisible)
        if (heroBackdropRef.current) {
          heroBackdropRef.current.style.setProperty('--hero2-opacity', '0')
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      lenis.destroy()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div>
      {/* Page Loader */}
      <PageLoader />

      {/* Fixed Navigation */}
      <Navigation />

      {/* Hero Section with Sticky Effect */}
      <main className={`${styles.hero} ${styles.heroSticky}`} aria-labelledby="hero-title">
        <div
          ref={heroBackdropRef}
          className={styles.heroBackdrop}
          aria-hidden="true"
        />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroScan} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />
        <section ref={heroContentRef} className={styles.heroContent}>
          <p ref={heroKickerRef} className={styles.heroKicker}>
            Hands-on cyber training
          </p>
          <h1 id="hero-title" ref={heroTitleRef} className={styles.heroTitle}>
            <span>Learn</span>
            <span>Cybersecurity</span>
            <span className={styles.heroTitleAccent}>the Practical Way</span>
          </h1>
          <div ref={heroCopyRef} className={styles.heroCopyCard}>
            <p className={styles.heroCopy}>
              Master ethical hacking, network security, and Python scripting
              through real-world training and projects.
            </p>
          </div>
        </section>
      </main>

      {/* Next Section slides over hero */}
      <section
        ref={nextSectionRef}
        className={`${styles.nextSection} ${styles.nextSectionOverlay}`}
        style={{ minHeight: '100vh' }}
      >
        <div className={styles.nextSectionInner}>
          <div className={styles.nextSectionGlow} aria-hidden="true" />
          <h2 className={styles.nextSectionTitle}>Begin Your Journey</h2>
          <p className={styles.nextSectionText}>
            Choose your path and start mastering cybersecurity with hands-on
            labs and real-world challenges.
          </p>
        </div>
      </section>

      {/* Custom Cursor */}
      <CustomCursorAlternate />

      {/* Click Spark Effect */}
      <ClickSpark />
    </div>
  )
}
