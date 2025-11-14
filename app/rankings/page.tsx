"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Crown, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

const globalRanking = [
  { position: 1, username: "BF_Master", score: 125800, wins: 156, gamesPlayed: 180 },
  { position: 2, username: "FunkinLegend", score: 118500, wins: 142, gamesPlayed: 165 },
  { position: 3, username: "RhythmKing", score: 112300, wins: 138, gamesPlayed: 160 },
  { position: 4, username: "NoteNinja", score: 108900, wins: 125, gamesPlayed: 155 },
  { position: 5, username: "BeatMaster99", score: 105400, wins: 118, gamesPlayed: 148 },
  { position: 6, username: "GrooveQueen", score: 98700, wins: 110, gamesPlayed: 140 },
  { position: 7, username: "MusicWarrior", score: 94200, wins: 102, gamesPlayed: 135 },
  { position: 8, username: "SoundSlayer", score: 89800, wins: 95, gamesPlayed: 128 },
  { position: 9, username: "FunkyFighter", score: 85300, wins: 88, gamesPlayed: 120 },
  { position: 10, username: "RapBattler", score: 81900, wins: 82, gamesPlayed: 115 },
]

const playerStats = {
  username: "Jugador123",
  position: 47,
  score: 45600,
  gamesPlayed: 68,
  gamesWon: 42,
}

export default function RankingsPage() {
  const router = useRouter()
  const [rankingData, setRankingData] = useState(globalRanking)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setRankingData((prev) =>
        prev.map((player) => ({
          ...player,
          score: player.score + Math.floor(Math.random() * 100),
        }))
      )
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getRankColor = (position: number) => {
    if (position === 1) return "text-yellow-400"
    if (position === 2) return "text-gray-300"
    if (position === 3) return "text-amber-600"
    return "text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        <Button variant="ghost" size="lg" className="absolute top-8 left-8 text-xl font-black" onClick={() => router.push('/')}>
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500 mt-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-12 h-12 text-accent animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-accent tracking-tighter">RANKINGS</h2>
          </div>
          <p className="text-lg text-muted-foreground font-bold">
            Actualizado: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="w-full max-w-5xl space-y-6">
          {/* Top 10 Global */}
          <div className="bg-card border-4 border-accent/30 rounded-lg p-6 animate-in fade-in slide-in-from-bottom duration-500">
            <h3 className="text-3xl font-black text-foreground mb-6 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              TOP 10 GLOBAL
            </h3>

            <div className="space-y-2">
              {rankingData.map((player, index) => (
                <div
                  key={player.position}
                  className="flex items-center justify-between bg-background border-2 border-muted rounded-lg p-4 hover:border-accent/50 transition-all duration-300 animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12">
                      {player.position <= 3 ? (
                        <Trophy className={`w-8 h-8 ${getRankColor(player.position)}`} />
                      ) : (
                        <span className="text-2xl font-black text-muted-foreground">#{player.position}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-foreground">{player.username}</span>
                      <span className="text-sm text-muted-foreground font-bold">
                        {player.wins}W / {player.gamesPlayed}P
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{player.score.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground block font-bold">puntos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posición Personal */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-4 border-primary rounded-lg p-6 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
            <h3 className="text-2xl font-black text-foreground mb-4 flex items-center gap-3">
              <Target className="w-7 h-7 text-primary" />
              TU POSICIÓN
            </h3>

            <div className="flex items-center justify-between bg-background/80 border-2 border-primary rounded-lg p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-primary rounded-full">
                  <span className="text-2xl font-black text-primary-foreground">#{playerStats.position}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-foreground">{playerStats.username}</span>
                  <span className="text-sm text-muted-foreground font-bold">
                    {playerStats.gamesWon}W / {playerStats.gamesPlayed}P
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-primary">{playerStats.score.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground block font-bold">puntos</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Necesitas {(rankingData[9].score - playerStats.score).toLocaleString()} puntos para entrar al Top 10</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30" />
    </div>
  )
}
