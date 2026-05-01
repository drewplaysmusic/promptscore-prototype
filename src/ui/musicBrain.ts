import { generateHarmonyPlan, type HarmonyPlan } from './harmonyBrain'
import {
  isScaleExercisePrompt,
  generateScaleExercise,
} from './exerciseBrain'
export type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
export type KeySignatureValue = 'C major' | 'G major' | 'F major' | 'D major' | 'A minor'
type PhraseShapeValue = 'simple contour' | 'question answer' | 'motif sequence' | 'cadence focus'
type StyleValue =
  | 'plain'
  | 'baroque'
  | 'classical'
  | 'romantic'
  | 'renaissance'
  | 'jazz'
  | 'rock'
  | 'modern'
  | 'folk'
  | 'country'
type ScaleSystemValue =
  | 'major'
  | 'natural minor'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'harmonic minor'
  | 'melodic minor'
  | 'whole tone'
  | 'diminished'

type TonalCenterValue = PitchValue

type PlannedDuration = {
  duration: DurationValue
  startBeat: number
  measureIndex: number
  beatInMeasure: number
}

export type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: PitchValue
  measure: number
  beat: number
}

type BrainDefaults = {
  duration: DurationValue
  accidental: AccidentalValue
  timeSignature: TimeSignatureValue
}

export type MusicBrainResult = {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  harmony: HarmonyPlan
  summary: string
}

type ScaleTone = {
  pitch: PitchValue
  accidental: AccidentalValue
}

const CHROMATIC_SHARP_TONES: ScaleTone[] = [
  { pitch: 'C', accidental: null },
  { pitch: 'C', accidental: 'Sharp' },
  { pitch: 'D', accidental: null },
  { pitch: 'D', accidental: 'Sharp' },
  { pitch: 'E', accidental: null },
  { pitch: 'F', accidental: null },
  { pitch: 'F', accidental: 'Sharp' },
  { pitch: 'G', accidental: null },
  { pitch: 'G', accidental: 'Sharp' },
  { pitch: 'A', accidental: null },
  { pitch: 'A', accidental: 'Sharp' },
  { pitch: 'B', accidental: null },
]

const TONAL_CENTER_INDEX: Record<TonalCenterValue, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const SCALE_INTERVALS: Record<ScaleSystemValue, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'natural minor': [0, 2, 3, 5, 7, 8, 10],
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic minor': [0, 2, 3, 5, 7, 9, 11],
  'whole tone': [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
}

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/[,.;:]/g, ' ')
}

function removeScaleWordsFromRhythmParsing(prompt: string): string {
  return prompt
    .replace(/whole tone/g, '')
    .replace(/harmonic minor/g, '')
    .replace(/melodic minor/g, '')
    .replace(/natural minor/g, '')
}

function getDurationBeats(duration: DurationValue): number {
  if (duration === 'Whole') return 4
  if (duration === 'Half') return 2
  if (duration === 'Quarter') return 1
  if (duration === 'Eighth') return 0.5
  return 0.25
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function detectStyle(prompt: string): StyleValue {
  if (prompt.includes('baroque') || prompt.includes('bach')) return 'baroque'
  if (prompt.includes('classical') || prompt.includes('mozart')) return 'classical'
  if (prompt.includes('romantic') || prompt.includes('chopin')) return 'romantic'
  if (prompt.includes('renaissance')) return 'renaissance'
  if (prompt.includes('jazz')) return 'jazz'
  if (prompt.includes('rock')) return 'rock'
  if (prompt.includes('modern')) return 'modern'
  if (prompt.includes('folk') || prompt.includes('sad')) return 'folk'
  if (prompt.includes('country') || prompt.includes('western')) return 'country'
  return 'plain'
}

function detectScaleSystem(prompt: string, style: StyleValue): ScaleSystemValue {
  if (prompt.includes('harmonic minor')) return 'harmonic minor'
  if (prompt.includes('melodic minor')) return 'melodic minor'
  if (prompt.includes('whole tone')) return 'whole tone'
  if (prompt.includes('diminished')) return 'diminished'
  if (prompt.includes('ionian')) return 'ionian'
  if (prompt.includes('dorian')) return 'dorian'
  if (prompt.includes('phrygian')) return 'phrygian'
  if (prompt.includes('lydian')) return 'lydian'
  if (prompt.includes('mixolydian')) return 'mixolydian'
  if (prompt.includes('aeolian')) return 'aeolian'
  if (prompt.includes('locrian')) return 'locrian'
  if (prompt.includes('natural minor')) return 'natural minor'
  if (prompt.includes('minor') || style === 'folk') return 'natural minor'
  return 'major'
}

function detectTonalCenter(prompt: string, fallback: TonalCenterValue): TonalCenterValue {
  const directMatch = prompt.match(/\b(?:in|key of)\s+([a-g])\b/)
  const scaleMatch = prompt.match(/\b([a-g])\s+(major|minor|ionian|dorian|phrygian|lydian|mixolydian|aeolian|locrian|harmonic minor|melodic minor|whole tone|diminished)\b/)
  const match = directMatch || scaleMatch

  if (!match) return fallback
  const candidate = match[1].toUpperCase()
  if (candidate === 'C' || candidate === 'D' || candidate === 'E' || candidate === 'F' || candidate === 'G' || candidate === 'A' || candidate === 'B') {
    return candidate
  }

  return fallback
}

function getScaleTones(tonalCenter: TonalCenterValue, scaleSystem: ScaleSystemValue): ScaleTone[] {
  const rootIndex = TONAL_CENTER_INDEX[tonalCenter]
  const intervals = SCALE_INTERVALS[scaleSystem]

  return intervals.map((interval) => CHROMATIC_SHARP_TONES[(rootIndex + interval) % 12])
}

function getDisplayScaleName(tonalCenter: TonalCenterValue, scaleSystem: ScaleSystemValue): string {
  return `${tonalCenter} ${scaleSystem}`
}

function getKeySignatureForDisplay(tonalCenter: TonalCenterValue, scaleSystem: ScaleSystemValue): KeySignatureValue {
  if (scaleSystem === 'major' || scaleSystem === 'ionian') {
    if (tonalCenter === 'G') return 'G major'
    if (tonalCenter === 'F') return 'F major'
    if (tonalCenter === 'D') return 'D major'
    return 'C major'
  }

  if ((scaleSystem === 'natural minor' || scaleSystem === 'aeolian') && tonalCenter === 'A') return 'A minor'

  return 'C major'
}

function getScaleToneSemitone(scale: ScaleTone[], scaleIndex: number): number {
  const tone = scale[Math.abs(scaleIndex) % scale.length]
  const naturalIndex = TONAL_CENTER_INDEX[tone.pitch]

  if (tone.accidental === 'Sharp') return naturalIndex + 1
  if (tone.accidental === 'Flat') return naturalIndex - 1
  return naturalIndex
}

function getNearestChordScaleIndex(
  scale: ScaleTone[],
  chordScaleIndices: number[],
  previousScaleIndex: number | null,
  fallbackIndex: number,
): number {
  if (previousScaleIndex === null) return fallbackIndex

  const previousSemitone = getScaleToneSemitone(scale, previousScaleIndex)

  return chordScaleIndices.reduce((best, candidate) => {
    const bestDistance = Math.abs(getScaleToneSemitone(scale, best) - previousSemitone)
    const candidateDistance = Math.abs(getScaleToneSemitone(scale, candidate) - previousSemitone)
    return candidateDistance < bestDistance ? candidate : best
  }, chordScaleIndices[0])
}

function getPassingToneScaleIndex(
  scale: ScaleTone[],
  previousScaleIndex: number | null,
  targetScaleIndex: number,
): number {
  if (previousScaleIndex === null) return targetScaleIndex

  const previousSemitone = getScaleToneSemitone(scale, previousScaleIndex)
  const targetSemitone = getScaleToneSemitone(scale, targetScaleIndex)
  const directDistance = Math.abs(targetSemitone - previousSemitone)

  if (directDistance <= 2) return targetScaleIndex

  const scaleLength = scale.length
  const stepUp = (previousScaleIndex + 1 + scaleLength) % scaleLength
  const stepDown = (previousScaleIndex - 1 + scaleLength) % scaleLength
  const upDistance = Math.abs(getScaleToneSemitone(scale, stepUp) - targetSemitone)
  const downDistance = Math.abs(getScaleToneSemitone(scale, stepDown) - targetSemitone)

  return upDistance <= downDistance ? stepUp : stepDown
}

function getHarmonyChordScaleIndices(harmonyLabel: string): number[] | null {
  const cleaned = harmonyLabel.replace(/maj|min|m|alt|7|°/g, '')

  if (cleaned === 'none') return null
  if (cleaned === 'I' || cleaned === 'i') return [0, 2, 4]
  if (cleaned === 'ii' || cleaned === 'ii°') return [1, 3, 5]
  if (cleaned === 'iii' || cleaned === 'III') return [2, 4, 6]
  if (cleaned === 'IV' || cleaned === 'iv') return [3, 5, 0]
  if (cleaned === 'V' || cleaned === 'v') return [4, 6, 1]
  if (cleaned === 'vi' || cleaned === 'VI') return [5, 0, 2]
  if (cleaned === 'vii' || cleaned === 'VII' || cleaned === 'bVII') return [6, 1, 3]

  return null
}

function getHarmonyLabelForMeasure(harmony: HarmonyPlan, measureIndex: number): string {
  if (harmony.progression.length === 0) return 'none'
  return harmony.progression[measureIndex % harmony.progression.length]
}

function getHarmonyTargetScaleIndex(
  scale: ScaleTone[],
  harmony: HarmonyPlan,
  measureIndex: number,
  eventIndex: number,
  isCadence: boolean,
  previousScaleIndex: number | null,
): number | null {
  const label = getHarmonyLabelForMeasure(harmony, measureIndex)
  const chordIndices = getHarmonyChordScaleIndices(label)
  if (!chordIndices) return null

  if (isCadence) return getNearestChordScaleIndex(scale, chordIndices, previousScaleIndex, chordIndices[0])
  return getNearestChordScaleIndex(scale, chordIndices, previousScaleIndex, chordIndices[eventIndex % chordIndices.length])
}

function detectTimeSignature(prompt: string, fallback: TimeSignatureValue, style: StyleValue): TimeSignatureValue {
  if (prompt.includes('6/8')) return '6/8'
  if (prompt.includes('3/4')) return '3/4'
  if (prompt.includes('2/4')) return '2/4'
  if (prompt.includes('4/4')) return '4/4'
  return fallback
}

function detectDuration(prompt: string, fallback: DurationValue, style: StyleValue): DurationValue {
  const rhythmPrompt = removeScaleWordsFromRhythmParsing(prompt)

  if (rhythmPrompt.includes('sixteenth') || rhythmPrompt.includes('16th')) return '16th'
  if (rhythmPrompt.includes('eighth') || rhythmPrompt.includes('8th')) return 'Eighth'
  if (rhythmPrompt.includes('half')) return 'Half'
  if (rhythmPrompt.includes('whole')) return 'Whole'
  if (rhythmPrompt.includes('quarter')) return 'Quarter'
  if (style === 'baroque') return 'Eighth'
  if (style === 'renaissance') return 'Half'
  return fallback
}

function detectMeasureCount(prompt: string, style: StyleValue): number {
  const match = prompt.match(/(\d+)\s*(measure|measures|bar|bars)/)
  if (!match) return style === 'baroque' ? 8 : 4

  const parsed = Number(match[1])
  if (!Number.isFinite(parsed)) return 4
  return Math.min(Math.max(parsed, 1), 16)
}

function detectPhraseShape(prompt: string, style: StyleValue): PhraseShapeValue {
  if (prompt.includes('question') || prompt.includes('answer') || prompt.includes('natural phrase')) return 'question answer'
  if (prompt.includes('motif') || prompt.includes('sequence')) return 'motif sequence'
  if (prompt.includes('cadence') || prompt.includes('ending')) return 'cadence focus'
  if (style === 'baroque') return 'motif sequence'
  if (style === 'classical') return 'question answer'
  if (style === 'romantic') return 'cadence focus'
  if (style === 'renaissance') return 'simple contour'
  if (style === 'jazz') return 'motif sequence'
  if (style === 'rock') return 'question answer'
  if (style === 'modern') return 'motif sequence'
  if (style === 'folk') return 'question answer'
  if (style === 'country') return 'question answer'
  return 'simple contour'
}

function parseRhythmPattern(
  prompt: string,
  fallback: DurationValue,
  timeSignature: TimeSignatureValue,
  phraseShape: PhraseShapeValue,
  style: StyleValue,
): DurationValue[] {
  const rhythmPrompt = removeScaleWordsFromRhythmParsing(prompt)
  const tokens = rhythmPrompt.toLowerCase().split(/\s+/)
  const pattern: DurationValue[] = []

  if (rhythmPrompt.includes('advanced rhythm')) return ['Quarter', 'Eighth', 'Eighth', 'Half']
  if (rhythmPrompt.includes('syncopated')) return ['Eighth', 'Quarter', 'Eighth', 'Half']
  if (rhythmPrompt.includes('sixteenth rhythm')) return ['16th', '16th', 'Eighth', 'Quarter', 'Half']
  if (rhythmPrompt.includes('steady eighth')) return ['Eighth']
  if (rhythmPrompt.includes('all quarter') || rhythmPrompt.includes('steady quarter')) return ['Quarter']
  if (rhythmPrompt.includes('quarter quarter half')) return ['Quarter', 'Quarter', 'Half']
  if (rhythmPrompt.includes('eighth eighth quarter quarter')) return ['Eighth', 'Eighth', 'Quarter', 'Quarter']

  tokens.forEach((token) => {
    if (token.includes('whole')) pattern.push('Whole')
    else if (token.includes('half')) pattern.push('Half')
    else if (token.includes('quarter')) pattern.push('Quarter')
    else if (token.includes('eighth') || token.includes('8th')) pattern.push('Eighth')
    else if (token.includes('sixteenth') || token.includes('16th')) pattern.push('16th')
  })

  if (pattern.length > 0) return pattern

  if (style === 'baroque') return ['Eighth', 'Eighth', 'Quarter', 'Quarter', 'Half']
  if (style === 'classical') return ['Quarter', 'Eighth', 'Eighth', 'Half']
  if (style === 'romantic') return ['Quarter', 'Eighth', 'Quarter', 'Half']
  if (style === 'renaissance') return ['Half', 'Half', 'Whole']
  if (style === 'jazz') return ['Eighth', 'Quarter', 'Eighth', 'Half']
  if (style === 'rock') return ['Quarter', 'Quarter', 'Half']
  if (style === 'modern') return ['Eighth', 'Quarter', 'Eighth', 'Half']
  if (style === 'folk') return ['Quarter', 'Eighth', 'Eighth', 'Half']
  if (style === 'country') return ['Eighth', 'Eighth', 'Quarter', 'Half']

  if (timeSignature === '3/4') return ['Quarter', 'Half']
  if (timeSignature === '6/8') return ['Eighth', 'Eighth', 'Quarter']
  if (phraseShape === 'question answer') return ['Quarter', 'Quarter', 'Half']
  if (phraseShape === 'motif sequence') return ['Eighth', 'Eighth', 'Quarter', 'Half']
  if (phraseShape === 'cadence focus') return ['Quarter', 'Eighth', 'Eighth', 'Half']

  return fallback === 'Quarter' ? ['Quarter', 'Quarter', 'Half'] : [fallback]
}

function shouldUseGeneratedMelody(prompt: string, explicitEvents: Omit<NoteEvent, 'measure' | 'beat'>[]): boolean {
  if (explicitEvents.length === 0) return true
  return (
    prompt.includes('generate') ||
    prompt.includes('write') ||
    prompt.includes('make') ||
    prompt.includes('piece') ||
    prompt.includes('style') ||
    prompt.includes('melody') ||
    prompt.includes('phrase') ||
    prompt.includes('measure') ||
    prompt.includes('bar') ||
    prompt.includes('baroque') ||
    prompt.includes('bach') ||
    prompt.includes('classical') ||
    prompt.includes('mozart') ||
    prompt.includes('romantic') ||
    prompt.includes('chopin') ||
    prompt.includes('renaissance') ||
    prompt.includes('jazz') ||
    prompt.includes('rock') ||
    prompt.includes('modern') ||
    prompt.includes('folk') ||
    prompt.includes('country') ||
    prompt.includes('ionian') ||
    prompt.includes('dorian') ||
    prompt.includes('phrygian') ||
    prompt.includes('lydian') ||
    prompt.includes('mixolydian') ||
    prompt.includes('aeolian') ||
    prompt.includes('locrian') ||
    prompt.includes('harmonic minor') ||
    prompt.includes('melodic minor') ||
    prompt.includes('whole tone') ||
    prompt.includes('diminished') ||
    prompt.includes('in c') ||
    prompt.includes('in g') ||
    prompt.includes('in f') ||
    prompt.includes('in d') ||
    prompt.includes('in e') ||
    prompt.includes('in a') ||
    prompt.includes('in b')
  )
}

function isPitchToken(token: string): token is PitchValue {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(token)
}

function extractExplicitEvents(prompt: string, duration: DurationValue, accidental: AccidentalValue): Omit<NoteEvent, 'measure' | 'beat'>[] {
  const tokens = prompt.toUpperCase().split(/\s+/).filter(Boolean)
  const events: Omit<NoteEvent, 'measure' | 'beat'>[] = []
  let activeAccidental = accidental
  let activeDuration = duration

  tokens.forEach((token, index) => {
    const previousToken = tokens[index - 1]
    if (previousToken === 'IN' || previousToken === 'KEY') return

    if (token === 'SHARP' || token === '#') {
      activeAccidental = 'Sharp'
      return
    }

    if (token === 'FLAT' || token === 'B_FLAT') {
      activeAccidental = 'Flat'
      return
    }

    if (token === 'NATURAL') {
      activeAccidental = 'Natural'
      return
    }

    if (token === 'WHOLE') {
      activeDuration = 'Whole'
      return
    }

    if (token === 'HALF') {
      activeDuration = 'Half'
      return
    }

    if (token === 'QUARTER') {
      activeDuration = 'Quarter'
      return
    }

    if (token === 'EIGHTH' || token === '8TH') {
      activeDuration = 'Eighth'
      return
    }

    if (token === 'SIXTEENTH' || token === '16TH') {
      activeDuration = '16th'
      return
    }

    if (token === 'REST' || token === 'R') {
      events.push({ duration: activeDuration, accidental: null, isRest: true, pitch: 'B' })
      return
    }

    const cleanedPitch = token.replace(/[^A-G]/g, '')
    if (isPitchToken(cleanedPitch)) {
      let eventAccidental = activeAccidental
      if (token.includes('#')) eventAccidental = 'Sharp'
      if (token.includes('B') && token.length > 1) eventAccidental = 'Flat'

      events.push({
        duration: activeDuration,
        accidental: eventAccidental,
        isRest: false,
        pitch: cleanedPitch,
      })
    }
  })

  return events
}

function getPhraseScaleIndex(eventIndex: number, totalEvents: number, phraseShape: PhraseShapeValue, style: StyleValue): number {
  const progress = totalEvents <= 1 ? 1 : eventIndex / (totalEvents - 1)
  const simpleContour = [0, 1, 2, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 0]
  const questionAnswerContour = [0, 1, 2, 4, 3, 2, 4, 5, 4, 2, 1, 0]
  const motifSequenceContour = [0, 2, 4, 2, 1, 3, 5, 3, 2, 4, 3, 1, 0]
  const baroqueContour = [0, 2, 4, 5, 4, 2, 1, 3, 5, 6, 5, 3, 2, 4, 3, 1, 0]
  const classicalContour = [0, 1, 2, 4, 3, 2, 1, 0]
  const romanticContour = [0, 2, 4, 5, 3, 4, 2, 1, 0]
  const renaissanceContour = [0, 1, 2, 1, 0, 2, 3, 2, 1, 0]
  const jazzContour = [0, 2, 4, 5, 3, 4, 6, 5, 3, 2, 0]
  const rockContour = [0, 2, 4, 2, 0, 4, 3, 2, 0]
  const modernContour = [0, 3, 1, 5, 2, 6, 4, 1, 0]
  const folkContour = [0, 2, 1, 0, 3, 2, 1, 0, 4, 3, 2, 0]
  const countryContour = [0, 2, 4, 2, 0, 2, 3, 2, 0, 1, 2, 0]

  if (progress > 0.92) return 0

  if (style === 'baroque') return baroqueContour[eventIndex % baroqueContour.length]
  if (style === 'classical') return classicalContour[eventIndex % classicalContour.length]
  if (style === 'romantic') return romanticContour[eventIndex % romanticContour.length]
  if (style === 'renaissance') return renaissanceContour[eventIndex % renaissanceContour.length]
  if (style === 'jazz') return jazzContour[eventIndex % jazzContour.length]
  if (style === 'rock') return rockContour[eventIndex % rockContour.length]
  if (style === 'modern') return modernContour[eventIndex % modernContour.length]
  if (style === 'folk') return folkContour[eventIndex % folkContour.length]
  if (style === 'country') return countryContour[eventIndex % countryContour.length]

  if (phraseShape === 'cadence focus') {
    if (progress > 0.75) return progress > 0.88 ? 0 : 4
    return simpleContour[eventIndex % simpleContour.length]
  }

  if (phraseShape === 'question answer') {
    const midpoint = Math.floor(totalEvents / 2)
    if (eventIndex === midpoint - 1) return 4
    if (eventIndex >= midpoint && progress > 0.82) return progress > 0.92 ? 0 : 1
    return questionAnswerContour[eventIndex % questionAnswerContour.length]
  }

  if (phraseShape === 'motif sequence') return motifSequenceContour[eventIndex % motifSequenceContour.length]

  return simpleContour[eventIndex % simpleContour.length]
}

function buildBeginnerMelodyEvents(
  prompt: string,
  scale: ScaleTone[],
  duration: DurationValue,
  timeSignature: TimeSignatureValue,
  measureCount: number,
  rhythmPattern: DurationValue[],
  phraseShape: PhraseShapeValue,
  style: StyleValue,
  harmony: HarmonyPlan,
): Omit<NoteEvent, 'measure' | 'beat'>[] {
  const measureBeats = getMeasureBeats(timeSignature)
  const totalBeats = measureCount * measureBeats
  const includeRests = prompt.includes('rest') || prompt.includes('space')
  const events: Omit<NoteEvent, 'measure' | 'beat'>[] = []
  let usedBeats = 0
  let eventIndex = 0
  let previousScaleIndex: number | null = null
  const plannedDurations: PlannedDuration[] = []

  while (usedBeats < totalBeats) {
    const patternDuration = rhythmPattern[plannedDurations.length % rhythmPattern.length] || duration
    const durationBeats = getDurationBeats(patternDuration)
    if (usedBeats + durationBeats > totalBeats) break

    plannedDurations.push({
      duration: patternDuration,
      startBeat: usedBeats,
      measureIndex: Math.floor(usedBeats / measureBeats),
      beatInMeasure: (usedBeats % measureBeats) + 1,
    })
    usedBeats += durationBeats
  }

  plannedDurations.forEach((plannedDuration, i) => {
    const isLast = i === plannedDurations.length - 1
    const shouldRest = includeRests && !isLast && i > 0 && i % 7 === 0

    if (shouldRest) {
      events.push({ duration: plannedDuration.duration, accidental: null, isRest: true, pitch: 'B' })
      eventIndex += 1
      return
    }

    const contourScaleIndex = isLast ? 0 : getPhraseScaleIndex(eventIndex, plannedDurations.length, phraseShape, style)
    const isStrongBeat = Math.abs(plannedDuration.beatInMeasure - 1) < 0.001
    const harmonyScaleIndex = isStrongBeat || isLast
      ? getHarmonyTargetScaleIndex(scale, harmony, plannedDuration.measureIndex, eventIndex, isLast, previousScaleIndex)
      : null
    const scaleIndex = harmonyScaleIndex ?? getPassingToneScaleIndex(scale, previousScaleIndex, contourScaleIndex)
    const scaleTone = scale[Math.abs(scaleIndex) % scale.length]

    events.push({
      duration: plannedDuration.duration,
      accidental: scaleTone.accidental,
      isRest: false,
      pitch: scaleTone.pitch,
    })

    previousScaleIndex = scaleIndex
    eventIndex += 1
  })

  return events
}

function placeEventAtCursor(event: Omit<NoteEvent, 'measure' | 'beat'>, cursor: { measure: number; beat: number }, timeSignature: TimeSignatureValue): { note: NoteEvent; nextMeasure: number; nextBeat: number } {
  const measureBeats = getMeasureBeats(timeSignature)
  const durationBeats = getDurationBeats(event.duration)
  let measure = cursor.measure
  let beat = cursor.beat

  if (beat + durationBeats > measureBeats + 1) {
    measure += 1
    beat = 1
  }

  const note: NoteEvent = {
    ...event,
    measure,
    beat,
  }

  const nextBeat = beat + durationBeats

  if (nextBeat >= measureBeats + 1) return { note, nextMeasure: measure + 1, nextBeat: 1 }
  return { note, nextMeasure: measure, nextBeat }
}

export function generateMusicBrainResult(promptText: string, defaults: BrainDefaults): MusicBrainResult {
  if (isScaleExercisePrompt(promptText)) {
    const exercise = generateScaleExercise(promptText)

    return {
      notes: exercise.notes,
      timeSignature: exercise.timeSignature,
      keySignature: 'C major',
      harmony: {
        progression: [],
        label: 'exercise',
        description: 'Scale exercise mode.',
      },
      summary: exercise.summary,
    }
  }
  const normalizedPrompt = normalizePrompt(promptText)
  const style = detectStyle(normalizedPrompt)
  const scaleSystem = detectScaleSystem(normalizedPrompt, style)
  const tonalCenter = detectTonalCenter(normalizedPrompt, style === 'folk' ? 'A' : 'C')
  const displayScaleName = getDisplayScaleName(tonalCenter, scaleSystem)
  const scale = getScaleTones(tonalCenter, scaleSystem)
  const harmony = generateHarmonyPlan(promptText, style, scaleSystem)
  const timeSignature = detectTimeSignature(normalizedPrompt, defaults.timeSignature, style)
  const duration = detectDuration(normalizedPrompt, defaults.duration, style)
  const keySignature = getKeySignatureForDisplay(tonalCenter, scaleSystem)
  const measureCount = detectMeasureCount(normalizedPrompt, style)
  const phraseShape = detectPhraseShape(normalizedPrompt, style)
  const rhythmPattern = parseRhythmPattern(normalizedPrompt, duration, timeSignature, phraseShape, style)
  const explicitEvents = extractExplicitEvents(promptText, duration, defaults.accidental)
  const shouldGenerateMelody = shouldUseGeneratedMelody(normalizedPrompt, explicitEvents)
  const sourceEvents = shouldGenerateMelody
    ? buildBeginnerMelodyEvents(normalizedPrompt, scale, duration, timeSignature, measureCount, rhythmPattern, phraseShape, style, harmony)
    : explicitEvents

  const notes: NoteEvent[] = []
  let measure = 1
  let beat = 1

  sourceEvents.forEach((event) => {
    const placed = placeEventAtCursor(event, { measure, beat }, timeSignature)
    notes.push(placed.note)
    measure = placed.nextMeasure
    beat = placed.nextBeat
  })

  return {
    notes,
    timeSignature,
    keySignature,
    harmony,
    summary: `Generated ${notes.length} events across ${measureCount} measure(s) in ${displayScaleName}, ${timeSignature}, ${style} style, using ${phraseShape} phrase shape and rhythm pattern: ${rhythmPattern.join(' → ')}. Harmony: ${harmony.progression.join(' → ')} (${harmony.label}). Strong beats target nearest chord tones; weak beats now use passing tones toward the next contour target.`,
  }
}