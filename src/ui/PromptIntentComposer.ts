import { fillMeasuresWithPattern } from './MeasureFillEngine'
import { parsePromptIntent } from './PromptIntentEngine'
import { getStylePlan } from './StyleEngine'
import { generateHarmonyPlan } from './harmonyBrain'
import { getRhythmIntent } from './RhythmIntentEngine'
import { applyRhythmGrouping } from './RhythmGroupingEngine'
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
  harmony: any
  summary: string
}

const SIMPLE_SCALE = ['C','D','E','F','G','A','B'] as const

export function generatePromptIntentScore(prompt: string, defaults: ComposerDefaults): ComposerResult {
  const intent = parsePromptIntent(prompt)
  const timeSignature = defaults.timeSignature || '4/4'
  const keySignature = `${intent.keyRoot} ${intent.mode}` as KeySignatureValue
  const stylePlan = getStylePlan(intent.style, intent.density)
  const rhythmIntent = getRhythmIntent(prompt, stylePlan.rhythmPattern)
  const harmony = generateHarmonyPlan(prompt, intent.style, intent.mode)

  const measurePlans = fillMeasuresWithPattern(intent.measureCount, rhythmIntent.rhythmPattern, timeSignature)

  const rawNotes: NoteEvent[] = []

  measurePlans.forEach((measurePlan, measureIndex) => {
    measurePlan.forEach((plannedEvent, index) => {
      const pitch = SIMPLE_SCALE[(measureIndex + index) % SIMPLE_SCALE.length] as NoteEvent['pitch']

      rawNotes.push({
        duration: plannedEvent.duration,
        accidental: null,
        isRest: false,
        pitch,
        octave: 4,
        measure: measureIndex + 1,
        beat: plannedEvent.beat,
      } as NoteEvent)
    })
  })

  const notes = applyRhythmGrouping(rawNotes as any, timeSignature) as NoteEvent[]

  return {
    notes,
    timeSignature,
    keySignature,
    harmony,
    summary: `${intent.summary} ${rhythmIntent.summary}`,
  }
}
