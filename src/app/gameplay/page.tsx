"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlayerBoard } from "@/components/gameplay/player-board"
import { FeedbackOverlay } from "@/components/gameplay/feedback-overlay"
import { GameplayEngine, generateSampleChart, type HitResult } from "@/lib/gameplay-engine"

interface PlayerState {
  id: number
  name: string
  score: number
  combo: number
  maxCombo: number
  perfectCount: number
  goodCount: number
  missCount: number
  keys: string[]
}

interface Note {
  id: string
  lane: number
  time: number
  hit: boolean
}

export default function GameplayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "pvp"
  const track = searchParams.get("track") || "Tutorial"

  const audioRef = useRef<HTMLAudioElement>(null)
  const engineRef = useRef<GameplayEngine | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [notes, setNotes] = useState<Note[]>([])

  // Estado del jugador local
  const [localPlayer, setLocalPlayer] = useState<PlayerState>({
    id: 1,
    name: "Jugador 1 (Tú)",
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    keys: ["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight"], // Cambiado a teclas de flecha
  })

  // Estado del oponente (simulado)
  const [opponent, setOpponent] = useState<PlayerState>({
    id: 2,
    name: "Jugador 2",
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    keys: ["A", "S", "W", "D"],
  })

  // Inicializar el motor de juego
  useEffect(() => {
    const chart = generateSampleChart(140, "normal")
    engineRef.current = new GameplayEngine(chart)

    if (audioRef.current) {
      engineRef.current.setAudioElement(audioRef.current)
    }

    const visualNotes: Note[] = chart.notes.map((note) => ({
      id: note.id,
      lane: note.lane,
      time: note.time,
      hit: false,
    }))
    setNotes(visualNotes)
  }, [])

  // Actualizar tiempo actual
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      sendResultsToBackend()
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || !engineRef.current) return

      const key = e.key
      const laneIndex = localPlayer.keys.indexOf(key)

      if (laneIndex === -1) return

      const currentTime = engineRef.current.getCurrentTime()
      const result = engineRef.current.checkHit(laneIndex, currentTime)

      if (result) {
        processHitResult(result)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, localPlayer.keys])

  const processHitResult = useCallback((result: HitResult) => {
    if (!engineRef.current) return

    // Marcar nota como golpeada
    engineRef.current.markNoteAsHit(result.note.id)

    setNotes((prev) => prev.map((note) => (note.id === result.note.id ? { ...note, hit: true } : note)))

    // Actualizar estado del jugador
    setLocalPlayer((prev) => {
      const newCombo = result.type !== "miss" ? prev.combo + 1 : 0
      const comboMultiplier = Math.floor(newCombo / 10) + 1
      const scoreGain = result.points * comboMultiplier

      return {
        ...prev,
        score: prev.score + scoreGain,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        perfectCount: prev.perfectCount + (result.type === "perfect" ? 1 : 0),
        goodCount: prev.goodCount + (result.type === "good" ? 1 : 0),
        missCount: prev.missCount + (result.type === "miss" ? 1 : 0),
      }
    })
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const sendResultsToBackend = async () => {
    // Enviar resultados finales al backend
    const results = {
      playerId: localPlayer.id,
      totalScore: localPlayer.score,
      perfectCount: localPlayer.perfectCount,
      goodCount: localPlayer.goodCount,
      missCount: localPlayer.missCount,
      maxCombo: localPlayer.maxCombo,
      track,
      mode,
      timestamp: new Date().toISOString(),
    }

    console.log("Enviando resultados al backend:", results)

    // Aquí iría la llamada real al backend
    // await fetch('/api/game/results', { method: 'POST', body: JSON.stringify(results) })

    // Redirigir a pantalla de resultados
    setTimeout(() => {
      router.push(
        `/results?score=${localPlayer.score}&perfect=${localPlayer.perfectCount}&good=${localPlayer.goodCount}&miss=${localPlayer.missCount}&combo=${localPlayer.maxCombo}`,
      )
    }, 2000)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-4">
            <h1 className="text-5xl font-black text-primary mb-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              {track}
            </h1>
            <p className="text-lg font-bold text-muted-foreground">
              {mode === "coop" ? "Modo Cooperativo" : "Modo PvP"}
            </p>
          </div>

          {/* Barra de progreso de la canción */}
          <div className="space-y-2">
            <div className="relative w-full h-6 bg-black/40 rounded-full overflow-hidden border-2 border-primary/30">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-bold text-muted-foreground px-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Tableros de jugadores sin bordes excesivos */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <PlayerBoard
            playerId={localPlayer.id}
            playerName={localPlayer.name}
            score={localPlayer.score}
            combo={localPlayer.combo}
            perfectCount={localPlayer.perfectCount}
            goodCount={localPlayer.goodCount}
            missCount={localPlayer.missCount}
            assignedKeys={localPlayer.keys}
            isLocalPlayer={true}
            notes={notes}
            currentTime={currentTime}
          />

          {mode === "pvp" && (
            <PlayerBoard
              playerId={opponent.id}
              playerName={opponent.name}
              score={opponent.score}
              combo={opponent.combo}
              perfectCount={opponent.perfectCount}
              goodCount={opponent.goodCount}
              missCount={opponent.missCount}
              assignedKeys={opponent.keys}
              isLocalPlayer={false}
              notes={[]}
              currentTime={currentTime}
            />
          )}
        </div>
      </div>

      {/* Audio element (hidden) */}
      <audio ref={audioRef} src="/placeholder-audio.mp3" preload="auto" />

      <FeedbackOverlay feedback={null} />

      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}
