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
}

export class GameplayEngine {
  private chart: Chart
  private audioElement: HTMLAudioElement | null = null
  private hitWindow = {
    perfect: 0.05, // 50ms
    good: 0.1, // 100ms
  }

  constructor(chart: Chart) {
    this.chart = chart
  }

  setAudioElement(audio: HTMLAudioElement) {
    this.audioElement = audio
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0
  }

  checkHit(lane: number, currentTime: number): HitResult | null {
    // Buscar la nota más cercana en el carril especificado
    const note = this.findNearestNote(lane, currentTime)

    if (!note) {
      return {
        type: "miss",
        points: 0,
        note: { id: "miss", time: currentTime, lane, key: "" },
      }
    }

    const timeDiff = Math.abs(note.time - currentTime)

    // Determinar el tipo de hit basado en la diferencia de tiempo
    if (timeDiff <= this.hitWindow.perfect) {
      return { type: "perfect", points: 350, note }
    } else if (timeDiff <= this.hitWindow.good) {
      return { type: "good", points: 100, note }
    } else {
      return { type: "miss", points: 0, note }
    }
  }

  private findNearestNote(lane: number, currentTime: number): Note | null {
    const upcomingNotes = this.chart.notes.filter(
      (note) => note.lane === lane && Math.abs(note.time - currentTime) <= this.hitWindow.good && !note.hit,
    )

    if (upcomingNotes.length === 0) return null

    // Retornar la nota más cercana al tiempo actual
    return upcomingNotes.reduce((closest, note) =>
      Math.abs(note.time - currentTime) < Math.abs(closest.time - currentTime) ? note : closest,
    )
  }

  getActiveNotes(currentTime: number, lookahead = 2): Note[] {
    return this.chart.notes.filter((note) => {
      const timeUntilNote = note.time - currentTime
      return timeUntilNote >= 0 && timeUntilNote <= lookahead && !note.hit
    })
  }

  markNoteAsHit(noteId: string) {
    const note = this.chart.notes.find((n) => n.id === noteId)
    if (note) {
      ;(note as any).hit = true
    }
  }
}

// Función para generar un chart de ejemplo
export function generateSampleChart(bpm = 120, difficulty = "normal"): Chart {
  const notes: Note[] = []
  const keys = ["D", "F", "J", "K"]
  const noteDuration = 60 / bpm // Duración de una nota en segundos

  // Generar notas para 30 segundos de juego
  for (let i = 0; i < 120; i++) {
    const lane = Math.floor(Math.random() * 4)
    notes.push({
      id: `note-${i}`,
      time: i * noteDuration,
      lane,
      key: keys[lane],
    })
  }

  return { notes, bpm, difficulty }
}
