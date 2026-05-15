import type { AccidentalValue, NoteEvent } from './musicBrain'
import type { RomanNumeral } from './harmonyBrain'

export type ScaleModeValue =
  | 'major'
  | 'natural minor'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'harmonic minor'
  | 'melodic minor'

export type HarmonyTone = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
  octave: number
  scaleDegree: number
}

export type ChordToneSet = {
  romanNumeral: RomanNumeral
  tones: HarmonyTone[]
  preferredMelodyDegrees: number[]
  description: string
}

type PitchClassTone = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
}

const CHROMATIC_SHARP: PitchClassTone[] = [
  { pitch: 'C', accidental: null },
  { pitch: 'C', accidental: 'Sharp' },
  { pitch: 'D', accidental: null },
  { pitch: 'D', accidental: 'Sharp' },
  { pitch: 'E', accidental: null },
  { pitch: 'F', accidental: null },
  { pitch: 'F', accidental: 'Sharp' },
  { pitch: 'G', accidental: null },
  { pitch: 'G', accidental: 'Sharp' },
  { pitch: 'A', accidental: null },
  { pitch: 'A', accidental: 'Sharp' },
  { pitch: 'B', accidental: null },
]

const ROOT_INDEX: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  Bb: 10,
  Eb: 3,
  Ab: 8,
  Db: 1,
  Gb: 6,
  'F#': 6,
  'C#': 1,
}

const MODE_INTERVALS: Record<ScaleModeValue, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  ionian: [0, 2, 4, 5, 7, 9, 11],
  'natural minor': [0, 2, 3, 5, 7, 8, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic minor': [0, 2, 3, 5, 7, 9, 11],
}

const ROMAN_TO_SCALE_DEGREES: Partial<Record<RomanNumeral, number[]>> = {
  I: [0, 2, 4],
  Imaj7: [0, 2, 4, 6],
  ii: [1, 3, 5],
  ii7: [1, 3, 5, 0],
  iim7: [1, 3, 5, 0],
  iii: [2, 4, 6],
  IV: [3, 5, 0],
  IV7: [3, 5, 0, 2],
  V: [4, 6, 1],
  V7: [4, 6, 1, 3],
  V7alt: [4, 6, 1, 3],
  vi: [5, 0, 2],
  vii°: [6, 1, 3],
  vii°7: [6, 1, 3, 5],
  i: [0, 2, 4],
  Im7: [0, 2, 4, 6],
  'ii°': [1, 3, 5],
  III: [2, 4, 6],
  iv: [3, 5, 0],
  v: [4, 6, 1],
  VI: [5, 0, 2],
  VII: [6, 1, 3],
  bVII: [6, 1, 3],
}

function normalizeMode(mode: string): ScaleModeValue {
  if (mode === 'minor') return 'natural minor'
  if (mode in MODE_INTERVALS) return mode as ScaleModeValue
  return 'major'
}

function getScaleSemitone(root: string, mode: ScaleModeValue, degree: number): number {
  const rootIndex = ROOT_INDEX[root] ?? 0
  const intervals = MODE_INTERVALS[mode]
  return (rootIndex + intervals[((degree % 7) + 7) % 7] + 120) % 12
}

function toneFromSemitone(semitone: number, octave: number, scaleDegree: number): HarmonyTone {
  const tone = CHROMATIC_SHARP[((semitone % 12) + 12) % 12]
  return {
    pitch: tone.pitch,
    accidental: tone.accidental,
    octave,
    scaleDegree,
  }
}

export function getScaleTonesForMode(root: string, modeInput: string, octave = 4): HarmonyTone[] {
  const mode = normalizeMode(modeInput)
  return MODE_INTERVALS[mode].map((_, degree) => {
    const semitone = getScaleSemitone(root, mode, degree)
    const octaveOffset = degree >= 7 ? 1 : 0
    return toneFromSemitone(semitone, octave + octaveOffset, degree)
  })
}

export function getChordToneSet(root: string, modeInput: string, romanNumeral: RomanNumeral, octave = 4): ChordToneSet {
  const mode = normalizeMode(modeInput)
  const degrees = ROMAN_TO_SCALE_DEGREES[romanNumeral] ?? [0, 2, 4]
  const tones = degrees.map((degree) => {
    const semitone = getScaleSemitone(root, mode, degree)
    const octaveOffset = degree < degrees[0] ? 1 : 0
    return toneFromSemitone(semitone, octave + octaveOffset, degree)
  })

  return {
    romanNumeral,
    tones,
    preferredMelodyDegrees: degrees,
    description: `${romanNumeral} chord tones in ${root} ${mode}: ${tones.map((tone) => `${tone.pitch}${tone.accidental === 'Sharp' ? '#' : tone.accidental === 'Flat' ? 'b' : ''}${tone.octave}`).join(' · ')}`,
  }
}

export function chooseChordAwareScaleDegree(
  contourDegree: number,
  chordToneSet: ChordToneSet,
  eventIndex: number,
  isCadencePoint: boolean,
): number {
  if (isCadencePoint) return chordToneSet.preferredMelodyDegrees[0] ?? 0

  const chordDegrees = chordToneSet.preferredMelodyDegrees
  if (eventIndex % 2 === 0 && chordDegrees.length > 0) {
    return chordDegrees[eventIndex % chordDegrees.length]
  }

  return contourDegree
}
