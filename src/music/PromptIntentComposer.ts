import { fillMeasuresWithPattern } from './MeasureFillEngine'
import { parsePromptIntent } from './PromptIntentEngine'
import { getStylePlan, getStyleScaleDegree } from './StyleEngine'
import { generateHarmonyPlan, type HarmonyPlan, type RomanNumeral } from './harmonyBrain'
import { chooseChordAwareScaleDegree, getChordToneSet } from './HarmonyTheoryEngine'
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
  harmony: HarmonyPlan
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

function getScaleModeLabel(mode: 'major' | 'minor'): string {
  return mode === 'minor' ? 'natural minor' : 'major'
}

function countPlannedEvents(measurePlans: ReturnType<typeof fillMeasuresWithPattern>): number {
  return measurePlans.reduce((total, measure) => total + measure.length, 0)
}

function getHarmonyForMeasure(harmony: HarmonyPlan, measureIndex: number): RomanNumeral {
  if (harmony.progression.length === 0) return 'I'
  const numeral = harmony.progression[measureIndex % harmony.progression.length]
  return numeral === 'none' ? 'I' : numeral
}

export function generatePromptIntentScore(prompt: string, defaults: ComposerDefaults): ComposerResult {
  const intent = parsePromptIntent(prompt)
  const timeSignature = defaults.timeSignature || '4/4'
  const keySignature = getKeySignature(intent.keyRoot, intent.mode)
  const scale = getScale(intent.keyRoot, intent.mode)
  const stylePlan = getStylePlan(intent.style, intent.density)
  const harmony = generateHarmonyPlan(prompt, intent.style === 'mozart' ? 'classical' : intent.style, getScaleModeLabel(intent.mode))
  const measurePlans = fillMeasuresWithPattern(intent.measureCount, stylePlan.rhythmPattern, timeSignature)
  const totalEvents = countPlannedEvents(measurePlans)
  const notes: NoteEvent[] = []
  let eventIndex = 0

  measurePlans.forEach((measurePlan, measureIndex) => {
    const romanNumeral = getHarmonyForMeasure(harmony, measureIndex)
    const chordToneSet = getChordToneSet(intent.keyRoot, getScaleModeLabel(intent.mode), romanNumeral, 4)

    measurePlan.forEach((plannedEvent, eventInMeasureIndex) => {
      const contourDegree = getStyleScaleDegree(
        stylePlan,
        eventIndex,
        totalEvents,
        measureIndex,
        measurePlans.length,
      )
      const isCadencePoint = eventInMeasureIndex === measurePlan.length - 1
      const scaleDegree = chooseChordAwareScaleDegree(contourDegree, chordToneSet, eventIndex, isCadencePoint)
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
    harmony,
    summary: `${intent.summary} Harmony: ${harmony.progression.join(' → ')}. StyleEngine: ${stylePlan.summary}. Generated ${notes.length} note events across ${intent.measureCount} exactly filled measures.`,
  }
}
