'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './CustomCursorCrosshair.module.css'

export default function CustomCursorCrosshair() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // Check if touch device
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(touchDevice)
    if (touchDevice) return

    document.documentElement.classList.add('custom-cursor-active')

    const mouse = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    const dotPos = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY

      // Dot moves almost instantly
      gsap.to(dotPos, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.05,
        ease: 'power2.out',
        onUpdate: () => {
          if (dotRef.current) {
            dotRef.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`
          }
        },
      })

      // Crosshair moves with smooth lag
      gsap.to(pos, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.18,
        ease: 'power3.out',
        onUpdate: () => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
          }
        },
      })
    }

    const onMouseEnter = () => {
      setIsHovering(true)
      gsap.to(cursorRef.current, {
        scale: 1.5,
        duration: 0.35,
        ease: 'elastic.out(1, 0.5)',
      })
      gsap.to(dotRef.current, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        boxShadow: '0 0 25px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 50, 30, 0.9)',
        duration: 0.25,
      })
    }

    const onMouseLeave = () => {
      setIsHovering(false)
      gsap.to(cursorRef.current, {
        scale: 1.0,
        duration: 0.35,
        ease: 'elastic.out(1, 0.5)',
      })
      gsap.to(dotRef.current, {
        scale: 1.0,
        backgroundColor: '#ff321e',
        boxShadow: '0 0 12px rgba(255, 50, 30, 0.9), 0 0 24px rgba(255, 50, 30, 0.6)',
        duration: 0.25,
      })
    }

    const addHoverEffects = () => {
      // Query all interactive elements including CSS module classes
      const interactives = document.querySelectorAll(
        `a, 
         button, 
         [role="button"],
         [class*="menuBarButton"],
         [class*="navBrand"],
         [class*="heroCopyCard"],
         [class*="menuBar"],
         [class*="navBrandLogo"]`
      )
      
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })
    }

    window.addEventListener('mousemove', onMouseMove)

    const timeoutId = setTimeout(addHoverEffects, 200)

    const observer = new MutationObserver(addHoverEffects)
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
      {/* Center targeting circle */}
      <div ref={cursorRef} className={`${styles.cursor} ${isHovering ? styles.cursorHovering : ''}`}>
        <div className={styles.outerRing} />
        <div className={styles.innerRing} />
        <div className={styles.scanline} />
      </div>
      
      {/* Center dot */}
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}
