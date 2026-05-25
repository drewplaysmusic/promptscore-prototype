import type { AccidentalValue, NoteEvent, TimeSignatureValue } from './musicBrain'

export type RhythmDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type RhythmExerciseLength = 4 | 8 | 16
export type RhythmOptionKey = 'quarters' | 'eighths' | 'rests' | 'triplets' | 'dotted' | 'sixteenths'

export type RhythmOptions = Record<RhythmOptionKey, boolean>

export type RhythmExerciseSettings = {
  difficulty: RhythmDifficulty
  measureCount: RhythmExerciseLength
  timeSignature: TimeSignatureValue
  allowed: RhythmOptions
}

export type RhythmExercise = {
  id: string
  title: string
  notes: NoteEvent[]
  countsByMeasure: Record<number, string[]>
  summary: string
}

type RhythmToken = {
  duration: NoteEvent['duration']
  isRest?: boolean
  countLabel: string
}

type GeneratedRhythmNote = NoteEvent & {
  tupletGroupId?: string
  ratioLabel?: string
  beamGroupId?: string
  bracketGroupId?: string
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getDurationBeats(duration: NoteEvent['duration']): number {
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

function defaultOptionsForDifficulty(difficulty: RhythmDifficulty): RhythmOptions {
  if (difficulty === 'beginner') {
    return { quarters: true, eighths: true, rests: false, triplets: false, dotted: false, sixteenths: false }
  }
  if (difficulty === 'intermediate') {
    return { quarters: true, eighths: true, rests: true, triplets: true, dotted: true, sixteenths: false }
  }
  return { quarters: true, eighths: true, rests: true, triplets: true, dotted: true, sixteenths: true }
}

export function getDefaultRhythmOptions(difficulty: RhythmDifficulty): RhythmOptions {
  return defaultOptionsForDifficulty(difficulty)
}

function getBeatLabel(beat: number): string {
  return `${Math.floor(beat)}`
}

function getEighthLabels(beat: number): string[] {
  return [`${Math.floor(beat)}`, '+']
}

function getTripletLabels(beat: number): string[] {
  return [`${Math.floor(beat)}`, 'trip', 'let']
}

function getSixteenthLabels(beat: number): string[] {
  return [`${Math.floor(beat)}`, 'e', '+', 'a']
}

function getTokenLibrary(settings: RhythmExerciseSettings, beat: number): RhythmToken[][] {
  const library: RhythmToken[][] = []
  const allowed = settings.allowed

  if (allowed.quarters) library.push([{ duration: 'Quarter', countLabel: getBeatLabel(beat) }])
  if (allowed.eighths) library.push(getEighthLabels(beat).map((countLabel) => ({ duration: 'Eighth', countLabel })))
  if (allowed.triplets) library.push(getTripletLabels(beat).map((countLabel) => ({ duration: 'TripletEighth', countLabel })))
  if (allowed.sixteenths) library.push(getSixteenthLabels(beat).map((countLabel) => ({ duration: '16th', countLabel })))
  if (allowed.dotted && beat + 1.5 <= getMeasureBeats(settings.timeSignature) + 1) {
    library.push([{ duration: 'DottedQuarter', countLabel: getBeatLabel(beat) }, { duration: 'Eighth', countLabel: '+' }])
  }
  if (allowed.rests) library.push([{ duration: 'Quarter', isRest: true, countLabel: getBeatLabel(beat) }])

  return library.length > 0 ? library : [[{ duration: 'Quarter', countLabel: getBeatLabel(beat) }]]
}

function choosePattern(settings: RhythmExerciseSettings, measure: number, beat: number): RhythmToken[] {
  const library = getTokenLibrary(settings, beat)
  const offset = settings.difficulty === 'beginner' ? measure + Math.floor(beat) : measure * 3 + Math.floor(beat) * 2
  return library[offset % library.length]
}

function createNote(token: RhythmToken, measure: number, beat: number): GeneratedRhythmNote {
  return {
    duration: token.duration,
    accidental: null as AccidentalValue,
    isRest: Boolean(token.isRest),
    pitch: 'B',
    octave: 4,
    measure,
    beat,
    voiceType: 'melody',
  } as GeneratedRhythmNote
}

function tagTriplets(notes: GeneratedRhythmNote[]): GeneratedRhythmNote[] {
  const counts = new Map<string, number>()
  return notes.map((note) => {
    if (note.duration !== 'TripletEighth') return note
    const beatBucket = Math.floor(note.beat)
    const key = `${note.measure}-${beatBucket}`
    const count = counts.get(key) ?? 0
    counts.set(key, count + 1)
    const groupId = `triplet-rhythm-${note.measure}-${beatBucket}-${Math.floor(count / 3)}`
    return { ...note, tupletGroupId: groupId, beamGroupId: groupId, bracketGroupId: groupId, ratioLabel: '3:2' }
  })
}

function getDifficultySummary(difficulty: RhythmDifficulty): string {
  if (difficulty === 'beginner') return 'Beginner: quarter notes and paired eighths with a steady pulse.'
  if (difficulty === 'intermediate') return 'Intermediate: rests, dotted rhythms, and triplet-ready subdivision.'
  return 'Advanced: mixed subdivisions, sixteenths, rests, and tuplets.'
}

export function generateRhythmExercise(settings: RhythmExerciseSettings): RhythmExercise {
  const measureBeats = getMeasureBeats(settings.timeSignature)
  const notes: GeneratedRhythmNote[] = []
  const countsByMeasure: Record<number, string[]> = {}

  for (let measure = 1; measure <= settings.measureCount; measure += 1) {
    let beat = 1
    countsByMeasure[measure] = []

    while (beat < measureBeats + 1 - 0.0001) {
      const pattern = choosePattern(settings, measure, beat).filter((token) => beat + getDurationBeats(token.duration) <= measureBeats + 1.0001)
      const safePattern = pattern.length > 0 ? pattern : [{ duration: 'Quarter' as const, countLabel: getBeatLabel(beat) }]

      safePattern.forEach((token) => {
        if (beat >= measureBeats + 1 - 0.0001) return
        notes.push(createNote(token, measure, beat))
        countsByMeasure[measure].push(token.countLabel)
        beat += getDurationBeats(token.duration)
      })
    }
  }

  return {
    id: `rhythm-${Date.now()}`,
    title: `${settings.difficulty[0].toUpperCase()}${settings.difficulty.slice(1)} Rhythm Exercise`,
    notes: tagTriplets(notes) as NoteEvent[],
    countsByMeasure,
    summary: `${getDifficultySummary(settings.difficulty)} ${settings.measureCount} measures in ${settings.timeSignature}.`,
  }
}
