'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import styles from './BackgroundMusic.module.css'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.35
    audio.loop = true
    audio.load()

    const unlockEvents = ['pointerdown', 'click', 'keydown', 'touchstart'] as const

    const removeUnlockListeners = () => {
      unlockEvents.forEach((eventName) => {
        document.removeEventListener(eventName, startPlayback, true)
      })
    }

    const startPlayback = async () => {
      try {
        audio.muted = false
        await audio.play()
        setIsPlaying(true)
        setIsBlocked(false)
        removeUnlockListeners()
      } catch {
        setIsBlocked(true)
      }
    }

    startPlayback()

    unlockEvents.forEach((eventName) => {
      document.addEventListener(eventName, startPlayback, true)
    })

    return () => {
      removeUnlockListeners()
      audio.pause()
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        audio.muted = false
        await audio.play()
        setIsPlaying(true)
        setIsBlocked(false)
      } catch {
        setIsBlocked(true)
      }
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/bg_music.mp3"
        preload="auto"
        loop
        playsInline
        aria-hidden="true"
      />
      <button
        type="button"
        className={`${styles.toggle} ${isBlocked ? styles.needsInteraction : ''}`}
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={isPlaying ? 'Pause background music' : 'Play background music'}
      >
        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  )
}
