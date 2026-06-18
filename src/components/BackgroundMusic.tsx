'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.35

    const startPlayback = () => {
      audio.play().catch(() => {
        // Autoplay can be blocked until the user interacts with the page.
      })
    }

    startPlayback()

    const unlockPlayback = () => {
      startPlayback()
    }

    window.addEventListener('pointerdown', unlockPlayback, { once: true })
    window.addEventListener('keydown', unlockPlayback, { once: true })
    window.addEventListener('touchstart', unlockPlayback, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockPlayback)
      window.removeEventListener('keydown', unlockPlayback)
      window.removeEventListener('touchstart', unlockPlayback)
      audio.pause()
    }
  }, [])

  return (
    <audio
      ref={audioRef}
      src="/bg_music.mp3"
      preload="auto"
      loop
      aria-hidden="true"
      className="hidden"
    />
  )
}
