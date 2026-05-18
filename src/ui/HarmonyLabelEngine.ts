export type HarmonyMode = 'major' | 'minor'

export type ParsedKeySignature = {
  tonic: string
  mode: HarmonyMode
}

const MAJOR_SCALE_BY_KEY: Record<string, string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
}

const NATURAL_MINOR_SCALE_BY_KEY: Record<string, string[]> = {
  A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  E: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
  B: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
  F: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
  D: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
  G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
  C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
}

const ROMAN_TO_DEGREE: Record<string, number> = {
  I: 0,
  i: 0,
  ii: 1,
  'ii°': 1,
  iim7: 1,
  ii7: 1,
  iii: 2,
  III: 2,
  IV: 3,
  iv: 3,
  IV7: 3,
  V: 4,
  v: 4,
  V7: 4,
  V7alt: 4,
  vi: 5,
  VI: 5,
  'vii°': 6,
  'vii°7': 6,
  VII: 6,
  bVII: 6,
}

function normalizeAccidentals(value: string): string {
  return value.replace(/♭/g, 'b').replace(/♯/g, '#')
}

export function parseKeySignature(keySignature: string): ParsedKeySignature {
  const normalized = normalizeAccidentals(keySignature).trim()
  const parts = normalized.split(/\s+/)
  const tonic = parts[0] || 'C'
  const mode = normalized.toLowerCase().includes('minor') ? 'minor' : 'major'
  return { tonic, mode }
}

function getScaleForKey(keySignature: string): string[] {
  const parsed = parseKeySignature(keySignature)
  if (parsed.mode === 'minor') return NATURAL_MINOR_SCALE_BY_KEY[parsed.tonic] ?? NATURAL_MINOR_SCALE_BY_KEY.A
  return MAJOR_SCALE_BY_KEY[parsed.tonic] ?? MAJOR_SCALE_BY_KEY.C
}

function getQualitySuffix(romanNumeral: string): string {
  if (romanNumeral.includes('maj7')) return 'maj7'
  if (romanNumeral.includes('m7')) return 'm7'
  if (romanNumeral.includes('7')) return '7'
  if (romanNumeral.includes('°')) return 'dim'

  const cleaned = romanNumeral.replace(/[^ivIV]/g, '')
  if (cleaned.length > 0 && cleaned === cleaned.toLowerCase()) return 'm'
  return ''
}

export function romanToChordName(romanNumeral: string, keySignature: string): string {
  const normalized = normalizeAccidentals(romanNumeral).trim()
  if (!normalized || normalized === 'none') return '—'

  const scale = getScaleForKey(keySignature)
  const degree = ROMAN_TO_DEGREE[normalized]
  if (degree === undefined) return normalized

  let root = scale[degree]
  if (normalized.startsWith('b') && degree === 6) {
    root = scale[6].replace('#', '').replace('B', 'Bb')
  }

  return `${root}${getQualitySuffix(normalized)}`
}

export function buildHarmonyLabels(harmonyProgression: string[], keySignature: string): string[] {
  return harmonyProgression.map((roman) => `${romanToChordName(roman, keySignature)} / ${roman}`)
}
