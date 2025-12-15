"use client"

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface ArrowNoteProps {
  direction: "left" | "down" | "up" | "right"
  position: number // 0-100, porcentaje desde arriba
  lane: number // 0-3
  hit?: boolean
}

export function ArrowNote({ direction, position, lane, hit = false }: ArrowNoteProps) {
  const getArrowIcon = () => {
    switch (direction) {
      case "left":
        return <ArrowLeft className="w-full h-full" />
      case "down":
        return <ArrowDown className="w-full h-full" />
      case "up":
        return <ArrowUp className="w-full h-full" />
      case "right":
        return <ArrowRight className="w-full h-full" />
    }
  }

  const getColor = () => {
    switch (direction) {
      case "left":
        return "text-purple-500 border-purple-500"
      case "down":
        return "text-cyan-500 border-cyan-500"
      case "up":
        return "text-green-500 border-green-500"
      case "right":
        return "text-red-500 border-red-500"
    }
  }

  return (
    <div
      className={`absolute transition-all duration-75 ${hit ? "opacity-0" : "opacity-100"}`}
      style={{
        top: `${position}%`,
        left: `${lane * 25}%`,
        width: "25%",
      }}
    >
      <div
        className={`w-16 h-16 mx-auto border-4 rounded-lg bg-background/90 flex items-center justify-center ${getColor()}`}
      >
        {getArrowIcon()}
      </div>
    </div>
  )
}
