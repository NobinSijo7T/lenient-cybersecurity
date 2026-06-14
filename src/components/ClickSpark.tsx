'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import styles from './ClickSpark.module.css'

export default function ClickSpark() {
  useEffect(() => {
    const sparks = new Set<HTMLDivElement>()
    let isCleanedUp = false
    
    const createSpark = (x: number, y: number) => {
      if (isCleanedUp) return
      
      const container = document.querySelector(`.${styles.container}`)
      if (!container) return

      const sparkCount = 8

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div')
        spark.className = 'click-spark'

        const angle = (Math.PI * 2 * i) / sparkCount
        const velocity = 50 + Math.random() * 50

        spark.style.left = `${x}px`
        spark.style.top = `${y}px`

        container.appendChild(spark)
        sparks.add(spark)

        gsap.to(spark, {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          opacity: 0,
          scale: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            if (isCleanedUp) return
            
            try {
              sparks.delete(spark)
              spark.remove()
            } catch (error) {
              // Silently catch if element was already removed
              console.debug('Spark cleanup error:', error)
            }
          },
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!isCleanedUp) {
        createSpark(e.clientX, e.clientY)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      isCleanedUp = true
      document.removeEventListener('click', handleClick)
      
      // Clean up any remaining sparks
      sparks.forEach((spark) => {
        try {
          gsap.killTweensOf(spark)
          spark.remove()
        } catch (error) {
          // Silently catch cleanup errors
          console.debug('Spark cleanup error:', error)
        }
      })
      sparks.clear()
    }
  }, [])

  return <div className={styles.container} />
}
