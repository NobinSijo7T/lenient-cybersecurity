'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useScroll, useTransform } from 'motion/react'
import { GoogleGeminiEffect } from '@/components/ui/google-gemini-effect'
import { Timeline, type TimelineEntry } from '@/components/ui/timeline'
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particle-typography'
import Navigation from '@/components/Navigation'
import ScrollVideoHero from '@/components/ScrollVideoHero'
import PageLoader from '@/components/PageLoader'
import CTAButton from '@/components/CTAButton'
import Footer from '@/components/Footer'
import styles from './page.module.css'

gsap.registerPlugin(ScrollTrigger)

const learningPath: TimelineEntry[] = [
  {
    title: 'Day 1: Foundations',
    content: (
      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <p className="mb-5 text-base leading-relaxed text-[#ffe8e4]/75 md:text-lg">
          Build a strong base in networking, Linux, and the systems that every
          security professional needs to understand.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Networking', 'Linux', 'Security fundamentals'].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#ff5a45]/25 bg-[#ff321e]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ff9b8e]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Day 2: Break Things',
    content: (
      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <p className="mb-5 text-base leading-relaxed text-[#ffe8e4]/75 md:text-lg">
          Learn how attackers think by testing applications, finding
          vulnerabilities, and documenting what you discover.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Ethical hacking', 'Web security', 'Penetration testing'].map(
            (skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#ff5a45]/25 bg-[#ff321e]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ff9b8e]"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Day 3: Build Defenses',
    content: (
      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <p className="mb-5 text-base leading-relaxed text-[#ffe8e4]/75 md:text-lg">
          Turn insight into protection with threat analysis, incident response,
          and automation powered by Python.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Threat detection', 'Incident response', 'Python automation'].map(
            (skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#ff5a45]/25 bg-[#ff321e]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ff9b8e]"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Day 4: Ship Proof',
    content: (
      <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <p className="mb-5 text-base leading-relaxed text-[#ffe8e4]/75 md:text-lg">
          Turn your work into a focused portfolio with documented labs,
          security reports, and projects that demonstrate real capability.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Portfolio projects', 'Security reports', 'Career readiness'].map(
            (skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#ff5a45]/25 bg-[#ff321e]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ff9b8e]"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </div>
    ),
  },
]

export default function HomePage() {
  const heroContentRef = useRef<HTMLElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const nextSectionRef = useRef<HTMLElement>(null)
  const geminiContainerRef = useRef<HTMLDivElement>(null)

  // Scroll-driven path lengths for the Gemini effect
  const { scrollYProgress } = useScroll({
    target: geminiContainerRef,
    offset: ['start 85%', 'end end'],
  })
  const path1 = useTransform(scrollYProgress, [0, 1], [0, 1])
  const path2 = useTransform(scrollYProgress, [0, 1], [0, 1])
  const path3 = useTransform(scrollYProgress, [0, 1], [0, 1])
  const path4 = useTransform(scrollYProgress, [0, 1], [0, 1])
  const path5 = useTransform(scrollYProgress, [0, 1], [0, 1])


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

    // ── Sync Lenis → ScrollTrigger (required for pin accuracy) ─────
    lenis.on('scroll', ScrollTrigger.update)

    let reqId: number
    function raf(time: number) {
      lenis.raf(time)
      reqId = requestAnimationFrame(raf)
    }
    reqId = requestAnimationFrame(raf)

    // ── GSAP entrance animations ────────────────────────
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from(
          heroContentRef.current,
          { opacity: 0, y: 26, duration: 0.9, ease: 'power2.out' },
          0.3
        )
        .from(
          heroTitleRef.current,
          { opacity: 0, y: 34, duration: 0.8 },
          '-=0.55'
        )
    }, heroContentRef)

    // ── Sticky scroll effect ────────────────────────────
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = window.innerHeight
      if (scrollY > heroHeight * 0.5) {
        nextSectionRef.current?.classList.add(styles.isVisible)
      } else {
        nextSectionRef.current?.classList.remove(styles.isVisible)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      lenis.destroy()
      cancelAnimationFrame(reqId)
      ctx.revert() // Kill all GSAP animations in this context
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div>
      {/* Page Loader */}
      <PageLoader />

      {/* Fixed Navigation */}
      <Navigation />

      {/* ── Scroll-Scrubbed Cinematic Hero ───────────────── */}
      <ScrollVideoHero src="/bg_vid.mp4" className={styles.hero} id="home">

        {/* Atmospheric overlays */}
        <div className={styles.heroInteractiveField} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.heroFloatingOrbs} aria-hidden="true" />
        <div className={styles.heroDataStream} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroScan} aria-hidden="true" />
        <div className={styles.heroSweep} aria-hidden="true" />

        {/* Hero text content */}
        <section ref={heroContentRef} className={styles.heroContent}>
          <div id="hero-title" ref={heroTitleRef} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', width: '100%', maxWidth: '1000px', paddingBottom: '3rem', overflow: 'visible' }}>
              <CursorDrivenParticleTypography 
                text="Learn"
                fontSize={85}
                particleSize={2}
                particleDensity={3}
                dispersionStrength={15}
                returnSpeed={0.08}
                color="#fff7f2"
                className="w-full"
              />
            </div>
            <div style={{ height: '200px', width: '100%', maxWidth: '1000px', marginTop: '-4rem', overflow: 'visible' }}>
              <CursorDrivenParticleTypography 
                text="Cybersecurity"
                fontSize={85}
                particleSize={2}
                particleDensity={3}
                dispersionStrength={15}
                returnSpeed={0.08}
                color="#ff321e"
                className="w-full"
              />
            </div>
          </div>
        </section>

      </ScrollVideoHero>

      {/* Practical learning path */}
      <div id="roadmap">
        <Timeline
          data={learningPath}
          eyebrow="Your roadmap"
          title="From curious beginner to capable defender"
          description="A practical path built around the skills, tools, and 
          real-world challenges that move your cybersecurity career forward."
        />
      </div>

      {/* Next Section slides over hero */}
      <section
        id="get-started"
        ref={nextSectionRef}
        className={`${styles.nextSection} ${styles.nextSectionOverlay}`}
      >
        {/* Background Effects */}
        <div className={styles.nextSectionBgEffects} aria-hidden="true">
          <div className={styles.nextSectionMatrix} />
          <div className={styles.nextSectionRadialGlow} />
          <div className={styles.nextSectionScanlines} />
          <div className={styles.nextSectionHexPattern} />
        </div>
        
        {/* "Begin Your Journey" content */}
        <div className={styles.nextSectionInner}>
          <div className={styles.nextSectionGlow} aria-hidden="true" />
          <h2 className={styles.nextSectionTitle}>Begin Your Journey</h2>
          <p className={styles.nextSectionText}>
            Choose your path and start mastering cybersecurity with hands-on
            labs and real-world challenges.
          </p>
          <CTAButton className={styles.ctaButton} />
        </div>

        {/* Google Gemini Effect — scroll-driven lines */}
        <div ref={geminiContainerRef} className={styles.geminiWrapper}>
          <GoogleGeminiEffect
            pathLengths={[path1, path2, path3, path4, path5]}
            className={styles.geminiEffect}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
