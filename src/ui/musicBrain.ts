export type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
export type KeySignatureValue = 'C major' | 'G major' | 'F major' | 'D major' | 'A minor'

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

function detectTimeSignature(prompt: string, fallback: TimeSignatureValue): TimeSignatureValue {
  if (prompt.includes('6/8')) return '6/8'
  if (prompt.includes('3/4')) return '3/4'
  if (prompt.includes('2/4')) return '2/4'
  if (prompt.includes('4/4')) return '4/4'
  return fallback
}

function detectDuration(prompt: string, fallback: DurationValue): DurationValue {
  if (prompt.includes('sixteenth') || prompt.includes('16th')) return '16th'
  if (prompt.includes('eighth') || prompt.includes('8th')) return 'Eighth'
  if (prompt.includes('half')) return 'Half'
  if (prompt.includes('whole')) return 'Whole'
  if (prompt.includes('quarter')) return 'Quarter'
  return fallback
}

function detectKey(prompt: string): KeySignatureValue {
  if (prompt.includes('g major') || prompt.includes('key of g')) return 'G major'
  if (prompt.includes('f major') || prompt.includes('key of f')) return 'F major'
  if (prompt.includes('d major') || prompt.includes('key of d')) return 'D major'
  if (prompt.includes('a minor') || prompt.includes('key of a minor')) return 'A minor'
  return 'C major'
}

function detectMeasureCount(prompt: string): number {
  const match = prompt.match(/(\d+)\s*(measure|measures|bar|bars)/)
  if (!match) return 4

  const parsed = Number(match[1])
  if (!Number.isFinite(parsed)) return 4
  return Math.min(Math.max(parsed, 1), 16)
}

function isPitchToken(token: string): token is PitchValue {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(token)
}

function extractExplicitEvents(prompt: string, duration: DurationValue, accidental: AccidentalValue): Omit<NoteEvent, 'measure' | 'beat'>[] {
  const tokens = prompt.toUpperCase().split(/\s+/).filter(Boolean)
  const events: Omit<NoteEvent, 'measure' | 'beat'>[] = []
  let activeAccidental = accidental
  let activeDuration = duration

  tokens.forEach((token) => {
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

function buildBeginnerMelodyEvents(prompt: string, keySignature: KeySignatureValue, duration: DurationValue, timeSignature: TimeSignatureValue, measureCount: number): Omit<NoteEvent, 'measure' | 'beat'>[] {
  const scale = KEY_SCALES[keySignature]
  const measureBeats = getMeasureBeats(timeSignature)
  const durationBeats = getDurationBeats(duration)
  const totalEvents = Math.max(1, Math.floor((measureCount * measureBeats) / durationBeats))
  const contour = [0, 1, 2, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 0]
  const includeRests = prompt.includes('rest') || prompt.includes('space')
  const events: Omit<NoteEvent, 'measure' | 'beat'>[] = []

  for (let i = 0; i < totalEvents; i += 1) {
    const isLast = i === totalEvents - 1
    const shouldRest = includeRests && !isLast && i > 0 && i % 7 === 0

    if (shouldRest) {
      events.push({ duration, accidental: null, isRest: true, pitch: 'B' })
      continue
    }

    const scaleTone = isLast ? scale[0] : scale[contour[i % contour.length] % scale.length]
    events.push({
      duration,
      accidental: scaleTone.accidental,
      isRest: false,
      pitch: scaleTone.pitch,
    })
  }

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

  if (nextBeat >= measureBeats + 1) {
    return { note, nextMeasure: measure + 1, nextBeat: 1 }
  }

  return { note, nextMeasure: measure, nextBeat }
}

export function generateMusicBrainResult(promptText: string, defaults: BrainDefaults): MusicBrainResult {
  const normalizedPrompt = normalizePrompt(promptText)
  const timeSignature = detectTimeSignature(normalizedPrompt, defaults.timeSignature)
  const duration = detectDuration(normalizedPrompt, defaults.duration)
  const keySignature = detectKey(normalizedPrompt)
  const measureCount = detectMeasureCount(normalizedPrompt)
  const explicitEvents = extractExplicitEvents(promptText, duration, defaults.accidental)
  const shouldGenerateMelody = explicitEvents.length === 0 || normalizedPrompt.includes('generate') || normalizedPrompt.includes('write') || normalizedPrompt.includes('melody')
  const sourceEvents = shouldGenerateMelody
    ? buildBeginnerMelodyEvents(normalizedPrompt, keySignature, duration, timeSignature, measureCount)
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
    summary: `Generated ${notes.length} events across ${measureCount} measure(s) in ${keySignature}, ${timeSignature}, using ${duration.toLowerCase()} values.`,
  }
}
