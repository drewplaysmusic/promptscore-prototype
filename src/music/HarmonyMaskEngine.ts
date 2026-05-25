import { createMaskOutput, type MusicMaskOutput } from './MusicIntelligenceLayer'
import type { MusicAnalysisResult } from './MusicAnalysisEngine'

export type HarmonyChord = {
  id: string
  measure: number
  beat: number
  chordSymbol: string
  romanNumeral?: string
  harmonicFunction?: string
}

export type HarmonyMaskResult = {
  chordMasks: MusicMaskOutput[]
  romanMasks: MusicMaskOutput[]
  functionMasks: MusicMaskOutput[]
  cadenceMasks: MusicMaskOutput[]
}

function detectRomanNumeral(chordSymbol: string, keyCenter: string): string {
  const normalized = chordSymbol.toUpperCase()

  if (keyCenter === 'C') {
    if (normalized.startsWith('C')) return 'I'
    if (normalized.startsWith('DM')) return 'ii'
    if (normalized.startsWith('EM')) return 'iii'
    if (normalized.startsWith('F')) return 'IV'
    if (normalized.startsWith('G')) return 'V'
    if (normalized.startsWith('AM')) return 'vi'
    if (normalized.startsWith('B')) return 'vii°'
  }

  return '?'
}

function detectHarmonicFunction(romanNumeral: string): string {
  if (['I', 'vi'].includes(romanNumeral)) {
    return 'Tonic'
  }

  if (['ii', 'IV'].includes(romanNumeral)) {
    return 'Predominant'
  }

  if (['V', 'vii°'].includes(romanNumeral)) {
    return 'Dominant'
  }

  return 'Color / Modal'
}

export function buildHarmonyMasks({
  chords,
  analysis,
}: {
  chords: HarmonyChord[]
  analysis: MusicAnalysisResult
}): HarmonyMaskResult {
  const chordMasks: MusicMaskOutput[] = []
  const romanMasks: MusicMaskOutput[] = []
  const functionMasks: MusicMaskOutput[] = []
  const cadenceMasks: MusicMaskOutput[] = []

  chords.forEach((chord) => {
    const romanNumeral = chord.romanNumeral
      ?? detectRomanNumeral(chord.chordSymbol, analysis.estimatedKeyCenter)

    const harmonicFunction = chord.harmonicFunction
      ?? detectHarmonicFunction(romanNumeral)

    chordMasks.push(createMaskOutput({
      brainId: 'harmony',
      type: 'text-overlay',
      label: 'Chord',
      value: chord.chordSymbol,
      anchor: {
        measure: chord.measure,
        beat: chord.beat,
      },
      priority: 1,
      visibleByDefault: true,
    }))

    romanMasks.push(createMaskOutput({
      brainId: 'theory',
      type: 'analysis-label',
      label: 'Roman Numeral',
      value: romanNumeral,
      anchor: {
        measure: chord.measure,
        beat: chord.beat,
      },
      priority: 2,
      visibleByDefault: true,
    }))

    functionMasks.push(createMaskOutput({
      brainId: 'theory',
      type: 'analysis-label',
      label: 'Function',
      value: harmonicFunction,
      anchor: {
        measure: chord.measure,
        beat: chord.beat,
      },
      priority: 2,
      visibleByDefault: true,
    }))
  })

  cadenceMasks.push(createMaskOutput({
    brainId: 'theory',
    type: 'analysis-label',
    label: 'Cadence',
    value: analysis.cadenceTendency,
    anchor: {
      measure: chords[chords.length - 1]?.measure ?? 1,
      beat: chords[chords.length - 1]?.beat ?? 1,
    },
    priority: 1,
    visibleByDefault: true,
  }))

  return {
    chordMasks,
    romanMasks,
    functionMasks,
    cadenceMasks,
  }
}

export function createMockHarmonyProgression(): HarmonyChord[] {
  return [
    {
      id: 'chord-1',
      measure: 1,
      beat: 1,
      chordSymbol: 'Cmaj7',
    },
    {
      id: 'chord-2',
      measure: 2,
      beat: 1,
      chordSymbol: 'Am7',
    },
    {
      id: 'chord-3',
      measure: 3,
      beat: 1,
      chordSymbol: 'Dm7',
    },
    {
      id: 'chord-4',
      measure: 4,
      beat: 1,
      chordSymbol: 'G7',
    },
  ]
}
