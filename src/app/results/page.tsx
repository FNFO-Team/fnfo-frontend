"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PlayerResult {
  id: number
  name: string
  score: number
  accuracy: number
  maxCombo: number
  rank: number
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [winner, setWinner] = useState<PlayerResult | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    // Obtener datos del jugador local de URL params
    const localScore = Number.parseInt(searchParams.get("score") || "0")
    const perfect = Number.parseInt(searchParams.get("perfect") || "0")
    const good = Number.parseInt(searchParams.get("good") || "0")
    const miss = Number.parseInt(searchParams.get("miss") || "0")
    const combo = Number.parseInt(searchParams.get("combo") || "0")

    const totalNotes = perfect + good + miss
    const accuracy = totalNotes > 0 ? ((perfect + good * 0.5) / totalNotes) * 100 : 0

    // Simular datos de otros jugadores
    const allPlayers: PlayerResult[] = [
      {
        id: 1,
        name: "Jugador 1 (Tú)",
        score: localScore,
        accuracy: Math.round(accuracy * 10) / 10,
        maxCombo: combo,
        rank: 0,
      },
      {
        id: 2,
        name: "Jugador 2",
        score: Math.floor(Math.random() * 50000) + 30000,
        accuracy: Math.floor(Math.random() * 30) + 70,
        maxCombo: Math.floor(Math.random() * 100) + 50,
        rank: 0,
      },
      {
        id: 3,
        name: "Jugador 3",
        score: Math.floor(Math.random() * 50000) + 20000,
        accuracy: Math.floor(Math.random() * 30) + 65,
        maxCombo: Math.floor(Math.random() * 80) + 40,
        rank: 0,
      },
      {
        id: 4,
        name: "Jugador 4",
        score: Math.floor(Math.random() * 40000) + 15000,
        accuracy: Math.floor(Math.random() * 30) + 60,
        maxCombo: Math.floor(Math.random() * 70) + 30,
        rank: 0,
      },
    ]

    // Ordenar por puntaje y asignar ranks
    const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score)
    sortedPlayers.forEach((player, index) => {
      player.rank = index + 1
    })

    setPlayers(sortedPlayers)
    setWinner(sortedPlayers[0])
    setInitialized(true)
  }, [initialized])

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400"
      case 2:
        return "text-gray-300"
      case 3:
        return "text-orange-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return ""
    }
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

      <div className="relative z-10 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-primary mb-4 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-pulse-glow">
              RESULTADOS
            </h1>
            {winner && (
              <p className="text-2xl font-bold text-foreground">
                Ganador: <span className="text-accent">{winner.name}</span>
              </p>
            )}
          </div>

          {/* Tabla de resultados */}
          <div className="space-y-4 mb-12">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`
                  p-6 bg-gradient-to-r transition-all duration-300 hover:scale-105
                  ${
                    player.rank === 1
                      ? "from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400/50"
                      : player.rank === 2
                        ? "from-gray-400/20 to-gray-500/20 border-2 border-gray-300/50"
                        : player.rank === 3
                          ? "from-orange-500/20 to-orange-600/20 border-2 border-orange-400/50"
                          : "from-primary/10 to-secondary/10 border-2 border-primary/30"
                  }
                  rounded-lg backdrop-blur-sm
                  ${player.id === 1 ? "ring-2 ring-cyan-400" : ""}
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className={`text-5xl font-black ${getRankColor(player.rank)}`}>
                      {getRankMedal(player.rank)} #{player.rank}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {player.name}
                        {player.id === 1 && <span className="text-cyan-400 ml-2">(TÚ)</span>}
                      </h3>
                      <div className="flex gap-6 text-sm font-semibold text-muted-foreground">
                        <span>Precisión: {player.accuracy}%</span>
                        <span>Combo Max: {player.maxCombo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-primary">{player.score.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Puntos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de navegación */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/lobby")}
              className="text-xl font-bold px-8 py-6 bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)]"
            >
              Volver al Lobby
            </Button>
            <Button
              onClick={() => router.push("/game-mode")}
              className="text-xl font-bold px-8 py-6 bg-gradient-to-br from-accent to-secondary hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.8)]"
            >
              Jugar de Nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30" />
    </div>
  )
}
