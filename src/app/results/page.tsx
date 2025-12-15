"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getLastGameResult, clearLastGameResult, type StoredGameResult } from "@/lib/game-service"
import { Trophy, Zap } from "lucide-react"

interface PlayerResult {
  id: number
  name: string
  score: number
  accuracy: number
  maxCombo: number
  rank: number
}

interface OpponentResult {
  id: number
  name: string
  score: number
  accuracy: number
  maxCombo: number
  perfect: number
  good: number
  miss: number
}

export default function ResultsPage() {
  const router = useRouter()

  const [players, setPlayers] = useState<PlayerResult[]>([])
  const [winner, setWinner] = useState<PlayerResult | null>(null)
  const [gameResult, setGameResult] = useState<StoredGameResult | null>(null)
  const [opponent, setOpponent] = useState<OpponentResult | null>(null)
  const [playerWon, setPlayerWon] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Obtener datos del último juego de localStorage
    const lastResult = getLastGameResult()
    const lastOpponent = localStorage.getItem("lastOpponent")
    
    console.log("Datos de resultados del localStorage:", lastResult)
    console.log("Datos del oponente:", lastOpponent)

    if (!lastResult) {
      console.warn("No hay resultados guardados en localStorage")
      setInitialized(true)
      return
    }

    const localScore = lastResult.score
    const perfect = lastResult.perfect
    const good = lastResult.good
    const miss = lastResult.miss
    const combo = lastResult.maxCombo
    const accuracy = lastResult.accuracy

    setGameResult(lastResult)

    // Obtener datos del oponente si existen
    let opponentData: OpponentResult | null = null
    if (lastOpponent) {
      opponentData = JSON.parse(lastOpponent)
      setOpponent(opponentData)
      
      // Determinar si el jugador ganó
      setPlayerWon(localScore > opponentData!.score)
    }

    // Crear tabla de resultados
    const allPlayers: PlayerResult[] = [
      {
        id: 1,
        name: "Tú",
        score: localScore,
        accuracy: Math.round(accuracy * 10) / 10,
        maxCombo: combo,
        rank: 0,
      },
    ]

    // Si hay oponente, agregarlo a la tabla
    if (opponentData) {
      allPlayers.push({
        id: opponentData.id,
        name: opponentData.name,
        score: opponentData.score,
        accuracy: Math.round(opponentData.accuracy * 10) / 10,
        maxCombo: opponentData.maxCombo,
        rank: 0,
      })
    } else {
      // Si no hay oponente (modo single player), agregar 3 jugadores aleatorios
      allPlayers.push(
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
        }
      )
    }

    // Ordenar por puntaje y asignar ranks
    const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score)
    sortedPlayers.forEach((player, index) => {
      player.rank = index + 1
    })

    setPlayers(sortedPlayers)
    setWinner(sortedPlayers[0])
    setInitialized(true)
  }, [])

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
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl font-black text-primary mb-4 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-pulse-glow">
                RESULTADOS
              </h1>
            </motion.div>
            
            {/* Comparativa Ganador/Perdedor si hay oponente */}
            {opponent && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 mb-8"
              >
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {/* Tu resultado */}
                  <div className={`
                    p-6 rounded-lg border-4 transition-all duration-300
                    ${playerWon 
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/50" 
                      : "bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-400/50"
                    }
                  `}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {playerWon && <Trophy className="w-6 h-6 text-green-400" />}
                      <span className={`text-sm font-bold ${playerWon ? "text-green-400" : "text-red-400"}`}>
                        {playerWon ? "¡GANASTE!" : "PERDISTE"}
                      </span>
                    </div>
                    <p className="text-lg font-black text-foreground">{gameResult?.score || 0} pts</p>
                  </div>
                  
                  {/* Resultado del oponente */}
                  <div className={`
                    p-6 rounded-lg border-4 transition-all duration-300
                    ${!playerWon 
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/50" 
                      : "bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-400/50"
                    }
                  `}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {!playerWon && <Trophy className="w-6 h-6 text-green-400" />}
                      <span className={`text-sm font-bold ${!playerWon ? "text-green-400" : "text-red-400"}`}>
                        {!playerWon ? "¡GANÓ!" : "PERDIÓ"}
                      </span>
                    </div>
                    <p className="text-lg font-black text-foreground">{opponent.score} pts</p>
                  </div>
                </div>
              </motion.div>
            )}

            {winner && !opponent && (
              <p className="text-2xl font-bold text-foreground">
                Ganador: <span className="text-accent">{winner.name}</span>
              </p>
            )}
          </div>

          {/* Mensaje de error si no hay datos */}
          {!gameResult && initialized && (
            <div className="bg-destructive/20 border-2 border-destructive rounded-lg p-8 mb-12 text-center">
              <p className="text-xl font-bold text-destructive mb-4">No hay resultados disponibles</p>
              <p className="text-muted-foreground mb-6">Los datos de tu juego no se encontraron. Por favor, vuelve a jugar.</p>
              <Button
                onClick={() => router.push("/game-mode")}
                className="text-lg font-bold px-8 py-6 bg-gradient-to-br from-primary to-secondary"
              >
                Volver a Jugar
              </Button>
            </div>
          )}

          {/* Detalles del juego */}
          {gameResult && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-lg p-8 mb-12 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Detalles de tu Juego</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">PERFECT</p>
                  <p className="text-4xl font-black text-green-400">{gameResult.perfect}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">GOOD</p>
                  <p className="text-4xl font-black text-blue-400">{gameResult.good}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">MISS</p>
                  <p className="text-4xl font-black text-red-400">{gameResult.miss}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">TOTAL</p>
                  <p className="text-4xl font-black text-cyan-400">{gameResult.totalNotes}</p>
                </div>
              </div>
            </div>
          )}

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
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            {opponent && (
              <Button
                onClick={() => {
                  // Limpiar datos y volver a track select para revancha
                  localStorage.removeItem("lastGameResult")
                  localStorage.removeItem("lastOpponent")
                  router.push("/track-select")
                }}
                className="text-xl font-bold px-8 py-6 bg-gradient-to-br from-cyan-500 to-blue-600 hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
              >
                <Zap className="w-6 h-6 mr-2" />
                REVANCHA
              </Button>
            )}
            <Button
              onClick={() => {
                // Limpiar datos
                localStorage.removeItem("lastGameResult")
                localStorage.removeItem("lastOpponent")
                sessionStorage.removeItem("gamePlayers")
                router.push("/lobby")
              }}
              className="text-xl font-bold px-8 py-6 bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)]"
            >
              Volver al Lobby
            </Button>
            <Button
              onClick={() => {
                // Limpiar datos
                localStorage.removeItem("lastGameResult")
                localStorage.removeItem("lastOpponent")
                sessionStorage.removeItem("gamePlayers")
                router.push("/game-mode")
              }}
              className="text-xl font-bold px-8 py-6 bg-gradient-to-br from-accent to-secondary hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.8)]"
            >
              Jugar de Nuevo
            </Button>
          </motion.div>
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
