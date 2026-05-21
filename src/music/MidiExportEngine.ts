import { downloadMusicXmlFile } from './MusicXmlExportEngine'
import type { AccidentalValue, NoteEvent, TimeSignatureValue } from './musicBrain'

type ChordPitch = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
  octave: number
}

type ExportableNoteEvent = NoteEvent & {
  octave?: number
  voiceType?: 'melody' | 'accompaniment' | 'bass' | 'percussion'
  chordPitches?: ChordPitch[]
}

type MidiPitch = {
  pitch: NoteEvent['pitch']
  accidental: AccidentalValue
  octave?: number
}

type TimedMidiEvent = {
  tick: number
  bytes: number[]
}

const TICKS_PER_QUARTER = 480

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

function getMidiNumber(note: MidiPitch): number {
  const octave = note.octave ?? 4
  return 12 * (octave + 1) + SEMITONE_BY_PITCH[note.pitch] + accidentalOffset(note.accidental)
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

function getAbsoluteBeat(note: NoteEvent, timeSignature: TimeSignatureValue): number {
  return (note.measure - 1) * getMeasureBeats(timeSignature) + (note.beat - 1)
}

function getPlayablePitches(note: ExportableNoteEvent): MidiPitch[] {
  if (note.chordPitches && note.chordPitches.length > 0) return note.chordPitches
  return [{ pitch: note.pitch, accidental: note.accidental, octave: note.octave }]
}

function writeString(value: string): number[] {
  return Array.from(value).map((character) => character.charCodeAt(0))
}

function writeU16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff]
}

function writeU32(value: number): number[] {
  return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

function writeVariableLengthQuantity(value: number): number[] {
  let buffer = value & 0x7f
  const bytes: number[] = []

  while ((value >>= 7)) {
    buffer <<= 8
    buffer |= ((value & 0x7f) | 0x80)
  }

  while (true) {
    bytes.push(buffer & 0xff)
    if (buffer & 0x80) buffer >>= 8
    else break
  }

  return bytes
}

function getChannelForNote(note: ExportableNoteEvent): number {
  if (note.voiceType === 'accompaniment' || note.voiceType === 'bass') return 1
  if (note.chordPitches && note.chordPitches.length > 1) return 1
  return 0
}

function getVelocityForNote(note: ExportableNoteEvent): number {
  if (note.voiceType === 'accompaniment' || note.voiceType === 'bass') return 68
  if (note.chordPitches && note.chordPitches.length > 1) return 68
  return 88
}

function getTrackNameBytes(name: string): number[] {
  const text = writeString(name)
  return [0x00, 0xff, 0x03, text.length, ...text]
}

function createMidiBytes(notes: ExportableNoteEvent[], timeSignature: TimeSignatureValue, tempo: number): Uint8Array {
  const musicalEvents: TimedMidiEvent[] = []
  const safeTempo = Math.max(40, Math.min(220, Math.round(tempo || 92)))
  const microsecondsPerQuarter = Math.round(60000000 / safeTempo)
  const [numerator, denominatorRaw] = timeSignature.split('/').map(Number)
  const denominatorPower = Math.log2(denominatorRaw || 4)

  notes
    .filter((note) => !note.isRest && note.measure > 0)
    .forEach((note) => {
      const tick = Math.round(getAbsoluteBeat(note, timeSignature) * TICKS_PER_QUARTER)
      const durationTicks = Math.max(1, Math.round(getDurationBeats(note.duration) * TICKS_PER_QUARTER))
      const channel = getChannelForNote(note)
      const velocity = getVelocityForNote(note)
      const pitches = getPlayablePitches(note)

      pitches.forEach((pitch) => {
        const midiNumber = Math.max(0, Math.min(127, getMidiNumber(pitch)))
        musicalEvents.push({ tick, bytes: [0x90 + channel, midiNumber, velocity] })
        musicalEvents.push({ tick: tick + durationTicks, bytes: [0x80 + channel, midiNumber, 0] })
      })
    })

  musicalEvents.sort((a, b) => a.tick - b.tick || a.bytes[0] - b.bytes[0])

  const trackEvents: number[] = [
    ...getTrackNameBytes('PromptScore Export'),
    0x00, 0xff, 0x51, 0x03,
    (microsecondsPerQuarter >> 16) & 0xff,
    (microsecondsPerQuarter >> 8) & 0xff,
    microsecondsPerQuarter & 0xff,
    0x00, 0xff, 0x58, 0x04,
    numerator || 4,
    denominatorPower,
    24,
    8,
    0x00, 0xc0, 0x00,
    0x00, 0xc1, 0x00,
  ]

  let previousTick = 0
  musicalEvents.forEach((event) => {
    const delta = Math.max(0, event.tick - previousTick)
    trackEvents.push(...writeVariableLengthQuantity(delta), ...event.bytes)
    previousTick = event.tick
  })

  trackEvents.push(0x00, 0xff, 0x2f, 0x00)

  const header = [
    ...writeString('MThd'),
    ...writeU32(6),
    ...writeU16(0),
    ...writeU16(1),
    ...writeU16(TICKS_PER_QUARTER),
  ]

  const track = [
    ...writeString('MTrk'),
    ...writeU32(trackEvents.length),
    ...trackEvents,
  ]

  return new Uint8Array([...header, ...track])
}

function triggerMidiDownload(notes: NoteEvent[], timeSignature: TimeSignatureValue, tempo: number, fileName = 'promptscore-export.mid') {
  const bytes = createMidiBytes(notes as ExportableNoteEvent[], timeSignature, tempo)
  const blob = new Blob([bytes], { type: 'audio/midi' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function downloadMidiFile(notes: NoteEvent[], timeSignature: TimeSignatureValue, tempo: number, fileName = 'promptscore-export.mid') {
  triggerMidiDownload(notes, timeSignature, tempo, fileName)
  window.setTimeout(() => {
    downloadMusicXmlFile(notes, timeSignature, 'promptscore-export.musicxml')
  }, 120)
}
