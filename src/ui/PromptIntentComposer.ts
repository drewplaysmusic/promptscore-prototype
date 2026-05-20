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

type AccompanimentPattern = 'held-pad' | 'block-chords' | 'bass-chords' | 'arpeggio' | 'alberti'

const SIMPLE_SCALE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const BASS_CLEF_ROOT_OCTAVE = 3
const ACCOMPANIMENT_CHORD_OCTAVE = 3

function wantsPrintedAccompaniment(prompt: string): boolean {
  const normalized = prompt.toLowerCase()
  return (
    normalized.includes('chord') ||
    normalized.includes('harmony') ||
    normalized.includes('progression') ||
    normalized.includes('accompaniment') ||
    normalized.includes('underneath') ||
    normalized.includes('piano') ||
    normalized.includes('arpeggio') ||
    normalized.includes('broken') ||
    normalized.includes('alberti') ||
    normalized.includes('bass')
  )
}

function getAccompanimentPattern(prompt: string): AccompanimentPattern {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('alberti')) return 'alberti'
  if (normalized.includes('arpeggio') || normalized.includes('arpeggiated') || normalized.includes('broken chord') || normalized.includes('broken chords')) return 'arpeggio'
  if (normalized.includes('bass') || normalized.includes('left hand') || normalized.includes('root movement')) return 'bass-chords'
  if (normalized.includes('block') || normalized.includes('blocked')) return 'block-chords'
  return 'held-pad'
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function makeChordPitches(chord: ReturnType<typeof parseChordProgressionInput>[number], octave = ACCOMPANIMENT_CHORD_OCTAVE) {
  return chord.pitches.map((pitch, pitchIndex) => ({
    pitch: pitch.step as NoteEvent['pitch'],
    accidental: pitch.accidental as AccidentalValue,
    octave: pitchIndex === 0 ? octave : octave + Math.floor(pitchIndex / 2),
  }))
}

function makeChordEvent(chord: ReturnType<typeof parseChordProgressionInput>[number], measure: number, beat: number, duration: NoteEvent['duration'], octave = ACCOMPANIMENT_CHORD_OCTAVE): NoteEvent {
  const root = chord.root
  return {
    duration,
    accidental: root.accidental as AccidentalValue,
    isRest: false,
    pitch: root.step as NoteEvent['pitch'],
    octave,
    chordPitches: makeChordPitches(chord, octave),
    measure,
    beat,
  } as NoteEvent
}

function makeSinglePitchEvent(chord: ReturnType<typeof parseChordProgressionInput>[number], pitchIndex: number, measure: number, beat: number, duration: NoteEvent['duration'], octave = ACCOMPANIMENT_CHORD_OCTAVE): NoteEvent {
  const pitch = chord.pitches[pitchIndex % chord.pitches.length] ?? chord.root
  return {
    duration,
    accidental: pitch.accidental as AccidentalValue,
    isRest: false,
    pitch: pitch.step as NoteEvent['pitch'],
    octave: pitchIndex === 0 ? octave : octave + Math.floor(pitchIndex / 2),
    measure,
    beat,
  } as NoteEvent
}

function createAccompanimentEvents(harmonyProgression: string[], keySignature: KeySignatureValue, measureCount: number, timeSignature: TimeSignatureValue, prompt: string): NoteEvent[] {
  if (harmonyProgression.length === 0 || measureCount <= 0) return []

  const chordPlans = parseChordProgressionInput(harmonyProgression.join(' '), keySignature, ACCOMPANIMENT_CHORD_OCTAVE)
  if (chordPlans.length === 0) return []

  const pattern = getAccompanimentPattern(prompt)
  const measureBeats = getMeasureBeats(timeSignature)
  const events: NoteEvent[] = []

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    const chord = chordPlans[measureIndex % chordPlans.length]
    const measure = measureIndex + 1

    if (pattern === 'alberti') {
      const albertiOrder = [0, 2, 1, 2, 0, 2, 1, 2]
      const beats = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].filter((beat) => beat < measureBeats + 1)
      beats.forEach((beat, index) => {
        events.push(makeSinglePitchEvent(chord, albertiOrder[index % albertiOrder.length], measure, beat, 'Eighth', BASS_CLEF_ROOT_OCTAVE))
      })
      continue
    }

    if (pattern === 'arpeggio') {
      const beats = timeSignature === '6/8' ? [1, 1.5, 2, 2.5, 3, 3.5] : [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].filter((beat) => beat < measureBeats + 1)
      beats.forEach((beat, index) => {
        events.push(makeSinglePitchEvent(chord, index, measure, beat, 'Eighth', BASS_CLEF_ROOT_OCTAVE))
      })
      continue
    }

    if (pattern === 'bass-chords') {
      events.push(makeSinglePitchEvent(chord, 0, measure, 1, 'Quarter', BASS_CLEF_ROOT_OCTAVE))
      events.push(makeSinglePitchEvent(chord, 0, measure, 2, 'Quarter', BASS_CLEF_ROOT_OCTAVE))
      if (measureBeats > 2) events.push(makeChordEvent(chord, measure, 3, 'Half', ACCOMPANIMENT_CHORD_OCTAVE))
      continue
    }

    if (pattern === 'block-chords') {
      events.push(makeChordEvent(chord, measure, 1, 'Quarter', ACCOMPANIMENT_CHORD_OCTAVE))
      events.push(makeChordEvent(chord, measure, 2, 'Quarter', ACCOMPANIMENT_CHORD_OCTAVE))
      if (measureBeats > 2) {
        events.push(makeChordEvent(chord, measure, 3, 'Quarter', ACCOMPANIMENT_CHORD_OCTAVE))
        events.push(makeChordEvent(chord, measure, 4, 'Quarter', ACCOMPANIMENT_CHORD_OCTAVE))
      }
      continue
    }

    events.push(makeChordEvent(chord, measure, 1, 'Whole', ACCOMPANIMENT_CHORD_OCTAVE))
  }

  return applyRhythmGrouping(events as any, timeSignature) as NoteEvent[]
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
  const accompanimentPattern = getAccompanimentPattern(prompt)
  const accompanimentNotes = wantsPrintedAccompaniment(prompt)
    ? createAccompanimentEvents(harmony.progression ?? [], keySignature, intent.measureCount, timeSignature, prompt)
    : []

  const notes = [...accompanimentNotes, ...melodyNotes].sort((a, b) => (a.measure - b.measure) || (a.beat - b.beat) || ((a as any).octave ?? 4) - ((b as any).octave ?? 4))

  return {
    notes,
    timeSignature,
    keySignature,
    harmony,
    summary: `${intent.summary} ${rhythmIntent.summary} Harmony: ${(harmony.progression ?? []).join(' → ')}.${accompanimentNotes.length > 0 ? ` Added ${accompanimentNotes.length} ${accompanimentPattern} accompaniment event(s).` : ''}`,
  }
}
