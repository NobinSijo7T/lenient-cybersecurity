'use client'

import { useState, useCallback } from 'react'

export function useLoader() {
  const [isLoading, setIsLoading] = useState(true)

  const showLoader = useCallback(() => setIsLoading(true), [])
  const hideLoader = useCallback(() => setIsLoading(false), [])
  const toggleLoader = useCallback(() => setIsLoading((prev) => !prev), [])

  return {
    isLoading,
    showLoader,
    hideLoader,
    toggleLoader,
  }
}
