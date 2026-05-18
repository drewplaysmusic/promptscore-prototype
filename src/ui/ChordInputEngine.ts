import { romanToChordName } from './HarmonyLabelEngine'
import { getChord, parsePitchText, type ChordQuality, type PitchValue } from './PitchEngine'

export type ParsedChordInput = {
  sourceToken: string
  chordName: string
  root: PitchValue
  quality: ChordQuality
  pitches: PitchValue[]
  label: string
}

const ROMAN_TOKEN_PATTERN = /^(b?VII|vii°7|vii°|V7alt|Imaj7|iim7|ii7|IV7|Im7|V7|I|ii|iii|IV|V|vi|i|ii°|III|iv|v|VI|VII)$/

function normalizeChordToken(token: string): string {
  return token.trim().replace(/♭/g, 'b').replace(/♯/g, '#')
}

function tokenizeProgression(input: string): string[] {
  return input
    .replace(/[→>,-]/g, ' ')
    .split(/\s+/)
    .map(normalizeChordToken)
    .filter(Boolean)
}

function parseChordName(chordName: string): { rootText: string; quality: ChordQuality } | null {
  const normalized = normalizeChordToken(chordName)
  const match = normalized.match(/^([A-G](?:#|b)?)(maj7|M7|m7|min7|minor7|7|m|min|minor|dim|°|aug|\+)?$/)
  if (!match) return null

  const rootText = match[1]
  const qualityText = match[2] || ''
  let quality: ChordQuality = 'major'

  if (qualityText === 'm' || qualityText === 'min' || qualityText === 'minor') quality = 'minor'
  if (qualityText === '7') quality = 'dominant7'
  if (qualityText === 'maj7' || qualityText === 'M7') quality = 'major7'
  if (qualityText === 'm7' || qualityText === 'min7' || qualityText === 'minor7') quality = 'minor7'
  if (qualityText === 'dim' || qualityText === '°') quality = 'diminished'
  if (qualityText === 'aug' || qualityText === '+') quality = 'augmented'

  return { rootText, quality }
}

export function parseChordProgressionInput(input: string, keySignature: string, octave = 4): ParsedChordInput[] {
  return tokenizeProgression(input).map((token) => {
    const chordName = ROMAN_TOKEN_PATTERN.test(token) ? romanToChordName(token, keySignature) : token
    const parsed = parseChordName(chordName)
    if (!parsed) return null

    const root = parsePitchText(parsed.rootText, octave)
    if (!root) return null

    const chord = getChord(root, parsed.quality)

    return {
      sourceToken: token,
      chordName,
      root,
      quality: parsed.quality,
      pitches: chord.pitches,
      label: `${chordName}${token !== chordName ? ` / ${token}` : ''}`,
    }
  }).filter((result): result is ParsedChordInput => Boolean(result))
}
