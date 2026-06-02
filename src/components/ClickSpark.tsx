'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import styles from './ClickSpark.module.css'

export default function ClickSpark() {
  useEffect(() => {
    const createSpark = (x: number, y: number) => {
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

        gsap.to(spark, {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          opacity: 0,
          scale: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            spark.remove()
          },
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      createSpark(e.clientX, e.clientY)
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return <div className={styles.container} />
}
