/**
 * Genera un audio de prueba usando Web Audio API
 * Útil para testear el gameplay sin archivos de audio reales
 */
export function generateTestAudio(durationSeconds: number = 30): Blob {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const sampleRate = audioContext.sampleRate
  const length = sampleRate * durationSeconds
  const audioBuffer = audioContext.createAudioBuffer(1, length, sampleRate)
  const data = audioBuffer.getChannelData(0)

  // Generar un patrón simple de sonido (onda sinusoidal básica)
  for (let i = 0; i < length; i++) {
    const frequency = 440 // La4
    const angle = (2 * Math.PI * frequency * i) / sampleRate
    data[i] = Math.sin(angle) * 0.3
  }

  // Convertir AudioBuffer a Blob (simplificado para pruebas)
  // En producción se usaría encodeAudioData o un formato real
  const offlineContext = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    1,
    length,
    sampleRate,
  )
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineContext.destination)
  source.start(0)

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
 * Alias para compatibilidad
 */
export function createAudioUrl(): string {
  return createTestAudioUrl()

  const blob = new Blob([WAV_HEADER], { type: "audio/wav" })
  return URL.createObjectURL(blob)
}
