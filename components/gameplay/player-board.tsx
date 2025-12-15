"use client"

import { ScoreDisplay } from "./score-display"
import { NoteTrack } from "./note-track"

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
}: PlayerBoardProps) {
  return (
    <div
      className={`relative bg-card border-4 rounded-lg p-6 transition-all duration-300 ${
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

      <NoteTrack playerId={playerId} notes={notes} currentTime={currentTime} onNoteHit={onNoteHit} />
    </div>
  )
}
