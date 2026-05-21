import { fillMeasuresWithPattern } from './MeasureFillEngine'
import { parsePromptIntent } from './PromptIntentEngine'
import { getStylePlan, getStyleScaleDegree } from './StyleEngine'
import { generateHarmonyPlan, type HarmonyPlan, type RomanNumeral } from './harmonyBrain'
import { chooseChordAwareScaleDegree, getChordToneSet, type ChordToneSet } from './HarmonyTheoryEngine'
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

type GeneratedNoteEvent = NoteEvent & {
  voiceType?: 'melody' | 'accompaniment' | 'bass' | 'percussion'
  chordPitches?: Array<{
    pitch: NoteEvent['pitch']
    accidental: AccidentalValue
    octave: number
  }>
}

type AccompanimentPattern = 'held-pad' | 'block-chords' | 'bass-chords' | 'arpeggio' | 'alberti'

const ACCOMPANIMENT_OCTAVE = 4

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

function promptHasAny(prompt: string, words: string[]): boolean {
  const normalized = prompt.toLowerCase()
  return words.some((word) => normalized.includes(word))
}

function wantsPrintedAccompaniment(prompt: string): boolean {
  return promptHasAny(prompt, [
    'piano', 'chord', 'chords', 'harmony', 'progression', 'accompaniment', 'underneath',
    'bass', 'alberti', 'arpeggio', 'arpeggiated', 'broken', 'left hand', 'two hands',
  ])
}

function getAccompanimentPattern(prompt: string): AccompanimentPattern {
  if (promptHasAny(prompt, ['alberti'])) return 'alberti'
  if (promptHasAny(prompt, ['arpeggio', 'arpeggiated', 'broken'])) return 'arpeggio'
  if (promptHasAny(prompt, ['bass movement', 'left hand', 'root movement'])) return 'bass-chords'
  if (promptHasAny(prompt, ['block', 'blocked'])) return 'block-chords'
  return 'held-pad'
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function tagAccompaniment(note: GeneratedNoteEvent): GeneratedNoteEvent {
  return { ...note, voiceType: 'accompaniment' }
}

function makeChordPitches(chordToneSet: ChordToneSet, octave = ACCOMPANIMENT_OCTAVE): GeneratedNoteEvent['chordPitches'] {
  return chordToneSet.tones.map((tone, toneIndex) => ({
    pitch: tone.pitch,
    accidental: tone.accidental,
    octave: octave + Math.floor(toneIndex / 2),
  }))
}

function makeChordEvent(chordToneSet: ChordToneSet, measure: number, beat: number, duration: NoteEvent['duration'], octave = ACCOMPANIMENT_OCTAVE): GeneratedNoteEvent {
  const root = chordToneSet.tones[0]
  return tagAccompaniment({
    duration,
    accidental: root?.accidental ?? null,
    isRest: false,
    pitch: root?.pitch ?? 'C',
    octave,
    chordPitches: makeChordPitches(chordToneSet, octave),
    measure,
    beat,
  } as GeneratedNoteEvent)
}

function makeSinglePitchEvent(chordToneSet: ChordToneSet, toneIndex: number, measure: number, beat: number, duration: NoteEvent['duration'], octave = ACCOMPANIMENT_OCTAVE): GeneratedNoteEvent {
  const tone = chordToneSet.tones[toneIndex % chordToneSet.tones.length] ?? chordToneSet.tones[0]
  return tagAccompaniment({
    duration,
    accidental: tone?.accidental ?? null,
    isRest: false,
    pitch: tone?.pitch ?? 'C',
    octave: octave + Math.floor(toneIndex / 2),
    measure,
    beat,
  } as GeneratedNoteEvent)
}

function createAccompanimentEvents(harmony: HarmonyPlan, keyRoot: string, mode: 'major' | 'minor', measureCount: number, timeSignature: TimeSignatureValue, prompt: string): GeneratedNoteEvent[] {
  if (!wantsPrintedAccompaniment(prompt)) return []

  const pattern = getAccompanimentPattern(prompt)
  const measureBeats = getMeasureBeats(timeSignature)
  const modeLabel = getScaleModeLabel(mode)
  const events: GeneratedNoteEvent[] = []

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    const measure = measureIndex + 1
    const romanNumeral = getHarmonyForMeasure(harmony, measureIndex)
    const chordToneSet = getChordToneSet(keyRoot, modeLabel, romanNumeral, ACCOMPANIMENT_OCTAVE)

    if (pattern === 'alberti') {
      const order = [0, 2, 1, 2, 0, 2, 1, 2]
      const beats = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].filter((beat) => beat < measureBeats + 1)
      beats.forEach((beat, index) => events.push(makeSinglePitchEvent(chordToneSet, order[index % order.length], measure, beat, 'Eighth', ACCOMPANIMENT_OCTAVE)))
      continue
    }

    if (pattern === 'arpeggio') {
      const beats = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].filter((beat) => beat < measureBeats + 1)
      beats.forEach((beat, index) => events.push(makeSinglePitchEvent(chordToneSet, index, measure, beat, 'Eighth', ACCOMPANIMENT_OCTAVE)))
      continue
    }

    if (pattern === 'bass-chords') {
      events.push(makeSinglePitchEvent(chordToneSet, 0, measure, 1, 'Quarter', ACCOMPANIMENT_OCTAVE))
      events.push(makeSinglePitchEvent(chordToneSet, 0, measure, 2, 'Quarter', ACCOMPANIMENT_OCTAVE))
      if (measureBeats > 2) events.push(makeChordEvent(chordToneSet, measure, 3, 'Half', ACCOMPANIMENT_OCTAVE))
      continue
    }

    if (pattern === 'block-chords') {
      events.push(makeChordEvent(chordToneSet, measure, 1, 'Quarter', ACCOMPANIMENT_OCTAVE))
      events.push(makeChordEvent(chordToneSet, measure, 2, 'Quarter', ACCOMPANIMENT_OCTAVE))
      if (measureBeats > 2) {
        events.push(makeChordEvent(chordToneSet, measure, 3, 'Quarter', ACCOMPANIMENT_OCTAVE))
        events.push(makeChordEvent(chordToneSet, measure, 4, 'Quarter', ACCOMPANIMENT_OCTAVE))
      }
      continue
    }

    events.push(makeChordEvent(chordToneSet, measure, 1, 'Whole', ACCOMPANIMENT_OCTAVE))
  }

  return events
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
  const melodyNotes: GeneratedNoteEvent[] = []
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

      melodyNotes.push({
        duration: plannedEvent.duration,
        accidental: tone.accidental,
        isRest: false,
        pitch: tone.pitch,
        octave: Math.max(5, tone.octave),
        measure: measureIndex + 1,
        beat: plannedEvent.beat,
        voiceType: 'melody',
      } as GeneratedNoteEvent)

      eventIndex += 1
    })
  })

  const accompanimentNotes = createAccompanimentEvents(harmony, intent.keyRoot, intent.mode, intent.measureCount, timeSignature, prompt)
  const notes = [...accompanimentNotes, ...melodyNotes].sort((a, b) => (a.measure - b.measure) || (a.beat - b.beat) || ((a.octave ?? 4) - (b.octave ?? 4)))

  return {
    notes: notes as NoteEvent[],
    timeSignature,
    keySignature,
    harmony,
    summary: `${intent.summary} Harmony: ${harmony.progression.join(' → ')}. StyleEngine: ${stylePlan.summary}. Generated ${melodyNotes.length} melody event(s)${accompanimentNotes.length > 0 ? ` and ${accompanimentNotes.length} accompaniment event(s)` : ''} across ${intent.measureCount} exactly filled measures.`,
  }
}
