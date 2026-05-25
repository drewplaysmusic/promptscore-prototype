export type MusicalDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'

export type MusicAnalysisResult = {
  estimatedKeyCenter: string
  detectedIntervals: string[]
  rhythmDensity: number
  estimatedDifficulty: MusicalDifficulty
  contour: string
  cadenceTendency: string
  explanation: string[]
}

const NOTE_ORDER = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B']

export function estimateKeyCenter(notes: any[]): string {
  if (!notes.length) return 'C'

  const counts: Record<string, number> = {}

  notes.forEach((note) => {
    const pitch = note.pitch ?? 'C'
    counts[pitch] = (counts[pitch] ?? 0) + 1
  })

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'C'
}

export function detectIntervals(notes: any[]): string[] {
  const found = new Set<string>()

  for (let i = 1; i < notes.length; i += 1) {
    const previous = NOTE_ORDER.indexOf(notes[i - 1]?.pitch)
    const current = NOTE_ORDER.indexOf(notes[i]?.pitch)

    if (previous >= 0 && current >= 0) {
      const diff = Math.abs(current - previous)
      found.add(`${diff} semitones`)
    }
  }

  return Array.from(found)
}

export function estimateRhythmDensity(notes: any[]): number {
  if (!notes.length) return 0

  return Number((notes.length / Math.max(notes.length / 4, 1)).toFixed(2))
}

export function classifyContour(notes: any[]): string {
  if (notes.length < 3) return 'static'

  let up = 0
  let down = 0

  for (let i = 1; i < notes.length; i += 1) {
    const previous = NOTE_ORDER.indexOf(notes[i - 1]?.pitch)
    const current = NOTE_ORDER.indexOf(notes[i]?.pitch)

    if (current > previous) up += 1
    if (current < previous) down += 1
  }

  if (up > down * 2) return 'ascending'
  if (down > up * 2) return 'descending'
  if (Math.abs(up - down) <= 1) return 'wave-like'

  return 'mixed'
}

export function estimateDifficulty(notes: any[], rhythmDensity: number): MusicalDifficulty {
  let score = 0

  if (notes.length > 16) score += 1
  if (notes.length > 32) score += 1
  if (rhythmDensity > 4) score += 1

  if (score <= 1) return 'Beginner'
  if (score <= 3) return 'Intermediate'
  if (score <= 4) return 'Advanced'

  return 'Professional'
}

export function detectCadenceTendency(notes: any[]): string {
  if (notes.length < 2) return 'undetermined'

  const ending = notes.slice(-2).map((note) => note.pitch)

  if (ending.includes('G') && ending.includes('C')) return 'authentic-like'
  if (ending.includes('F') && ending.includes('C')) return 'plagal-like'
  if (ending.includes('D') && ending.includes('G')) return 'half-cadence-like'

  return 'undetermined'
}

export function analyzeMusic(notes: any[]): MusicAnalysisResult {
  const estimatedKeyCenter = estimateKeyCenter(notes)
  const detectedIntervals = detectIntervals(notes)
  const rhythmDensity = estimateRhythmDensity(notes)
  const contour = classifyContour(notes)
  const estimatedDifficulty = estimateDifficulty(notes, rhythmDensity)
  const cadenceTendency = detectCadenceTendency(notes)

  return {
    estimatedKeyCenter,
    detectedIntervals,
    rhythmDensity,
    estimatedDifficulty,
    contour,
    cadenceTendency,
    explanation: [
      `Key center: ${estimatedKeyCenter}`,
      `Contour: ${contour}`,
      `Difficulty: ${estimatedDifficulty}`,
      `Cadence tendency: ${cadenceTendency}`,
    ],
  }
}
