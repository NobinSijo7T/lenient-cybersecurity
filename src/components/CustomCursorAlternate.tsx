'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './CustomCursorAlternate.module.css'

export default function CustomCursorAlternate() {
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

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY

      // Dot moves instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`
      }

      // Outer reticle moves with smooth lag
      gsap.to(pos, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.2,
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
        scale: 1.4,
        rotation: 45, // Rotates to a diamond target
        duration: 0.4,
        ease: 'back.out(1.5)',
      })
      gsap.to(dotRef.current, {
        scale: 1.8,
        backgroundColor: '#ffffff',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 50, 30, 0.8)',
        duration: 0.2,
      })
    }

    const onMouseLeave = () => {
      setIsHovering(false)
      gsap.to(cursorRef.current, {
        scale: 1.0,
        rotation: 0,
        duration: 0.4,
        ease: 'back.out(1.5)',
      })
      gsap.to(dotRef.current, {
        scale: 1.0,
        backgroundColor: '#ff321e',
        boxShadow: '0 0 10px rgba(255, 50, 30, 0.8), 0 0 20px rgba(255, 50, 30, 0.5)',
        duration: 0.2,
      })
    }

    const addHoverEffects = () => {
      // Using attribute selectors to match CSS module classes
      const interactives = document.querySelectorAll(
        'a, button, [role="button"], [class*="menuBarButton"], [class*="navBrand"], [class*="heroCopyCard"]'
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
      <div ref={cursorRef} className={`${styles.cursor} ${isHovering ? styles.cursorHovering : ''}`}>
        <div className={styles.cursorInner} />
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}
