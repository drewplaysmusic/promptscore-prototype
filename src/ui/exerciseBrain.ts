export type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'

export type ExerciseNoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: PitchValue
  measure: number
  beat: number
}

export type ScaleExerciseResult = {
  notes: ExerciseNoteEvent[]
  timeSignature: TimeSignatureValue
  summary: string
}

type ScaleSystemValue =
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
  | 'whole tone'
  | 'diminished'

type ScaleTone = {
  pitch: PitchValue
  accidental: AccidentalValue
}

const CHROMATIC_SHARP_TONES: ScaleTone[] = [
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

const TONAL_CENTER_INDEX: Record<PitchValue, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const SCALE_INTERVALS: Record<ScaleSystemValue, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'natural minor': [0, 2, 3, 5, 7, 8, 10],
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic minor': [0, 2, 3, 5, 7, 9, 11],
  'whole tone': [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
}

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/[,.;:]/g, ' ')
}

function isPitch(value: string): value is PitchValue {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(value)
}

function detectRoot(prompt: string): PitchValue {
  const direct = prompt.match(/\b([a-g])\s+(major|minor|ionian|dorian|phrygian|lydian|mixolydian|aeolian|locrian|harmonic minor|melodic minor|whole tone|diminished|scale)\b/)
  const inKey = prompt.match(/\bin\s+([a-g])\b/)
  const candidate = (direct?.[1] || inKey?.[1] || 'c').toUpperCase()
  return isPitch(candidate) ? candidate : 'C'
}

function detectScaleSystem(prompt: string): ScaleSystemValue {
  if (prompt.includes('harmonic minor')) return 'harmonic minor'
  if (prompt.includes('melodic minor')) return 'melodic minor'
  if (prompt.includes('whole tone')) return 'whole tone'
  if (prompt.includes('diminished')) return 'diminished'
  if (prompt.includes('ionian')) return 'ionian'
  if (prompt.includes('dorian')) return 'dorian'
  if (prompt.includes('phrygian')) return 'phrygian'
  if (prompt.includes('lydian')) return 'lydian'
  if (prompt.includes('mixolydian')) return 'mixolydian'
  if (prompt.includes('aeolian')) return 'aeolian'
  if (prompt.includes('locrian')) return 'locrian'
  if (prompt.includes('minor')) return 'natural minor'
  return 'major'
}

function detectDuration(prompt: string): DurationValue {
  if (prompt.includes('whole note') || prompt.includes('whole notes')) return 'Whole'
  if (prompt.includes('half note') || prompt.includes('half notes')) return 'Half'
  if (prompt.includes('sixteenth') || prompt.includes('16th')) return '16th'
  if (prompt.includes('eighth') || prompt.includes('8th')) return 'Eighth'
  return 'Quarter'
}

function getDurationBeats(duration: DurationValue): number {
  if (duration === 'Whole') return 4
  if (duration === 'Half') return 2
  if (duration === 'Quarter') return 1
  if (duration === 'Eighth') return 0.5
  return 0.25
}

function detectTimeSignature(prompt: string): TimeSignatureValue {
  if (prompt.includes('6/8')) return '6/8'
  if (prompt.includes('3/4')) return '3/4'
  if (prompt.includes('2/4')) return '2/4'
  return '4/4'
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getScale(root: PitchValue, scaleSystem: ScaleSystemValue): ScaleTone[] {
  const rootIndex = TONAL_CENTER_INDEX[root]
  return SCALE_INTERVALS[scaleSystem].map((interval) => CHROMATIC_SHARP_TONES[(rootIndex + interval) % 12])
}

function buildScalePattern(scale: ScaleTone[], prompt: string): ScaleTone[] {
  const oneOctave = prompt.includes('octave') || prompt.includes('1 octave')
  const base = oneOctave ? [...scale, scale[0]] : scale

  if (prompt.includes('thirds') || prompt.includes('3rds')) {
    const thirds: ScaleTone[] = []
    for (let index = 0; index < base.length - 2; index += 1) {
      thirds.push(base[index], base[index + 2])
    }
    return thirds
  }

  if (prompt.includes('up and down') || prompt.includes('ascending and descending')) {
    return [...base, ...base.slice(0, -1).reverse()]
  }

  if (prompt.includes('descending')) return [...base].reverse()
  return base
}

function placeNotes(pattern: ScaleTone[], duration: DurationValue, timeSignature: TimeSignatureValue): ExerciseNoteEvent[] {
  const measureBeats = getMeasureBeats(timeSignature)
  const durationBeats = getDurationBeats(duration)
  let measure = 1
  let beat = 1

  return pattern.map((tone) => {
    if (beat + durationBeats > measureBeats + 1) {
      measure += 1
      beat = 1
    }

    const note: ExerciseNoteEvent = {
      duration,
      accidental: tone.accidental,
      isRest: false,
      pitch: tone.pitch,
      measure,
      beat,
    }

    beat += durationBeats
    if (beat >= measureBeats + 1) {
      measure += 1
      beat = 1
    }

    return note
  })
}

export function isScaleExercisePrompt(promptText: string): boolean {
  const prompt = normalizePrompt(promptText)
  return prompt.includes('scale') || prompt.includes('thirds') || prompt.includes('3rds')
}

export function generateScaleExercise(promptText: string): ScaleExerciseResult {
  const prompt = normalizePrompt(promptText)
  const root = detectRoot(prompt)
  const scaleSystem = detectScaleSystem(prompt)
  const duration = detectDuration(prompt)
  const timeSignature = detectTimeSignature(prompt)
  const scale = getScale(root, scaleSystem)
  const pattern = buildScalePattern(scale, prompt)
  const notes = placeNotes(pattern, duration, timeSignature)

  return {
    notes,
    timeSignature,
    summary: `Generated ${root} ${scaleSystem} ${prompt.includes('thirds') || prompt.includes('3rds') ? 'thirds exercise' : 'scale exercise'} using ${duration.toLowerCase()} notes.`,
  }
}
