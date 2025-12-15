"use client"

interface ScoreDisplayProps {
  score: number
  combo: number
  perfectCount: number
  goodCount: number
  missCount: number
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="mb-6">
      <div className="text-center mb-4">
        <div className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Puntaje</div>
        <div className="text-6xl font-black text-primary tracking-wider drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
          {score.toLocaleString()}
        </div>
      </div>

      {/* Combo */}
      {combo > 0 && (
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.6)]">
            <span className="text-3xl font-black">{combo}x COMBO</span>
          </div>
        </div>
      )}
    </div>
  )
}
