"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, DoorOpen, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LobbyPage() {
  const router = useRouter()

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
        <Button variant="ghost" size="lg" className="absolute top-8 left-8 text-xl font-black" onClick={() => router.push('/')}>
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter mb-4">LOBBY</h2>
          <p className="text-xl text-muted-foreground font-bold">Elige una opción</p>
        </div>

        <div className="flex flex-col gap-8 w-full max-w-md animate-in fade-in slide-in-from-bottom duration-500">
          <Button
            size="lg"
            className="h-24 text-2xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => router.push('/game-mode')}
          >
            <DoorOpen className="w-10 h-10 mr-3" />
            CREAR SALA
          </Button>

          <Button
            size="lg"
            className="h-24 text-2xl font-black tracking-wider bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-secondary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="w-10 h-10 mr-3" />
            UNIRSE A SALA
          </Button>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-secondary/30" />
    </div>
  )
}
