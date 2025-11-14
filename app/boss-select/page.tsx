"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const bosses = [
  { id: 1, name: "DADDY DEAREST", difficulty: "FÁCIL", color: "bg-blue-500" },
  { id: 2, name: "MONSTER", difficulty: "MEDIO", color: "bg-purple-500" },
  { id: 3, name: "SENPAI", difficulty: "MEDIO", color: "bg-pink-500" },
  { id: 4, name: "TANKMAN", difficulty: "DIFÍCIL", color: "bg-orange-500" },
  { id: 5, name: "WHITTY", difficulty: "EXTREMO", color: "bg-red-500" },
]

export default function BossSelectPage() {
  const router = useRouter()

  const handleBossSelect = (bossName: string) => {
    router.push(`/waiting-room?mode=coop&item=${encodeURIComponent(bossName)}`)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <Button variant="ghost" size="lg" className="absolute top-8 left-8 text-xl font-black" onClick={() => router.push('/game-mode')}>
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-2">SELECCIONA UN JEFE</h2>
          <p className="text-lg text-muted-foreground font-bold">Modo Cooperativo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl animate-in fade-in slide-in-from-bottom duration-500">
          {bosses.map((boss, index) => (
            <Button
              key={boss.id}
              size="lg"
              className={`h-24 text-xl font-black tracking-wider ${boss.color} hover:opacity-90 text-white border-4 border-white/20 shadow-xl transition-all duration-300 hover:scale-105`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleBossSelect(boss.name)}
            >
              <div className="flex flex-col items-start w-full">
                <span>{boss.name}</span>
                <span className="text-sm font-normal opacity-90">Dificultad: {boss.difficulty}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}
