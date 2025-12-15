/**
 * Genera un audio de prueba usando Web Audio API
 * Útil para testear el gameplay sin archivos de audio reales
 */
export function generateTestAudio(durationSeconds: number = 30): Blob {
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext
  const audioContext = new AC()
  const sampleRate = audioContext.sampleRate
  const length = Math.floor(sampleRate * durationSeconds)
  const audioBuffer = audioContext.createBuffer(1, length, sampleRate)
  const data = audioBuffer.getChannelData(0)

  // Generar un patrón simple de sonido (onda sinusoidal básica)
  for (let i = 0; i < length; i++) {
    const frequency = 440 // La4
    const angle = (2 * Math.PI * frequency * i) / sampleRate
    data[i] = Math.sin(angle) * 0.3
  }

  // Convertir AudioBuffer a Blob (simplificado para pruebas)
  // En producción se usaría encodeAudioData o un formato real
  // Nota: este helper no se usa en producción. Devolvemos un blob vacío.
  return new Blob([], { type: "audio/wav" })
}

/**
 * Crea una URL de datos para reproducir audio usando Web Audio API
 */
export function createTestAudioUrl(): string {
  // Generar 30 segundos de audio silencioso
  const sampleRate = 44100
  const durationSeconds = 30
  const numSamples = sampleRate * durationSeconds
  const dataSize = numSamples * 2 // 2 bytes per sample (16-bit)
  const fileSize = 36 + dataSize

  // Crear header WAV
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // RIFF chunk
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, fileSize, true)
  writeString(8, "WAVE")

  // fmt chunk
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, 1, true) // AudioFormat (PCM)
  view.setUint16(22, 1, true) // NumChannels (mono)
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * 2, true) // ByteRate
  view.setUint16(32, 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample

  // data chunk
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  // Llenar con silencio (0) o un tono suave
  for (let i = 0; i < numSamples; i++) {
    // Generar un tono simple para debugging (440Hz = La)
    const t = i / sampleRate
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.1 * 32767
    view.setInt16(44 + i * 2, sample, true)
  }

  const wavBlob = new Blob([buffer], { type: "audio/wav" })
  return URL.createObjectURL(wavBlob)
}

/**
 * Genera un WAV basado en el chart: crea pequeños tonos en los tiempos de cada nota.
 * Cada carril usa una frecuencia distinta para facilitar la correlación audio-visual.
 */
export function createChartAudioUrl(chart: { notes: { time: number; lane: number }[] }, opts?: {
  sampleRate?: number
  burstMs?: number
  tailSec?: number
  laneFreqs?: number[]
}): string {
  const sampleRate = opts?.sampleRate ?? 44100
  const burstMs = opts?.burstMs ?? 100 // duración del beep por nota
  const tailSec = opts?.tailSec ?? 2 // cola para no cortar el último tono
  const laneFreqs = opts?.laneFreqs ?? [220, 293.66, 349.23, 440]

  const lastNoteTime = chart.notes.reduce((max, n) => Math.max(max, n.time), 0)
  const durationSeconds = Math.max(1, Math.ceil(lastNoteTime + tailSec))
  const numSamples = Math.floor(sampleRate * durationSeconds)
  const dataSize = numSamples * 2 // int16 mono
  const fileSize = 36 + dataSize

  // WAV header
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, fileSize, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, 1, true) // AudioFormat (PCM)
  view.setUint16(22, 1, true) // channels mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // ByteRate
  view.setUint16(32, 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  // Señal PCM float en [-1,1]
  const floatData = new Float32Array(numSamples)
  const burstSamples = Math.max(1, Math.floor((burstMs / 1000) * sampleRate))

  // Envolvente rápida para evitar clics: ataque corto y decaimiento
  const attack = Math.max(1, Math.floor(0.005 * sampleRate)) // 5ms
  const decay = burstSamples - attack

  for (const note of chart.notes) {
    const freq = laneFreqs[Math.max(0, Math.min(laneFreqs.length - 1, note.lane))]
    const start = Math.floor(note.time * sampleRate)
    for (let i = 0; i < burstSamples; i++) {
      const idx = start + i
      if (idx >= numSamples) break
      // Envolvente lineal simple
      const env = i < attack ? i / attack : Math.max(0, 1 - (i - attack) / Math.max(1, decay))
      const t = (idx / sampleRate)
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.25 * env
      floatData[idx] += sample
    }
  }

  // Normalizar/clamp y escribir int16
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, floatData[i]))
    view.setInt16(44 + i * 2, Math.floor(s * 32767), true)
  }

  const wavBlob = new Blob([buffer], { type: "audio/wav" })
  return URL.createObjectURL(wavBlob)
}

/**
 * Alias para compatibilidad
 */
export function createAudioUrl(): string {
  return createTestAudioUrl()
}
