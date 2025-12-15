"use client"

import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { ArrowNote } from "./arrow-note"

interface Note {
  id: string
  lane: number // 0=left, 1=down, 2=up, 3=right
  time: number
  hit: boolean
}

interface NoteTrackProps {
  playerId: number
  notes?: Note[]
  currentTime?: number
  onNoteHit?: (noteId: string, accuracy: "perfect" | "good" | "miss") => void
}

export function NoteTrack({ playerId, notes = [], currentTime = 0, onNoteHit }: NoteTrackProps) {
  const [activeFeedback, setActiveFeedback] = useState<{
    type: "perfect" | "good" | "miss"
    timestamp: number
  } | null>(null)

  useEffect(() => {
    if (activeFeedback) {
      const timer = setTimeout(() => setActiveFeedback(null), 600)
      return () => clearTimeout(timer)
    }
  }, [activeFeedback])

  const getArrowIcon = (lane: number) => {
    const iconClass = "w-12 h-12"
    switch (lane) {
      case 0:
        return <ArrowLeft className={iconClass} />
      case 1:
        return <ArrowDown className={iconClass} />
      case 2:
        return <ArrowUp className={iconClass} />
      case 3:
        return <ArrowRight className={iconClass} />
    }
  }

  const getArrowColor = (lane: number) => {
    switch (lane) {
      case 0:
        return "text-purple-500 border-purple-500 bg-purple-500/10"
      case 1:
        return "text-cyan-500 border-cyan-500 bg-cyan-500/10"
      case 2:
        return "text-green-500 border-green-500 bg-green-500/10"
      case 3:
        return "text-red-500 border-red-500 bg-red-500/10"
    }
  }

  const getKeyLabel = (lane: number) => {
    switch (lane) {
      case 0:
        return "←"
      case 1:
        return "↓"
      case 2:
        return "↑"
      case 3:
        return "→"
    }
  }

  const getFeedbackStyle = (type: "perfect" | "good" | "miss") => {
    switch (type) {
      case "perfect":
        return "text-green-400 animate-bounce"
      case "good":
        return "text-blue-400 animate-pulse"
      case "miss":
        return "text-red-400 animate-shake"
    }
  }

  return (
    <div className="relative bg-background/50 border-2 border-muted rounded-lg h-[500px] overflow-hidden mt-4">
      {/* Grid de carriles */}
      <div className="absolute inset-0 grid grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-l border-muted/20 first:border-l-0" />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary/20 to-transparent border-t-4 border-primary/50 z-10">
        <div className="grid grid-cols-4 h-full">
          {[0, 1, 2, 3].map((lane) => (
            <div key={lane} className="flex items-center justify-center relative">
              <div className={`w-16 h-16 border-4 rounded-lg flex items-center justify-center ${getArrowColor(lane)}`}>
                {getArrowIcon(lane)}
              </div>
              {/* Tecla label */}
              <div className="absolute -bottom-1 text-xs font-bold text-muted-foreground">{getKeyLabel(lane)}</div>
            </div>
          ))}
        </div>

        {activeFeedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`text-4xl font-black tracking-wider drop-shadow-lg ${getFeedbackStyle(activeFeedback.type)}`}
            >
              {activeFeedback.type === "perfect" && "PERFECT!"}
              {activeFeedback.type === "good" && "GOOD!"}
              {activeFeedback.type === "miss" && "MISS!"}
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0">
        {notes.map((note) => {
          // Calcular posición basada en el tiempo
          // La nota aparece en top=0 y debe llegar a la hit zone (bottom) en el momento correcto
          const noteTime = note.time
          const timeDiff = noteTime - currentTime
          // Si timeDiff es positivo, la nota está en el futuro y debe estar arriba
          // Si es 0, está en la hit zone
          // Asumimos que las notas son visibles 2 segundos antes de llegar
          const visibilityWindow = 2 // segundos
          const position = ((visibilityWindow - timeDiff) / visibilityWindow) * 100

          // Solo mostrar notas que están en la ventana de visibilidad
          if (position < 0 || position > 100 || note.hit) return null

          const direction: "left" | "down" | "up" | "right" =
            note.lane === 0 ? "left" : note.lane === 1 ? "down" : note.lane === 2 ? "up" : "right"

          return <ArrowNote key={note.id} direction={direction} position={position} lane={note.lane} hit={note.hit} />
        })}
      </div>

      {/* Indicador de línea superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50" />
    </div>
  )
}
