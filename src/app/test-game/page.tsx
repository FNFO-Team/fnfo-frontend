"use client"

import { useState } from "react"
import { useScoreCalculator } from "@/hooks/use-score-calculator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HitRating } from "@/lib/types/game"

/**
 * Página de testing para validar la lógica de score
 * Acceder a: http://localhost:3000/test-game
 */
export default function TestGamePage() {
  const { gameState, registerHit, registerMiss, reset, getFinalStats } = useScoreCalculator(10)
  const [simulatedTime, setSimulatedTime] = useState(0)

  const handleRegisterHit = (rating: HitRating) => {
    const noteId = `test_note_${gameState.hits.length}`
    const noteTime = simulatedTime

    registerHit(noteId, noteTime, "left")
  }

  const handleSimulateTimeDiff = (timeDiff: number) => {
    const newTime = simulatedTime + timeDiff
    setSimulatedTime(newTime)
  }

  const finalStats = getFinalStats()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Test Game Score Calculator</h1>

        {/* Test Controls */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Simulador de Tiempo</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tiempo simulado: {simulatedTime}ms</p>
              <div className="flex gap-2 flex-wrap mt-2">
                <Button onClick={() => handleSimulateTimeDiff(100)}>+100ms</Button>
                <Button onClick={() => handleSimulateTimeDiff(500)}>+500ms</Button>
                <Button onClick={() => handleSimulateTimeDiff(1000)}>+1s</Button>
                <Button onClick={() => setSimulatedTime(0)} variant="outline">
                  Reset Tiempo
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Hit Registration */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Registrar Hits</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cada click simula una nota en tiempo actual. La lógica detectará si es Perfect/Good/Miss.
          </p>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => handleRegisterHit("perfect")} className="bg-primary">
                Hit en Tiempo Actual
              </Button>
              <Button onClick={() => registerMiss(`miss_${gameState.missedNotes.length}`)} variant="destructive">
                Miss Manual
              </Button>
              <Button onClick={reset} variant="outline">
                Reset Todo
              </Button>
            </div>

            {/* Timing Windows Info */}
            <div className="bg-card/50 border border-primary/30 rounded p-4 text-sm space-y-2">
              <p>
                <strong>Perfect:</strong> ±50ms (dentro de {Math.abs(simulatedTime - 50)} - {Math.abs(simulatedTime + 50)})
              </p>
              <p>
                <strong>Good:</strong> ±100ms (dentro de {Math.abs(simulatedTime - 100)} - {Math.abs(simulatedTime + 100)})
              </p>
              <p>
                <strong>Miss:</strong> &gt;±150ms
              </p>
            </div>
          </div>
        </Card>

        {/* Live Stats */}
        <Card className="p-6 mb-8 border-primary">
          <h2 className="text-2xl font-bold mb-4">Estadísticas en Vivo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 p-4 rounded">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold">{gameState.score}</p>
            </div>
            <div className="bg-secondary/10 p-4 rounded">
              <p className="text-sm text-muted-foreground">Combo</p>
              <p className="text-3xl font-bold">{gameState.combo}</p>
            </div>
            <div className="bg-accent/10 p-4 rounded">
              <p className="text-sm text-muted-foreground">Max Combo</p>
              <p className="text-3xl font-bold">{gameState.maxCombo}</p>
            </div>
            <div className="bg-green-500/10 p-4 rounded">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-3xl font-bold">{gameState.accuracy.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Hit Log */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Registro de Hits ({gameState.hits.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameState.hits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay hits registrados</p>
            ) : (
              gameState.hits.map((hit) => (
                <div key={hit.noteId} className="flex justify-between items-center bg-card/50 p-3 rounded text-sm">
                  <span>
                    <strong>{hit.noteId}</strong> - {hit.rating.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">{hit.accuracy > 0 ? "+" : ""}{hit.accuracy.toFixed(0)}ms</span>
                  <span className={`font-bold ${hit.rating === "perfect" ? "text-primary" : hit.rating === "good" ? "text-secondary" : "text-destructive"}`}>
                    {hit.rating === "perfect" ? "+100" : hit.rating === "good" ? "+50" : "+0"} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Missed Notes */}
        {gameState.missedNotes.length > 0 && (
          <Card className="p-6 mb-8 border-destructive">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Notas Perdidas ({gameState.missedNotes.length})</h2>
            <div className="flex flex-wrap gap-2">
              {gameState.missedNotes.map((noteId) => (
                <span key={noteId} className="bg-destructive/20 text-destructive px-3 py-1 rounded text-sm font-bold">
                  {noteId}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Final Stats */}
        <Card className="p-6 border-green-500/30 bg-green-500/5">
          <h2 className="text-2xl font-bold mb-4">Estadísticas Finales (getFinalStats)</h2>
          <pre className="bg-background p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(finalStats, null, 2)}
          </pre>
          <p className="text-xs text-muted-foreground mt-4">
            Este objeto se enviaría al backend con submitGameResult()
          </p>
        </Card>
      </div>
    </div>
  )
}
