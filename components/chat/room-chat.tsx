"use client"

import { useState } from "react"
import { ChatBox, type Message } from "./chat-box"
import { ChatInput } from "./chat-input"
import { MessageCircle } from "lucide-react"

interface RoomChatProps {
  currentUserId: number
  currentUsername: string
}

export function RoomChat({ currentUserId, currentUsername }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([])

  const handleSendMessage = (messageText: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      username: currentUsername,
      message: messageText,
      timestamp: new Date(),
      userId: currentUserId,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <div className="w-full h-full flex flex-col bg-card border-4 border-accent/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border-b-2 border-accent/30">
        <MessageCircle className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-black text-foreground">CHAT DE SALA</h3>
      </div>

      <ChatBox messages={messages} currentUserId={currentUserId} />

      <div className="p-4 border-t-2 border-accent/30 bg-background/50">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
