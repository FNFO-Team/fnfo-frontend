"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, DoorOpen, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { matchmakingApi } from "@/lib/matchmaking"

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleJoinRoom = async () => {
    if (!roomId || !user?.username) return

    setIsLoading(true)
    setError(null)

    try {
      // Generar playerId igual que en el matchmaking
      const playerId = `player_${user.username.toLowerCase().replace(/\s+/g, '_')}`
      
      console.log('[JoinRoom] Intentando unirse a sala:', roomId, 'como:', playerId)

      // Llamar al API para unirse a la sala
      const response = await matchmakingApi.joinRoomByCode(playerId, roomId.toUpperCase())

      console.log('[JoinRoom] Respuesta:', response)

      if (response.success && response.room) {
        // Éxito - redirigir a waiting room con los datos de la sala
        router.push(`/waiting-room?mode=join&roomId=${response.room.roomId}`)
      } else {
        // Error
        setError(getErrorMessage(response.error || 'UNKNOWN_ERROR', response.message))
      }
    } catch (err) {
      console.error('[JoinRoom] Error:', err)
      setError('Error de conexión. Verifica que el servidor esté corriendo.')
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorCode: string, defaultMessage: string): string => {
    const errorMessages: Record<string, string> = {
      'ROOM_NOT_FOUND': 'La sala no existe. Verifica el código.',
      'ROOM_FULL': 'La sala está llena.',
      'ROOM_NOT_AVAILABLE': 'La sala no está disponible para unirse.',
      'CONNECTION_ERROR': 'Error de conexión con el servidor.',
      'MISSING_PARAMS': 'Faltan datos requeridos.',
    }
    return errorMessages[errorCode] || defaultMessage
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roomId.length >= 6) {
      handleJoinRoom()
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

        {/* Info del usuario */}
        <div className="absolute top-8 right-8 text-right">
          <p className="text-sm text-muted-foreground">Jugando como:</p>
          <p className="text-lg font-black text-primary">{user?.username}</p>
        </div>

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
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase())
                  setError(null) // Limpiar error al escribir
                }}
                onKeyPress={handleKeyPress}
                className="h-16 text-2xl font-black text-center tracking-widest border-4 border-secondary/50 focus:border-secondary uppercase"
                maxLength={10}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-2 font-bold">
                Ingresa el código que te compartió el creador de la sala
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/20 border border-destructive rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-bold text-destructive">{error}</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-16 text-xl font-black tracking-wider bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-secondary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleJoinRoom}
              disabled={roomId.length < 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  UNIÉNDOSE...
                </>
              ) : (
                <>
                  <DoorOpen className="w-6 h-6 mr-2" />
                  UNIRSE AHORA
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-muted">
            <p className="text-sm font-bold text-muted-foreground text-center">
              El código tiene 6 caracteres (letras y números)
            </p>
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