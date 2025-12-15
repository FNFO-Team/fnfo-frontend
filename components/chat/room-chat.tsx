"use client"

import { ChatBox, type Message } from "./chat-box"
import { ChatInput } from "./chat-input"
import { MessageCircle, Wifi, WifiOff } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { useMemo } from "react"

interface RoomChatProps {
  roomId: string
  currentUserId: string
  currentUsername: string
}

export function RoomChat({ roomId, currentUserId, currentUsername }: RoomChatProps) {
  const {
    messages: chatMessages,
    isConnected,
    isJoined,
    error,
    sendMessage,
    setTyping,
    typingUsers,
  } = useChat({
    roomId,
    userId: currentUserId,
    username: currentUsername,
  })

  // Convertir mensajes del chat-service al formato del componente
  const messages: Message[] = useMemo(() => {
    return chatMessages.map((msg) => ({
      id: msg.id,
      username: msg.from,
      message: msg.text,
      timestamp: new Date(msg.timestamp),
      oduserId: msg.oduserId,
    }))
  }, [chatMessages])

  const handleSendMessage = (messageText: string) => {
    sendMessage(messageText)
  }

  const handleTyping = () => {
    setTyping(true)
  }

  return (
    <div className="w-full h-full flex flex-col bg-card border-4 border-accent/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-accent/10 border-b-2 border-accent/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-black text-foreground">CHAT DE SALA</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? (isJoined ? 'CONECTADO' : 'UNIÉNDOSE...') : 'DESCONECTADO'}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/20 text-destructive text-sm font-bold">
          {error}
        </div>
      )}

      {/* Messages */}
      <ChatBox messages={messages} currentUserId={currentUserId} />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground italic">
          {typingUsers.length === 1
            ? `${typingUsers[0]} está escribiendo...`
            : `${typingUsers.join(', ')} están escribiendo...`}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t-2 border-accent/30 bg-background/50">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
          disabled={!isConnected || !isJoined}
        />
      </div>
    </div>
  )
}