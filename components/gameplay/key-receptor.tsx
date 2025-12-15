"use client"

import { motion } from "framer-motion"

interface KeyReceptorProps {
  keyLabel: string
  isPressed: boolean
  laneIndex: number
  showHitEffect?: boolean
  hitType?: "perfect" | "good" | "miss" | null
}

/**
 * Componente receptor de teclas (hitbox) con animación de presión
 * Se ubica en la parte inferior del carril donde las notas deben ser presionadas
 */
export function KeyReceptor({ keyLabel, isPressed, laneIndex, showHitEffect, hitType }: KeyReceptorProps) {
  // Colores según el carril
  const laneColors = [
    { bg: "bg-purple-500/20", border: "border-purple-500", glow: "shadow-purple-500/50", text: "text-purple-300" },
    { bg: "bg-blue-500/20", border: "border-blue-500", glow: "shadow-blue-500/50", text: "text-blue-300" },
    { bg: "bg-green-500/20", border: "border-green-500", glow: "shadow-green-500/50", text: "text-green-300" },
    { bg: "bg-red-500/20", border: "border-red-500", glow: "shadow-red-500/50", text: "text-red-300" },
  ]

  const color = laneColors[laneIndex] || laneColors[0]

  // Color del hit effect
  const hitColors = {
    perfect: "bg-primary",
    good: "bg-secondary",
    miss: "bg-destructive",
  }

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Hitbox receptor base */}
      <motion.div
        className={`absolute inset-0 rounded-lg ${color.bg} ${color.border} border-4 ${color.glow} shadow-2xl`}
        animate={{
          scale: isPressed ? 0.9 : 1,
          borderWidth: isPressed ? 6 : 4,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      />

      {/* Tecla label */}
      <motion.div
        className={`relative z-10 text-2xl font-black ${color.text} drop-shadow-lg`}
        animate={{
          scale: isPressed ? 0.85 : 1,
          y: isPressed ? 2 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {keyLabel}
      </motion.div>

      {/* Glow effect cuando se presiona */}
      {isPressed && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${color.bg} blur-xl`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Hit feedback effect */}
      {showHitEffect && hitType && (
        <motion.div
          key={`hit-${Date.now()}`}
          className={`absolute inset-0 rounded-full ${hitColors[hitType]} opacity-50`}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Hit type text */}
      {showHitEffect && hitType && (
        <motion.div
          key={`text-${Date.now()}`}
          className="absolute -top-8 text-sm font-black"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className={
              hitType === "perfect"
                ? "text-primary"
                : hitType === "good"
                ? "text-secondary"
                : "text-destructive"
            }
          >
            {hitType.toUpperCase()}
          </span>
        </motion.div>
      )}

      {/* Zona de timing visual (para debug) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute -top-16 w-full h-12 border border-dashed border-white/20 rounded flex items-center justify-center text-xs text-white/30">
          HIT ZONE
        </div>
      )}
    </div>
  )
}
