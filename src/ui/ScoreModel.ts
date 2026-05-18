import type { AccidentalValue, NoteEvent, TimeSignatureValue, KeySignatureValue } from './musicBrain'

export type ScoreVoiceType = 'melody' | 'accompaniment' | 'bass' | 'percussion'

export type ScoreVoiceEvent = NoteEvent & {
  voiceId: string
  voiceType: ScoreVoiceType
  layer?: number
}

export type ScoreVoice = {
  id: string
  type: ScoreVoiceType
  name: string
  events: ScoreVoiceEvent[]
}

export type ScoreMeasure = {
  measureNumber: number
  voices: ScoreVoice[]
}

export type ScoreSystem = {
  systemNumber: number
  measures: ScoreMeasure[]
}

export type ScoreDocument = {
  title?: string
  keySignature: KeySignatureValue
  timeSignature: TimeSignatureValue
  systems: ScoreSystem[]
}

function inferVoiceType(note: NoteEvent): ScoreVoiceType {
  const octave = (note as NoteEvent & { octave?: number }).octave ?? 4
  const chordPitches = (note as NoteEvent & { chordPitches?: unknown[] }).chordPitches

  if (chordPitches && chordPitches.length > 1) {
    if (octave <= 3) return 'accompaniment'
  }

  if (octave <= 2) return 'bass'
  return 'melody'
}

export function buildScoreDocument(notes: NoteEvent[], timeSignature: TimeSignatureValue, keySignature: KeySignatureValue): ScoreDocument {
  const measures = new Map<number, ScoreMeasure>()

  notes.forEach((note) => {
    const measureNumber = note.measure

    if (!measures.has(measureNumber)) {
      measures.set(measureNumber, {
        measureNumber,
        voices: [],
      })
    }

    const measure = measures.get(measureNumber)!
    const voiceType = inferVoiceType(note)
    const voiceId = `${voiceType}-voice`

    let voice = measure.voices.find((candidate) => candidate.id === voiceId)

    if (!voice) {
      voice = {
        id: voiceId,
        type: voiceType,
        name: voiceType.charAt(0).toUpperCase() + voiceType.slice(1),
        events: [],
      }

      measure.voices.push(voice)
    }

    voice.events.push({
      ...note,
      voiceId,
      voiceType,
    })
  })

  const sortedMeasures = [...measures.values()].sort((a, b) => a.measureNumber - b.measureNumber)

  const systems: ScoreSystem[] = []
  const measuresPerSystem = 3

  for (let index = 0; index < sortedMeasures.length; index += measuresPerSystem) {
    systems.push({
      systemNumber: Math.floor(index / measuresPerSystem) + 1,
      measures: sortedMeasures.slice(index, index + measuresPerSystem),
    })
  }

  return {
    title: 'Untitled PromptScore Document',
    keySignature,
    timeSignature,
    systems,
  }
}

export function flattenScoreDocument(score: ScoreDocument): ScoreVoiceEvent[] {
  return score.systems
    .flatMap((system) => system.measures)
    .flatMap((measure) => measure.voices)
    .flatMap((voice) => voice.events)
    .sort((a, b) => {
      const octaveA = (a as NoteEvent & { octave?: number }).octave ?? 4
      const octaveB = (b as NoteEvent & { octave?: number }).octave ?? 4

      return (
        (a.measure - b.measure) ||
        (a.beat - b.beat) ||
        (octaveA - octaveB)
      )
    })
}
