"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, Users, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!identifier || !password) return

    try {
      const { api } = await import("@/lib/api")
      const authPrefix = process.env.NEXT_PUBLIC_AUTH_PREFIX || "/auth"
      const path = `${authPrefix.replace(/\/$/, "")}/login`

      const result = await api.fetchJson<{ token?: string; user?: { username: string; email: string } }>(path, {
        method: "POST",
        body: { identifier, password },
        credentials: "include",
      })

      const token = result?.token
      const user = result?.user

      if (token) {
        localStorage.setItem("fnf_token", token)
      }
      if (user) {
        localStorage.setItem("fnf_user", JSON.stringify(user))
      }

      router.push("/")
    } catch (err: any) {
      console.error("Login error", err?.message || err)
      alert("No se pudo iniciar sesión. Verifica tus credenciales.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username && email) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter text-balance">
              FRIDAY NIGHT
            </h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-4 animate-pulse-glow">
            FUNKIN'
          </h2>
          <div className="flex items-center justify-center gap-2 text-accent font-bold text-xl">
            <Users className="w-6 h-6" />
            <span>MULTIPLAYER</span>
          </div>
        </div>

        {/* Login form */}
        <div className="w-full max-w-md bg-card/50 backdrop-blur-sm border-4 border-primary/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
          <h3 className="text-3xl font-black text-center mb-6 text-foreground">INICIAR SESIÓN</h3>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">USUARIO O CORREO</label>
              <Input
                type="text"
                placeholder="Ingresa tu usuario o correo"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-14 text-lg font-bold border-2 border-primary/50 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">CONTRASEÑA</label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-lg font-bold border-2 border-secondary/50 focus:border-secondary"
                disabled={isLoading}
              />
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleLogin}
              disabled={!identifier || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  ENTRANDO...
                </>
              ) : (
                <>
                  ENTRAR AL JUEGO
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 font-bold">¿No tienes cuenta? Créala ahora</p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30" />
    </div>
  )
}