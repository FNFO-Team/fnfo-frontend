import { api } from "@/lib/api"
import { GameResult } from "@/lib/types/game"

/**
 * Envía el resultado final del juego al backend
 * El backend valida coherencia y guarda el resultado
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
