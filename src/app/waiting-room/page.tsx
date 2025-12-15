"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Play, Copy, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { RoomChat } from "@/components/chat/room-chat"

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function WaitingRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const item = searchParams.get("item")

  const [roomId] = useState<string>(generateRoomId())
  const [copiedRoomId, setCopiedRoomId] = useState(false)
  const [players, setPlayers] = useState<Array<{ id: number; name: string; ready: boolean }>>([
    { id: 1, name: "Jugador 1 (Tú)", ready: true },
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayers((prev) => {
        if (prev.length < 4) {
          return [...prev, { id: prev.length + 1, name: `Jugador ${prev.length + 1}`, ready: false }]
        }
        return prev
      })
    }, 3000)
    return () => clearTimeout(timer)
  }, [players.length])

  const goBack = () => {
    if (mode === "coop") {
      router.push("/boss-select")
    } else {
      router.push("/track-select")
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopiedRoomId(true)
    setTimeout(() => setCopiedRoomId(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Button variant="ghost" size="lg" className="absolute top-8 left-8 text-xl font-black" onClick={goBack}>
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-2">SALA DE ESPERA</h2>
          <p className="text-lg text-muted-foreground font-bold mb-4">
            {mode === "coop" ? "Modo Cooperativo" : "Modo PvP"} - {item}
          </p>

          <div className="flex items-center justify-center gap-3 bg-card border-4 border-primary/30 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground font-bold">ID DE SALA</span>
              <span className="text-2xl font-black text-primary tracking-wider">{roomId}</span>
            </div>
            <Button size="sm" variant="outline" className="ml-auto font-black bg-transparent" onClick={copyRoomId}>
              {copiedRoomId ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  COPIADO
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  COPIAR
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
          {/* Players List */}
          <div className="bg-card border-4 border-secondary/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-foreground">JUGADORES</h3>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-secondary" />
                <span className="text-xl font-black text-secondary">{players.length}/4</span>
              </div>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-background border-2 border-muted rounded-lg p-4 animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-black text-primary-foreground">{player.id}</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.ready ? (
                      <span className="text-sm font-black text-green-500 bg-green-500/20 px-3 py-1 rounded-full">
                        LISTO
                      </span>
                    ) : (
                      <span className="text-sm font-black text-yellow-500 bg-yellow-500/20 px-3 py-1 rounded-full">
                        ESPERANDO
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {Array.from({ length: 4 - players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center justify-between bg-background/50 border-2 border-dashed border-muted rounded-lg p-4 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">Esperando jugador...</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full mt-6 h-16 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
              disabled={players.length < 2}
              onClick={() => {
                router.push(`/gameplay?mode=${mode}&track=${item}`)
              }}
            >
              <Play className="w-6 h-6 mr-2" />
              {players.length < 2 ? "ESPERANDO JUGADORES..." : "INICIAR PARTIDA"}
            </Button>
          </div>

          <div className="h-full min-h-[600px]">
            <RoomChat currentUserId={1} currentUsername="Jugador 1 (Tú)" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}
