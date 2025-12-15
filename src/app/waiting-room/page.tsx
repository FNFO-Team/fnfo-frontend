"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Play, Copy, Check, Loader2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMatchmaking } from '@/hooks/use-matchmaking'
import { useAuth } from '@/hooks/use-auth'
import { GameMode, matchmakingApi, Room } from '@/lib/matchmaking'
import { RoomChat } from '@/components/chat/room-chat'

export default function WaitingRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  // Parámetros de URL
  const modeParam = searchParams.get('mode') // 'coop', 'pvp', o 'join'
  const item = searchParams.get('item') // Boss o Track seleccionado
  const roomIdParam = searchParams.get('roomId') // Para cuando se une por código
  
  // Determinar si es modo "unirse por código" o "buscar partida"
  const isJoinByCode = modeParam === 'join' && roomIdParam
  
  // Convertir modo a GameMode (solo para matchmaking automático)
  const gameMode: GameMode = modeParam === 'coop' ? 'BOSS' : 'PVP'
  const maxPlayers = 4
  
  // Hook de matchmaking (solo para búsqueda automática)
  const {
    state: matchmakingState,
    isConnected,
    queuePosition,
    waitingPlayers,
    room: matchmakingRoom,
    error: matchmakingError,
    searchGame,
    cancelSearch,
  } = useMatchmaking()
  
  // Estados locales
  const [copiedRoomId, setCopiedRoomId] = useState(false)
  const [hasStartedSearch, setHasStartedSearch] = useState(false)
  const [joinedRoom, setJoinedRoom] = useState<Room | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Estado combinado
  const room = joinedRoom || matchmakingRoom
  const error = localError || matchmakingError
  const state = joinedRoom ? 'found' : matchmakingState

  // Generar oduserId para el chat
  const oduserId = user?.username 
    ? `player_${user.username.toLowerCase().replace(/\s+/g, '_')}`
    : ''

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Función para obtener datos de sala actualizados
  const fetchRoomData = useCallback(async (roomId: string) => {
    try {
      const roomData = await matchmakingApi.getRoom(roomId)
      if (roomData) {
        setJoinedRoom(roomData)
      }
    } catch (err) {
      console.error('Error fetching room:', err)
    }
  }, [])

  // Si se unió por código, cargar datos de la sala y hacer polling
  useEffect(() => {
    if (isJoinByCode && roomIdParam && isAuthenticated) {
      // Cargar datos iniciales
      fetchRoomData(roomIdParam)
      
      // Iniciar polling para actualizar datos de la sala
      setIsPolling(true)
      const interval = setInterval(() => {
        fetchRoomData(roomIdParam)
      }, 2000) // Actualizar cada 2 segundos

      return () => {
        clearInterval(interval)
        setIsPolling(false)
      }
    }
  }, [isJoinByCode, roomIdParam, isAuthenticated, fetchRoomData])

  // Iniciar búsqueda automática (solo si no es join por código)
  useEffect(() => {
    if (!isJoinByCode && !hasStartedSearch && isAuthenticated && user) {
      setHasStartedSearch(true)
      searchGame(gameMode)
    }
  }, [isJoinByCode, hasStartedSearch, isAuthenticated, user, gameMode, searchGame])

  const goBack = () => {
    if (!isJoinByCode) {
      cancelSearch()
    }
    
    if (modeParam === 'join') {
      router.push('/lobby')
    } else if (modeParam === 'coop') {
      router.push('/boss-select')
    } else {
      router.push("/track-select")
    }
  }

  const copyRoomId = () => {
    if (room?.roomId) {
      navigator.clipboard.writeText(room.roomId)
      setCopiedRoomId(true)
      setTimeout(() => setCopiedRoomId(false), 2000)
    }
  }

  const handleStartGame = () => {
    if (room?.roomId) {
      router.push(`/game?roomId=${room.roomId}&mode=${room.mode || gameMode}`)
    }
  }

  // Función para formatear el nombre del jugador
  const formatPlayerName = (playerId: string) => {
    const name = playerId.replace('player_', '').replace(/_/g, ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Verificar si es el jugador actual
  const isCurrentPlayer = (playerId: string) => {
    if (!user?.username) return false
    const currentPlayerId = `player_${user.username.toLowerCase().replace(/\s+/g, '_')}`
    return playerId === currentPlayerId
  }

  // Obtener lista de jugadores
  const players = room?.players || []
  const currentPlayerCount = players.length

  // No renderizar si no está autenticado
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fondo decorativo */}
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

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        {/* Botón Volver */}
        <Button 
          variant="ghost" 
          size="lg" 
          className="absolute top-8 left-8 text-xl font-black" 
          onClick={goBack}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        {/* Info del usuario actual */}
        <div className="absolute top-8 right-8 text-right">
          <p className="text-sm text-muted-foreground">Jugando como:</p>
          <p className="text-lg font-black text-primary">{user?.username}</p>
        </div>

        {/* Header */}
        <div className="text-center mb-6 mt-16 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter mb-2">
            {state === 'searching' ? 'BUSCANDO PARTIDA' : 
             state === 'found' || room ? 'SALA DE ESPERA' : 
             state === 'connecting' ? 'CONECTANDO...' :
             'SALA DE ESPERA'}
          </h2>
          <p className="text-md text-muted-foreground font-bold mb-2">
            {isJoinByCode ? 'Unido por código' : 
             (room?.mode === 'BOSS' || gameMode === 'BOSS') ? 'Modo Cooperativo' : 'Modo PvP'}
            {item && ` - ${item}`}
          </p>

          {/* Estado de conexión */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${(isConnected || isPolling) ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-sm text-muted-foreground">
              {(isConnected || isPolling) ? 'Conectado al servidor' : 'Conectando...'}
            </span>
          </div>

          {/*
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-2 rounded-lg mb-2">
                {error}
              </div>
            )}
          */}


          {/* Room ID */}
          {room?.roomId && (
            <div className="flex items-center justify-center gap-3 bg-card border-4 border-primary/30 rounded-lg p-3 max-w-md mx-auto">
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground font-bold">ID DE SALA</span>
                <span className="text-xl font-black text-primary tracking-wider">{room.roomId}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-auto font-black bg-transparent" 
                onClick={copyRoomId}
              >
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
          )}
        </div>

        {/* Contenido principal - Grid con jugadores y chat */}
        <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom duration-500">
          
          {/* Buscando partida (solo para matchmaking automático) */}
          {!isJoinByCode && state === 'searching' && (
            <div className="bg-card border-4 border-secondary/30 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-2xl font-black text-foreground mb-2">BUSCANDO OPONENTES</h3>
              <p className="text-muted-foreground mb-4">
                {queuePosition && `Posición en cola: ${queuePosition}`}
                {waitingPlayers > 0 && ` • ${waitingPlayers} jugador${waitingPlayers > 1 ? 'es' : ''} esperando`}
              </p>
              
              <Button
                variant="outline"
                size="lg"
                className="font-black"
                onClick={() => {
                  cancelSearch()
                  goBack()
                }}
              >
                <X className="w-5 h-5 mr-2" />
                CANCELAR BÚSQUEDA
              </Button>
            </div>
          )}

          {/* Sala encontrada / Unido por código */}
          {(state === 'found' || room) && room && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de jugadores */}
              <div className="bg-card border-4 border-secondary/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-foreground">JUGADORES</h3>
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-secondary" />
                    <span className="text-xl font-black text-secondary">
                      {currentPlayerCount}/{('maxPlayers' in room ? room.maxPlayers : null) || maxPlayers}
                    </span>
                  </div>
                  <span className="text-sm font-black text-green-500 bg-green-500/20 px-3 py-1 rounded-full">
                    CONECTADO
                  </span>
                </div>

                {/* Lista de jugadores */}
                <div className="space-y-3">
                  {players.map((playerId, index) => (
                    <div
                      key={playerId}
                      className="flex items-center justify-between bg-background border-2 border-muted rounded-lg p-4 animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-lg font-black text-primary-foreground">{index + 1}</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatPlayerName(playerId)}
                          {isCurrentPlayer(playerId) && ' (Tú)'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-green-500 bg-green-500/20 px-3 py-1 rounded-full">
                        CONECTADO
                      </span>
                    </div>
                  ))}

                  {/* Slots vacíos */}
                  {Array.from({ length: (('maxPlayers' in room ? room.maxPlayers : null) || maxPlayers) - currentPlayerCount }).map((_, index) => (
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

                {/* Botón Iniciar */}
                <Button
                  size="lg"
                  className="w-full mt-6 h-14 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={currentPlayerCount < 2}
                  onClick={handleStartGame}
                >
                  <Play className="w-6 h-6 mr-2" />
                  {currentPlayerCount < 2 ? "ESPERANDO..." : "INICIAR PARTIDA"}
                </Button>
              </div>

              {/* Panel de chat */}
              <div className="h-[500px]">
                <RoomChat
                  roomId={room.roomId}
                  currentUserId={oduserId}
                  currentUsername={user?.username || 'Anónimo'}
                />
              </div>
            </div>
          )}

          {/* Conectando */}
          {!isJoinByCode && state === 'connecting' && (
            <div className="bg-card border-4 border-secondary/30 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-2xl font-black text-foreground">CONECTANDO AL SERVIDOR</h3>
              <p className="text-muted-foreground">Por favor espera...</p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="bg-card border-4 border-destructive/30 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <X className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-2xl font-black text-foreground mb-2">ERROR DE CONEXIÓN</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                size="lg"
                className="font-black"
                onClick={() => {
                  setHasStartedSearch(false)
                  setLocalError(null)
                }}
              >
                REINTENTAR
              </Button>
            </div>
          )}
        </div>

        {/* Indicador de carga */}
        {(state === 'searching' || state === 'connecting') && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        )}
      </div>

      {/* Decoración de esquinas */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}