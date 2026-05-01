import React, { useEffect, useRef, useState } from 'react'
import { Accidental as VFAccidental, Beam, Formatter, Renderer, Stave, StaveNote, Tuplet, Voice } from 'vexflow'

type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th' | 'TripletEighth'
type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
type KeySignatureValue = 'C major' | 'G major' | 'F major' | 'D major' | 'A minor'

type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: PitchValue
  measure: number
  beat: number
}

function getVexDuration(duration: DurationValue, isRest: boolean): string {
  const suffix = isRest ? 'r' : ''
  if (duration === 'Whole') return `w${suffix}`
  if (duration === 'Half') return `h${suffix}`
  if (duration === 'Quarter') return `q${suffix}`
  if (duration === 'Eighth' || duration === 'TripletEighth') return `8${suffix}`
  return `16${suffix}`
}

function getDurationBeats(duration: DurationValue): number {
  if (duration === 'Whole') return 4
  if (duration === 'Half') return 2
  if (duration === 'Quarter') return 1
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
  if (keySignature === 'G major') return 'G'
  if (keySignature === 'F major') return 'F'
  if (keySignature === 'D major') return 'D'
  if (keySignature === 'A minor') return 'Am'
  return 'C'
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

function getLargestRestDuration(remainingBeats: number): DurationValue {
  if (remainingBeats >= 4) return 'Whole'
  if (remainingBeats >= 2) return 'Half'
  if (remainingBeats >= 1) return 'Quarter'
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
  return !note.isRest && note.measure > 0 && (note.duration === 'Eighth' || note.duration === '16th' || note.duration === 'TripletEighth')
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
    const isTriplet = note.duration === 'TripletEighth'
    const crossesBoundary = noteCrossesBeamBoundary(note, beatStart, boundarySize)

    if (activeBoundary !== null && boundaryIndex !== activeBoundary) {
      flushGroup()
    }

    activeBoundary = boundaryIndex

    if (isBeamable(note) && !isTriplet && !crossesBoundary) {
      activeGroup.push(vexNotes[index])
    } else {
      flushGroup()
    }

    fallbackBeatCursor += getDurationBeats(note.duration)
  })

  flushGroup()
  return beams
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
    if (note.duration === 'TripletEighth' && !note.isRest && note.measure > 0) {
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
  const [zoom, setZoom] = useState(0.9)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    if (notes.length === 0) return

    const measureGroups = groupNotesByMeasure(notes)

    const pageWidth = 900
    const pageHeight = 1160
    const leftMargin = 56
    const topMargin = 90
    const systemGap = 160
    const measuresPerSystem = 2

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(pageWidth, pageHeight)

    const context = renderer.getContext()
    const voiceConfig = getVoiceConfig(timeSignature)

    measureGroups.forEach((measureNotes, measureIndex) => {
      const systemIndex = Math.floor(measureIndex / measuresPerSystem)
      const measureInSystem = measureIndex % measuresPerSystem

      const y = topMargin + systemIndex * systemGap
      const x = leftMargin + measureInSystem * 340
      const isFirstMeasureOfSystem = measureInSystem === 0
      const staveWidth = 340

      const stave = new Stave(x, y, staveWidth)

      if (isFirstMeasureOfSystem) {
        stave.addClef('treble')
      }

      if (measureIndex === 0) {
        stave.addKeySignature(getVexKeySignature(keySignature))
        stave.addTimeSignature(timeSignature)
      }

      stave.setContext(context).draw()

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

        return vexNote
      })

      const voice = new Voice(voiceConfig)
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      const normalBeams = getMeterAwareBeams(vexNotes, measureWithPadding, timeSignature)
      const tripletResult = getTripletTupletsAndBeams(vexNotes, measureWithPadding)
      const beams = [...normalBeams, ...tripletResult.beams]
      const tuplets = tripletResult.tuplets

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 90)
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
        marginTop: 24,
        width: '100%',
        border: '1px solid #d4d4d8',
        borderRadius: 14,
        background: '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 44,
          borderBottom: '1px solid #d4d4d8',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
          Score Page View · {keySignature}{showHarmonyOverlay ? ' · Harmony Overlay' : ''}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            −
          </button>
          <span style={{ fontSize: 13 }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            +
          </button>
          <button type="button" onClick={() => setZoom(0.9)}>
            Fit
          </button>
        </div>
      </div>

      <div
        style={{
          minHeight: 520,
          maxHeight: 620,
          overflow: 'auto',
          padding: 32,
          display: 'grid',
          placeItems: 'start center',
        }}
      >
        <div
          style={{
            width: 900,
            minHeight: 1160,
            background: '#ffffff',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            padding: '48px 36px',
          }}
        >
          {notes.length === 0 ? (
            <div style={{ color: '#71717a', textAlign: 'center', paddingTop: 120 }}>
              Add notes to render the score page.
            </div>
          ) : (
            <div ref={containerRef} />
          )}
        </div>
      </div>
    </div>
  )
}
