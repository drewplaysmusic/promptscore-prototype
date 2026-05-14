export type PromptStyleTag =
  | 'mozart'
  | 'classical'
  | 'folk'
  | 'country'
  | 'march'
  | 'jazz'
  | 'pop'
  | 'beginner'
  | 'unknown'

export type PromptInstrument =
  | 'piano'
  | 'violin'
  | 'flute'
  | 'clarinet'
  | 'trumpet'
  | 'snare drum'
  | 'mallets'
  | 'melody'
  | 'unknown'

export type PromptMode = 'major' | 'minor'
export type PromptDensity = 'simple' | 'moderate' | 'busy'
export type PromptTask = 'melody' | 'rhythm' | 'chords' | 'unknown'

export type PromptIntent = {
  task: PromptTask
  measureCount: number
  keyRoot: string
  mode: PromptMode
  style: PromptStyleTag
  instrument: PromptInstrument
  density: PromptDensity
  rawPrompt: string
  confidence: number
  summary: string
}

const KEY_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'F#', 'C#']

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, ' ')
}

function detectMeasureCount(normalized: string): number {
  const explicit = normalized.match(/\b(\d+)\s*(?:measure|measures|bar|bars)\b/)
  if (explicit) return Math.max(1, Math.min(64, Number(explicit[1])))

  if (normalized.includes('short')) return 4
  if (normalized.includes('phrase')) return 8
  if (normalized.includes('long')) return 16
  return 4
}

function detectTask(normalized: string): PromptTask {
  if (normalized.includes('melody') || normalized.includes('tune') || normalized.includes('theme')) return 'melody'
  if (normalized.includes('rhythm') || normalized.includes('rhythms')) return 'rhythm'
  if (normalized.includes('chord') || normalized.includes('harmony') || normalized.includes('progression')) return 'chords'
  return 'melody'
}

function detectKey(normalized: string): { keyRoot: string; mode: PromptMode } {
  const keyMatch = normalized.match(/\b(?:in|key of)\s+([a-g](?:#|b|♯|♭)?)(?:\s+(major|minor))?\b/)

  if (keyMatch) {
    const rawRoot = keyMatch[1].replace('♯', '#').replace('♭', 'b')
    const keyRoot = rawRoot.charAt(0).toUpperCase() + rawRoot.slice(1)
    const mode = keyMatch[2] === 'minor' ? 'minor' : 'major'
    return { keyRoot, mode }
  }

  if (normalized.includes('minor')) return { keyRoot: 'A', mode: 'minor' }
  return { keyRoot: 'C', mode: 'major' }
}

function detectStyle(normalized: string): PromptStyleTag {
  if (normalized.includes('mozart')) return 'mozart'
  if (normalized.includes('classical')) return 'classical'
  if (normalized.includes('folk')) return 'folk'
  if (normalized.includes('country')) return 'country'
  if (normalized.includes('march')) return 'march'
  if (normalized.includes('jazz')) return 'jazz'
  if (normalized.includes('pop')) return 'pop'
  if (normalized.includes('beginner') || normalized.includes('easy')) return 'beginner'
  return 'unknown'
}

function detectInstrument(normalized: string): PromptInstrument {
  if (normalized.includes('piano')) return 'piano'
  if (normalized.includes('violin')) return 'violin'
  if (normalized.includes('flute')) return 'flute'
  if (normalized.includes('clarinet')) return 'clarinet'
  if (normalized.includes('trumpet')) return 'trumpet'
  if (normalized.includes('snare')) return 'snare drum'
  if (normalized.includes('marimba') || normalized.includes('xylophone') || normalized.includes('bells')) return 'mallets'
  if (normalized.includes('melody')) return 'melody'
  return 'unknown'
}

function detectDensity(normalized: string): PromptDensity {
  if (normalized.includes('simple') || normalized.includes('easy') || normalized.includes('beginner')) return 'simple'
  if (normalized.includes('busy') || normalized.includes('fast') || normalized.includes('virtuosic')) return 'busy'
  return 'moderate'
}

function scoreConfidence(intent: Omit<PromptIntent, 'confidence' | 'summary'>): number {
  let score = 0.35
  if (intent.task !== 'unknown') score += 0.15
  if (KEY_ROOTS.includes(intent.keyRoot)) score += 0.15
  if (intent.measureCount !== 4) score += 0.1
  if (intent.style !== 'unknown') score += 0.1
  if (intent.instrument !== 'unknown') score += 0.05
  return Math.min(0.95, score)
}

function buildSummary(intent: Omit<PromptIntent, 'confidence' | 'summary'>): string {
  const style = intent.style === 'unknown' ? 'general' : intent.style
  const instrument = intent.instrument === 'unknown' ? 'melody line' : intent.instrument
  return `Parsed ${intent.measureCount} measure ${intent.mode} ${intent.task} in ${intent.keyRoot} ${intent.mode}, style: ${style}, instrument: ${instrument}, density: ${intent.density}.`
}

export function parsePromptIntent(prompt: string): PromptIntent {
  const normalized = normalizePrompt(prompt)
  const { keyRoot, mode } = detectKey(normalized)
  const base = {
    task: detectTask(normalized),
    measureCount: detectMeasureCount(normalized),
    keyRoot,
    mode,
    style: detectStyle(normalized),
    instrument: detectInstrument(normalized),
    density: detectDensity(normalized),
    rawPrompt: prompt,
  }

  return {
    ...base,
    confidence: scoreConfidence(base),
    summary: buildSummary(base),
  }
}
