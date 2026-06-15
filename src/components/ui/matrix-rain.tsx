"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface MatrixRainProps {
    className?: string
    variant?: "default" | "cyan" | "rainbow"
    width?: number
    height?: number
    fontSize?: number
    speed?: number
    fixedColor?: string
    overlay?: boolean
}

export function MatrixRain({
    className,
    variant = "default",
    width,
    height,
    fontSize = 16,
    speed = 50,
    fixedColor,
    overlay = false,
}: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let columns = Math.floor(canvas.width / fontSize)
        let drops = new Array(columns).fill(1)

        // If specific dimensions are provided, use them. Otherwise observe parent.
        const resizeObserver = new ResizeObserver(() => {
            if (!width && !height) {
                const prevWidth = canvas.width
                canvas.width = canvas.offsetWidth
                canvas.height = canvas.offsetHeight
                
                // Update columns and drops array when resized
                if (canvas.width !== prevWidth) {
                    const newColumns = Math.floor(canvas.width / fontSize)
                    if (newColumns !== columns) {
                        const newDrops = new Array(newColumns).fill(1)
                        for (let i = 0; i < Math.min(columns, newColumns); i++) {
                            newDrops[i] = drops[i]
                        }
                        columns = newColumns
                        drops = newDrops
                    }
                }
            }
        })
        resizeObserver.observe(canvas)

        // Initial size setup
        if (width) canvas.width = width
        if (height) canvas.height = height
        if (!width && !height) {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
            
            columns = Math.floor(canvas.width / fontSize)
            drops = new Array(columns).fill(1)
        }

        // Character set: Katakana + Numbers
        const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890"

        let isDark = document.documentElement.classList.contains("dark")

        const bg = overlay ? "rgba(0,0,0,0)" : isDark ? "#000000" : "#ffffff"

        if (!overlay) {
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        const draw = () => {
            // Check theme state on every frame
            const currentIsDark = document.documentElement.classList.contains("dark")

            // If theme changed, reset the background immediately
            if (currentIsDark !== isDark) {
                isDark = currentIsDark
                ctx.fillStyle = isDark ? "#000000" : "#ffffff"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            // Semi-transparent color for trail effect
            if (overlay) {
                // Erase with alpha to create a transparent fade trail
                ctx.globalCompositeOperation = "destination-out"
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.globalCompositeOperation = "source-over"
            } else {
                ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)] || ""

                // Color selection
                if (variant === "rainbow" && !fixedColor) {
                    const hue = (Date.now() / 20 + i * 10) % 360
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
                } else if (fixedColor) {
                    ctx.fillStyle = fixedColor
                } else {
                    // Adaptive colors based on background
                    if (variant === "cyan") {
                        ctx.fillStyle = isDark ? "#0FF" : "#0e7490" // Cyan-700
                    } else {
                        // Default to green
                        ctx.fillStyle = isDark ? "#0F0" : "#15803d" // Green-700
                    }
                }

                const x = i * fontSize
                const y = drops[i] * fontSize

                ctx.fillText(text, x, y)

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                drops[i]++
            }
        }

        const interval = setInterval(draw, speed)

        return () => {
            clearInterval(interval)
            resizeObserver.disconnect()
        }
    }, [variant, fontSize, speed, fixedColor, overlay, width, height])

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                overlay
                    ? "size-full block"
                    : "size-full bg-background block rounded-[inherit]",
                className
            )}
            style={{ width, height }}
        />
    )
}
