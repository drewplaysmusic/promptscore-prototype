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

type ChordPitch = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
  octave: number
}

type PlayableNoteEvent = NoteEvent & {
  octave?: number
  voiceType?: 'melody' | 'accompaniment' | 'bass' | 'percussion'
  chordPitches?: ChordPitch[]
}

type VoiceMix = {
  waveform: OscillatorType
  peakGain: number
  sustainGain: number
  attack: number
  releaseRatio: number
  durationScale: number
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

const MELODY_MIX: VoiceMix = {
  waveform: 'triangle',
  peakGain: 0.17,
  sustainGain: 0.13,
  attack: 0.012,
  releaseRatio: 0.25,
  durationScale: 0.92,
}

const ACCOMPANIMENT_MIX: VoiceMix = {
  waveform: 'sine',
  peakGain: 0.095,
  sustainGain: 0.07,
  attack: 0.018,
  releaseRatio: 0.32,
  durationScale: 0.82,
}

function accidentalOffset(accidental: AccidentalValue): number {
  if (accidental === 'Sharp') return 1
  if (accidental === 'Flat') return -1
  return 0
}

function getMidiNumber(note: { pitch: NoteEvent['pitch']; accidental: AccidentalValue; octave?: number }): number {
  const octave = note.octave ?? 4
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

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getStartBeatAbsolute(note: NoteEvent, timeSignature: TimeSignatureValue): number {
  const measureBeats = getMeasureBeats(timeSignature)
  return (note.measure - 1) * measureBeats + (note.beat - 1)
}

function getVoiceMix(note: PlayableNoteEvent): VoiceMix {
  if (note.voiceType === 'accompaniment' || note.voiceType === 'bass') return ACCOMPANIMENT_MIX
  if (note.chordPitches && note.chordPitches.length > 1) return ACCOMPANIMENT_MIX
  return MELODY_MIX
}

function getPlayablePitches(note: PlayableNoteEvent): Array<{ pitch: NoteEvent['pitch']; accidental: AccidentalValue; octave?: number }> {
  if (note.chordPitches && note.chordPitches.length > 0) return note.chordPitches
  return [{ pitch: note.pitch, accidental: note.accidental, octave: note.octave }]
}

function createTone(context: AudioContext, destination: AudioNode, frequency: number, startTime: number, durationSeconds: number, mix: VoiceMix, chordSize = 1) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = mix.waveform
  oscillator.frequency.setValueAtTime(frequency, startTime)

  const safeChordGain = Math.max(0.45, 1 / Math.sqrt(Math.max(1, chordSize)))
  const peakGain = mix.peakGain * safeChordGain
  const sustainGain = mix.sustainGain * safeChordGain
  const attack = mix.attack
  const release = Math.min(0.12, durationSeconds * mix.releaseRatio)
  const sustainEnd = Math.max(startTime + attack, startTime + durationSeconds - release)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + attack)
  gain.gain.setValueAtTime(sustainGain, sustainEnd)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds)

  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + durationSeconds + 0.02)
}

export function playScoreNotes(notes: NoteEvent[], options: PlaybackOptions = {}): PlaybackHandle {
  const playableNotes = (notes as PlayableNoteEvent[]).filter((note) => !note.isRest && note.measure > 0)
  const tempo = options.tempo ?? 92
  const secondsPerBeat = 60 / tempo
  const timeSignature = options.timeSignature ?? '4/4'
  const context = new AudioContext()
  const masterGain = context.createGain()
  masterGain.gain.setValueAtTime(0.88, context.currentTime)
  masterGain.connect(context.destination)

  const timers: number[] = []
  let stopped = false

  playableNotes.forEach((note) => {
    const mix = getVoiceMix(note)
    const startOffset = getStartBeatAbsolute(note, timeSignature) * secondsPerBeat
    const durationSeconds = getDurationBeats(note.duration) * secondsPerBeat * mix.durationScale
    const startTime = context.currentTime + 0.08 + startOffset
    const playablePitches = getPlayablePitches(note)

    playablePitches.forEach((pitch) => {
      createTone(context, masterGain, midiToFrequency(getMidiNumber(pitch)), startTime, durationSeconds, mix, playablePitches.length)
    })

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
