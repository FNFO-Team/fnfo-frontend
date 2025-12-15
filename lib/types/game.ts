/**
 * Tipos y interfaces para el sistema de juego
 */

export type KeyType = "left" | "down" | "up" | "right"
export type NoteType = "normal" | "hold"
export type HitRating = "perfect" | "good" | "miss"

/**
 * Representa una nota en el chart
 */
export interface ChartNote {
  id: string
  time: number // tiempo en milisegundos
  key: KeyType
  type: NoteType
  duration?: number // para notas hold, en milisegundos
}

/**
 * Representa el chart completo de una canción
 */
export interface GameChart {
  id: string
  title: string
  artist: string
  difficulty: "easy" | "normal" | "hard" | "extreme"
  bpm: number
  duration: number // duración total en ms
  notes: ChartNote[]
  previewUrl?: string
  audioUrl: string
}

/**
 * Resultado de un hit detectado
 */
export interface HitResult {
  noteId: string
  rating: HitRating
  accuracy: number // -100 a 100 (ms antes/después del time correcto)
  timestamp: number
  key: KeyType
}

/**
 * Estado del juego en vivo
 */
export interface GameState {
  currentTime: number // ms
  isPlaying: boolean
  score: number
  combo: number
  maxCombo: number
  hits: HitResult[]
  missedNotes: string[] // IDs de notas no presionadas
  accuracy: number // porcentaje 0-100
  keysPressed: Set<KeyType> // teclas presionadas actualmente
}

/**
 * Estadísticas finales del juego
 */
export interface GameResult {
  chartId: string
  difficulty: string
  score: number
  combo: number
  maxCombo: number
  accuracy: number // 0-100
  perfect: number
  good: number
  miss: number
  totalNotes: number
  duration: number // ms jugados
  timestamp: string // ISO string
  userId?: string
}

/**
 * Windows de tiempo para detectar hits (en ms)
 */
export const TIMING_WINDOWS = {
  perfect: 50,  // ±50ms
  good: 100,    // ±100ms
  miss: 150,    // ±150ms (fuera de esto es miss)
} as const

/**
 * Puntos por tipo de hit
 */
export const SCORE_VALUES = {
  perfect: 100,
  good: 50,
  miss: 0,
} as const
