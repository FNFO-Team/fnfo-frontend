export interface Note {
  id: string
  time: number // Tiempo en segundos donde debe ser presionada
  lane: number // Carril (0-3)
  key: string // Tecla asignada
  hit?: boolean // Whether the note has been hit
}

export interface Chart {
  notes: Note[]
  bpm: number
  difficulty: string
}

export interface HitResult {
  type: "perfect" | "good" | "miss"
  points: number
  note: Note
  timeDiff: number // Diferencia exacta de tiempo en segundos
}

export class GameplayEngine {
  private chart: Chart
  private audioElement: HTMLAudioElement | null = null
  private hitWindow = {
    perfect: 0.05, // 50ms en segundos
    good: 0.1, // 100ms en segundos
  }
  private hitNotes: Set<string> = new Set() // Evitar duplicados

  constructor(chart: Chart) {
    this.chart = chart
  }

  setAudioElement(audio: HTMLAudioElement) {
    this.audioElement = audio
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0
  }

  /**
   * Verifica si hay un hit para la nota más cercana en un carril
   * Retorna null si no hay nota dentro del hit window
   */
  checkHit(lane: number, currentTime: number): HitResult | null {
    // Buscar la nota más cercana en el carril especificado que no haya sido golpeada
    const note = this.findNearestUnhitNote(lane, currentTime)

    if (!note) {
      return null
    }

    const timeDiff = note.time - currentTime // Pueden ser negativos (nota pasada)
    const absDiff = Math.abs(timeDiff)

    // Determinar el tipo de hit basado en la diferencia de tiempo
    if (absDiff <= this.hitWindow.perfect) {
      this.hitNotes.add(note.id)
      ;(note as any).hit = true
      return { type: "perfect", points: 350, note, timeDiff }
    } else if (absDiff <= this.hitWindow.good) {
      this.hitNotes.add(note.id)
      ;(note as any).hit = true
      return { type: "good", points: 100, note, timeDiff }
    }

    // Si está fuera del hit window pero muy cerca, es un miss
    if (absDiff <= this.hitWindow.good * 1.5) {
      this.hitNotes.add(note.id)
      ;(note as any).hit = true
      return { type: "miss", points: 0, note, timeDiff }
    }

    return null
  }

  /**
   * Encuentra la nota no golpeada más cercana en un carril
   * Solo considera notas dentro del hit window (pasadas o futuras)
   */
  private findNearestUnhitNote(lane: number, currentTime: number): Note | null {
    const candidates = this.chart.notes.filter(
      (note) =>
        note.lane === lane &&
        !this.hitNotes.has(note.id) &&
        Math.abs(note.time - currentTime) <= this.hitWindow.good * 1.5,
    )

    if (candidates.length === 0) return null

    // Retornar la nota más cercana
    return candidates.reduce((closest, note) =>
      Math.abs(note.time - currentTime) < Math.abs(closest.time - currentTime) ? note : closest,
    )
  }

  getActiveNotes(currentTime: number, lookahead = 2): Note[] {
    return this.chart.notes.filter((note) => {
      const timeUntilNote = note.time - currentTime
      return timeUntilNote >= -0.2 && timeUntilNote <= lookahead && !this.hitNotes.has(note.id)
    })
  }

  /**
   * Obtiene notas que debieron ser presionadas pero no fueron (misses automáticos)
   */
  getExpiredNotes(currentTime: number): Note[] {
    return this.chart.notes.filter(
      (note) => note.time < currentTime - this.hitWindow.good * 1.5 && !this.hitNotes.has(note.id),
    )
  }

  markNoteAsHit(noteId: string) {
    this.hitNotes.add(noteId)
    const note = this.chart.notes.find((n) => n.id === noteId)
    if (note) {
      ;(note as any).hit = true
    }
  }

  /**
   * Obtiene estadísticas finales del juego
   */
  getGameStats() {
    return {
      totalNotes: this.chart.notes.length,
      hitNotes: this.hitNotes.size,
      missedNotes: this.chart.notes.length - this.hitNotes.size,
    }
  }

  /**
   * Reinicia el motor
   */
  reset() {
    this.hitNotes.clear()
    this.chart.notes.forEach((note) => {
      ;(note as any).hit = false
    })
  }
}

// Función para generar un chart de ejemplo
export function generateSampleChart(bpm = 120, difficulty = "normal"): Chart {
  const notes: Note[] = []
  const keys = ["D", "F", "J", "K"]
  const noteDuration = 60 / bpm // Duración de una nota en segundos

  // Generar notas para 30 segundos de juego
  // Empezar desde 2 segundos para dar tiempo a ver las primeras notas cayendo
  const startTime = 2
  for (let i = 0; i < 120; i++) {
    const lane = Math.floor(Math.random() * 4)
    notes.push({
      id: `note-${i}`,
      time: startTime + (i * noteDuration),
      lane,
      key: keys[lane],
    })
  }

  return { notes, bpm, difficulty }
}
