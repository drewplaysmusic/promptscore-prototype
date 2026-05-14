import { fillMeasuresWithPattern } from './MeasureFillEngine'
import { parsePromptIntent } from './PromptIntentEngine'
import { getStylePlan, getStyleScaleDegree } from './StyleEngine'
import type { AccidentalValue, KeySignatureValue, NoteEvent, TimeSignatureValue } from './musicBrain'

type ComposerDefaults = {
  duration: NoteEvent['duration']
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

function countPlannedEvents(measurePlans: ReturnType<typeof fillMeasuresWithPattern>): number {
  return measurePlans.reduce((total, measure) => total + measure.length, 0)
}

export function generatePromptIntentScore(prompt: string, defaults: ComposerDefaults): ComposerResult {
  const intent = parsePromptIntent(prompt)
  const timeSignature = defaults.timeSignature || '4/4'
  const keySignature = getKeySignature(intent.keyRoot, intent.mode)
  const scale = getScale(intent.keyRoot, intent.mode)
  const stylePlan = getStylePlan(intent.style, intent.density)
  const measurePlans = fillMeasuresWithPattern(intent.measureCount, stylePlan.rhythmPattern, timeSignature)
  const totalEvents = countPlannedEvents(measurePlans)
  const notes: NoteEvent[] = []
  let eventIndex = 0

  measurePlans.forEach((measurePlan, measureIndex) => {
    measurePlan.forEach((plannedEvent) => {
      const scaleDegree = getStyleScaleDegree(
        stylePlan,
        eventIndex,
        totalEvents,
        measureIndex,
        measurePlans.length,
      )
      const tone = scale[Math.max(0, scaleDegree) % scale.length]

      notes.push({
        duration: plannedEvent.duration,
        accidental: tone.accidental,
        isRest: false,
        pitch: tone.pitch,
        octave: tone.octave,
        measure: measureIndex + 1,
        beat: plannedEvent.beat,
      } as NoteEvent)

      eventIndex += 1
    })
  })

  return {
    notes,
    timeSignature,
    keySignature,
    summary: `${intent.summary} StyleEngine: ${stylePlan.summary}. Generated ${notes.length} note events across ${intent.measureCount} exactly filled measures.`,
  }
}
