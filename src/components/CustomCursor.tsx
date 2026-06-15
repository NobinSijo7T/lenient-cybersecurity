'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)
  const [isPointer, setIsPointer] = useState(false)
  
  useEffect(() => {
    const cursorDot = cursorDotRef.current
    const cursorOutline = cursorOutlineRef.current
    
    if (!cursorDot || !cursorOutline) return

    // Add class to hide default cursor
    document.documentElement.classList.add('custom-cursor-active')

    let mouseX = 0
    let mouseY = 0
    let outlineX = 0
    let outlineY = 0

    // Update mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Update dot position immediately
      cursorDot.style.left = `${mouseX}px`
      cursorDot.style.top = `${mouseY}px`

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"]')
      setIsPointer(!!isInteractive)
    }

    // Smooth follow animation for outline
    const animateOutline = () => {
      const dx = mouseX - outlineX
      const dy = mouseY - outlineY
      
      outlineX += dx * 0.15
      outlineY += dy * 0.15
      
      cursorOutline.style.left = `${outlineX}px`
      cursorOutline.style.top = `${outlineY}px`
      
      requestAnimationFrame(animateOutline)
    }

    // Hide cursor when leaving window
    const handleMouseLeave = () => {
      cursorDot.style.opacity = '0'
      cursorOutline.style.opacity = '0'
    }

    const handleMouseEnter = () => {
      cursorDot.style.opacity = '1'
      cursorOutline.style.opacity = '1'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    const animationId = requestAnimationFrame(animateOutline)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <div 
        ref={cursorDotRef} 
        className={`${styles.cursorDot} ${isPointer ? styles.cursorPointer : ''}`}
      />
      <div 
        ref={cursorOutlineRef} 
        className={`${styles.cursorOutline} ${isPointer ? styles.cursorPointer : ''}`}
      />
    </>
  )
}
