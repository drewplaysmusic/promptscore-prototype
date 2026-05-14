import { fillMeasuresWithPattern } from './MeasureFillEngine'
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
  return `${keyRoot} ${mode}` as KeySignatureValue
}

function getScale(keyRoot: string, mode: 'major' | 'minor'): ScaleTone[] {
  if (mode === 'minor') return MINOR_SCALES[keyRoot] ?? MINOR_SCALES.A
  return MAJOR_SCALES[keyRoot] ?? MAJOR_SCALES.C
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
  const measurePlans = fillMeasuresWithPattern(intent.measureCount, rhythmPattern, timeSignature)
  const notes: NoteEvent[] = []
  let contourIndex = 0

  measurePlans.forEach((measurePlan, measureIndex) => {
    measurePlan.forEach((plannedEvent, eventIndex) => {
      const isFinalNote = measureIndex === measurePlans.length - 1 && eventIndex === measurePlan.length - 1
      const scaleIndex = isFinalNote ? 0 : contour[contourIndex % contour.length]
      const tone = scale[scaleIndex % scale.length]

      notes.push({
        duration: plannedEvent.duration,
        accidental: tone.accidental,
        isRest: false,
        pitch: tone.pitch,
        octave: tone.octave,
        measure: measureIndex + 1,
        beat: plannedEvent.beat,
      } as NoteEvent)

      contourIndex += 1
    })
  })

  return {
    notes,
    timeSignature,
    keySignature,
    summary: `${intent.summary} Generated ${notes.length} note events across ${intent.measureCount} exactly filled measures.`,
  }
}
