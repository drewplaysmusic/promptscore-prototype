export type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
export type KeySignatureValue = 'C major' | 'G major' | 'F major' | 'D major' | 'A minor'
type PhraseShapeValue = 'simple contour' | 'question answer' | 'motif sequence' | 'cadence focus'
type StyleValue = 'plain' | 'bach' | 'country' | 'sad folk' | 'hymn' | 'march' | 'waltz'

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
  summary: string
}

type ScaleTone = {
  pitch: PitchValue
  accidental: AccidentalValue
}

const KEY_SCALES: Record<KeySignatureValue, ScaleTone[]> = {
  'C major': [
    { pitch: 'C', accidental: null },
    { pitch: 'D', accidental: null },
    { pitch: 'E', accidental: null },
    { pitch: 'F', accidental: null },
    { pitch: 'G', accidental: null },
    { pitch: 'A', accidental: null },
    { pitch: 'B', accidental: null },
  ],
  'G major': [
    { pitch: 'G', accidental: null },
    { pitch: 'A', accidental: null },
    { pitch: 'B', accidental: null },
    { pitch: 'C', accidental: null },
    { pitch: 'D', accidental: null },
    { pitch: 'E', accidental: null },
    { pitch: 'F', accidental: 'Sharp' },
  ],
  'F major': [
    { pitch: 'F', accidental: null },
    { pitch: 'G', accidental: null },
    { pitch: 'A', accidental: null },
    { pitch: 'B', accidental: 'Flat' },
    { pitch: 'C', accidental: null },
    { pitch: 'D', accidental: null },
    { pitch: 'E', accidental: null },
  ],
  'D major': [
    { pitch: 'D', accidental: null },
    { pitch: 'E', accidental: null },
    { pitch: 'F', accidental: 'Sharp' },
    { pitch: 'G', accidental: null },
    { pitch: 'A', accidental: null },
    { pitch: 'B', accidental: null },
    { pitch: 'C', accidental: 'Sharp' },
  ],
  'A minor': [
    { pitch: 'A', accidental: null },
    { pitch: 'B', accidental: null },
    { pitch: 'C', accidental: null },
    { pitch: 'D', accidental: null },
    { pitch: 'E', accidental: null },
    { pitch: 'F', accidental: null },
    { pitch: 'G', accidental: null },
  ],
}

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/[,.;:]/g, ' ')
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
  if (prompt.includes('bach') || prompt.includes('baroque')) return 'bach'
  if (prompt.includes('country') || prompt.includes('western')) return 'country'
  if (prompt.includes('sad') || prompt.includes('folk')) return 'sad folk'
  if (prompt.includes('hymn') || prompt.includes('chorale')) return 'hymn'
  if (prompt.includes('march')) return 'march'
  if (prompt.includes('waltz')) return 'waltz'
  return 'plain'
}

function detectTimeSignature(prompt: string, fallback: TimeSignatureValue, style: StyleValue): TimeSignatureValue {
  if (prompt.includes('6/8')) return '6/8'
  if (prompt.includes('3/4')) return '3/4'
  if (prompt.includes('2/4')) return '2/4'
  if (prompt.includes('4/4')) return '4/4'
  if (style === 'waltz') return '3/4'
  if (style === 'march') return '2/4'
  return fallback
}

function detectDuration(prompt: string, fallback: DurationValue, style: StyleValue): DurationValue {
  if (prompt.includes('sixteenth') || prompt.includes('16th')) return '16th'
  if (prompt.includes('eighth') || prompt.includes('8th')) return 'Eighth'
  if (prompt.includes('half')) return 'Half'
  if (prompt.includes('whole')) return 'Whole'
  if (prompt.includes('quarter')) return 'Quarter'
  if (style === 'bach') return 'Eighth'
  if (style === 'hymn') return 'Half'
  return fallback
}

function detectKey(prompt: string, style: StyleValue): KeySignatureValue {
  if (prompt.includes('g major') || prompt.includes('key of g') || /\bin\s+g\b/.test(prompt)) return 'G major'
  if (prompt.includes('f major') || prompt.includes('key of f') || /\bin\s+f\b/.test(prompt)) return 'F major'
  if (prompt.includes('d major') || prompt.includes('key of d') || /\bin\s+d\b/.test(prompt)) return 'D major'
  if (prompt.includes('a minor') || prompt.includes('key of a minor')) return 'A minor'
  if (style === 'sad folk') return 'A minor'
  return 'C major'
}

function detectMeasureCount(prompt: string, style: StyleValue): number {
  const match = prompt.match(/(\d+)\s*(measure|measures|bar|bars)/)
  if (!match) return style === 'bach' ? 8 : 4

  const parsed = Number(match[1])
  if (!Number.isFinite(parsed)) return 4
  return Math.min(Math.max(parsed, 1), 16)
}

function detectPhraseShape(prompt: string, style: StyleValue): PhraseShapeValue {
  if (prompt.includes('question') || prompt.includes('answer') || prompt.includes('natural phrase')) return 'question answer'
  if (prompt.includes('motif') || prompt.includes('sequence')) return 'motif sequence'
  if (prompt.includes('cadence') || prompt.includes('ending')) return 'cadence focus'
  if (style === 'bach') return 'motif sequence'
  if (style === 'country' || style === 'sad folk') return 'question answer'
  if (style === 'hymn') return 'cadence focus'
  return 'simple contour'
}

function parseRhythmPattern(
  prompt: string,
  fallback: DurationValue,
  timeSignature: TimeSignatureValue,
  phraseShape: PhraseShapeValue,
  style: StyleValue,
): DurationValue[] {
  const tokens = prompt.toLowerCase().split(/\s+/)
  const pattern: DurationValue[] = []

  if (prompt.includes('advanced rhythm')) return ['Eighth', 'Quarter', 'Eighth', 'Quarter', 'Half']
  if (prompt.includes('syncopated')) return ['Eighth', 'Quarter', 'Eighth', 'Quarter', 'Quarter']
  if (prompt.includes('sixteenth rhythm')) return ['16th', '16th', 'Eighth', 'Quarter', 'Quarter']
  if (prompt.includes('steady eighth')) return ['Eighth']
  if (prompt.includes('all quarter') || prompt.includes('steady quarter')) return ['Quarter']
  if (prompt.includes('quarter quarter half')) return ['Quarter', 'Quarter', 'Half']
  if (prompt.includes('eighth eighth quarter quarter')) return ['Eighth', 'Eighth', 'Quarter', 'Quarter']

  tokens.forEach((token) => {
    if (token.includes('whole')) pattern.push('Whole')
    else if (token.includes('half')) pattern.push('Half')
    else if (token.includes('quarter')) pattern.push('Quarter')
    else if (token.includes('eighth') || token.includes('8th')) pattern.push('Eighth')
    else if (token.includes('sixteenth') || token.includes('16th')) pattern.push('16th')
  })

  if (pattern.length > 0) return pattern

  if (style === 'bach') return ['Eighth', 'Eighth', 'Eighth', 'Eighth', 'Quarter', 'Quarter']
  if (style === 'country') return ['Eighth', 'Eighth', 'Quarter', 'Quarter', 'Half']
  if (style === 'sad folk') return ['Quarter', 'Eighth', 'Eighth', 'Half']
  if (style === 'hymn') return ['Half', 'Half', 'Whole']
  if (style === 'march') return ['Quarter', 'Eighth', 'Eighth', 'Quarter']
  if (style === 'waltz') return ['Quarter', 'Quarter', 'Quarter']

  if (timeSignature === '3/4') return ['Quarter', 'Quarter', 'Half']
  if (timeSignature === '6/8') return ['Eighth', 'Eighth', 'Eighth', 'Quarter']
  if (phraseShape === 'question answer') return ['Quarter', 'Quarter', 'Half', 'Eighth', 'Eighth', 'Quarter', 'Half']
  if (phraseShape === 'motif sequence') return ['Eighth', 'Eighth', 'Quarter', 'Quarter', 'Half']
  if (phraseShape === 'cadence focus') return ['Quarter', 'Eighth', 'Eighth', 'Quarter', 'Half']

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
    prompt.includes('bach') ||
    prompt.includes('country') ||
    prompt.includes('folk') ||
    prompt.includes('hymn') ||
    prompt.includes('waltz') ||
    prompt.includes('in c') ||
    prompt.includes('in g') ||
    prompt.includes('in f') ||
    prompt.includes('in d')
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
  const bachContour = [0, 2, 4, 5, 4, 2, 1, 3, 5, 6, 5, 3, 2, 4, 3, 1, 0]
  const countryContour = [0, 2, 4, 2, 0, 2, 3, 2, 0, 1, 2, 0]
  const sadFolkContour = [0, 2, 1, 0, 3, 2, 1, 0, 4, 3, 2, 0]
  const hymnContour = [0, 2, 4, 4, 3, 2, 1, 0]

  if (progress > 0.92) return 0

  if (style === 'bach') return bachContour[eventIndex % bachContour.length]
  if (style === 'country') return countryContour[eventIndex % countryContour.length]
  if (style === 'sad folk') return sadFolkContour[eventIndex % sadFolkContour.length]
  if (style === 'hymn') return hymnContour[eventIndex % hymnContour.length]

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
  keySignature: KeySignatureValue,
  duration: DurationValue,
  timeSignature: TimeSignatureValue,
  measureCount: number,
  rhythmPattern: DurationValue[],
  phraseShape: PhraseShapeValue,
  style: StyleValue,
): Omit<NoteEvent, 'measure' | 'beat'>[] {
  const scale = KEY_SCALES[keySignature]
  const measureBeats = getMeasureBeats(timeSignature)
  const totalBeats = measureCount * measureBeats
  const includeRests = prompt.includes('rest') || prompt.includes('space')
  const events: Omit<NoteEvent, 'measure' | 'beat'>[] = []
  let usedBeats = 0
  let eventIndex = 0
  const plannedDurations: DurationValue[] = []

  while (usedBeats < totalBeats) {
    const patternDuration = rhythmPattern[plannedDurations.length % rhythmPattern.length] || duration
    const durationBeats = getDurationBeats(patternDuration)
    if (usedBeats + durationBeats > totalBeats) break
    plannedDurations.push(patternDuration)
    usedBeats += durationBeats
  }

  plannedDurations.forEach((patternDuration, i) => {
    const isLast = i === plannedDurations.length - 1
    const shouldRest = includeRests && !isLast && i > 0 && i % 7 === 0

    if (shouldRest) {
      events.push({ duration: patternDuration, accidental: null, isRest: true, pitch: 'B' })
      eventIndex += 1
      return
    }

    const scaleIndex = isLast ? 0 : getPhraseScaleIndex(eventIndex, plannedDurations.length, phraseShape, style)
    const scaleTone = scale[Math.abs(scaleIndex) % scale.length]

    events.push({
      duration: patternDuration,
      accidental: scaleTone.accidental,
      isRest: false,
      pitch: scaleTone.pitch,
    })

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
  const normalizedPrompt = normalizePrompt(promptText)
  const style = detectStyle(normalizedPrompt)
  const timeSignature = detectTimeSignature(normalizedPrompt, defaults.timeSignature, style)
  const duration = detectDuration(normalizedPrompt, defaults.duration, style)
  const keySignature = detectKey(normalizedPrompt, style)
  const measureCount = detectMeasureCount(normalizedPrompt, style)
  const phraseShape = detectPhraseShape(normalizedPrompt, style)
  const rhythmPattern = parseRhythmPattern(normalizedPrompt, duration, timeSignature, phraseShape, style)
  const explicitEvents = extractExplicitEvents(promptText, duration, defaults.accidental)
  const shouldGenerateMelody = shouldUseGeneratedMelody(normalizedPrompt, explicitEvents)
  const sourceEvents = shouldGenerateMelody
    ? buildBeginnerMelodyEvents(normalizedPrompt, keySignature, duration, timeSignature, measureCount, rhythmPattern, phraseShape, style)
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
    summary: `Generated ${notes.length} events across ${measureCount} measure(s) in ${keySignature}, ${timeSignature}, ${style} style, using ${phraseShape} phrase shape and rhythm pattern: ${rhythmPattern.join(' → ')}.`,
  }
}
