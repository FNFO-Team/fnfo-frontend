import { api } from "@/lib/api"
import { GameResult } from "@/lib/types/game"

/**
 * Tipo para los resultados guardados en localStorage
 */
export interface StoredGameResult {
  chartId: string
  difficulty: string
  score: number
  combo: number
  maxCombo: number
  accuracy: number
  perfect: number
  good: number
  miss: number
  totalNotes: number
  duration: number
  timestamp: string
}

/**
 * Envía el resultado final del juego al backend Y lo guarda en localStorage
 */
export async function submitGameResult(result: GameResult): Promise<{ success: boolean; message: string }> {
  try {
    const gamePrefix = process.env.NEXT_PUBLIC_GAME_PREFIX || "/game"
    const path = `${gamePrefix.replace(/\/$/, "")}/results`

    await api.fetchJson<{ success: boolean; message: string }>(path, {
      method: "POST",
      body: {
        chartId: result.chartId,
        difficulty: result.difficulty,
        score: result.score,
        combo: result.combo,
        maxCombo: result.maxCombo,
        accuracy: result.accuracy,
        perfect: result.perfect,
        good: result.good,
        miss: result.miss,
        totalNotes: result.totalNotes,
        duration: result.duration,
        timestamp: result.timestamp,
      },
      credentials: "include",
    })

    // Guardar en localStorage para la página de resultados
    const storedResult: StoredGameResult = {
      chartId: result.chartId,
      difficulty: result.difficulty,
      score: result.score,
      combo: result.combo,
      maxCombo: result.maxCombo,
      accuracy: result.accuracy,
      perfect: result.perfect,
      good: result.good,
      miss: result.miss,
      totalNotes: result.totalNotes,
      duration: result.duration,
      timestamp: result.timestamp,
    }

    localStorage.setItem("lastGameResult", JSON.stringify(storedResult))

    return {
      success: true,
      message: "Resultado guardado correctamente",
    }
  } catch (err: any) {
    console.error("Error submitting game result", err)
    return {
      success: false,
      message: err?.message || "No se pudo guardar el resultado",
    }
  }
}

/**
 * Obtiene el último resultado guardado en localStorage
 */
export function getLastGameResult(): StoredGameResult | null {
  try {
    const stored = localStorage.getItem("lastGameResult")
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.error("Error reading last game result from localStorage", err)
    return null
  }
}

/**
 * Limpia el último resultado de localStorage
 */
export function clearLastGameResult(): void {
  localStorage.removeItem("lastGameResult")
}

/**
 * Obtiene un chart por ID desde el backend
 */
export async function fetchChart(chartId: string) {
  try {
    const gamePrefix = process.env.NEXT_PUBLIC_GAME_PREFIX || "/game"
    const path = `${gamePrefix.replace(/\/$/, "")}/charts/${chartId}`

    const chart = await api.fetchJson(path, {
      method: "GET",
      credentials: "include",
    })

    return chart
  } catch (err: any) {
    console.error("Error fetching chart", err)
    throw err
  }
}

/**
 * Obtiene la lista de charts disponibles
 */
export async function fetchCharts(difficulty?: string) {
  try {
    const gamePrefix = process.env.NEXT_PUBLIC_GAME_PREFIX || "/game"
    let path = `${gamePrefix.replace(/\/$/, "")}/charts`

    if (difficulty) {
      path += `?difficulty=${encodeURIComponent(difficulty)}`
    }

    const charts = await api.fetchJson(path, {
      method: "GET",
      credentials: "include",
    })

    return charts
  } catch (err: any) {
    console.error("Error fetching charts", err)
    throw err
  }
}
