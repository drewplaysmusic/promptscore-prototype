import type { AccidentalValue, NoteEvent, TimeSignatureValue } from './musicBrain'

type PlaybackHandle = {
  stop: () => void
}

type PlaybackOptions = {
  tempo?: number
  timeSignature?: TimeSignatureValue
  onCursorChange?: (cursor: { measure: number; beat: number }) => void
  onComplete?: () => void
}

const SEMITONE_BY_PITCH: Record<NoteEvent['pitch'], number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

function accidentalOffset(accidental: AccidentalValue): number {
  if (accidental === 'Sharp') return 1
  if (accidental === 'Flat') return -1
  return 0
}

function getMidiNumber(note: NoteEvent): number {
  const octave = (note as NoteEvent & { octave?: number }).octave ?? 4
  return 12 * (octave + 1) + SEMITONE_BY_PITCH[note.pitch] + accidentalOffset(note.accidental)
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
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

function getStartBeatAbsolute(note: NoteEvent, timeSignature: TimeSignatureValue): number {
  const measureBeats = timeSignature === '3/4' ? 3 : timeSignature === '2/4' ? 2 : 4
  return (note.measure - 1) * measureBeats + (note.beat - 1)
}

function createTone(context: AudioContext, frequency: number, startTime: number, durationSeconds: number) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  const attack = 0.01
  const release = Math.min(0.08, durationSeconds * 0.25)
  const sustainEnd = Math.max(startTime + attack, startTime + durationSeconds - release)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(0.18, startTime + attack)
  gain.gain.setValueAtTime(0.14, sustainEnd)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + durationSeconds + 0.02)
}

export function playScoreNotes(notes: NoteEvent[], options: PlaybackOptions = {}): PlaybackHandle {
  const playableNotes = notes.filter((note) => !note.isRest && note.measure > 0)
  const tempo = options.tempo ?? 92
  const secondsPerBeat = 60 / tempo
  const timeSignature = options.timeSignature ?? '4/4'
  const context = new AudioContext()
  const timers: number[] = []
  let stopped = false

  playableNotes.forEach((note) => {
    const startOffset = getStartBeatAbsolute(note, timeSignature) * secondsPerBeat
    const durationSeconds = getDurationBeats(note.duration) * secondsPerBeat * 0.92
    const startTime = context.currentTime + 0.08 + startOffset

    createTone(context, midiToFrequency(getMidiNumber(note)), startTime, durationSeconds)

    const cursorTimer = window.setTimeout(() => {
      if (!stopped) options.onCursorChange?.({ measure: note.measure, beat: note.beat })
    }, Math.max(0, (startOffset * 1000) + 40))

    timers.push(cursorTimer)
  })

  const finalNote = playableNotes[playableNotes.length - 1]
  const finalOffset = finalNote
    ? (getStartBeatAbsolute(finalNote, timeSignature) + getDurationBeats(finalNote.duration)) * secondsPerBeat
    : 0

  timers.push(window.setTimeout(() => {
    if (!stopped) options.onComplete?.()
  }, finalOffset * 1000 + 160))

  return {
    stop: () => {
      stopped = true
      timers.forEach((timer) => window.clearTimeout(timer))
      void context.close()
    },
  }
}
