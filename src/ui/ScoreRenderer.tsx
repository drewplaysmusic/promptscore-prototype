import React, { useEffect, useRef, useState } from 'react'
import { Accidental as VFAccidental, Beam, Dot, Formatter, Renderer, Stave, StaveNote, Tuplet, Voice } from 'vexflow'
import { buildHarmonyLabels } from './HarmonyLabelEngine'

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

function getVoiceConfig(timeSignature: TimeSignatureValue): { num_beats: number; beat_value: number } {
  if (timeSignature === '3/4') return { num_beats: 3, beat_value: 4 }
  if (timeSignature === '2/4') return { num_beats: 2, beat_value: 4 }
  if (timeSignature === '6/8') return { num_beats: 6, beat_value: 8 }
  return { num_beats: 4, beat_value: 4 }
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

function makeAutoBeamKey(note: NoteEvent): string {
  const beatBucket = Math.floor(note.beat)
  return `auto-${note.measure}-${beatBucket}`
}

function getSmartBeamsAndTuplets(vexNotes: StaveNote[], notes: NoteEvent[]): { beams: Beam[]; tuplets: Tuplet[] } {
  const beams: Beam[] = []
  const tuplets: Tuplet[] = []
  const explicitGroups = new Map<string, StaveNote[]>()
  const autoGroups = new Map<string, StaveNote[]>()

  notes.forEach((note, index) => {
    if (!isBeamable(note)) return

    const explicitId = note.bracketGroupId || note.tupletGroupId || note.ratioLabel || note.beamGroupId || ''
    if (explicitId) {
      const group = explicitGroups.get(explicitId) ?? []
      group.push(vexNotes[index])
      explicitGroups.set(explicitId, group)
      return
    }

    const autoId = makeAutoBeamKey(note)
    const group = autoGroups.get(autoId) ?? []
    group.push(vexNotes[index])
    autoGroups.set(autoId, group)
  })

  explicitGroups.forEach((group, id) => {
    if (group.length < 2) return
    beams.push(new Beam(group))

    if (id.includes('triplet') || id.includes('3:2')) {
      tuplets.push(new Tuplet(group, {
        num_notes: 3,
        notes_occupied: 2,
      } as any))
    }
  })

  autoGroups.forEach((group) => {
    if (group.length < 2) return
    beams.push(new Beam(group))
  })

  return { beams, tuplets }
}

export default function ScoreRenderer({ notes, timeSignature, keySignature, harmonyProgression = [], showHarmonyOverlay = false }: {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  harmonyProgression?: string[]
  showHarmonyOverlay?: boolean
  cursorPosition?: ScoreCursorPosition
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const harmonyLabels = buildHarmonyLabels(harmonyProgression, keySignature)

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
      const stave = new Stave(x, y, staveWidth)

      if (measureInSystem === 0) stave.addClef('treble')

      if (measureIndex === 0) {
        stave.addKeySignature(getVexKeySignature(keySignature))
        stave.addTimeSignature(timeSignature)
      }

      stave.setContext(context)
      stave.draw()

      const vexNotes = measureNotes.map((note) => {
        const vexNote = new StaveNote({
          keys: getVexKeys(note),
          duration: getVexDuration(note.duration, note.isRest),
        })

        if (!note.isRest && note.chordPitches && note.chordPitches.length > 0) {
          note.chordPitches.forEach((pitch, index) => {
            const accidental = getVexAccidental(pitch.accidental)
            if (accidental) vexNote.addModifier(new VFAccidental(accidental), index)
          })
        } else {
          const accidental = getVexAccidental(note.accidental)
          if (accidental && !note.isRest) vexNote.addModifier(new VFAccidental(accidental), 0)
        }

        if (isDottedDuration(note.duration)) {
          Dot.buildAndAttach([vexNote])
        }

        return vexNote
      })

      const voice = new Voice(voiceConfig)
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      const grouped = getSmartBeamsAndTuplets(vexNotes, measureNotes)
      new Formatter().joinVoices([voice]).format([voice], staveWidth - 92)
      voice.draw(context, stave)
      grouped.beams.forEach((beam) => beam.setContext(context).draw())
      grouped.tuplets.forEach((tuplet) => tuplet.setContext(context).draw())
    })
  }, [notes, timeSignature, keySignature])

  return (
    <div style={{ marginTop: 16, width: '100%', border: '1px solid #d4d4d8', borderRadius: 14, background: '#f8fafc', overflow: 'hidden' }}>
      <div style={{ height: 38, borderBottom: '1px solid #d4d4d8', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
          Score Timeline · PulseGrid · {keySignature}{showHarmonyOverlay ? ' · Harmony Overlay' : ''}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}>−</button>
          <span style={{ fontSize: 13 }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>+</button>
          <button type="button" onClick={() => setZoom(1)}>Fit</button>
        </div>
      </div>

      <div style={{ minHeight: 500, maxHeight: 900, overflow: 'auto', padding: 0, background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)' }}>
        <div style={{ width: 1180, minHeight: 760, background: 'transparent', boxShadow: 'none', transform: `scale(${zoom})`, transformOrigin: 'top left', padding: '6px 8px 24px' }}>
          {showHarmonyOverlay && harmonyLabels.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 372px)', rowGap: 102, padding: '12px 36px 0', fontSize: 18, fontWeight: 800, color: '#111827', pointerEvents: 'none' }}>
              {Array.from({ length: Math.max(1, ...notes.map((note) => note.measure), harmonyLabels.length) }).map((_, index) => (
                <div key={`harmony-${index}`} style={{ paddingLeft: index % 3 === 0 ? 88 : 22 }}>
                  {harmonyLabels[index % harmonyLabels.length]}
                </div>
              ))}
            </div>
          ) : null}

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
