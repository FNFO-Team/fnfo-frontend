"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Swords } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GameModePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-40 right-1/3 w-44 h-44 bg-accent/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Button variant="ghost" size="lg" className="absolute top-8 left-8 text-xl font-black" onClick={() => router.push('/lobby')}>
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter mb-4">MODO DE JUEGO</h2>
          <p className="text-xl text-muted-foreground font-bold">Selecciona el modo de juego</p>
        </div>

        <div className="flex flex-col gap-8 w-full max-w-md animate-in fade-in slide-in-from-bottom duration-500">
          <Button
            size="lg"
            className="h-28 text-2xl font-black tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-4 border-white/20 shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => router.push('/boss-select')}
          >
            <Heart className="w-10 h-10 mr-3" />
            <div className="flex flex-col items-start">
              <span>COOPERATIVO</span>
              <span className="text-sm font-normal opacity-90">Enfrenta jefes juntos</span>
            </div>
          </Button>

          <Button
            size="lg"
            className="h-28 text-2xl font-black tracking-wider bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-4 border-white/20 shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => router.push('/track-select')}
          >
            <Swords className="w-10 h-10 mr-3" />
            <div className="flex flex-col items-start">
              <span>JUGADOR VS JUGADOR</span>
              <span className="text-sm font-normal opacity-90">Compite contra otros</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
    </div>
  )
}
