'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import {
  Home,
  Route,
  Rocket,
} from 'lucide-react'
import styles from './Navigation.module.css'

const navItems = [
  { icon: Home, label: 'Home', href: '#home' },
  { icon: Route, label: 'Roadmap', href: '#roadmap' },
  { icon: Rocket, label: 'Get Started', href: '#get-started' },
]

export default function Navigation() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [tooltipLeft, setTooltipLeft] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const menuGlowRef = useRef<HTMLSpanElement>(null)
  const navBarRef = useRef<HTMLElement>(null)
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const updateActivePosition = useCallback(() => {
    if (activeIndex === null || !menuRef.current) return

    const menuItem = menuItemRefs.current[activeIndex]
    if (!menuItem) return

    const menuRect = menuRef.current.getBoundingClientRect()
    const itemRect = menuItem.getBoundingClientRect()

    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const centeredLeft =
        itemRect.left - menuRect.left + (itemRect.width - tooltipRect.width) / 2
      setTooltipLeft(
        Math.max(0, Math.min(centeredLeft, menuRect.width - tooltipRect.width))
      )
    }

    if (menuGlowRef.current) {
      gsap.to(menuGlowRef.current, {
        x: itemRect.left - menuRect.left,
        width: itemRect.width,
        opacity: 1,
        duration: 0.34,
        ease: 'power3.out',
      })
    }
  }, [activeIndex])

  useEffect(() => {
    updateActivePosition()
  }, [activeIndex, updateActivePosition])

  const handleSetActive = (index: number) => {
    setActiveIndex(index)
  }

  const handleClearActive = () => {
    setActiveIndex(null)
    if (menuGlowRef.current) {
      gsap.to(menuGlowRef.current, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.out',
      })
    }
  }

  const handleNavClick = (href: string) => {
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Entrance animation
  useEffect(() => {
    if (navBarRef.current) {
      gsap.from(navBarRef.current, {
        opacity: 0,
        y: -22,
        filter: 'blur(12px)',
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.2,
      })
    }
  }, [])

  return (
    <header ref={navBarRef} className={styles.navWrap} aria-label="Primary navigation">
      <div className={styles.navBrand} aria-label="Lenient Cyber">
        <img
          className={styles.navBrandLogo}
          src="/white.png"
          alt="Lenient Cyber"
        />
      </div>

      <nav className={styles.menuBar} aria-label="Course navigation">
        {activeIndex !== null && (
          <div
            ref={tooltipRef}
            className={`${styles.menuTooltip} ${styles.tooltipVisible}`}
            style={{ transform: `translate3d(${tooltipLeft}px, 0, 0)` }}
            aria-hidden="true"
          >
            {navItems[activeIndex].label}
          </div>
        )}

        <div
          ref={menuRef}
          className={styles.menuBarItems}
          onMouseLeave={handleClearActive}
        >
          <span
            ref={menuGlowRef}
            className={`${styles.menuBarGlow} ${
              activeIndex !== null ? styles.glowVisible : ''
            }`}
            aria-hidden="true"
          />

          {navItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.label}
                ref={(el) => {
                  menuItemRefs.current[index] = el
                }}
                className={styles.menuBarButton}
                type="button"
                aria-label={item.label}
                onMouseEnter={() => handleSetActive(index)}
                onFocus={() => handleSetActive(index)}
                onBlur={handleClearActive}
                onClick={() => handleNavClick(item.href)}
              >
                <IconComponent
                  className={styles.menuBarIcon}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
