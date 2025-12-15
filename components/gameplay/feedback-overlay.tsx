"use client"

interface FeedbackItem {
  id: string
  type: "perfect" | "good" | "miss"
  timestamp: number
}

interface FeedbackOverlayProps {
  feedback: FeedbackItem | null
}

export function FeedbackOverlay({ feedback }: FeedbackOverlayProps) {
  // El feedback ahora se muestra directamente en el NoteTrack component
  return null
}
