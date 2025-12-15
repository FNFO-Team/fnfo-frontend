'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '@/lib/config'

export interface ChatMessage {
  id: string
  from: string
  oduserId: string
  text: string
  timestamp: number
}

export interface SystemMessage {
  type: 'user_joined' | 'user_left' | 'user_disconnected'
  text: string
  oduserId: string
  username: string
  timestamp: number
}

interface UseChatOptions {
  roomId: string
  userId: string
  username: string
}

interface UseChatReturn {
  messages: ChatMessage[]
  isConnected: boolean
  isJoined: boolean
  error: string | null
  sendMessage: (text: string) => void
  setTyping: (isTyping: boolean) => void
  typingUsers: string[]
}

export function useChat({ roomId, userId, username }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Conectar al chat
  useEffect(() => {
    if (!roomId || !userId || !username) {
      return
    }

    console.log('[Chat] Conectando...', { roomId, userId, username })

    const socket = io(config.chat.url, {
      auth: {
        oduserId: userId,
        username: username,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Conectado
    socket.on('connect', () => {
      console.log('[Chat] Conectado!')
      setIsConnected(true)
      setError(null)

      // Unirse a la sala
      socket.emit('room:join', { roomId }, (response: any) => {
        console.log('[Chat] room:join response:', response)
        if (response.ok) {
          setIsJoined(true)
          // Cargar mensajes anteriores
          if (response.last && Array.isArray(response.last)) {
            setMessages(response.last)
          }
        } else {
          setError(response.msg || 'Error al unirse al chat')
        }
      })
    })

    // Error de conexión
    socket.on('connect_error', (err) => {
      console.error('[Chat] Error de conexión:', err.message)
      setError('Error de conexión al chat')
      setIsConnected(false)
    })

    // Desconectado
    socket.on('disconnect', (reason) => {
      console.log('[Chat] Desconectado:', reason)
      setIsConnected(false)
      setIsJoined(false)
    })

    // Recibir mensaje
    // Recibir mensaje
    socket.on('chat:message', (msg: ChatMessage) => {
    console.log('[Chat] Mensaje recibido:', msg)
    // Evitar duplicados: verificar si el mensaje ya existe
    setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id)
        if (exists) {
        return prev
        }
        return [...prev, msg]
    })
    })

    // Mensajes del sistema
    socket.on('system', (data: SystemMessage) => {
      console.log('[Chat] Sistema:', data)
      // Puedes agregar mensajes del sistema a la lista si quieres mostrarlos
    })

    // Indicador de typing
    socket.on('chat:typing', (data: { oduserId: string; username: string; isTyping: boolean }) => {
      if (data.oduserId === userId) return // Ignorar el propio typing
      
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (!prev.includes(data.username)) {
            return [...prev, data.username]
          }
        } else {
          return prev.filter((u) => u !== data.username)
        }
        return prev
      })
    })

    // Cleanup
    return () => {
      console.log('[Chat] Desconectando...')
      if (socket.connected) {
        socket.emit('room:leave', { roomId })
        socket.disconnect()
      }
      socketRef.current = null
    }
  }, [roomId, userId, username])

  // Enviar mensaje
  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current?.connected || !isJoined || !text.trim()) {
      return
    }

    socketRef.current.emit('chat:message', { roomId, text: text.trim() }, (response: any) => {
      if (!response.ok) {
        console.error('[Chat] Error enviando mensaje:', response.msg)
        setError(response.msg)
      }
    })
  }, [roomId, isJoined])

  // Indicar que está escribiendo
  const setTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current?.connected || !isJoined) {
      return
    }

    socketRef.current.emit('chat:typing', { roomId, isTyping })

    // Auto-limpiar después de 2 segundos
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('chat:typing', { roomId, isTyping: false })
      }, 2000)
    }
  }, [roomId, isJoined])

  return {
    messages,
    isConnected,
    isJoined,
    error,
    sendMessage,
    setTyping,
    typingUsers,
  }
}

export default useChat