// Cliente de Matchmaking Service con Socket.IO
import { io, Socket } from 'socket.io-client'
import { config } from './config'

export type GameMode = 'PVP' | 'BOSS'

export type RoomStatus = 'FORMING' | 'READY' | 'IN_PROGRESS' | 'FINISHED'

export interface Player {
  playerId: string
  name?: string
}

export interface Room {
  roomId: string
  players: string[]
  mode: GameMode
  status: RoomStatus
  currentPlayers: number
  maxPlayers: number
  createdAt: number
}

export interface MatchmakingResponse {
  success: boolean
  message: string
  queuePosition?: number
  waitingPlayers?: number
}

export interface JoinRoomResponse {
  success: boolean
  message: string
  error?: string
  room?: Room
}

export interface RoomFoundEvent {
  roomId: string
  players: string[]
  mode: GameMode
  timestamp: number
}

export interface PlayerStatus {
  status: 'IN_ROOM' | 'IN_QUEUE' | 'NOT_IN_MATCHMAKING'
  roomId?: string
  roomStatus?: RoomStatus
  players?: string[]
  mode?: GameMode
  position?: number
  queueSize?: number
}

export interface QueueUpdateEvent {
  waitingPlayers: number
  mode: GameMode
}

type MatchmakingEventHandlers = {
  onConnected?: () => void
  onDisconnected?: (reason: string) => void
  onError?: (error: Error) => void
  onMatchmakingJoined?: (data: MatchmakingResponse & { mode: GameMode }) => void
  onMatchmakingLeft?: (data: { success: boolean; mode: GameMode }) => void
  onQueueUpdated?: (data: QueueUpdateEvent) => void
  onRoomFound?: (data: RoomFoundEvent) => void
  onPlayerStatus?: (data: PlayerStatus) => void
}

class MatchmakingClient {
  private socket: Socket | null = null
  private handlers: MatchmakingEventHandlers = {}
  private playerId: string = ''

  // Conectar al servicio de matchmaking
  connect(playerId: string, handlers: MatchmakingEventHandlers = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('[Matchmaking] Ya conectado')
        resolve()
        return
      }

      this.playerId = playerId
      this.handlers = handlers

      console.log('[Matchmaking] Conectando a:', config.matchmaking.url)

      this.socket = io(config.matchmaking.url, {
        auth: { playerId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      // Evento: Conectado
      this.socket.on('connect', () => {
        console.log('[Matchmaking] Conectado!')
        this.handlers.onConnected?.()
        resolve()
      })

      // Evento: Error de conexión
      this.socket.on('connect_error', (error) => {
        console.error('[Matchmaking] Error de conexión:', error.message)
        this.handlers.onError?.(error)
        reject(error)
      })

      // Evento: Desconectado
      this.socket.on('disconnect', (reason) => {
        console.log('[Matchmaking] Desconectado:', reason)
        this.handlers.onDisconnected?.(reason)
      })

      // Evento: Unido al matchmaking
      this.socket.on('matchmaking-joined', (data) => {
        console.log('[Matchmaking] Unido a cola:', data)
        this.handlers.onMatchmakingJoined?.(data)
      })

      // Evento: Salió del matchmaking
      this.socket.on('matchmaking-left', (data) => {
        console.log('[Matchmaking] Salió de cola:', data)
        this.handlers.onMatchmakingLeft?.(data)
      })

      // Evento: Cola actualizada
      this.socket.on('queue-updated', (data) => {
        console.log('[Matchmaking] Cola actualizada:', data)
        this.handlers.onQueueUpdated?.(data)
      })

      // Evento: ¡Sala encontrada!
      this.socket.on('room-found', (data) => {
        console.log('[Matchmaking] ¡Sala encontrada!', data)
        this.handlers.onRoomFound?.(data)
      })

      // Evento: Estado del jugador
      this.socket.on('player-status', (data) => {
        console.log('[Matchmaking] Estado:', data)
        this.handlers.onPlayerStatus?.(data)
      })

      // Evento: Error de matchmaking
      this.socket.on('matchmaking-error', (error) => {
        console.error('[Matchmaking] Error:', error)
        
        // Ignorar error si ya está en cola (no es crítico)
        if (error.message?.includes('ya está en la cola')) {
          return
        }
        
        this.handlers.onError?.(new Error(error.message || 'Error de matchmaking'))
      })
    })
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      console.log('[Matchmaking] Desconectando...')
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Unirse a la cola de matchmaking
  joinMatchmaking(mode: GameMode): void {
    if (!this.socket?.connected) {
      console.error('[Matchmaking] No conectado')
      return
    }
    console.log('[Matchmaking] Uniéndose a cola:', mode)
    this.socket.emit('join-matchmaking', { mode })
  }

  // Salir de la cola de matchmaking
  leaveMatchmaking(mode: GameMode): void {
    if (!this.socket?.connected) {
      console.error('[Matchmaking] No conectado')
      return
    }
    console.log('[Matchmaking] Saliendo de cola:', mode)
    this.socket.emit('leave-matchmaking', { mode })
  }

  // Obtener estado del jugador
  getStatus(): void {
    if (!this.socket?.connected) {
      console.error('[Matchmaking] No conectado')
      return
    }
    this.socket.emit('get-status')
  }

  // Obtener información de la cola
  getQueueInfo(): void {
    if (!this.socket?.connected) {
      console.error('[Matchmaking] No conectado')
      return
    }
    this.socket.emit('get-queue-info')
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Obtener el ID del jugador
  getPlayerId(): string {
    return this.playerId
  }
}

// API REST para matchmaking (alternativa a WebSocket)
export const matchmakingApi = {
  // Unirse a matchmaking via REST
  async join(playerId: string, mode: GameMode): Promise<MatchmakingResponse> {
    const response = await fetch(`${config.matchmaking.url}${config.matchmaking.apiPrefix}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode }),
    })
    return response.json()
  },

  // Salir de matchmaking via REST
  async leave(playerId: string, mode: GameMode): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${config.matchmaking.url}${config.matchmaking.apiPrefix}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, mode }),
    })
    return response.json()
  },

  // ========================================
  // NUEVO: Unirse a sala por código
  // ========================================
  async joinRoomByCode(playerId: string, roomId: string): Promise<JoinRoomResponse> {
    try {
      const response = await fetch(`${config.matchmaking.url}${config.matchmaking.apiPrefix}/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, roomId }),
      })
      return response.json()
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: 'CONNECTION_ERROR',
      }
    }
  },

  // Obtener estado del jugador
  async getStatus(playerId: string): Promise<PlayerStatus> {
    const response = await fetch(
      `${config.matchmaking.url}${config.matchmaking.apiPrefix}/status/${playerId}`
    )
    return response.json()
  },

  // Obtener estadísticas
  async getStats(): Promise<{ pvpQueueSize: number; bossQueueSize: number; totalRooms: number }> {
    const response = await fetch(`${config.matchmaking.url}${config.matchmaking.apiPrefix}/stats`)
    return response.json()
  },

  // Obtener salas
  async getRooms(mode?: GameMode): Promise<{ count: number; rooms: Room[] }> {
    const url = mode
      ? `${config.matchmaking.url}${config.matchmaking.apiPrefix}/rooms?mode=${mode}`
      : `${config.matchmaking.url}${config.matchmaking.apiPrefix}/rooms`
    const response = await fetch(url)
    return response.json()
  },

  // Obtener sala por ID
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const response = await fetch(
        `${config.matchmaking.url}${config.matchmaking.apiPrefix}/rooms/${roomId}`
      )
      if (!response.ok) {
        return null
      }
      return response.json()
    } catch {
      return null
    }
  },

  // Iniciar partida
  async startGame(roomId: string): Promise<{ success: boolean; message: string; room: Room }> {
    const response = await fetch(
      `${config.matchmaking.url}${config.matchmaking.apiPrefix}/rooms/${roomId}/start`,
      { method: 'POST' }
    )
    return response.json()
  },
}

// Singleton del cliente
export const matchmakingClient = new MatchmakingClient()

export default matchmakingClient