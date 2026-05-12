export type PitchStep = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type PitchAccidental = 'Sharp' | 'Flat' | 'Natural' | null

export type PitchValue = {
  step: PitchStep
  octave: number
  accidental: PitchAccidental
}

export type KeySignatureValue =
  | 'C major' | 'G major' | 'D major' | 'A major' | 'E major' | 'B major' | 'F# major' | 'C# major'
  | 'F major' | 'Bb major' | 'Eb major' | 'Ab major' | 'Db major' | 'Gb major' | 'Cb major'
  | 'A minor' | 'E minor' | 'B minor' | 'F# minor' | 'C# minor' | 'G# minor' | 'D# minor' | 'A# minor'
  | 'D minor' | 'G minor' | 'C minor' | 'F minor' | 'Bb minor' | 'Eb minor' | 'Ab minor'

export type ScaleMode =
  | 'major'
  | 'natural minor'
  | 'harmonic minor'
  | 'melodic minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7'

export type ChordValue = {
  root: PitchValue
  quality: ChordQuality
  pitches: PitchValue[]
}

const STEP_TO_SEMITONE: Record<PitchStep, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const SEMITONE_TO_SHARP_PITCH: PitchValue[] = [
  { step: 'C', accidental: null, octave: 4 },
  { step: 'C', accidental: 'Sharp', octave: 4 },
  { step: 'D', accidental: null, octave: 4 },
  { step: 'D', accidental: 'Sharp', octave: 4 },
  { step: 'E', accidental: null, octave: 4 },
  { step: 'F', accidental: null, octave: 4 },
  { step: 'F', accidental: 'Sharp', octave: 4 },
  { step: 'G', accidental: null, octave: 4 },
  { step: 'G', accidental: 'Sharp', octave: 4 },
  { step: 'A', accidental: null, octave: 4 },
  { step: 'A', accidental: 'Sharp', octave: 4 },
  { step: 'B', accidental: null, octave: 4 },
]

const KEY_SIGNATURE_ACCIDENTALS: Record<KeySignatureValue, Partial<Record<PitchStep, PitchAccidental>>> = {
  'C major': {},
  'G major': { F: 'Sharp' },
  'D major': { F: 'Sharp', C: 'Sharp' },
  'A major': { F: 'Sharp', C: 'Sharp', G: 'Sharp' },
  'E major': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp' },
  'B major': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp' },
  'F# major': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp', E: 'Sharp' },
  'C# major': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp', E: 'Sharp', B: 'Sharp' },
  'F major': { B: 'Flat' },
  'Bb major': { B: 'Flat', E: 'Flat' },
  'Eb major': { B: 'Flat', E: 'Flat', A: 'Flat' },
  'Ab major': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat' },
  'Db major': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat' },
  'Gb major': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat', C: 'Flat' },
  'Cb major': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat', C: 'Flat', F: 'Flat' },
  'A minor': {},
  'E minor': { F: 'Sharp' },
  'B minor': { F: 'Sharp', C: 'Sharp' },
  'F# minor': { F: 'Sharp', C: 'Sharp', G: 'Sharp' },
  'C# minor': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp' },
  'G# minor': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp' },
  'D# minor': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp', E: 'Sharp' },
  'A# minor': { F: 'Sharp', C: 'Sharp', G: 'Sharp', D: 'Sharp', A: 'Sharp', E: 'Sharp', B: 'Sharp' },
  'D minor': { B: 'Flat' },
  'G minor': { B: 'Flat', E: 'Flat' },
  'C minor': { B: 'Flat', E: 'Flat', A: 'Flat' },
  'F minor': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat' },
  'Bb minor': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat' },
  'Eb minor': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat', C: 'Flat' },
  'Ab minor': { B: 'Flat', E: 'Flat', A: 'Flat', D: 'Flat', G: 'Flat', C: 'Flat', F: 'Flat' },
}

const SCALE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'natural minor': [0, 2, 3, 5, 7, 8, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic minor': [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
}

const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
}

function normalizeModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo
}

export function pitchToMidi(pitch: PitchValue): number {
  const accidentalOffset = pitch.accidental === 'Sharp' ? 1 : pitch.accidental === 'Flat' ? -1 : 0
  return (pitch.octave + 1) * 12 + STEP_TO_SEMITONE[pitch.step] + accidentalOffset
}

export function midiToPitch(midi: number): PitchValue {
  const octave = Math.floor(midi / 12) - 1
  const semitone = normalizeModulo(midi, 12)
  const pitch = SEMITONE_TO_SHARP_PITCH[semitone]
  return { ...pitch, octave }
}

export function transposePitch(pitch: PitchValue, semitones: number): PitchValue {
  return midiToPitch(pitchToMidi(pitch) + semitones)
}

export function pitchToVexKey(pitch: PitchValue): string {
  const accidental = pitch.accidental === 'Sharp' ? '#' : pitch.accidental === 'Flat' ? 'b' : ''
  return `${pitch.step.toLowerCase()}${accidental}/${pitch.octave}`
}

export function getPitchAccidentalForKey(step: PitchStep, keySignature: KeySignatureValue): PitchAccidental {
  return KEY_SIGNATURE_ACCIDENTALS[keySignature][step] ?? null
}

export function applyKeySignatureToPitch(pitch: PitchValue, keySignature: KeySignatureValue): PitchValue {
  if (pitch.accidental) return pitch
  return { ...pitch, accidental: getPitchAccidentalForKey(pitch.step, keySignature) }
}

export function parsePitchText(text: string, fallbackOctave = 4): PitchValue | null {
  const match = text.trim().match(/^([A-Ga-g])\s*(#|b|♯|♭|sharp|flat|natural)?\s*(\d+)?$/)
  if (!match) return null

  const step = match[1].toUpperCase() as PitchStep
  const accidentalText = match[2]?.toLowerCase()
  const octave = match[3] ? Number(match[3]) : fallbackOctave
  let accidental: PitchAccidental = null

  if (accidentalText === '#' || accidentalText === '♯' || accidentalText === 'sharp') accidental = 'Sharp'
  if (accidentalText === 'b' || accidentalText === '♭' || accidentalText === 'flat') accidental = 'Flat'
  if (accidentalText === 'natural') accidental = 'Natural'

  return { step, octave, accidental }
}

export function getScalePitches(root: PitchValue, mode: ScaleMode, octaveSpan = 1): PitchValue[] {
  const rootMidi = pitchToMidi(root)
  const pitches: PitchValue[] = []

  for (let octave = 0; octave < Math.max(1, octaveSpan); octave += 1) {
    SCALE_INTERVALS[mode].forEach((interval) => {
      pitches.push(midiToPitch(rootMidi + interval + octave * 12))
    })
  }

  return pitches
}

export function getChord(root: PitchValue, quality: ChordQuality): ChordValue {
  return {
    root,
    quality,
    pitches: CHORD_INTERVALS[quality].map((interval) => transposePitch(root, interval)),
  }
}

export function getChordVexKeys(chord: ChordValue): string[] {
  return chord.pitches.map(pitchToVexKey)
}

export function getNearestPitchInScale(target: PitchValue, scale: PitchValue[]): PitchValue {
  const targetMidi = pitchToMidi(target)
  return scale.reduce((best, candidate) => {
    const bestDistance = Math.abs(pitchToMidi(best) - targetMidi)
    const candidateDistance = Math.abs(pitchToMidi(candidate) - targetMidi)
    return candidateDistance < bestDistance ? candidate : best
  }, scale[0])
}

export function createMelodyContour(root: PitchValue, mode: ScaleMode, contour: number[], octaveSpan = 2): PitchValue[] {
  const scale = getScalePitches(root, mode, octaveSpan)
  return contour.map((scaleDegree) => scale[normalizeModulo(scaleDegree, scale.length)])
}

export function describePitch(pitch: PitchValue): string {
  const accidental = pitch.accidental === 'Sharp' ? '#' : pitch.accidental === 'Flat' ? 'b' : pitch.accidental === 'Natural' ? 'n' : ''
  return `${pitch.step}${accidental}${pitch.octave}`
}
