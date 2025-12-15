import { useState, useCallback, useEffect } from "react"
import { GameState, HitResult, KeyType, TIMING_WINDOWS, SCORE_VALUES } from "@/lib/types/game"

/**
 * Hook que maneja el estado del juego en vivo
 * Calcula score, combo, accuracy basado en hits detectados
 */
export function useScoreCalculator(totalNotes: number = 0) {
  const [gameState, setGameState] = useState<GameState>({
    currentTime: 0,
    isPlaying: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: [],
    missedNotes: [],
    accuracy: 0,
    keysPressed: new Set(),
  })

  /**
   * Calcula si un hit es Perfect, Good o Miss basado en el timing
   */
  const calculateRating = useCallback((timeDiff: number): "perfect" | "good" | "miss" => {
    const absDiff = Math.abs(timeDiff)
    if (absDiff <= TIMING_WINDOWS.perfect) return "perfect"
    if (absDiff <= TIMING_WINDOWS.good) return "good"
    return "miss"
  }, [])

  /**
   * Registra un hit y actualiza el estado del juego
   */
  const registerHit = useCallback(
    (noteId: string, noteTime: number, key: KeyType) => {
      setGameState((prev) => {
        // Evitar hits duplicados para la misma nota
        if (prev.hits.some((h) => h.noteId === noteId)) {
          return prev
        }

        const timeDiff = prev.currentTime - noteTime
        const rating = calculateRating(timeDiff)
        const hitResult: HitResult = {
          noteId,
          rating,
          accuracy: timeDiff,
          timestamp: prev.currentTime,
          key,
        }

        const newHits = [...prev.hits, hitResult]
        const scoreValue = SCORE_VALUES[rating]
        const newScore = prev.score + scoreValue
        const newCombo = rating === "miss" ? 0 : prev.combo + 1
        const newMaxCombo = Math.max(prev.maxCombo, newCombo)

        // Calcular accuracy general
        const perfectCount = newHits.filter((h) => h.rating === "perfect").length
        const goodCount = newHits.filter((h) => h.rating === "good").length
        const missCount = newHits.filter((h) => h.rating === "miss").length
        const newAccuracy =
          newHits.length > 0 ? ((perfectCount * 100 + goodCount * 50) / (newHits.length * 100)) * 100 : 0

        return {
          ...prev,
          hits: newHits,
          score: newScore,
          combo: newCombo,
          maxCombo: newMaxCombo,
          accuracy: newAccuracy,
        }
      })
    },
    [calculateRating]
  )

  /**
   * Marca una nota como missed (no fue presionada a tiempo)
   */
  const registerMiss = useCallback((noteId: string) => {
    setGameState((prev) => {
      if (prev.hits.some((h) => h.noteId === noteId) || prev.missedNotes.includes(noteId)) {
        return prev
      }

      const newMissedNotes = [...prev.missedNotes, noteId]
      const newCombo = 0
      const newHits = [
        ...prev.hits,
        {
          noteId,
          rating: "miss" as const,
          accuracy: 0,
          timestamp: prev.currentTime,
          key: "left" as KeyType,
        },
      ]

      const perfectCount = newHits.filter((h) => h.rating === "perfect").length
      const goodCount = newHits.filter((h) => h.rating === "good").length
      const newAccuracy =
        newHits.length > 0 ? ((perfectCount * 100 + goodCount * 50) / (newHits.length * 100)) * 100 : 0

      return {
        ...prev,
        hits: newHits,
        missedNotes: newMissedNotes,
        combo: newCombo,
        accuracy: newAccuracy,
      }
    })
  }, [])

  /**
   * Actualiza el tiempo actual de reproducción
   */
  const updateCurrentTime = useCallback((time: number) => {
    setGameState((prev) => ({
      ...prev,
      currentTime: time,
    }))
  }, [])

  /**
   * Actualiza si el audio está siendo reproducido
   */
  const setIsPlaying = useCallback((playing: boolean) => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: playing,
    }))
  }, [])

  /**
   * Actualiza las teclas presionadas actualmente
   */
  const setKeysPressed = useCallback((keys: Set<KeyType>) => {
    setGameState((prev) => ({
      ...prev,
      keysPressed: keys,
    }))
  }, [])

  /**
   * Reinicia el estado del juego
   */
  const reset = useCallback(() => {
    setGameState({
      currentTime: 0,
      isPlaying: false,
      score: 0,
      combo: 0,
      maxCombo: 0,
      hits: [],
      missedNotes: [],
      accuracy: 0,
      keysPressed: new Set(),
    })
  }, [])

  /**
   * Obtiene estadísticas finales
   */
  const getFinalStats = useCallback(
    () => {
      const perfectCount = gameState.hits.filter((h) => h.rating === "perfect").length
      const goodCount = gameState.hits.filter((h) => h.rating === "good").length
      const missCount = gameState.hits.filter((h) => h.rating === "miss").length

      return {
        score: gameState.score,
        combo: gameState.combo,
        maxCombo: gameState.maxCombo,
        accuracy: gameState.accuracy,
        perfect: perfectCount,
        good: goodCount,
        miss: missCount,
        totalNotes,
      }
    },
    [gameState, totalNotes]
  )

  return {
    gameState,
    registerHit,
    registerMiss,
    updateCurrentTime,
    setIsPlaying,
    setKeysPressed,
    reset,
    getFinalStats,
  }
}
