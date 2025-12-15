"use client"

import { useState, useEffect } from "react"
import { ScoreDisplay } from "./score-display"
import { GameLane } from "./game-lane"

interface PlayerBoardProps {
  playerId: number
  playerName: string
  score: number
  combo: number
  perfectCount: number
  goodCount: number
  missCount: number
  assignedKeys: string[]
  isLocalPlayer?: boolean
  notes?: any[]
  currentTime?: number
  onNoteHit?: (noteId: string, accuracy: "perfect" | "good" | "miss") => void
  pressedKeys?: Set<string>
  lastHitResult?: { lane: number; type: "perfect" | "good" | "miss" } | null
}

export function PlayerBoard({
  playerId,
  playerName,
  score,
  combo,
  perfectCount,
  goodCount,
  missCount,
  assignedKeys,
  isLocalPlayer = false,
  notes = [],
  currentTime = 0,
  onNoteHit,
  pressedKeys = new Set(),
  lastHitResult,
}: PlayerBoardProps) {
  const [hitEffects, setHitEffects] = useState<Map<number, boolean>>(new Map())

  // Mostrar hit effect por 300ms
  useEffect(() => {
    if (lastHitResult) {
      setHitEffects((prev) => new Map(prev).set(lastHitResult.lane, true))
      const timer = setTimeout(() => {
        setHitEffects((prev) => {
          const newMap = new Map(prev)
          newMap.set(lastHitResult.lane, false)
          return newMap
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [lastHitResult])

  // Mapeo de teclas a labels visibles
  const getKeyLabel = (key: string): string => {
    if (key === "ArrowLeft") return "←"
    if (key === "ArrowDown") return "↓"
    if (key === "ArrowUp") return "↑"
    if (key === "ArrowRight") return "→"
    return key.toUpperCase()
  }

  // Verificar si una tecla está presionada
  const isKeyPressed = (index: number): boolean => {
    const key = assignedKeys[index]
    if (!key) return false
    
    const keyLower = key.toLowerCase()
    
    // Verificar directamente por nombre de tecla
    if (pressedKeys.has(keyLower)) return true
    
    // Para arrow keys, verificar diferentes formatos
    if (key.startsWith("Arrow")) {
      const arrowName = key.replace("Arrow", "").toLowerCase()
      return pressedKeys.has(`arrow${arrowName}`)
    }
    
    return false
  }

  return (
    <div
      className={`relative bg-card/50 backdrop-blur-sm border-4 rounded-lg p-6 transition-all duration-300 ${
        isLocalPlayer ? "border-primary shadow-xl shadow-primary/20" : "border-muted"
      }`}
    >
      {/* Header del jugador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xl font-black text-primary-foreground">{playerId}</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground">{playerName}</h3>
            {isLocalPlayer && <span className="text-xs font-bold text-primary">(TÚ)</span>}
          </div>
        </div>
      </div>

      {/* Display de puntaje */}
      <ScoreDisplay
        score={score}
        combo={combo}
        perfectCount={perfectCount}
        goodCount={goodCount}
        missCount={missCount}
      />

      {/* Carriles de juego */}
      <div className="mt-6 relative h-96 bg-black/20 rounded-lg overflow-hidden border-2 border-primary/20">
        <div className="absolute inset-0 flex">
          {[0, 1, 2, 3].map((laneIndex) => (
            <GameLane
              key={laneIndex}
              laneIndex={laneIndex}
              keyLabel={getKeyLabel(assignedKeys[laneIndex] || "")}
              notes={notes}
              currentTime={currentTime}
              isPressed={isKeyPressed(laneIndex)}
              lastHitType={lastHitResult?.lane === laneIndex ? lastHitResult.type : null}
              showHitEffect={hitEffects.get(laneIndex) || false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
