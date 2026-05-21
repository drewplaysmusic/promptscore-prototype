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

const DIVISIONS = 12

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getDurationDivisions(duration: NoteEvent['duration']): number {
  if (duration === 'Whole') return DIVISIONS * 4
  if (duration === 'DottedHalf') return DIVISIONS * 3
  if (duration === 'Half') return DIVISIONS * 2
  if (duration === 'DottedQuarter') return Math.round(DIVISIONS * 1.5)
  if (duration === 'Quarter') return DIVISIONS
  if (duration === 'DottedEighth') return Math.round(DIVISIONS * 0.75)
  if (duration === 'Eighth') return DIVISIONS / 2
  if (duration === 'TripletEighth') return DIVISIONS / 3
  return DIVISIONS / 4
}

function getNoteType(duration: NoteEvent['duration']): string {
  if (duration === 'Whole') return 'whole'
  if (duration === 'DottedHalf' || duration === 'Half') return 'half'
  if (duration === 'DottedQuarter' || duration === 'Quarter') return 'quarter'
  if (duration === 'DottedEighth' || duration === 'Eighth' || duration === 'TripletEighth') return 'eighth'
  return '16th'
}

function isDotted(duration: NoteEvent['duration']): boolean {
  return duration === 'DottedHalf' || duration === 'DottedQuarter' || duration === 'DottedEighth'
}

function getAlter(accidental: AccidentalValue): number | null {
  if (accidental === 'Sharp') return 1
  if (accidental === 'Flat') return -1
  return null
}

function getAccidentalXml(accidental: AccidentalValue): string {
  if (accidental === 'Sharp') return '<accidental>sharp</accidental>'
  if (accidental === 'Flat') return '<accidental>flat</accidental>'
  if (accidental === 'Natural') return '<accidental>natural</accidental>'
  return ''
}

function getMeasureCount(notes: ExportableNoteEvent[]): number {
  return Math.max(1, ...notes.map((note) => note.measure))
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getTimeSignatureParts(timeSignature: TimeSignatureValue): { beats: number; beatType: number } {
  const [beatsRaw, beatTypeRaw] = timeSignature.split('/').map(Number)
  return { beats: beatsRaw || 4, beatType: beatTypeRaw || 4 }
}

function isAccompaniment(note: ExportableNoteEvent): boolean {
  if (note.voiceType === 'accompaniment' || note.voiceType === 'bass') return true
  if (note.chordPitches && note.chordPitches.length > 1) return true
  return false
}

function getStaffNumber(note: ExportableNoteEvent): number {
  return isAccompaniment(note) ? 2 : 1
}

function getVoiceNumber(note: ExportableNoteEvent): number {
  return isAccompaniment(note) ? 2 : 1
}

function getMeasureNotes(notes: ExportableNoteEvent[], measure: number, staff: number): ExportableNoteEvent[] {
  return notes
    .filter((note) => note.measure === measure && getStaffNumber(note) === staff)
    .sort((a, b) => a.beat - b.beat)
}

function pitchToXml(pitch: { pitch: NoteEvent['pitch']; accidental: AccidentalValue; octave?: number }): string {
  const alter = getAlter(pitch.accidental)
  return `<pitch><step>${pitch.pitch}</step>${alter === null ? '' : `<alter>${alter}</alter>`}<octave>${pitch.octave ?? 4}</octave></pitch>`
}

function getChordPitches(note: ExportableNoteEvent): Array<{ pitch: NoteEvent['pitch']; accidental: AccidentalValue; octave?: number }> {
  if (note.chordPitches && note.chordPitches.length > 0) return note.chordPitches
  return [{ pitch: note.pitch, accidental: note.accidental, octave: note.octave }]
}

function noteToXml(note: ExportableNoteEvent, pitch: { pitch: NoteEvent['pitch']; accidental: AccidentalValue; octave?: number }, isChordTone: boolean): string {
  const duration = getDurationDivisions(note.duration)
  const type = getNoteType(note.duration)
  const dot = isDotted(note.duration) ? '<dot/>' : ''
  const tuplet = note.duration === 'TripletEighth'
    ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
    : ''

  return [
    '<note>',
    isChordTone ? '<chord/>' : '',
    pitchToXml(pitch),
    `<duration>${duration}</duration>`,
    `<voice>${getVoiceNumber(note)}</voice>`,
    `<type>${type}</type>`,
    dot,
    tuplet,
    getAccidentalXml(pitch.accidental),
    `<staff>${getStaffNumber(note)}</staff>`,
    '</note>',
  ].join('')
}

function restToXml(duration: NoteEvent['duration'], staff: number, voice: number): string {
  const dot = isDotted(duration) ? '<dot/>' : ''
  return [
    '<note>',
    '<rest/>',
    `<duration>${getDurationDivisions(duration)}</duration>`,
    `<voice>${voice}</voice>`,
    `<type>${getNoteType(duration)}</type>`,
    dot,
    `<staff>${staff}</staff>`,
    '</note>',
  ].join('')
}

function noteEventToXml(note: ExportableNoteEvent): string {
  if (note.isRest) return restToXml(note.duration, getStaffNumber(note), getVoiceNumber(note))
  const pitches = getChordPitches(note)
  return pitches.map((pitch, index) => noteToXml(note, pitch, index > 0)).join('')
}

function backupMeasureXml(): string {
  return `<backup><duration>${getMeasureBeats('4/4') * DIVISIONS}</duration></backup>`
}

function measureToXml(notes: ExportableNoteEvent[], measureNumber: number, timeSignature: TimeSignatureValue): string {
  const { beats, beatType } = getTimeSignatureParts(timeSignature)
  const melodyNotes = getMeasureNotes(notes, measureNumber, 1)
  const accompanimentNotes = getMeasureNotes(notes, measureNumber, 2)
  const measureDuration = getMeasureBeats(timeSignature) * DIVISIONS

  const attributes = measureNumber === 1
    ? [
        '<attributes>',
        `<divisions>${DIVISIONS}</divisions>`,
        '<key><fifths>0</fifths></key>',
        `<time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time>`,
        '<staves>2</staves>',
        '<clef number="1"><sign>G</sign><line>2</line></clef>',
        '<clef number="2"><sign>F</sign><line>4</line></clef>',
        '</attributes>',
      ].join('')
    : ''

  const melodyXml = melodyNotes.length > 0
    ? melodyNotes.map(noteEventToXml).join('')
    : restToXml('Whole', 1, 1)

  const accompanimentXml = accompanimentNotes.length > 0
    ? `<backup><duration>${measureDuration}</duration></backup>${accompanimentNotes.map(noteEventToXml).join('')}`
    : `<backup><duration>${measureDuration}</duration></backup>${restToXml('Whole', 2, 2)}`

  return `<measure number="${measureNumber}">${attributes}${melodyXml}${accompanimentXml}</measure>`
}

export function createMusicXmlDocument(notes: NoteEvent[], timeSignature: TimeSignatureValue, title = 'PromptScore Export'): string {
  const exportableNotes = notes as ExportableNoteEvent[]
  const measureCount = getMeasureCount(exportableNotes)
  const measures = Array.from({ length: measureCount }, (_, index) => measureToXml(exportableNotes, index + 1, timeSignature)).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${escapeXml(title)}</work-title></work>
  <identification><creator type="composer">PromptScore</creator><encoding><software>PromptScore Prototype</software></encoding></identification>
  <part-list><score-part id="P1"><part-name>Piano</part-name><score-instrument id="P1-I1"><instrument-name>Piano</instrument-name></score-instrument><midi-instrument id="P1-I1"><midi-channel>1</midi-channel><midi-program>1</midi-program></midi-instrument></score-part></part-list>
  <part id="P1">${measures}</part>
</score-partwise>`
}

export function downloadMusicXmlFile(notes: NoteEvent[], timeSignature: TimeSignatureValue, fileName = 'promptscore-export.musicxml') {
  const xml = createMusicXmlDocument(notes, timeSignature)
  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
