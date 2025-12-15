"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlayerBoard } from "@/components/gameplay/player-board"
import { FeedbackOverlay } from "@/components/gameplay/feedback-overlay"
import { GameplayEngine, generateSampleChart, type HitResult } from "@/lib/gameplay-engine"
import { submitGameResult } from "@/lib/game-service"
import { createTestAudioUrl } from "@/lib/audio-utils"

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
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const lastHitTime = useRef<Map<number, number>>(new Map())
  const [lastHitResult, setLastHitResult] = useState<{ lane: number; type: "perfect" | "good" | "miss" } | null>(null)

  // Mapeo normalizado de teclas a lanes (0-3)
  const keyToLaneMap = useRef<Map<string, number>>(new Map([
    ["arrowleft", 0],
    ["arrowdown", 1],
    ["arrowup", 2],
    ["arrowright", 3],
    ["a", 0],
    ["s", 1],
    ["w", 2],
    ["d", 3],
  ]))

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
      // Generar audio de prueba y establecerlo
      const testAudioUrl = createTestAudioUrl()
      audioRef.current.src = testAudioUrl
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

  // Force re-render para animaciones suaves (60fps)
  useEffect(() => {
    if (!isPlaying) return

    let animationFrameId: number

    const animate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const laneIndex = keyToLaneMap.current.get(key)

      console.log(`Key pressed: ${key}, Lane: ${laneIndex}`)

      if (laneIndex === undefined) return
      if (!isPlaying || !engineRef.current) {
        console.log(`Not playing or engine not ready`)
        return
      }

      // Evitar múltiples hits por la misma tecla presionada
      setPressedKeys((prev) => {
        if (prev.has(key)) {
          console.log(`Key already pressed: ${key}`)
          return prev
        }
        const newSet = new Set(prev)
        newSet.add(key)
        return newSet
      })

      // Evitar hits duplicados en el mismo carril dentro de 100ms
      const now = engineRef.current.getCurrentTime()
      const lastHit = lastHitTime.current.get(laneIndex) || 0
      if (now - lastHit < 0.1) {
        console.log(`Debounce: ${now - lastHit}s`)
        return
      }

      const result = engineRef.current.checkHit(laneIndex, now)
      console.log(`Hit result:`, result)
      if (result) {
        lastHitTime.current.set(laneIndex, now)
        setLastHitResult({ lane: laneIndex, type: result.type })
        processHitResult(result)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      setPressedKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
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
    if (!engineRef.current) return

    const stats = engineRef.current.getGameStats()
    const accuracy = stats.totalNotes > 0 ? (stats.hitNotes / stats.totalNotes) * 100 : 0

    const results = {
      chartId: track || "sample",
      difficulty: "normal",
      score: localPlayer.score,
      combo: localPlayer.combo,
      maxCombo: localPlayer.maxCombo,
      accuracy: accuracy,
      perfect: localPlayer.perfectCount,
      good: localPlayer.goodCount,
      miss: localPlayer.missCount,
      totalNotes: stats.totalNotes,
      duration: currentTime * 1000,
      timestamp: new Date().toISOString(),
    }

    console.log("Enviando resultados al backend:", results)

    try {
      const response = await submitGameResult(results)
      if (response.success) {
        console.log("Resultado guardado correctamente")
      } else {
        console.error("Error al guardar resultado:", response.message)
      }
    } catch (err) {
      console.error("Error enviando resultados:", err)
    }

    // Redirigir a pantalla de resultados
    setTimeout(() => {
      router.push(
        `/results?score=${localPlayer.score}&perfect=${localPlayer.perfectCount}&good=${localPlayer.goodCount}&miss=${localPlayer.missCount}&combo=${localPlayer.maxCombo}&accuracy=${accuracy.toFixed(1)}`,
      )
    }, 1000)
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
            pressedKeys={pressedKeys}
            lastHitResult={lastHitResult}
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
      <audio 
        ref={audioRef} 

      />

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded text-xs font-mono z-50 max-w-xs border-2 border-primary">
          <div className="mb-2 font-bold">DEBUG</div>
          <div>Playing: {isPlaying ? "✓ ON" : "✗ OFF"}</div>
          <div>Time: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s</div>
          <div>Notes: {notes.length} (visible: {notes.filter(n => !n.hit).length})</div>
          <div>Score: {localPlayer.score}</div>
          <div>Combo: {localPlayer.combo}</div>
          <div>Keys: {Array.from(pressedKeys).join(", ") || "none"}</div>
          <div className="mt-2 space-y-1">
            <button 
              onClick={togglePlayPause}
              className="w-full bg-primary hover:bg-primary/80 px-2 py-1 rounded text-white font-bold"
            >
              {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
            </button>
            <div className="text-green-400 text-xs">Presiona: Arrow Keys o A/S/W/D</div>
          </div>
        </div>
      )}

      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}
