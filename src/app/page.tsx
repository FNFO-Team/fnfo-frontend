"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Trophy, BarChart3, Music, Users, SettingsIcon, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"

export default function FridayNightFunkinHome() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated, isInitialized, logout } = useAuthContext()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isInitialized, router])

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return null
  }

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    // AuthContext state change will trigger redirect via useEffect in login page
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-8 right-8 flex gap-2 z-20">
        <Button
          variant="ghost"
          size="lg"
          className="text-xl font-black"
          onClick={() => router.push("/settings")}
        >
          <SettingsIcon className="w-6 h-6 mr-2" />
          AJUSTES
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-xl font-black"
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6 mr-2" />
          SALIR
        </Button>
      </div>

      {/* Animated background elements */}
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
        <div
          className="absolute bottom-40 right-1/3 w-44 h-44 bg-primary/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo/Title section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter text-balance">
              FRIDAY NIGHT
            </h1>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter mb-4 animate-pulse-glow">
            FUNKIN'
          </h2>
          <div className="flex items-center justify-center gap-2 text-accent font-bold text-xl md:text-2xl">
            <Users className="w-6 h-6" />
            <span>ONLINE</span>
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Button
            size="lg"
            className="h-20 text-2xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-primary/50"
            onMouseEnter={() => setHoveredButton("play")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => router.push("/lobby")}
          >
            <Play
              className={`w-8 h-8 mr-3 transition-transform duration-300 ${hoveredButton === "play" ? "scale-125" : ""}`}
            />
            INICIAR PARTIDA
          </Button>

          <Button
            size="lg"
            className="h-20 text-2xl font-black tracking-wider bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-secondary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-secondary/50"
            onMouseEnter={() => setHoveredButton("stats")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => router.push("/stats")}
          >
            <BarChart3
              className={`w-8 h-8 mr-3 transition-transform duration-300 ${hoveredButton === "stats" ? "scale-125" : ""}`}
            />
            ESTADÍSTICAS
          </Button>

          <Button
            size="lg"
            className="h-20 text-2xl font-black tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground border-4 border-accent-foreground/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-accent/50"
            onMouseEnter={() => setHoveredButton("rankings")}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => router.push("/rankings")}
          >
            <Trophy
              className={`w-8 h-8 mr-3 transition-transform duration-300 ${hoveredButton === "rankings" ? "scale-125" : ""}`}
            />
            RANKINGS
          </Button>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30" />
    </div>
  )
}
