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
    <div className="relative flex-1 h-full flex flex-col justify-end items-center">
      {/* Fondo del carril con líneas guía */}
      <div className="absolute inset-0 border-x border-white/10">
        {/* Líneas de timing para ayuda visual */}
        <div className="absolute bottom-20 left-0 right-0 h-px bg-white/5" />
        <div className="absolute bottom-24 left-0 right-0 h-px bg-white/5" />
        <div className="absolute bottom-28 left-0 right-0 h-px bg-white/5" />
      </div>

      {/* Contenedor de notas animadas */}
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

      {/* Receptor de tecla (hitbox) en la parte inferior */}
      <div className="relative z-10 mb-4">
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
