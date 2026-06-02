'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './PageLoader.module.css'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 2500)

    const removeTimer = setTimeout(() => {
      setVisible(false)
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={loaderRef}
      className={`${styles.loader} ${fading ? styles.loaderFading : ''}`}
    >
      <div className={styles.cyberGrid} />
      <div className={styles.glowOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>
      <div className={styles.logoWrapper}>
        <img src="/white.png" alt="Lenient Cyber" className={styles.logo} />
        <div className={styles.loaderBar}>
          <div className={styles.loaderProgress} />
        </div>
      </div>
    </div>
  )
}
