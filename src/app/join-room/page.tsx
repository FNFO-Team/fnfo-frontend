"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, DoorOpen, Hash } from "lucide-react"
import { useRouter } from "next/navigation"

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  const handleJoinRoom = () => {
    if (roomId) {
      // Navigate to waiting room with the room ID
      router.push(`/waiting-room?roomId=${roomId}&mode=join`)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Button
          variant="ghost"
          size="lg"
          className="absolute top-8 left-8 text-xl font-black"
          onClick={() => router.push("/lobby")}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-5xl md:text-7xl font-black text-secondary tracking-tighter mb-4">UNIRSE A SALA</h2>
          <p className="text-xl text-muted-foreground font-bold">Ingresa el código de la sala</p>
        </div>

        <div className="w-full max-w-md bg-card/50 backdrop-blur-sm border-4 border-secondary/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block flex items-center gap-2">
                CÓDIGO DE SALA
              </label>
              <Input
                type="text"
                placeholder="ABC123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="h-16 text-2xl font-black text-center tracking-widest border-4 border-secondary/50 focus:border-secondary uppercase"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground mt-2 font-bold">Ejemplo: ABC123 (6 caracteres)</p>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-xl font-black tracking-wider bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-secondary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleJoinRoom}
              disabled={roomId.length !== 6}
            >
              <DoorOpen className="w-6 h-6 mr-2" />
              UNIRSE AHORA
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-muted">
            <p className="text-sm font-bold text-muted-foreground text-center">Pídele el código a quien creó la sala</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-secondary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-secondary/30" />
    </div>
  )
}
