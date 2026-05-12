import { useCallback, useRef } from 'react'

const SOUND_KEY = 'smartiot-chat:sound-enabled'

export function readPref(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  } catch {
    // localStorage may be unavailable
    return true
  }
}

export function writePref(value: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, String(value))
  } catch {
    // localStorage may be unavailable
  }
}

export const SOUND_EVENT = 'smartiot-chat:sound-toggle'

export type SoundType = 'select' | 'create' | 'edit' | 'delete' | 'error' | 'message' | 'activate' | 'deactivate'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx || ctx.state === 'closed') {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      console.warn('[sounds] Failed to create AudioContext')
      return null
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', volume = 0.15) {
  const c = getCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(volume, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start()
  o.stop(c.currentTime + dur)
}

function noise(dur: number) {
  const c = getCtx()
  if (!c) return
  const n = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, n, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.06, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  const filter = c.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(2000, c.currentTime)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)
  src.start()
}

function play(sound: SoundType, force = false) {
  if (!force && !readPref()) return
  switch (sound) {
    case 'select':
      noise(0.04)
      break
    case 'create':
      tone(523, 0.12)
      setTimeout(() => tone(659, 0.14), 80)
      break
    case 'edit':
      tone(659, 0.18)
      break
    case 'delete':
      tone(349, 0.15, 'sawtooth')
      setTimeout(() => tone(262, 0.2, 'sawtooth'), 120)
      break
    case 'error':
      tone(200, 0.12, 'square')
      setTimeout(() => tone(160, 0.16, 'square'), 100)
      break
    case 'message':
      tone(740, 0.08)
      setTimeout(() => tone(988, 0.12), 70)
      break
    case 'activate':
      tone(523, 0.08, 'sine', 0.10)
      setTimeout(() => tone(784, 0.12, 'sine', 0.10), 60)
      break
    case 'deactivate':
      tone(440, 0.10, 'sine', 0.08)
      setTimeout(() => tone(349, 0.14, 'sine', 0.08), 70)
      break
  }
}

export function useSounds() {
  const pref = useRef(readPref())

  const playSound = useCallback((type: SoundType, force = false) => {
    play(type, force)
  }, [])

  const refresh = useCallback(() => {
    pref.current = readPref()
  }, [])

  return { playSound, refresh }
}
