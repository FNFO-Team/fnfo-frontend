'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import matchmakingClient, {
  GameMode,
  RoomFoundEvent,
  PlayerStatus,
  QueueUpdateEvent,
  matchmakingApi,
} from '@/lib/matchmaking'
import { useAuth } from './use-auth'

export type MatchmakingState = 
  | 'idle'           // No está buscando
  | 'connecting'     // Conectando al servidor
  | 'searching'      // Buscando partida
  | 'found'          // Sala encontrada
  | 'error'          // Error

export interface UseMatchmakingOptions {
  autoConnect?: boolean
}

export interface UseMatchmakingReturn {
  // Estado
  state: MatchmakingState
  isConnected: boolean
  queuePosition: number | null
  waitingPlayers: number
  room: RoomFoundEvent | null
  error: string | null
  mode: GameMode | null
  
  // Acciones
  connect: () => Promise<void>
  disconnect: () => void
  searchGame: (mode: GameMode) => Promise<void>
  cancelSearch: () => void
  getStatus: () => Promise<PlayerStatus | null>
}

export function useMatchmaking(options: UseMatchmakingOptions = {}): UseMatchmakingReturn {
  const { autoConnect = false } = options
  const { user } = useAuth()
  
  // Estados
  const [state, setState] = useState<MatchmakingState>('idle')
  const [isConnected, setIsConnected] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [waitingPlayers, setWaitingPlayers] = useState(0)
  const [room, setRoom] = useState<RoomFoundEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  
  // Ref para evitar reconexiones múltiples
  const isConnecting = useRef(false)

  // Generar playerId único basado en el usuario
  const getPlayerId = useCallback(() => {
    // Usar username del usuario logueado
    if (user?.username) {
      return `player_${user.username.toLowerCase().replace(/\s+/g, '_')}`
    }
    if (user?.nickname) {
      return `player_${user.nickname.toLowerCase().replace(/\s+/g, '_')}`
    }
    // Fallback: ID aleatorio
    return `player_${Math.random().toString(36).substring(2, 10)}`
  }, [user])

  // Conectar al servidor de matchmaking
  const connect = useCallback(async () => {
    if (isConnecting.current || matchmakingClient.isConnected()) {
      return
    }

    isConnecting.current = true
    setState('connecting')
    setError(null)

    const playerId = getPlayerId()
    console.log('[useMatchmaking] Conectando con playerId:', playerId)

    try {
      await matchmakingClient.connect(playerId, {
        onConnected: () => {
          console.log('[useMatchmaking] Conectado!')
          setIsConnected(true)
          setState('idle')
          isConnecting.current = false
        },
        onDisconnected: (reason) => {
          console.log('[useMatchmaking] Desconectado:', reason)
          setIsConnected(false)
          setState('idle')
        },
        onError: (err) => {
          console.error('[useMatchmaking] Error:', err)
          setError(err.message)
          setState('error')
          isConnecting.current = false
        },
        onMatchmakingJoined: (data) => {
          console.log('[useMatchmaking] Unido a cola:', data)
          setState('searching')
          setQueuePosition(data.queuePosition || null)
          setWaitingPlayers(data.waitingPlayers || 0)
        },
        onMatchmakingLeft: () => {
          console.log('[useMatchmaking] Salió de cola')
          setState('idle')
          setQueuePosition(null)
          setMode(null)
        },
        onQueueUpdated: (data: QueueUpdateEvent) => {
          console.log('[useMatchmaking] Cola actualizada:', data)
          setWaitingPlayers(data.waitingPlayers)
        },
        onRoomFound: (data: RoomFoundEvent) => {
          console.log('[useMatchmaking] ¡Sala encontrada!', data)
          setState('found')
          setRoom(data)
          setQueuePosition(null)
        },
        onPlayerStatus: (data: PlayerStatus) => {
          console.log('[useMatchmaking] Estado:', data)
          if (data.status === 'IN_QUEUE') {
            setState('searching')
            setQueuePosition(data.position || null)
            setWaitingPlayers(data.queueSize || 0)
            setMode(data.mode as GameMode || null)
          } else if (data.status === 'IN_ROOM') {
            setState('found')
            setRoom({
              roomId: data.roomId!,
              players: data.players || [],
              mode: data.mode as GameMode,
              timestamp: Date.now(),
            })
          }
        },
      })
    } catch (err) {
      console.error('[useMatchmaking] Error de conexión:', err)
      setError(err instanceof Error ? err.message : 'Error de conexión')
      setState('error')
      isConnecting.current = false
    }
  }, [getPlayerId])

  // Desconectar
  const disconnect = useCallback(() => {
    matchmakingClient.disconnect()
    setIsConnected(false)
    setState('idle')
    setRoom(null)
    setQueuePosition(null)
    setMode(null)
  }, [])

  // Buscar partida
  const searchGame = useCallback(async (gameMode: GameMode) => {
    console.log('[useMatchmaking] Buscando partida:', gameMode)
    setError(null)
    setMode(gameMode)

    // Si no está conectado, conectar primero
    if (!matchmakingClient.isConnected()) {
      await connect()
    }

    // Esperar un poco para asegurar conexión
    await new Promise(resolve => setTimeout(resolve, 100))

    if (matchmakingClient.isConnected()) {
      setState('searching')
      matchmakingClient.joinMatchmaking(gameMode)
    } else {
      // Fallback: usar API REST
      console.log('[useMatchmaking] Usando API REST como fallback')
      try {
        const playerId = getPlayerId()
        const response = await matchmakingApi.join(playerId, gameMode)
        if (response.success) {
          setState('searching')
          setQueuePosition(response.queuePosition || null)
          setWaitingPlayers(response.waitingPlayers || 0)
          
          // Polling para verificar si hay sala
          pollForRoom(playerId)
        } else {
          setError(response.message)
          setState('error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al buscar partida')
        setState('error')
      }
    }
  }, [connect, getPlayerId])

  // Polling para verificar sala (fallback cuando no hay WebSocket)
  const pollForRoom = useCallback(async (playerId: string) => {
    const checkStatus = async () => {
      try {
        const status = await matchmakingApi.getStatus(playerId)
        
        if (status.status === 'IN_ROOM') {
          setState('found')
          setRoom({
            roomId: status.roomId!,
            players: status.players || [],
            mode: status.mode as GameMode,
            timestamp: Date.now(),
          })
          return true // Detener polling
        }
        
        if (status.status === 'IN_QUEUE') {
          setQueuePosition(status.position || null)
          setWaitingPlayers(status.queueSize || 0)
        }
        
        return false
      } catch {
        return false
      }
    }

    // Polling cada 2 segundos
    const interval = setInterval(async () => {
      const found = await checkStatus()
      if (found || state !== 'searching') {
        clearInterval(interval)
      }
    }, 2000)

    // Cleanup después de 5 minutos
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
  }, [state])

  // Cancelar búsqueda
  const cancelSearch = useCallback(() => {
    if (mode && matchmakingClient.isConnected()) {
      matchmakingClient.leaveMatchmaking(mode)
    }
    setState('idle')
    setQueuePosition(null)
    setMode(null)
  }, [mode])

  // Obtener estado actual
  const getStatus = useCallback(async (): Promise<PlayerStatus | null> => {
    try {
      const playerId = getPlayerId()
      return await matchmakingApi.getStatus(playerId)
    } catch {
      return null
    }
  }, [getPlayerId])

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (autoConnect && user) {
      connect()
    }
    
    return () => {
      // No desconectar automáticamente para mantener la conexión
    }
  }, [autoConnect, user, connect])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Opcional: desconectar al desmontar
      // disconnect()
    }
  }, [])

  return {
    state,
    isConnected,
    queuePosition,
    waitingPlayers,
    room,
    error,
    mode,
    connect,
    disconnect,
    searchGame,
    cancelSearch,
    getStatus,
  }
}

export default useMatchmaking