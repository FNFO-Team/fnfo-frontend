"use client"

import { AnimatedNote } from "./animated-note"
import { KeyReceptor } from "./key-receptor"

interface Note {
  id: string
  lane: number
  time: number
  hit?: boolean
  duration?: number
}

interface GameLaneProps {
  laneIndex: number
  keyLabel: string
  notes: Note[]
  currentTime: number
  isPressed: boolean
  lastHitType?: "perfect" | "good" | "miss" | null
  showHitEffect?: boolean
}

/**
 * Carril individual de juego que contiene:
 * - Notas animadas cayendo desde arriba
 * - Receptor de tecla (hitbox) en la parte inferior
 */
export function GameLane({
  laneIndex,
  keyLabel,
  notes,
  currentTime,
  isPressed,
  lastHitType,
  showHitEffect,
}: GameLaneProps) {
  // Filtrar notas de este carril
  const laneNotes = notes.filter((note) => note.lane === laneIndex)

  return (
    <div className="relative flex-1 h-full bg-gradient-to-b from-transparent to-black/30">
      {/* Contenedor de notas animadas - ocupa todo el espacio disponible */}
      <div className="absolute inset-0 overflow-hidden">
        {laneNotes.map((note) => (
          <AnimatedNote
            key={note.id}
            id={note.id}
            lane={note.lane}
            noteTime={note.time}
            currentTime={currentTime}
            duration={note.duration}
            hit={note.hit}
          />
        ))}
      </div>

      {/* Líneas guía de timing */}
      <div className="absolute inset-0 pointer-events-none border-x border-white/10">
        <div className="absolute bottom-20 left-0 right-0 h-px bg-white/5" />
        <div className="absolute bottom-24 left-0 right-0 h-px bg-white/5" />
        <div className="absolute bottom-28 left-0 right-0 h-px bg-white/5" />
      </div>

      {/* Receptor de tecla (hitbox) - directamente en el fondo */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
        <KeyReceptor
          keyLabel={keyLabel}
          isPressed={isPressed}
          laneIndex={laneIndex}
          showHitEffect={showHitEffect}
          hitType={lastHitType}
        />
      </div>
    </div>
  )
}
