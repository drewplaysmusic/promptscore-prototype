import React, { useEffect, useRef, useState } from 'react'
import { Accidental as VFAccidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'

type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

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
  if (duration === 'Eighth') return `8${suffix}`
  return `16${suffix}`
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

function groupNotesByMeasure(notes: NoteEvent[]): NoteEvent[][] {
  const groups: NoteEvent[][] = []
  notes.forEach((note) => {
    const index = note.measure - 1
    if (!groups[index]) groups[index] = []
    groups[index].push(note)
  })
  return groups.filter(Boolean)
}

export default function ScoreRenderer({ notes }: { notes: NoteEvent[] }) {
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
    const topMargin = 80
    const systemGap = 150
    const measuresPerSystem = 3

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(pageWidth, pageHeight)

    const context = renderer.getContext()

    measureGroups.forEach((measureNotes, measureIndex) => {
      const systemIndex = Math.floor(measureIndex / measuresPerSystem)
      const measureInSystem = measureIndex % measuresPerSystem

      const y = topMargin + systemIndex * systemGap
      const x = leftMargin + measureInSystem * 260
      const isFirstMeasureOfSystem = measureInSystem === 0
      const staveWidth = isFirstMeasureOfSystem ? 280 : 250

      const stave = new Stave(x, y, staveWidth)

      if (isFirstMeasureOfSystem) {
        stave.addClef('treble')
      }

      if (measureIndex === 0) {
        stave.addTimeSignature('4/4')
      }

      stave.setContext(context).draw()

      const vexNotes = measureNotes.map((note) => {
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

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 80)
      voice.draw(context, stave)
    })
  }, [notes])

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
          Score Page View
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
function groupNotesByMeasure(notes: NoteEvent[]): NoteEvent[][] {
  const groups: NoteEvent[][] = []

  notes.forEach((note) => {
    const index = note.measure - 1
    if (!groups[index]) groups[index] = []
    groups[index].push(note)
  })

  return groups.filter(Boolean)
}

export default function ScoreRenderer({ notes }: { notes: NoteEvent[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(0.9)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    if (notes.length === 0) return

    const measureGroups = groupNotesByMeasure(notes)
    const pageWidth = 900
    const height = 260

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(pageWidth, height)

    const context = renderer.getContext()
    let x = 40

    measureGroups.forEach((measureNotes, measureIndex) => {
      const staveWidth = measureIndex === 0 ? 280 : 220
      const stave = new Stave(x, 70, staveWidth)

      if (measureIndex === 0) {
        stave.addClef('treble').addTimeSignature('4/4')
      }

      stave.setContext(context).draw()

      const vexNotes = measureNotes.map((note) => {
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

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 70)
      voice.draw(context, stave)

      x += staveWidth
    })
  }, [notes])

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
          Score Page View
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
