import { parsePromptIntent } from './PromptIntentEngine'
import type { AccidentalValue, DurationValue, KeySignatureValue, NoteEvent, TimeSignatureValue } from './musicBrain'

type ComposerDefaults = {
  duration: DurationValue
  accidental: AccidentalValue
  timeSignature: TimeSignatureValue
}

type ComposerResult = {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  summary: string
}

type ScaleTone = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
  octave: number
}

const MAJOR_SCALES: Record<string, ScaleTone[]> = {
  C: [
    { pitch: 'C', accidental: null, octave: 4 },
    { pitch: 'D', accidental: null, octave: 4 },
    { pitch: 'E', accidental: null, octave: 4 },
    { pitch: 'F', accidental: null, octave: 4 },
    { pitch: 'G', accidental: null, octave: 4 },
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: null, octave: 4 },
    { pitch: 'C', accidental: null, octave: 5 },
  ],
  G: [
    { pitch: 'G', accidental: null, octave: 4 },
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: null, octave: 4 },
    { pitch: 'C', accidental: null, octave: 5 },
    { pitch: 'D', accidental: null, octave: 5 },
    { pitch: 'E', accidental: null, octave: 5 },
    { pitch: 'F', accidental: 'Sharp', octave: 5 },
    { pitch: 'G', accidental: null, octave: 5 },
  ],
  D: [
    { pitch: 'D', accidental: null, octave: 4 },
    { pitch: 'E', accidental: null, octave: 4 },
    { pitch: 'F', accidental: 'Sharp', octave: 4 },
    { pitch: 'G', accidental: null, octave: 4 },
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: null, octave: 4 },
    { pitch: 'C', accidental: 'Sharp', octave: 5 },
    { pitch: 'D', accidental: null, octave: 5 },
  ],
  F: [
    { pitch: 'F', accidental: null, octave: 4 },
    { pitch: 'G', accidental: null, octave: 4 },
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: 'Flat', octave: 4 },
    { pitch: 'C', accidental: null, octave: 5 },
    { pitch: 'D', accidental: null, octave: 5 },
    { pitch: 'E', accidental: null, octave: 5 },
    { pitch: 'F', accidental: null, octave: 5 },
  ],
}

const MINOR_SCALES: Record<string, ScaleTone[]> = {
  A: [
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: null, octave: 4 },
    { pitch: 'C', accidental: null, octave: 5 },
    { pitch: 'D', accidental: null, octave: 5 },
    { pitch: 'E', accidental: null, octave: 5 },
    { pitch: 'F', accidental: null, octave: 5 },
    { pitch: 'G', accidental: null, octave: 5 },
    { pitch: 'A', accidental: null, octave: 5 },
  ],
  E: [
    { pitch: 'E', accidental: null, octave: 4 },
    { pitch: 'F', accidental: 'Sharp', octave: 4 },
    { pitch: 'G', accidental: null, octave: 4 },
    { pitch: 'A', accidental: null, octave: 4 },
    { pitch: 'B', accidental: null, octave: 4 },
    { pitch: 'C', accidental: null, octave: 5 },
    { pitch: 'D', accidental: null, octave: 5 },
    { pitch: 'E', accidental: null, octave: 5 },
  ],
}

function getKeySignature(keyRoot: string, mode: 'major' | 'minor'): KeySignatureValue {
  const candidate = `${keyRoot} ${mode}` as KeySignatureValue
  return candidate
}

function getScale(keyRoot: string, mode: 'major' | 'minor'): ScaleTone[] {
  if (mode === 'minor') return MINOR_SCALES[keyRoot] ?? MINOR_SCALES.A
  return MAJOR_SCALES[keyRoot] ?? MAJOR_SCALES.C
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getDurationBeats(duration: DurationValue): number {
  if (duration === 'Whole') return 4
  if (duration === 'DottedHalf') return 3
  if (duration === 'Half') return 2
  if (duration === 'DottedQuarter') return 1.5
  if (duration === 'Quarter') return 1
  if (duration === 'DottedEighth') return 0.75
  if (duration === 'Eighth') return 0.5
  if (duration === 'TripletEighth') return 1 / 3
  return 0.25
}

function getRhythmPattern(density: string, style: string): DurationValue[] {
  if (density === 'simple') return ['Quarter', 'Quarter', 'Half']
  if (density === 'busy') return ['Eighth', 'Eighth', 'Quarter', 'Eighth', 'Eighth', 'Quarter']
  if (style === 'mozart' || style === 'classical') return ['Quarter', 'Eighth', 'Eighth', 'Half']
  if (style === 'folk' || style === 'country') return ['Quarter', 'Eighth', 'Eighth', 'Half']
  return ['Quarter', 'Quarter', 'Half']
}

function getContour(style: string): number[] {
  if (style === 'mozart' || style === 'classical') return [0, 1, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 1, 0]
  if (style === 'folk' || style === 'country') return [0, 2, 1, 0, 3, 2, 1, 0, 4, 3, 2, 0]
  if (style === 'jazz') return [0, 2, 4, 5, 3, 4, 6, 5, 3, 2, 0]
  return [0, 1, 2, 4, 3, 2, 1, 0]
}

export function generatePromptIntentScore(prompt: string, defaults: ComposerDefaults): ComposerResult {
  const intent = parsePromptIntent(prompt)
  const timeSignature = defaults.timeSignature || '4/4'
  const keySignature = getKeySignature(intent.keyRoot, intent.mode)
  const scale = getScale(intent.keyRoot, intent.mode)
  const rhythmPattern = getRhythmPattern(intent.density, intent.style)
  const contour = getContour(intent.style)
  const notes: NoteEvent[] = []
  const measureBeats = getMeasureBeats(timeSignature)
  let contourIndex = 0

  for (let measure = 1; measure <= intent.measureCount; measure += 1) {
    let beat = 1
    let rhythmIndex = 0

    while (beat <= measureBeats + 0.001) {
      let duration = rhythmPattern[rhythmIndex % rhythmPattern.length]
      let durationBeats = getDurationBeats(duration)

      if (beat + durationBeats > measureBeats + 1.001) {
        duration = beat === measureBeats ? 'Quarter' : 'Eighth'
        durationBeats = getDurationBeats(duration)
      }

      const isFinalNote = measure === intent.measureCount && beat + durationBeats >= measureBeats + 1
      const scaleIndex = isFinalNote ? 0 : contour[contourIndex % contour.length]
      const tone = scale[scaleIndex % scale.length]

      notes.push({
        duration,
        accidental: tone.accidental,
        isRest: false,
        pitch: tone.pitch,
        octave: tone.octave,
        measure,
        beat,
      } as NoteEvent)

      beat += durationBeats
      rhythmIndex += 1
      contourIndex += 1
    }
  }

  return {
    notes,
    timeSignature,
    keySignature,
    summary: `${intent.summary} Generated ${notes.length} note events across ${intent.measureCount} measures.`,
  }
}
