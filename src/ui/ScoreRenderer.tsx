import React, { useEffect, useRef, useState } from 'react'
import { Accidental as VFAccidental, Beam, Dot, Formatter, Renderer, Stave, StaveNote, Tuplet, Voice } from 'vexflow'
import { createMeasureFrame, type MeasureFrame } from './measureFrame'

type DurationValue = 'Whole' | 'DottedHalf' | 'Half' | 'DottedQuarter' | 'Quarter' | 'DottedEighth' | 'Eighth' | '16th' | 'TripletEighth'
type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
type KeySignatureValue =
  | 'C major' | 'G major' | 'D major' | 'A major' | 'E major' | 'B major' | 'F# major' | 'C# major'
  | 'F major' | 'Bb major' | 'Eb major' | 'Ab major' | 'Db major' | 'Gb major' | 'Cb major'
  | 'A minor' | 'E minor' | 'B minor' | 'F# minor' | 'C# minor' | 'G# minor' | 'D# minor' | 'A# minor'
  | 'D minor' | 'G minor' | 'C minor' | 'F minor' | 'Bb minor' | 'Eb minor' | 'Ab minor'

type ScoreCursorPosition = { measure: number; beat: number }
type ChordPitch = { pitch: PitchValue; octave: number; accidental: AccidentalValue }

type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: PitchValue
  octave?: number
  chordPitches?: ChordPitch[]
  measure: number
  beat: number
  tupletGroupId?: string
  ratioLabel?: string
  beamGroupId?: string
  bracketGroupId?: string
}

function isDottedDuration(duration: DurationValue): boolean {
  return duration === 'DottedHalf' || duration === 'DottedQuarter' || duration === 'DottedEighth'
}

function getUndottedDuration(duration: DurationValue): DurationValue {
  if (duration === 'DottedHalf') return 'Half'
  if (duration === 'DottedQuarter') return 'Quarter'
  if (duration === 'DottedEighth') return 'Eighth'
  return duration
}

function getVexDuration(duration: DurationValue, isRest: boolean): string {
  const suffix = isRest ? 'r' : ''
  const base = getUndottedDuration(duration)
  if (base === 'Whole') return `w${suffix}`
  if (base === 'Half') return `h${suffix}`
  if (base === 'Quarter') return `q${suffix}`
  if (base === 'Eighth' || base === 'TripletEighth') return `8${suffix}`
  return `16${suffix}`
}

function getDurationBeats(duration: DurationValue): number {
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

function getVexAccidental(accidental: AccidentalValue): string | null {
  if (accidental === 'Sharp') return '#'
  if (accidental === 'Flat') return 'b'
  if (accidental === 'Natural') return 'n'
  return null
}

function getPitchVexKey(pitch: { pitch: PitchValue; octave?: number }): string {
  return `${pitch.pitch.toLowerCase()}/${pitch.octave ?? 4}`
}

function getVexKeys(note: NoteEvent): string[] {
  if (note.isRest) return ['b/4']
  if (note.chordPitches && note.chordPitches.length > 0) return note.chordPitches.map(getPitchVexKey)
  return [getPitchVexKey(note)]
}

function getVexKeySignature(keySignature: KeySignatureValue): string {
  const keyMap: Partial<Record<KeySignatureValue, string>> = {
    'C major': 'C', 'G major': 'G', 'D major': 'D', 'A major': 'A', 'E major': 'E', 'B major': 'B', 'F# major': 'F#', 'C# major': 'C#',
    'F major': 'F', 'Bb major': 'Bb', 'Eb major': 'Eb', 'Ab major': 'Ab', 'Db major': 'Db', 'Gb major': 'Gb', 'Cb major': 'Cb',
    'A minor': 'Am', 'E minor': 'Em', 'B minor': 'Bm', 'F# minor': 'F#m', 'C# minor': 'C#m', 'G# minor': 'G#m', 'D# minor': 'D#m', 'A# minor': 'A#m',
    'D minor': 'Dm', 'G minor': 'Gm', 'C minor': 'Cm', 'F minor': 'Fm', 'Bb minor': 'Bbm', 'Eb minor': 'Ebm', 'Ab minor': 'Abm',
  }
  return keyMap[keySignature] || 'C'
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function getVoiceConfig(timeSignature: TimeSignatureValue): { num_beats: number; beat_value: number } {
  if (timeSignature === '3/4') return { num_beats: 3, beat_value: 4 }
  if (timeSignature === '2/4') return { num_beats: 2, beat_value: 4 }
  if (timeSignature === '6/8') return { num_beats: 6, beat_value: 8 }
  return { num_beats: 4, beat_value: 4 }
}

function getPulseCountForGrid(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return 2
  return getMeasureBeats(timeSignature)
}

function getSubdivisionCountForGrid(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return 3
  return 4
}

function drawPulseGridOverlay(context: any, y: number, timeSignature: TimeSignatureValue, measureIndex: number, measureFrame: MeasureFrame) {
  if (!context || typeof context.beginPath !== 'function') return
  const pulseCount = getPulseCountForGrid(timeSignature)
  const subdivisionCount = getSubdivisionCountForGrid(timeSignature)
  const gridLeft = measureFrame.rhythmStartX
  const gridRight = measureFrame.rhythmEndX
  const gridWidth = measureFrame.rhythmWidth
  const gridTop = y + 8
  const gridBottom = y + 88
  const pulseWidth = gridWidth / pulseCount

  context.save()
  context.setStrokeStyle('#e5e7eb')
  context.setLineWidth(1)
  context.beginPath()
  context.moveTo(gridLeft, gridTop)
  context.lineTo(gridRight, gridTop)
  context.moveTo(gridLeft, gridBottom)
  context.lineTo(gridRight, gridBottom)
  context.stroke()

  for (let pulse = 0; pulse <= pulseCount; pulse += 1) {
    const pulseX = gridLeft + pulse * pulseWidth
    context.setStrokeStyle(pulse === 0 || pulse === pulseCount ? '#cbd5e1' : '#d1d5db')
    context.setLineWidth(pulse === 0 || pulse === pulseCount ? 1.2 : 1)
    context.beginPath()
    context.moveTo(pulseX, gridTop)
    context.lineTo(pulseX, gridBottom)
    context.stroke()
    if (pulse < pulseCount) {
      context.setFont('Arial', 9, 'normal')
      context.setFillStyle('#94a3b8')
      context.fillText(`${measureIndex + 1}.${pulse + 1}`, pulseX + 4, gridTop - 3)
      for (let subdivision = 1; subdivision < subdivisionCount; subdivision += 1) {
        const subdivisionX = pulseX + (pulseWidth * subdivision) / subdivisionCount
        context.setStrokeStyle('#eef2f7')
        context.beginPath()
        context.moveTo(subdivisionX, gridTop + 12)
        context.lineTo(subdivisionX, gridBottom - 12)
        context.stroke()
      }
    }
  }
  context.restore()
}

function drawScoreCursor(context: any, y: number, timeSignature: TimeSignatureValue, measureIndex: number, measureFrame: MeasureFrame, cursorPosition?: ScoreCursorPosition) {
  if (!context || !cursorPosition) return
  if (cursorPosition.measure !== measureIndex + 1) return
  const pulseCount = getPulseCountForGrid(timeSignature)
  const beatRatio = Math.max(0, Math.min(1, (cursorPosition.beat - 1) / pulseCount))
  const cursorX = measureFrame.rhythmStartX + beatRatio * measureFrame.rhythmWidth
  context.save()
  context.setStrokeStyle('#111827')
  context.setLineWidth(2)
  context.beginPath()
  context.moveTo(cursorX, y + 4)
  context.lineTo(cursorX, y + 94)
  context.stroke()
  context.restore()
}

function getLargestRestDuration(remainingBeats: number): DurationValue {
  if (remainingBeats >= 4) return 'Whole'
  if (remainingBeats >= 3) return 'DottedHalf'
  if (remainingBeats >= 2) return 'Half'
  if (remainingBeats >= 1.5) return 'DottedQuarter'
  if (remainingBeats >= 1) return 'Quarter'
  if (remainingBeats >= 0.75) return 'DottedEighth'
  if (remainingBeats >= 0.5) return 'Eighth'
  return '16th'
}

function getPaddingRests(measureNotes: NoteEvent[], timeSignature: TimeSignatureValue): NoteEvent[] {
  const usedBeats = measureNotes.reduce((total, note) => total + getDurationBeats(note.duration), 0)
  let remainingBeats = Math.max(0, getMeasureBeats(timeSignature) - usedBeats)
  const padding: NoteEvent[] = []
  while (remainingBeats > 0.001) {
    const duration = getLargestRestDuration(remainingBeats)
    padding.push({ duration, accidental: null, isRest: true, pitch: 'B', octave: 4, measure: 0, beat: 0 })
    remainingBeats -= getDurationBeats(duration)
  }
  return padding
}

function groupNotesByMeasure(notes: NoteEvent[]): NoteEvent[][] {
  const groups: NoteEvent[][] = []
  notes.forEach((note) => {
    const index = note.measure - 1
    if (!groups[index]) groups[index] = []
    groups[index].push(note)
  })
  return groups.filter(Boolean)
}

function isBeamable(note: NoteEvent): boolean {
  return !note.isRest && (note.duration === 'Eighth' || note.duration === '16th' || note.duration === 'TripletEighth')
}

function getSmartBeamsAndTuplets(vexNotes: StaveNote[], notes: NoteEvent[]): { beams: Beam[]; tuplets: Tuplet[] } {
  const beams: Beam[] = []
  const tuplets: Tuplet[] = []
  const groups = new Map<string, StaveNote[]>()

  notes.forEach((note, index) => {
    const id = note.bracketGroupId || note.tupletGroupId || note.ratioLabel || ''
    if (!id || note.isRest) return

    const group = groups.get(id) ?? []
    group.push(vexNotes[index])
    groups.set(id, group)
  })

  groups.forEach((group, id) => {
    if (group.length < 2) return
    beams.push(new Beam(group))

    const numberMatch = id.match(/\d+/)
    const tupletNumber = numberMatch ? Number(numberMatch[0]) : group.length

    if (tupletNumber >= 3) {
      tuplets.push(new Tuplet(group, {
        num_notes: tupletNumber,
        notes_occupied: tupletNumber === 3 ? 2 : tupletNumber - 1,
      } as any))
    }
  })

  return { beams, tuplets }
}

export default function ScoreRenderer({ notes, timeSignature, keySignature, harmonyProgression = [], showHarmonyOverlay = false, cursorPosition }: {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  harmonyProgression?: string[]
  showHarmonyOverlay?: boolean
  cursorPosition?: ScoreCursorPosition
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''
    if (notes.length === 0) return

    const measureGroups = groupNotesByMeasure(notes)
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(1180, 1200)
    const context = renderer.getContext()
    const voiceConfig = getVoiceConfig(timeSignature)

    measureGroups.forEach((measureNotes, measureIndex) => {
      const systemIndex = Math.floor(measureIndex / 3)
      const measureInSystem = measureIndex % 3
      const y = 64 + systemIndex * 132
      const x = 36 + measureInSystem * 372
      const staveWidth = 372
      const isFirstMeasureOfSystem = measureInSystem === 0
      const stave = new Stave(x, y, staveWidth)
      if (isFirstMeasureOfSystem) stave.addClef('treble')
      if (measureIndex === 0) {
        stave.addKeySignature(getVexKeySignature(keySignature))
        stave.addTimeSignature(timeSignature)
      }
      stave.setContext(context)
      const measureFrame = createMeasureFrame({ stave, measureIndex, isFirstMeasureOfSystem, x, staveWidth })
      drawPulseGridOverlay(context as any, y, timeSignature, measureIndex, measureFrame)
      stave.draw()

      if (showHarmonyOverlay && harmonyProgression.length > 0) {
        context.save()
        context.setFont('Arial', 15, 'bold')
        context.fillText(harmonyProgression[measureIndex % harmonyProgression.length], x + 18, y - 12)
        context.restore()
      }

      const measureWithPadding = [...measureNotes, ...getPaddingRests(measureNotes, timeSignature)]
      const vexNotes = measureWithPadding.map((note) => {
        const vexNote = new StaveNote({ keys: getVexKeys(note), duration: getVexDuration(note.duration, note.isRest) })
        if (!note.isRest && note.chordPitches && note.chordPitches.length > 0) {
          note.chordPitches.forEach((pitch, index) => {
            const accidental = getVexAccidental(pitch.accidental)
            if (accidental) vexNote.addModifier(new VFAccidental(accidental), index)
          })
        } else {
          const accidental = getVexAccidental(note.accidental)
          if (!note.isRest && accidental) vexNote.addModifier(new VFAccidental(accidental), 0)
        }
        if (isDottedDuration(note.duration)) Dot.buildAndAttach([vexNote])
        return vexNote
      })

      const voice = new Voice(voiceConfig)
      voice.setStrict(false)
      voice.addTickables(vexNotes)
      const grouped = getSmartBeamsAndTuplets(vexNotes, measureWithPadding)
      const beams = grouped.beams
      const tuplets = grouped.tuplets
      new Formatter().joinVoices([voice]).format([voice], staveWidth - 92)
      voice.draw(context, stave)
      beams.forEach((beam) => beam.setContext(context).draw())
      tuplets.forEach((tuplet) => tuplet.setContext(context).draw())
      drawScoreCursor(context as any, y, timeSignature, measureIndex, measureFrame, cursorPosition)
    })
  }, [notes, timeSignature, keySignature, harmonyProgression, showHarmonyOverlay, cursorPosition])

  return (
    <div style={{ marginTop: 16, width: '100%', border: '1px solid #d4d4d8', borderRadius: 14, background: '#f8fafc', overflow: 'hidden' }}>
      <div style={{ height: 38, borderBottom: '1px solid #d4d4d8', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Score Timeline · PulseGrid · {keySignature}{showHarmonyOverlay ? ' · Harmony Overlay' : ''}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}>−</button>
          <span style={{ fontSize: 13 }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>+</button>
          <button type="button" onClick={() => setZoom(1)}>Fit</button>
        </div>
      </div>
      <div style={{ minHeight: 500, maxHeight: 900, overflow: 'auto', padding: 0, background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)' }}>
        <div style={{ width: 1180, minHeight: 760, background: 'transparent', boxShadow: 'none', transform: `scale(${zoom})`, transformOrigin: 'top left', padding: '6px 8px 24px' }}>
          {notes.length === 0 ? <div style={{ color: '#71717a', textAlign: 'center', paddingTop: 120 }}>Add notes to render the score timeline.</div> : <div ref={containerRef} />}
        </div>
      </div>
    </div>
  )
}
