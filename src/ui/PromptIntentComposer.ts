import { fillMeasuresWithPattern } from './MeasureFillEngine'
import { parsePromptIntent } from './PromptIntentEngine'
import { getStylePlan } from './StyleEngine'
import { generateHarmonyPlan } from './harmonyBrain'
import { getRhythmIntent } from './RhythmIntentEngine'
import { applyRhythmGrouping } from './RhythmGroupingEngine'
import { parseChordProgressionInput } from './ChordInputEngine'
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

const SIMPLE_SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

function wantsPrintedAccompaniment(prompt: string): boolean {
  const normalized = prompt.toLowerCase()
  return (
    normalized.includes('chord') ||
    normalized.includes('harmony') ||
    normalized.includes('progression') ||
    normalized.includes('accompaniment') ||
    normalized.includes('underneath') ||
    normalized.includes('piano')
  )
}

function createAccompanimentEvents(harmonyProgression: string[], keySignature: KeySignatureValue, measureCount: number): NoteEvent[] {
  if (harmonyProgression.length === 0 || measureCount <= 0) return []

  const chordPlans = parseChordProgressionInput(harmonyProgression.join(' '), keySignature, 3)
  if (chordPlans.length === 0) return []

  return Array.from({ length: measureCount }).map((_, measureIndex) => {
    const chord = chordPlans[measureIndex % chordPlans.length]
    const root = chord.root
    const chordPitches = chord.pitches.map((pitch, pitchIndex) => ({
      pitch: pitch.step as NoteEvent['pitch'],
      accidental: pitch.accidental as AccidentalValue,
      octave: pitchIndex === 0 ? 3 : 3 + Math.floor(pitchIndex / 2),
    }))

    return {
      duration: 'Whole',
      accidental: root.accidental as AccidentalValue,
      isRest: false,
      pitch: root.step as NoteEvent['pitch'],
      octave: 3,
      chordPitches,
      measure: measureIndex + 1,
      beat: 1,
    } as NoteEvent
  })
}

export function generatePromptIntentScore(prompt: string, defaults: ComposerDefaults): ComposerResult {
  const intent = parsePromptIntent(prompt)
  const timeSignature = defaults.timeSignature || '4/4'
  const keySignature = `${intent.keyRoot} ${intent.mode}` as KeySignatureValue
  const stylePlan = getStylePlan(intent.style, intent.density)
  const rhythmIntent = getRhythmIntent(prompt, stylePlan.rhythmPattern)
  const harmony = generateHarmonyPlan(prompt, intent.style, intent.mode)

  const measurePlans = fillMeasuresWithPattern(intent.measureCount, rhythmIntent.rhythmPattern, timeSignature)

  const rawMelodyNotes: NoteEvent[] = []

  measurePlans.forEach((measurePlan, measureIndex) => {
    measurePlan.forEach((plannedEvent, index) => {
      const pitch = SIMPLE_SCALE[(measureIndex + index) % SIMPLE_SCALE.length] as NoteEvent['pitch']

      rawMelodyNotes.push({
        duration: plannedEvent.duration,
        accidental: null,
        isRest: false,
        pitch,
        octave: 5,
        measure: measureIndex + 1,
        beat: plannedEvent.beat,
      } as NoteEvent)
    })
  })

  const melodyNotes = applyRhythmGrouping(rawMelodyNotes as any, timeSignature) as NoteEvent[]
  const accompanimentNotes = wantsPrintedAccompaniment(prompt)
    ? createAccompanimentEvents(harmony.progression ?? [], keySignature, intent.measureCount)
    : []

  const notes = [...accompanimentNotes, ...melodyNotes].sort((a, b) => (a.measure - b.measure) || (a.beat - b.beat) || ((a as any).octave ?? 4) - ((b as any).octave ?? 4))

  return {
    notes,
    timeSignature,
    keySignature,
    harmony,
    summary: `${intent.summary} ${rhythmIntent.summary} Harmony: ${(harmony.progression ?? []).join(' → ')}.${accompanimentNotes.length > 0 ? ` Added ${accompanimentNotes.length} printed accompaniment chord event(s).` : ''}`,
  }
}
