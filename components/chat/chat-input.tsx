"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onTyping?: () => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, onTyping, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    onTyping?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={handleChange}
        placeholder={disabled ? "Conectando..." : "Escribe un mensaje..."}
        disabled={disabled}
        className="flex-1 px-4 py-3 bg-background border-2 border-muted rounded-lg text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        maxLength={200}
      />
      <Button
        type="submit"
        size="lg"
        disabled={!message.trim() || disabled}
        className="font-black bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary-foreground/20"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}
