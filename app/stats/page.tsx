"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Play, Trophy, Users, Target, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

const playerStats = {
  username: "Jugador123",
  position: 47,
  score: 45600,
  gamesPlayed: 68,
  gamesWon: 42,
  gamesLost: 26,
  winRate: 61.8,
  perfectHits: 8542,
  goodHits: 3210,
  missedNotes: 892,
  accuracy: 92.4,
  longestStreak: 342,
  favoriteMode: "PvP",
  totalPlayTime: "24h 35min",
}

export default function StatsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 bg-primary/20 rounded-full blur-3xl animate-float"
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
            <BarChart3 className="w-12 h-12 text-secondary animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-secondary tracking-tighter">ESTADÍSTICAS</h2>
          </div>
          <p className="text-lg text-muted-foreground font-bold">{playerStats.username}</p>
        </div>

        <div className="w-full max-w-5xl space-y-6">
          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Play className="w-6 h-6 text-primary" />
                <span className="text-sm font-bold text-muted-foreground">PARTIDAS JUGADAS</span>
              </div>
              <span className="text-4xl font-black text-primary">{playerStats.gamesPlayed}</span>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-4 border-green-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-green-500" />
                <span className="text-sm font-bold text-muted-foreground">PARTIDAS GANADAS</span>
              </div>
              <span className="text-4xl font-black text-green-500">{playerStats.gamesWon}</span>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-4 border-red-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-red-500" />
                <span className="text-sm font-bold text-muted-foreground">PARTIDAS PERDIDAS</span>
              </div>
              <span className="text-4xl font-black text-red-500">{playerStats.gamesLost}</span>
            </div>

            <div className="bg-gradient-to-br from-accent/20 to-accent/5 border-4 border-accent/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-accent" />
                <span className="text-sm font-bold text-muted-foreground">PUNTAJE TOTAL</span>
              </div>
              <span className="text-4xl font-black text-accent">{playerStats.score.toLocaleString()}</span>
            </div>
          </div>

          {/* Estadísticas Detalladas */}
          <div className="bg-card border-4 border-secondary/30 rounded-lg p-6 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
            <h3 className="text-3xl font-black text-foreground mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-secondary" />
              MÉTRICAS DE RENDIMIENTO
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Tasa de Victoria</span>
                  <span className="text-2xl font-black text-primary">{playerStats.winRate}%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Precisión</span>
                  <span className="text-2xl font-black text-green-500">{playerStats.accuracy}%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Racha Más Larga</span>
                  <span className="text-2xl font-black text-accent">{playerStats.longestStreak}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Tiempo de Juego</span>
                  <span className="text-2xl font-black text-secondary">{playerStats.totalPlayTime}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Notas Perfectas</span>
                  <span className="text-2xl font-black text-yellow-400">{playerStats.perfectHits.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Notas Buenas</span>
                  <span className="text-2xl font-black text-blue-400">{playerStats.goodHits.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Notas Falladas</span>
                  <span className="text-2xl font-black text-red-400">{playerStats.missedNotes.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-muted">
                  <span className="text-lg font-bold text-foreground">Modo Favorito</span>
                  <span className="text-2xl font-black text-purple-400">{playerStats.favoriteMode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Personal */}
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 border-4 border-accent rounded-lg p-6 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-accent rounded-full">
                  <span className="text-2xl font-black text-accent-foreground">#{playerStats.position}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">POSICIÓN GLOBAL</h3>
                  <p className="text-sm text-muted-foreground font-bold">Entre todos los jugadores</p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-black"
                onClick={() => router.push('/rankings')}
              >
                <Trophy className="w-5 h-5 mr-2" />
                VER RANKING
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
    </div>
  )
}
