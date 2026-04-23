import React, { useEffect, useMemo, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'

export type VexDurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type VexAccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null

export type VexNoteEvent = {
  duration: VexDurationValue
  accidental: VexAccidentalValue
  isRest: boolean
}

type Props = {
  notes: VexNoteEvent[]
  width?: number
  height?: number
}

function mapDuration(duration: VexDurationValue, isRest: boolean): string {
  const mapped: Record<VexDurationValue, string> = {
    Whole: 'w',
    Half: 'h',
    Quarter: 'q',
    Eighth: '8',
    '16th': '16',
  }

  return `${mapped[duration]}${isRest ? 'r' : ''}`
}

function mapAccidental(accidental: VexAccidentalValue): string | null {
  if (accidental === 'Sharp') return '#'
  if (accidental === 'Flat') return 'b'
  if (accidental === 'Natural') return 'n'
  return null
}

export default function VexFlowCanvas({ notes, width = 760, height = 220 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const staveNotes = useMemo(() => {
    const source = notes.length
      ? notes
      : [{ duration: 'Quarter' as VexDurationValue, accidental: null as VexAccidentalValue, isRest: false }]

    return source.map((note) => {
      const vexNote = new StaveNote({
        clef: 'treble',
        keys: ['b/4'],
        duration: mapDuration(note.duration, note.isRest),
      })

      const accidental = mapAccidental(note.accidental)
      if (accidental && !note.isRest) {
        vexNote.addModifier(new Accidental(accidental), 0)
      }

      return vexNote
    })
  }, [notes])

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
    renderer.resize(width, height)

    const context = renderer.getContext()
    const stave = new Stave(20, 30, width - 40)
    stave.addClef('treble').addTimeSignature('4/4')
    stave.setContext(context).draw()

    const voice = new Voice({ numBeats: 4, beatValue: 4 })
    voice.setStrict(false)
    voice.addTickables(staveNotes)

    new Formatter().joinVoices([voice]).format([voice], width - 120)
    voice.draw(context, stave)
  }, [staveNotes, width, height])

  return <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }} />
}
