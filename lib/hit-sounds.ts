// Simple per-lane hit sound player using Web Audio API
// Generates short tones/noise so each key has a distinct sound

export type HitQuality = "perfect" | "good" | "miss"

export class HitSoundPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private initialized = false

  // A4-based scale for lanes 0..3
  private laneFreqs = [220, 293.66, 349.23, 440]

  init() {
    if (typeof window === "undefined") return
    if (!this.ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
    }
    this.initialized = true
  }

  async resume() {
    if (!this.ctx) this.init()
    if (this.ctx && this.ctx.state !== "running") {
      try {
        await this.ctx.resume()
      } catch {}
    }
  }

  playLane(lane: number, quality: HitQuality = "good") {
    if (!this.initialized) this.init()
    if (!this.ctx || !this.master) return

    // Miss as short noise blip; hits as pitched tones
    if (quality === "miss") {
      this.playNoise(0.08)
      return
    }

    const freq = this.laneFreqs[Math.max(0, Math.min(this.laneFreqs.length - 1, lane))]
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const now = this.ctx.currentTime

    // Slightly different timbre for perfect vs good
    osc.type = quality === "perfect" ? "sawtooth" : "square"
    osc.frequency.setValueAtTime(freq, now)

    // Quick ADSR envelope
    const attack = 0.005
    const decay = quality === "perfect" ? 0.2 : 0.12
    const peak = quality === "perfect" ? 0.7 : 0.5
    const sustain = quality === "perfect" ? 0.2 : 0.15

    gain.gain.setValueAtTime(0.0, now)
    gain.gain.linearRampToValueAtTime(peak, now + attack)
    gain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
    gain.gain.linearRampToValueAtTime(0.0, now + attack + decay + 0.05)

    osc.connect(gain)
    gain.connect(this.master)

    osc.start(now)
    osc.stop(now + attack + decay + 0.08)
  }

  private playNoise(duration: number) {
    if (!this.ctx || !this.master) return
    const sampleRate = this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer
    // Gentle lowpass to make miss sound thuddy
    const filter = this.ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 800

    const gain = this.ctx.createGain()
    const now = this.ctx.currentTime
    gain.gain.setValueAtTime(0.0, now)
    gain.gain.linearRampToValueAtTime(0.4, now + 0.005)
    gain.gain.linearRampToValueAtTime(0.0, now + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)

    noise.start(now)
    noise.stop(now + duration + 0.02)
  }
}
