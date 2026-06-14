'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './CTAButton.module.css'

interface CTAButtonProps {
  href?: string
  onClick?: () => void
  className?: string
}

export default function CTAButton({ href = '#', onClick, className }: CTAButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    const glow = glowRef.current
    if (!button || !glow) return

    // Hover effect
    const handleMouseEnter = () => {
      gsap.to(glow, {
        scale: 1.15,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(glow, {
        scale: 1,
        opacity: 0.6,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <a
      ref={buttonRef}
      href={href}
      onClick={onClick}
      className={`${styles.ctaButton} ${className || ''}`}
    >
      <span ref={glowRef} className={styles.glow} aria-hidden="true" />
      <span className={styles.text}>Join community</span>
      <span className={styles.icon} aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 15L12.5 10L7.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  )
}
