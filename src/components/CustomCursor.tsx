'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // Check if touch device
    const touchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(touchDevice)
    if (touchDevice) return

    // Hide default cursor globally
    document.documentElement.classList.add('custom-cursor-active')

    const mouse = { x: 0, y: 0 }
    const dotPos = { x: 0, y: 0 }
    const ringPos = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY

      gsap.to(dotPos, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.06,
        ease: 'power2.out',
        onUpdate: () => {
          if (cursorDotRef.current) {
            cursorDotRef.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`
          }
        },
      })

      gsap.to(ringPos, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.32,
        ease: 'power3.out',
        onUpdate: () => {
          if (cursorRingRef.current) {
            cursorRingRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`
          }
        },
      })
    }

    const onMouseEnter = () => {
      setIsHovering(true)
      gsap.to(cursorRingRef.current, {
        scale: 1.8,
        borderColor: 'rgba(255, 50, 30, 0.95)',
        backgroundColor: 'rgba(255, 40, 20, 0.1)',
        boxShadow:
          '0 0 20px rgba(255, 30, 10, 0.6), inset 0 0 10px rgba(255, 30, 10, 0.3)',
        duration: 0.25,
        ease: 'power2.out',
      })
      gsap.to(cursorDotRef.current, {
        scale: 2.2,
        backgroundColor: '#ffffff',
        boxShadow:
          '0 0 16px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 50, 30, 0.8)',
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    const onMouseLeave = () => {
      setIsHovering(false)
      gsap.to(cursorRingRef.current, {
        scale: 1.0,
        borderColor: 'rgba(255, 60, 30, 0.6)',
        backgroundColor: 'transparent',
        boxShadow:
          '0 0 0px rgba(0,0,0,0), inset 0 0 0px rgba(0,0,0,0)',
        duration: 0.25,
        ease: 'power2.out',
      })
      gsap.to(cursorDotRef.current, {
        scale: 1.0,
        backgroundColor: '#ff321e',
        boxShadow:
          '0 0 10px rgba(255, 50, 30, 0.8), 0 0 20px rgba(255, 50, 30, 0.5)',
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    const addHoverEffects = () => {
      const interactives = document.querySelectorAll(
        'a, button, [role="button"], .menu-bar__button, .nav-brand, .hero__copy-card'
      )
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })
    }

    window.addEventListener('mousemove', onMouseMove)

    const timeoutId = setTimeout(() => {
      addHoverEffects()
    }, 200)

    const observer = new MutationObserver(() => {
      addHoverEffects()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.documentElement.classList.remove('custom-cursor-active')
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [])

  if (isTouch) return null

  return (
    <div className={styles.wrap}>
      <div
        ref={cursorDotRef}
        className={`${styles.dot} ${isHovering ? styles.dotHovering : ''}`}
      />
      <div
        ref={cursorRingRef}
        className={`${styles.ring} ${isHovering ? styles.ringHovering : ''}`}
      />
    </div>
  )
}
