import { api, buildWsUrl } from "./api"

export type GameWsEvent =
  | { type: "connected" }
  | { type: "disconnected"; reason?: string }
  | { type: "error"; message: string }
  | { type: "room_state"; roomId: string; players: string[] }
  | { type: "game_start"; startAt?: number }
  | { type: "opponent_hit"; playerId: string; lane: number; hitType: "perfect" | "good" | "miss"; points: number; t?: number }
  | { type: "game_end"; reason?: string }

export type HitPayload = {
  noteId?: string
  lane: number
  hitType: "perfect" | "good" | "miss"
  points: number
  t?: number
}

export type GameWsHandlers = {
  onEvent?: (evt: GameWsEvent) => void
  onConnected?: () => void
  onDisconnected?: (reason?: string) => void
  onOpponentHit?: (evt: Extract<GameWsEvent, { type: "opponent_hit" }>) => void
  onStart?: (evt: Extract<GameWsEvent, { type: "game_start" }>) => void
  onState?: (evt: Extract<GameWsEvent, { type: "room_state" }>) => void
  onEnd?: (evt: Extract<GameWsEvent, { type: "game_end" }>) => void
  onError?: (message: string) => void
}

export class GameWSClient {
  private ws: WebSocket | null = null
  private roomId = ""
  private playerId = ""
  private handlers: GameWsHandlers

  constructor(handlers: GameWsHandlers = {}) {
    this.handlers = handlers
  }

  isConnected() {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  async connect(roomId: string, playerId: string) {
    this.roomId = roomId
    this.playerId = playerId

    const base = api.getWsBase()
    if (!base) {
      this.handlers.onError?.("WS base no configurado (NEXT_PUBLIC_WS_BASE_URL)")
      return
    }

    const url = api.buildWsUrl(`game?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}`)

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.handlers.onConnected?.()
      this.handlers.onEvent?.({ type: "connected" })
      // Anunciar join
      this.send({ action: "join", roomId: this.roomId, playerId: this.playerId })
    }

    this.ws.onclose = (ev) => {
      const reason = ev.reason || undefined
      this.handlers.onDisconnected?.(reason)
      this.handlers.onEvent?.({ type: "disconnected", reason })
    }

    this.ws.onerror = () => {
      this.handlers.onError?.("WebSocket error")
    }

    this.ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data as string)
        this.routeIncoming(data)
      } catch (e) {
        // ignore
      }
    }
  }

  private routeIncoming(data: any) {
    switch (data?.type) {
      case "room_state":
        this.handlers.onState?.(data)
        this.handlers.onEvent?.(data)
        break
      case "game_start":
        this.handlers.onStart?.(data)
        this.handlers.onEvent?.(data)
        break
      case "opponent_hit":
        this.handlers.onOpponentHit?.(data)
        this.handlers.onEvent?.(data)
        break
      case "game_end":
        this.handlers.onEnd?.(data)
        this.handlers.onEvent?.(data)
        break
      default:
        // unknown; ignore
        break
    }
  }

  private send(obj: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(obj))
  }

  sendHit(payload: HitPayload) {
    this.send({ action: "hit", roomId: this.roomId, playerId: this.playerId, ...payload })
  }

  ready() {
    this.send({ action: "ready", roomId: this.roomId, playerId: this.playerId })
  }

  start() {
    this.send({ action: "start", roomId: this.roomId, playerId: this.playerId })
  }

  disconnect() {
    try {
      this.ws?.close()
    } catch {}
    this.ws = null
  }
}
