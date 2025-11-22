"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Settings, Volume2, Music, Palette, User, Save } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    username: "",
    email: "",
    musicVolume: 70,
    sfxVolume: 80,
    theme: "dark",
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedUser = localStorage.getItem("fnf_user")
    const savedSettings = localStorage.getItem("fnf_settings")

    if (savedUser) {
      const user = JSON.parse(savedUser)
      setSettings((prev) => ({ ...prev, username: user.username, email: user.email }))
    }

    if (savedSettings) {
      const userSettings = JSON.parse(savedSettings)
      setSettings((prev) => ({ ...prev, ...userSettings }))
    }
  }, [])

  const handleSave = () => {
    // Save user info
    localStorage.setItem(
      "fnf_user",
      JSON.stringify({
        username: settings.username,
        email: settings.email,
      }),
    )

    // Save settings
    localStorage.setItem(
      "fnf_settings",
      JSON.stringify({
        musicVolume: settings.musicVolume,
        sfxVolume: settings.sfxVolume,
        theme: settings.theme,
      }),
    )

    router.push("/")
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

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        <Button
          variant="ghost"
          size="lg"
          className="absolute top-8 left-8 text-xl font-black"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500 mt-16">
          <Settings className="w-20 h-20 text-accent mx-auto mb-4 animate-spin-slow" />
          <h2 className="text-5xl md:text-7xl font-black text-accent tracking-tighter mb-4">AJUSTES</h2>
        </div>

        <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
          {/* User Settings */}
          <div className="bg-card/50 backdrop-blur-sm border-4 border-primary/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-black text-foreground">PERFIL DE USUARIO</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">NOMBRE DE USUARIO</Label>
                <Input
                  type="text"
                  value={settings.username}
                  onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                  className="h-12 text-lg font-bold border-2 border-primary/50"
                />
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">CORREO ELECTRÓNICO</Label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-12 text-lg font-bold border-2 border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-card/50 backdrop-blur-sm border-4 border-secondary/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-secondary" />
              <h3 className="text-2xl font-black text-foreground">AUDIO</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    VOLUMEN DE MÚSICA
                  </Label>
                  <span className="text-lg font-black text-secondary">{settings.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={(e) => setSettings((prev) => ({ ...prev, musicVolume: Number(e.target.value) }))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    VOLUMEN DE EFECTOS
                  </Label>
                  <span className="text-lg font-black text-secondary">{settings.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sfxVolume: Number(e.target.value) }))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            size="lg"
            className="w-full h-16 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
            onClick={handleSave}
          >
            <Save className="w-6 h-6 mr-2" />
            GUARDAR CAMBIOS
          </Button>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}
