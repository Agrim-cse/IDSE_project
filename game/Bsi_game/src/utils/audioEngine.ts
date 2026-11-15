type SoundName = 'click' | 'typewriter' | 'paper' | 'scanner' | 'stamp' | 'thunder'

/** Small Web Audio soundscape. Audio starts only after a user gesture. */
class NoirAudioEngine {
  private context?: AudioContext
  private masterMusic?: GainNode
  private masterSfx?: GainNode
  private rainSource?: AudioBufferSourceNode
  private rainGain?: GainNode
  private musicLevel = 0.35
  private sfxLevel = 0.7
  private narratorAudio?: HTMLAudioElement
  private narratorSource?: MediaElementAudioSourceNode
  private narratorFilters: BiquadFilterNode[] = []
  private narratorUtterance?: SpeechSynthesisUtterance
  private narratorResolve?: () => void
  private narratorStateListener?: (speaking: boolean) => void

  onNarratorStateChange(listener?: (speaking: boolean) => void) {
    this.narratorStateListener = listener
    return () => { if (this.narratorStateListener === listener) this.narratorStateListener = undefined }
  }

  private setNarratorSpeaking(speaking: boolean) {
    this.narratorStateListener?.(speaking)
  }

  private settleNarrator() {
    const resolve = this.narratorResolve
    this.narratorResolve = undefined
    resolve?.()
  }

  private fallbackToSpeech(audio: HTMLAudioElement, text: string) {
    if (this.narratorAudio !== audio) return
    audio.pause()
    this.narratorSource?.disconnect()
    this.narratorFilters.forEach((filter) => filter.disconnect())
    this.narratorSource = undefined
    this.narratorFilters = []
    if (!('speechSynthesis' in window)) { this.setNarratorSpeaking(false); this.settleNarrator(); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.pitch = 0.75
    utterance.rate = 0.88
    utterance.volume = this.sfxLevel
    const maleVoice = window.speechSynthesis.getVoices().find((voice) => /en-US/i.test(voice.lang) && /guy|christopher|david|mark|male/i.test(voice.name))
      ?? window.speechSynthesis.getVoices().find((voice) => /en-US/i.test(voice.lang))
    if (maleVoice) utterance.voice = maleVoice
    utterance.onstart = () => this.setNarratorSpeaking(true)
    utterance.onend = () => { if (this.narratorUtterance === utterance) { this.narratorUtterance = undefined; this.narratorAudio = undefined; this.setNarratorSpeaking(false); this.settleNarrator() } }
    utterance.onerror = () => { if (this.narratorUtterance === utterance) { this.narratorUtterance = undefined; this.narratorAudio = undefined; this.setNarratorSpeaking(false); this.settleNarrator() } }
    this.narratorUtterance = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  playNarratorLine(audioUrl: string, fallbackText: string): Promise<void> {
    this.stopNarrator()
    return new Promise((resolve) => {
      this.narratorResolve = resolve
      const audio = new Audio(audioUrl)
      this.narratorAudio = audio
      audio.preload = 'auto'
      audio.volume = 1
      let usedFallback = false
      const fallback = () => {
        if (usedFallback) return
        usedFallback = true
        this.fallbackToSpeech(audio, fallbackText)
      }
      audio.onerror = fallback
      audio.onplay = () => this.setNarratorSpeaking(true)
      audio.onended = () => this.stopNarrator()
      try {
        const context = this.getContext()
        if (context && this.masterSfx) {
          const source = context.createMediaElementSource(audio)
          const highpass = context.createBiquadFilter()
          const presence = context.createBiquadFilter()
          const lowpass = context.createBiquadFilter()
          highpass.type = 'highpass'
          highpass.frequency.value = 105
          presence.type = 'peaking'
          presence.frequency.value = 950
          presence.Q.value = 0.8
          presence.gain.value = 1.5
          lowpass.type = 'lowpass'
          lowpass.frequency.value = 5200
          source.connect(highpass).connect(presence).connect(lowpass).connect(this.masterSfx)
          this.narratorSource = source
          this.narratorFilters = [highpass, presence, lowpass]
        } else audio.volume = this.sfxLevel
      } catch {
        audio.volume = this.sfxLevel
      }
      this.setNarratorSpeaking(true)
      void audio.play().catch(fallback)
    })
  }

  stopNarrator() {
    if (this.narratorAudio) {
      this.narratorAudio.onerror = null
      this.narratorAudio.onplay = null
      this.narratorAudio.onended = null
      this.narratorAudio.pause()
      this.narratorAudio.currentTime = 0
      this.narratorAudio = undefined
    }
    this.narratorSource?.disconnect()
    this.narratorFilters.forEach((filter) => filter.disconnect())
    this.narratorSource = undefined
    this.narratorFilters = []
    if (this.narratorUtterance && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    this.narratorUtterance = undefined
    this.setNarratorSpeaking(false)
    this.settleNarrator()
  }

  private getContext() {
    if (typeof window === 'undefined') return undefined
    if (!this.context) {
      const AudioContextCtor = window.AudioContext
      this.context = new AudioContextCtor()
      this.masterMusic = this.context.createGain()
      this.masterSfx = this.context.createGain()
      this.masterMusic.gain.value = this.musicLevel
      this.masterSfx.gain.value = this.sfxLevel
      this.masterMusic.connect(this.context.destination)
      this.masterSfx.connect(this.context.destination)
    }
    if (this.context.state === 'suspended') void this.context.resume()
    return this.context
  }

  setMusicVolume(value: number) {
    this.musicLevel = Math.max(0, Math.min(1, value / 100))
    if (this.context && this.masterMusic) this.masterMusic.gain.setTargetAtTime(this.musicLevel, this.context.currentTime, 0.08)
  }
  setSfxVolume(value: number) {
    this.sfxLevel = Math.max(0, Math.min(1, value / 100))
    if (this.context && this.masterSfx) this.masterSfx.gain.setTargetAtTime(this.sfxLevel, this.context.currentTime, 0.04)
  }

  /** Crisp 880 Hz bedside monitor pulse. */
  playEcgBeep() {
    const context = this.getContext()
    if (!context || !this.masterSfx) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.17, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    oscillator.connect(gain).connect(this.masterSfx)
    oscillator.start(now)
    oscillator.stop(now + 0.13)
  }

  /** Two and a half seconds of flatline tone over a fading low dread chord. */
  playFlatlineAlarm() {
    const context = this.getContext()
    if (!context || !this.masterSfx) return
    const now = context.currentTime
    const layers: Array<{ frequency: number; volume: number; type: OscillatorType }> = [
      { frequency: 740, volume: 0.13, type: 'sine' },
      { frequency: 43, volume: 0.18, type: 'sine' },
      { frequency: 51, volume: 0.09, type: 'triangle' },
    ]
    for (const layer of layers) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = layer.type
      oscillator.frequency.setValueAtTime(layer.frequency, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(layer.volume, now + 0.035)
      gain.gain.setValueAtTime(layer.volume, now + 2.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)
      oscillator.connect(gain).connect(this.masterSfx)
      oscillator.start(now)
      oscillator.stop(now + 2.55)
    }
  }

  isRainPlaying() { return Boolean(this.rainSource) }

  toggleRain(force?: boolean) {
    if (this.rainSource) {
      if (force === true) return
      this.stopRain()
      return
    }
    if (force === false) return
    const context = this.getContext()
    if (!context || !this.masterMusic) return
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.22
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    source.buffer = buffer
    source.loop = true
    filter.type = 'lowpass'
    filter.frequency.value = 820
    gain.gain.value = 0
    source.connect(filter).connect(gain).connect(this.masterMusic)
    source.start()
    gain.gain.setTargetAtTime(0.035, context.currentTime, 1.8)
    this.rainSource = source
    this.rainGain = gain
  }

  stopRain() {
    if (!this.rainSource || !this.context) return
    this.rainGain?.gain.setTargetAtTime(0, this.context.currentTime, 0.08)
    const source = this.rainSource
    this.rainSource = undefined
    window.setTimeout(() => { try { source.stop() } catch { /* already stopped */ } }, 450)
  }

  play(sound: SoundName) {
    const context = this.getContext()
    if (!context || !this.masterSfx) return
    const now = context.currentTime
    const tone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.16, endFrequency = frequency) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration)
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
      oscillator.connect(gain).connect(this.masterSfx!)
      oscillator.start(now)
      oscillator.stop(now + duration)
    }
    const noise = (duration: number, volume: number, lowpass: number) => {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
      const channel = buffer.getChannelData(0)
      for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()
      source.buffer = buffer
      filter.type = 'lowpass'
      filter.frequency.value = lowpass
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
      source.connect(filter).connect(gain).connect(this.masterSfx!)
      source.start(now)
    }
    switch (sound) {
      case 'click': tone(680, 0.045, 'square', 0.04, 430); break
      case 'typewriter': tone(1250 + Math.random() * 350, 0.025, 'square', 0.035, 760); break
      case 'paper': noise(0.32, 0.12, 1500); tone(180, 0.12, 'triangle', 0.045, 110); break
      case 'scanner': tone(180, 0.65, 'sawtooth', 0.13, 760); tone(1100, 0.13, 'sine', 0.08, 1560); break
      case 'stamp': tone(90, 0.45, 'triangle', 0.33, 32); noise(0.12, 0.2, 420); break
      case 'thunder': noise(1.4, 0.035, 150); tone(58, 1.7, 'sine', 0.11, 31); break
    }
  }
}

export const audioEngine = new NoirAudioEngine()
