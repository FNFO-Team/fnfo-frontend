"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { MessageCircle } from "lucide-react"

export interface Message {
  id: string
  username: string
  message: string
  timestamp: Date
  userId: number
}

interface ChatBoxProps {
  messages: Message[]
  currentUserId: number
}

export function ChatBox({ messages, currentUserId }: ChatBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth" style={{ maxHeight: "400px" }}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-bold text-muted-foreground">No hay mensajes aún</p>
          <p className="text-xs text-muted-foreground/70">Sé el primero en saludar</p>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            id={msg.id}
            username={msg.username}
            message={msg.message}
            timestamp={msg.timestamp}
            isOwnMessage={msg.userId === currentUserId}
          />
        ))
      )}
    </div>
  )
}
