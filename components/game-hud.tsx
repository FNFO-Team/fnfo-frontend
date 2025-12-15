"use client"

import { Zap, Target } from "lucide-react"

interface GameHUDProps {
  score: number
  combo: number
  maxCombo: number
  accuracy: number
  perfect: number
  good: number
  miss: number
  currentTime: number
  duration: number
}

/**
 * Componente HUD que muestra score, combo y estadísticas en vivo durante el juego
 */
export function GameHUD({
  score,
  combo,
  maxCombo,
  accuracy,
  perfect,
  good,
  miss,
  currentTime,
  duration,
}: GameHUDProps) {
  const progressPercent = (currentTime / duration) * 100
  const formattedTime = formatTime(currentTime)
  const formattedDuration = formatTime(duration)

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-secondary" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary" />

      {/* Score y Combo - Top Left */}
      <div className="absolute top-8 left-8 font-black text-white drop-shadow-lg">
        <div className="text-5xl mb-2 text-primary animate-pulse">{score.toLocaleString()}</div>
        <div className="text-2xl text-secondary">SCORE</div>
      </div>

      {/* Combo - Top Right */}
      <div className="absolute top-8 right-8 text-center font-black text-white drop-shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-8 h-8 text-yellow-400" />
          <div className="text-5xl text-yellow-400">{combo}</div>
        </div>
        <div className="text-lg text-muted-foreground">MAX: {maxCombo}</div>
      </div>

      {/* Accuracy - Bottom Left */}
      <div className="absolute bottom-32 left-8 font-black text-white drop-shadow-lg">
        <div className="text-4xl mb-1 text-accent">{accuracy.toFixed(1)}%</div>
        <div className="text-lg text-muted-foreground">ACCURACY</div>
      </div>

      {/* Hit Stats - Bottom Left (bajo accuracy) */}
      <div className="absolute bottom-8 left-8 font-bold text-sm drop-shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-primary">Perfect: {perfect}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-secondary" />
          <span className="text-secondary">Good: {good}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-destructive" />
          <span className="text-destructive">Miss: {miss}</span>
        </div>
      </div>

      {/* Progress Bar - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-80">
        <div className="bg-card/80 border-2 border-primary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-bold">
          <span>{formattedTime}</span>
          <span>{formattedDuration}</span>
        </div>
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
