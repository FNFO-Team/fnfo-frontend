"use client"

import { useState, useEffect } from "react"

interface KeyDisplayProps {
  keys: string[]
}

export function KeyDisplay({ keys }: KeyDisplayProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (keys.includes(key)) {
        setPressedKeys((prev) => new Set(prev).add(key))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (keys.includes(key)) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [keys])

  const keyColors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"]

  return (
    <div className="bg-background border-2 border-secondary/30 rounded-lg p-4 mb-4">
      <div className="text-xs font-bold text-muted-foreground text-center mb-2">CONTROLES</div>
      <div className="flex justify-center gap-3">
        {keys.map((key, index) => (
          <div
            key={key}
            className={`w-16 h-16 rounded-lg flex items-center justify-center border-4 transition-all duration-100 ${
              pressedKeys.has(key)
                ? `${keyColors[index % keyColors.length]} border-white scale-110 shadow-lg`
                : "bg-muted border-muted-foreground/30"
            }`}
          >
            <span className={`text-2xl font-black ${pressedKeys.has(key) ? "text-white" : "text-muted-foreground"}`}>
              {key}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
