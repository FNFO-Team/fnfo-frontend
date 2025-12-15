"use client"

import { motion } from "framer-motion"

interface AnimatedNoteProps {
  id: string
  lane: number
  noteTime: number
  currentTime: number
  duration?: number // Para notas hold
  hit?: boolean
  missed?: boolean
}

/**
 * Componente de nota animada que cae desde arriba hacia el receptor
 * La posición se calcula basado en currentTime vs noteTime
 */
export function AnimatedNote({
  id,
  lane,
  noteTime,
  currentTime,
  duration,
  hit = false,
  missed = false,
}: AnimatedNoteProps) {
  // Calcular posición vertical basada en tiempo
  // lookahead = 2 segundos antes de llegar al hitbox
  const lookahead = 2
  const timeUntilHit = noteTime - currentTime
  
  // Posición: 0% (arriba) a 100% (hitbox) basado en tiempo restante
  // Si timeUntilHit > lookahead, la nota aún no es visible
  // Si timeUntilHit <= 0, la nota ya pasó
  const positionPercent = ((lookahead - timeUntilHit) / lookahead) * 100
  
  // Debug en consola
  if (process.env.NODE_ENV === "development" && id.endsWith("0")) {
    console.log(`Note ${id}: time=${noteTime}s, current=${currentTime}s, until=${timeUntilHit.toFixed(2)}s, pos=${positionPercent.toFixed(0)}%`)
  }
  
  // No renderizar si la nota está muy lejos (>lookahead) o ya pasó mucho tiempo
  if (timeUntilHit > lookahead || timeUntilHit < -0.5) {
    return null
  }

  // Si fue golpeada, mostrar animación de explosión
  if (hit) {
    return (
      <motion.div
        key={`${id}-hit`}
        className="absolute inset-0 flex items-center justify-center"
        style={{ top: `${positionPercent}%` }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-12 h-12 rounded-full bg-primary/50 blur-sm" />
      </motion.div>
    )
  }

  // Si fue missed, mostrar semi-transparente
  const opacity = missed ? 0.3 : 1

  // Color según el tipo de nota
  const noteColor = missed ? "bg-destructive" : "bg-primary"
  const glowColor = missed ? "shadow-destructive/50" : "shadow-primary"

  return (
    <motion.div
      key={id}
      className="absolute left-0 right-0 flex justify-center items-center pointer-events-none"
      style={{ 
        top: `${positionPercent}%`,
        opacity,
      }}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Nota normal */}
      {!duration && (
        <div
          className={`w-12 h-3 ${noteColor} rounded-full shadow-lg ${glowColor} border-2 border-primary-foreground/20`}
        />
      )}

      {/* Nota hold (línea larga) */}
      {duration && (
        <div className="relative">
          <div
            className={`w-12 ${noteColor} rounded-t-full shadow-lg ${glowColor} border-2 border-primary-foreground/20`}
            style={{ height: `${(duration / lookahead) * 100}px` }}
          />
          <div className={`w-12 h-3 ${noteColor} rounded-full shadow-lg ${glowColor}`} />
        </div>
      )}

      {/* Indicador de timing para debug */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute -top-6 text-xs font-mono text-white/50">
          {timeUntilHit.toFixed(2)}s
        </div>
      )}
    </motion.div>
  )
}
