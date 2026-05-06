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

type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: PitchValue
  measure: number
  beat: number
  tupletGroupId?: string
  ratioLabel?: string
  beamGroupId?: string
  bracketGroupId?: string
  startTick?: number
  endTick?: number
  startX?: number
  endX?: number
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
  const baseDuration = getUndottedDuration(duration)
  if (baseDuration === 'Whole') return `w${suffix}`
  if (baseDuration === 'Half') return `h${suffix}`
  if (baseDuration === 'Quarter') return `q${suffix}`
  if (baseDuration === 'Eighth' || baseDuration === 'TripletEighth') return `8${suffix}`
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

function getVexKey(note: NoteEvent): string {
  return `${note.pitch.toLowerCase()}/4`
}

function getVexKeySignature(keySignature: KeySignatureValue): string {
  const keyMap: Record<KeySignatureValue, string> = {
    'C major': 'C',
    'G major': 'G',
    'D major': 'D',
    'A major': 'A',
    'E major': 'E',
    'B major': 'B',
    'F# major': 'F#',
    'C# major': 'C#',
    'F major': 'F',
    'Bb major': 'Bb',
    'Eb major': 'Eb',
    'Ab major': 'Ab',
    'Db major': 'Db',
    'Gb major': 'Gb',
    'Cb major': 'Cb',
    'A minor': 'Am',
    'E minor': 'Em',
    'B minor': 'Bm',
    'F# minor': 'F#m',
    'C# minor': 'C#m',
    'G# minor': 'G#m',
    'D# minor': 'D#m',
    'A# minor': 'A#m',
    'D minor': 'Dm',
    'G minor': 'Gm',
    'C minor': 'Cm',
    'F minor': 'Fm',
    'Bb minor': 'Bbm',
    'Eb minor': 'Ebm',
    'Ab minor': 'Abm',
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

function drawPulseGridOverlay(
  context: any,
  y: number,
  timeSignature: TimeSignatureValue,
  measureIndex: number,
  measureFrame: MeasureFrame,
) {
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
    }

    if (pulse < pulseCount) {
      for (let subdivision = 1; subdivision < subdivisionCount; subdivision += 1) {
        const subdivisionX = pulseX + (pulseWidth * subdivision) / subdivisionCount
        context.setStrokeStyle('#eef2f7')
        context.setLineWidth(1)
        context.beginPath()
        context.moveTo(subdivisionX, gridTop + 12)
        context.lineTo(subdivisionX, gridBottom - 12)
        context.stroke()
      }
    }
  }

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
  const paddingRests: NoteEvent[] = []

  while (remainingBeats > 0.001) {
    const duration = getLargestRestDuration(remainingBeats)
    const durationBeats = getDurationBeats(duration)

    paddingRests.push({
      duration,
      accidental: null,
      isRest: true,
      pitch: 'B',
      measure: 0,
      beat: 0,
    })

    remainingBeats -= durationBeats
  }

  return paddingRests
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
  return !note.isRest && note.measure > 0 && (note.duration === 'Eighth' || note.duration === 'DottedEighth' || note.duration === '16th' || note.duration === 'TripletEighth')
}

function getBeamBoundarySize(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return 1.5
  return 1
}

function getBeatStart(note: NoteEvent, fallbackBeat: number): number {
  return note.measure > 0 && note.beat > 0 ? note.beat : fallbackBeat
}

function getBeamBoundaryIndex(beatStart: number, boundarySize: number): number {
  return Math.floor((beatStart - 1 + 0.0001) / boundarySize)
}

function noteCrossesBeamBoundary(note: NoteEvent, beatStart: number, boundarySize: number): boolean {
  const durationBeats = getDurationBeats(note.duration)
  const startBoundary = getBeamBoundaryIndex(beatStart, boundarySize)
  const endBoundary = getBeamBoundaryIndex(beatStart + durationBeats - 0.001, boundarySize)
  return startBoundary !== endBoundary
}

function getMeterAwareBeams(vexNotes: StaveNote[], notesForMeasure: NoteEvent[], timeSignature: TimeSignatureValue): Beam[] {
  const beams: Beam[] = []
  const boundarySize = getBeamBoundarySize(timeSignature)
  let fallbackBeatCursor = 1
  let activeBoundary: number | null = null
  let activeGroup: StaveNote[] = []

  function flushGroup() {
    if (activeGroup.length >= 2) {
      beams.push(new Beam(activeGroup))
    }
    activeGroup = []
  }

  notesForMeasure.forEach((note, index) => {
    const beatStart = getBeatStart(note, fallbackBeatCursor)
    const boundaryIndex = getBeamBoundaryIndex(beatStart, boundarySize)
    const isRatioGrouped = Boolean(note.tupletGroupId || note.ratioLabel || note.bracketGroupId)
    const crossesBoundary = noteCrossesBeamBoundary(note, beatStart, boundarySize)

    if (activeBoundary !== null && boundaryIndex !== activeBoundary) {
      flushGroup()
    }

    activeBoundary = boundaryIndex

    if (isBeamable(note) && !isRatioGrouped && !crossesBoundary) {
      activeGroup.push(vexNotes[index])
    } else {
      flushGroup()
    }

    fallbackBeatCursor += getDurationBeats(note.duration)
  })

  flushGroup()
  return beams
}

function parseTupletNumber(note: NoteEvent): number | null {
  const source = `${note.ratioLabel ?? ''} ${note.tupletGroupId ?? ''} ${note.bracketGroupId ?? ''}`

  const ratioMatch = source.match(/(\d+)\s*:/)
  if (ratioMatch) return Number(ratioMatch[1])

  const tupletMatch = source.match(/tuplet-(\d+)/)
  if (tupletMatch) return Number(tupletMatch[1])

  const ratioIdMatch = source.match(/ratio-(\d+)-(\d+)/)
  if (ratioIdMatch) return Number(ratioIdMatch[1])

  if (note.duration === 'TripletEighth') return 3
  return null
}

function getTupletNotesOccupied(tupletNumber: number): number | undefined {
  if (tupletNumber === 3) return 2
  if (tupletNumber === 5) return 4
  if (tupletNumber === 7) return 4
  if (tupletNumber === 9) return 8
  return undefined
}

function getRatioTupletsAndBeams(vexNotes: StaveNote[], notesForMeasure: NoteEvent[]): { tuplets: Tuplet[]; beams: Beam[] } {
  const tuplets: Tuplet[] = []
  const beams: Beam[] = []
  const groups = new Map<string, { vexNotes: StaveNote[]; notes: NoteEvent[] }>()

  notesForMeasure.forEach((note, index) => {
    if (note.isRest || note.measure <= 0) return
    const groupId = note.bracketGroupId || note.tupletGroupId || note.ratioLabel
    if (!groupId) return

    const existing = groups.get(groupId) ?? { vexNotes: [], notes: [] }
    existing.vexNotes.push(vexNotes[index])
    existing.notes.push(note)
    groups.set(groupId, existing)
  })

  groups.forEach((group) => {
    if (group.vexNotes.length < 2) return

    beams.push(new Beam(group.vexNotes))

    const tupletNumber = parseTupletNumber(group.notes[0]) ?? group.vexNotes.length
    if (tupletNumber >= 3) {
      tuplets.push(
        new Tuplet(group.vexNotes, {
          num_notes: tupletNumber,
          notes_occupied: getTupletNotesOccupied(tupletNumber),
        }),
      )
    }
  })

  return { tuplets, beams }
}

function getTripletTupletsAndBeams(vexNotes: StaveNote[], notesForMeasure: NoteEvent[]): { tuplets: Tuplet[]; beams: Beam[] } {
  const tuplets: Tuplet[] = []
  const beams: Beam[] = []
  let activeTripletGroup: StaveNote[] = []

  function flushTripletGroup() {
    if (activeTripletGroup.length === 3) {
      beams.push(new Beam(activeTripletGroup))
      tuplets.push(new Tuplet(activeTripletGroup, { num_notes: 3, notes_occupied: 2 }))
    }
    activeTripletGroup = []
  }

  notesForMeasure.forEach((note, index) => {
    const isRatioGrouped = Boolean(note.tupletGroupId || note.ratioLabel || note.bracketGroupId)

    if (note.duration === 'TripletEighth' && !note.isRest && note.measure > 0 && !isRatioGrouped) {
      activeTripletGroup.push(vexNotes[index])
      if (activeTripletGroup.length === 3) flushTripletGroup()
      return
    }

    flushTripletGroup()
  })

  flushTripletGroup()
  return { tuplets, beams }
}

export default function ScoreRenderer({
  notes,
  timeSignature,
  keySignature,
  harmonyProgression = [],
  showHarmonyOverlay = false,
}: {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  harmonyProgression?: string[]
  showHarmonyOverlay?: boolean
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    if (notes.length === 0) return

    const measureGroups = groupNotesByMeasure(notes)

    const pageWidth = 1180
    const pageHeight = 760
    const leftMargin = 36
    const topMargin = 64
    const systemGap = 132
    const measuresPerSystem = 3

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(pageWidth, pageHeight)

    const context = renderer.getContext()
    const voiceConfig = getVoiceConfig(timeSignature)

    measureGroups.forEach((measureNotes, measureIndex) => {
      const systemIndex = Math.floor(measureIndex / measuresPerSystem)
      const measureInSystem = measureIndex % measuresPerSystem

      const y = topMargin + systemIndex * systemGap
      const x = leftMargin + measureInSystem * 372
      const isFirstMeasureOfSystem = measureInSystem === 0
      const staveWidth = 372

      const stave = new Stave(x, y, staveWidth)

      if (isFirstMeasureOfSystem) {
        stave.addClef('treble')
      }

      if (measureIndex === 0) {
        stave.addKeySignature(getVexKeySignature(keySignature))
        stave.addTimeSignature(timeSignature)
      }

      stave.setContext(context)
      const measureFrame = createMeasureFrame({
        stave,
        measureIndex,
        isFirstMeasureOfSystem,
        x,
        staveWidth,
      })
      drawPulseGridOverlay(context as any, y, timeSignature, measureIndex, measureFrame)
      stave.draw()

      if (showHarmonyOverlay && harmonyProgression.length > 0) {
        const harmonyLabel = harmonyProgression[measureIndex % harmonyProgression.length]
        context.save()
        context.setFont('Arial', 15, 'bold')
        context.fillText(harmonyLabel, x + 18, y - 12)
        context.restore()
      }

      const paddingRests = getPaddingRests(measureNotes, timeSignature)
      const measureWithPadding = [...measureNotes, ...paddingRests]

      const vexNotes = measureWithPadding.map((note) => {
        const vexNote = new StaveNote({
          keys: [note.isRest ? 'b/4' : getVexKey(note)],
          duration: getVexDuration(note.duration, note.isRest),
        })

        const accidental = getVexAccidental(note.accidental)

        if (!note.isRest && accidental) {
          vexNote.addModifier(new VFAccidental(accidental), 0)
        }

        if (isDottedDuration(note.duration)) {
          Dot.buildAndAttach([vexNote])
        }

        return vexNote
      })

      const voice = new Voice(voiceConfig)
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      const normalBeams = getMeterAwareBeams(vexNotes, measureWithPadding, timeSignature)
      const tripletResult = getTripletTupletsAndBeams(vexNotes, measureWithPadding)
      const ratioResult = getRatioTupletsAndBeams(vexNotes, measureWithPadding)
      const beams = [...normalBeams, ...tripletResult.beams, ...ratioResult.beams]
      const tuplets = [...tripletResult.tuplets, ...ratioResult.tuplets]

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 92)

      voice.draw(context, stave)
      beams.forEach((beam) => {
        beam.setContext(context).draw()
      })
      tuplets.forEach((tuplet) => {
        tuplet.setContext(context).draw()
      })
    })
  }, [notes, timeSignature, keySignature, harmonyProgression, showHarmonyOverlay])

  return (
    <div
      style={{
        marginTop: 16,
        width: '100%',
        border: '1px solid #d4d4d8',
        borderRadius: 14,
        background: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 38,
          borderBottom: '1px solid #d4d4d8',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
          Score Timeline · PulseGrid · {keySignature}{showHarmonyOverlay ? ' · Harmony Overlay' : ''}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}>
            −
          </button>
          <span style={{ fontSize: 13 }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            +
          </button>
          <button type="button" onClick={() => setZoom(1)}>
            Fit
          </button>
        </div>
      </div>

      <div
        style={{
          minHeight: 500,
          maxHeight: 620,
          overflow: 'auto',
          padding: 0,
          background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
        }}
      >
        <div
          style={{
            width: 1180,
            minHeight: 760,
            background: 'transparent',
            boxShadow: 'none',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            padding: '6px 8px 24px',
          }}
        >
          {notes.length === 0 ? (
            <div style={{ color: '#71717a', textAlign: 'center', paddingTop: 120 }}>
              Add notes to render the score timeline.
            </div>
          ) : (
            <div ref={containerRef} />
          )}
        </div>
      </div>
    </div>
  )
}
