interface ChatMessageProps {
  id: string
  username: string
  message: string
  timestamp: Date
  isOwnMessage: boolean
}

export function ChatMessage({ username, message, timestamp, isOwnMessage }: ChatMessageProps) {
  const formattedTime = timestamp.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={`flex flex-col gap-1 animate-in slide-in-from-bottom duration-300 ${
        isOwnMessage ? "items-end" : "items-start"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOwnMessage && <span className="text-xs font-bold text-primary">{username}</span>}
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
        {isOwnMessage && <span className="text-xs font-bold text-secondary">{username}</span>}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? "bg-primary text-primary-foreground border-2 border-primary-foreground/20"
            : "bg-card text-foreground border-2 border-muted"
        }`}
      >
        <p className="text-sm font-medium break-words">{message}</p>
      </div>
    </div>
  )
}
