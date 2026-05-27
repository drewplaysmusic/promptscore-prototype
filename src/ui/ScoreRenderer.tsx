import React, { useEffect, useRef, useState } from 'react'
import { Accidental as VFAccidental, Beam, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, Stem, Tuplet, Voice } from 'vexflow'

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
  voiceType?: 'melody' | 'accompaniment' | 'bass' | 'percussion'
  tupletGroupId?: string
  ratioLabel?: string
  beamGroupId?: string
  bracketGroupId?: string
}

type VoiceLane = 'melody' | 'accompaniment'
type RhythmStaffLineCount = 1 | 2 | 3 | 4 | 5

function isDottedDuration(duration: DurationValue): boolean {
  return duration === 'DottedHalf' || duration === 'DottedQuarter' || duration === 'DottedEighth'
}

function getUndottedDuration(duration: DurationValue): DurationValue {
  if (duration === 'DottedHalf') return 'Half'
  if (duration === 'DottedQuarter') return 'Quarter'
  if (duration === 'DottedEighth') return 'Eighth'
  return duration
}

function getRhythmLabMetadata(lineCount: RhythmStaffLineCount) {
  return {
    notationScale: lineCount === 1 ? 1.35 : 1.18,
    spacingMultiplier: lineCount === 1 ? 1.45 : 1.18,
    lineSpacing: lineCount === 1 ? 18 : 12,
    percussionMode: lineCount === 1,
  }
}

function getEducationalPitchConstraint(pitch: PitchValue, lineCount: RhythmStaffLineCount): PitchValue {
  const visible: PitchValue[] = ['E', 'G', 'B', 'D', 'F'].slice(0, lineCount) as PitchValue[]
  return visible.includes(pitch) ? pitch : visible[0]
}

function normalizeRhythmLabNotes(notes: NoteEvent[], lineCount: RhythmStaffLineCount): NoteEvent[] {
  return notes.map((note) => ({
    ...note,
    pitch: getEducationalPitchConstraint(note.pitch, lineCount),
    octave: 4,
  }))
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

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
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

function isCloseEnough(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001
}

function getLargestPlainDurationThatFits(beats: number): DurationValue {
  if (beats >= 4 || isCloseEnough(beats, 4)) return 'Whole'
  if (beats >= 3 || isCloseEnough(beats, 3)) return 'DottedHalf'
  if (beats >= 2 || isCloseEnough(beats, 2)) return 'Half'
  if (beats >= 1.5 || isCloseEnough(beats, 1.5)) return 'DottedQuarter'
  if (beats >= 1 || isCloseEnough(beats, 1)) return 'Quarter'
  if (beats >= 0.75 || isCloseEnough(beats, 0.75)) return 'DottedEighth'
  if (beats >= 0.5 || isCloseEnough(beats, 0.5)) return 'Eighth'
  return '16th'
}

function makeRenderRest(base: NoteEvent, duration: DurationValue, beat: number, lane: VoiceLane): NoteEvent {
  return {
    duration,
    accidental: null,
    isRest: true,
    pitch: lane === 'accompaniment' ? 'D' : 'B',
    octave: lane === 'accompaniment' ? 3 : 4,
    measure: base.measure,
    beat,
    voiceType: lane,
  }
}

function fillRenderRests(base: NoteEvent, startBeat: number, endBeat: number, lane: VoiceLane): NoteEvent[] {
  const rests: NoteEvent[] = []
  let cursor = startBeat
  while (cursor < endBeat && !isCloseEnough(cursor, endBeat)) {
    const remaining = endBeat - cursor
    const duration = getLargestPlainDurationThatFits(remaining)
    const durationBeats = getDurationBeats(duration)
    if (durationBeats <= 0) break
    rests.push(makeRenderRest(base, duration, cursor, lane))
    cursor += durationBeats
  }
  return rests
}

function normalizeVoiceMeasureForRender(notes: NoteEvent[], timeSignature: TimeSignatureValue, lane: VoiceLane): NoteEvent[] {
  if (notes.length === 0) return []
  const measureEndBeat = getMeasureBeats(timeSignature) + 1
  const sorted = [...notes].sort((a, b) => a.beat - b.beat)
  const output: NoteEvent[] = []
  let cursor = 1

  sorted.forEach((note) => {
    const noteStart = Math.max(1, note.beat)
    const durationBeats = getDurationBeats(note.duration)
    const noteEnd = noteStart + durationBeats

    if (noteStart > cursor + 0.001) {
      output.push(...fillRenderRests(note, cursor, Math.min(noteStart, measureEndBeat), lane))
      cursor = noteStart
    }

    if (noteEnd > measureEndBeat + 0.001) return
    if (noteEnd <= cursor + 0.001 && noteStart < cursor - 0.001) return

    output.push(note)
    cursor = Math.max(cursor, noteEnd)
  })

  if (cursor < measureEndBeat - 0.001) {
    output.push(...fillRenderRests(output[output.length - 1] ?? sorted[0], cursor, measureEndBeat, lane))
  }

  return output
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

function inferLane(note: NoteEvent): VoiceLane {
  if (note.voiceType === 'accompaniment' || note.voiceType === 'bass') return 'accompaniment'
  const octave = note.octave ?? 4
  if (note.chordPitches && note.chordPitches.length > 1) return 'accompaniment'
  if (octave < 5) return 'accompaniment'
  return 'melody'
}

function hasAccompaniment(notes: NoteEvent[]): boolean {
  return notes.some((note) => inferLane(note) === 'accompaniment')
}

function isBeamable(note: NoteEvent): boolean {
  return !note.isRest && (note.duration === 'Eighth' || note.duration === '16th' || note.duration === 'TripletEighth')
}

function makeAutoBeamKey(note: NoteEvent): string {
  const beatBucket = Math.floor(note.beat)
  return `auto-${note.measure}-${beatBucket}`
}

function getBeatBucket(note: NoteEvent): number {
  return Math.floor(note.beat)
}

function getExplicitGroupId(note: NoteEvent): string {
  return note.bracketGroupId || note.tupletGroupId || note.beamGroupId || ''
}

function makeTripletGroupId(note: NoteEvent): string {
  const explicit = getExplicitGroupId(note)
  if (explicit) return explicit
  return `triplet-${note.measure}-${getBeatBucket(note)}-${note.voiceType ?? 'voice'}`
}

function getDenseRhythmRatio(notes: NoteEvent[]): number {
  if (notes.length === 0) return 0
  const dense = notes.filter((note) => note.duration === '16th' || note.duration === 'TripletEighth').length
  return dense / notes.length
}

function getFormatWidth(baseWidth: number, notes: NoteEvent[]): number {
  const denseRatio = getDenseRhythmRatio(notes)
  const denseBonus = denseRatio > 0.7 ? 72 : denseRatio > 0.35 ? 42 : 0
  const noteCountBonus = Math.max(0, notes.length - 8) * 8
  return Math.max(180, baseWidth - 92 + denseBonus + noteCountBonus)
}

function drawText(context: any, text: string, x: number, y: number) {
  context.save()
  context.setFont('Arial', 10, 'bold')
  context.setFillStyle('#71717a')
  context.fillText(text, x, y)
  context.restore()
}

function drawScoreCursor(context: any, x: number, y: number, staveWidth: number, cursorPosition: ScoreCursorPosition | undefined, measureIndex: number, timeSignature: TimeSignatureValue, height = 92) {
  if (!cursorPosition) return
  if (cursorPosition.measure !== measureIndex + 1) return

  const beatCount = timeSignature === '6/8' ? 3 : Number(timeSignature.split('/')[0] || 4)
  const beatRatio = Math.max(0, Math.min(1, (cursorPosition.beat - 1) / beatCount))
  const cursorX = x + 26 + beatRatio * Math.max(1, staveWidth - 64)

  context.save()
  context.setStrokeStyle('#ef4444')
  context.setLineWidth(2)
  context.beginPath()
  context.moveTo(cursorX, y + 4)
  context.lineTo(cursorX, y + height)
  context.stroke()
  context.restore()
}

function getSmartBeamsAndTuplets(vexNotes: StaveNote[], notes: NoteEvent[]): { beams: Beam[]; tuplets: Tuplet[] } {
  const beams: Beam[] = []
  const tuplets: Tuplet[] = []
  const tripletGroups = new Map<string, StaveNote[]>()
  const beamGroups = new Map<string, StaveNote[]>()

  notes.forEach((note, index) => {
    if (!isBeamable(note)) return
    const vexNote = vexNotes[index]
    if (!vexNote) return

    if (note.duration === 'TripletEighth') {
      const tripletId = makeTripletGroupId(note)
      const group = tripletGroups.get(tripletId) ?? []
      group.push(vexNote)
      tripletGroups.set(tripletId, group)
      return
    }

    const explicitId = getExplicitGroupId(note)
    const beatLocalId = explicitId ? `${explicitId}-${getBeatBucket(note)}` : makeAutoBeamKey(note)
    const group = beamGroups.get(beatLocalId) ?? []
    group.push(vexNote)
    beamGroups.set(beatLocalId, group)
  })

  tripletGroups.forEach((group) => {
    for (let index = 0; index < group.length; index += 3) {
      const slice = group.slice(index, index + 3)
      if (slice.length < 2) continue
      beams.push(new Beam(slice))
      if (slice.length === 3) {
        tuplets.push(new Tuplet(slice, {
          num_notes: 3,
          notes_occupied: 2,
        } as any))
      }
    }
  })

  beamGroups.forEach((group) => {
    if (group.length < 2) return
    beams.push(new Beam(group))
  })

  return { beams, tuplets }
}

function getStemDirection(lane: VoiceLane): number {
  return lane === 'melody' ? Stem.UP : Stem.DOWN
}

function createVexNotes(notes: NoteEvent[], lane: VoiceLane): StaveNote[] {
  const stemDirection = getStemDirection(lane)

  return notes.map((note) => {
    const vexNote = new StaveNote({
      keys: getVexKeys(note),
      duration: getVexDuration(note.duration, note.isRest),
      stem_direction: stemDirection,
    } as any)

    if (typeof (vexNote as any).setStemDirection === 'function') {
      ;(vexNote as any).setStemDirection(stemDirection)
    }

    if (!note.isRest && note.chordPitches && note.chordPitches.length > 0) {
      note.chordPitches.forEach((pitch, index) => {
        const accidental = getVexAccidental(pitch.accidental)
        if (accidental) vexNote.addModifier(new VFAccidental(accidental), index)
      })
    } else {
      const accidental = getVexAccidental(note.accidental)
      if (accidental && !note.isRest) vexNote.addModifier(new VFAccidental(accidental), 0)
    }

    if (isDottedDuration(note.duration)) Dot.buildAndAttach([vexNote])
    return vexNote
  })
}

function drawVoiceLane(context: any, stave: Stave, notes: NoteEvent[], timeSignature: TimeSignatureValue, staveWidth: number, lane: VoiceLane) {
  if (notes.length === 0) return

  const renderNotes = normalizeVoiceMeasureForRender(notes, timeSignature, lane)
  if (renderNotes.length === 0) return

  const voiceConfig = getVoiceConfig(timeSignature)
  const vexNotes = createVexNotes(renderNotes, lane)
  const voice = new Voice(voiceConfig)
  voice.setStrict(false)
  voice.addTickables(vexNotes)

  const grouped = getSmartBeamsAndTuplets(vexNotes, renderNotes)
  new Formatter().joinVoices([voice]).format([voice], getFormatWidth(staveWidth, renderNotes))
  voice.draw(context, stave)
  grouped.beams.forEach((beam) => beam.setContext(context).draw())
  grouped.tuplets.forEach((tuplet) => tuplet.setContext(context).draw())
}

export default function ScoreRenderer({ notes, timeSignature, keySignature, harmonyProgression = [], showHarmonyOverlay = false, showGrandStaff = false, cursorPosition, showRhythmStaff = false, rhythmStaffLineCount = 1 }: {
  notes: NoteEvent[]
  timeSignature: TimeSignatureValue
  keySignature: KeySignatureValue
  harmonyProgression?: string[]
  showHarmonyOverlay?: boolean
  showGrandStaff?: boolean
  cursorPosition?: ScoreCursorPosition
  showRhythmStaff?: boolean
  rhythmStaffLineCount?: RhythmStaffLineCount
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const harmonyLabels = harmonyProgression || []
  const accompanimentVisible = !showRhythmStaff && showGrandStaff && hasAccompaniment(notes)
  const normalizedNotes = showRhythmStaff ? normalizeRhythmLabNotes(notes, rhythmStaffLineCount) : notes
  const rhythmMetadata = getRhythmLabMetadata(rhythmStaffLineCount)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''
    if (normalizedNotes.length === 0) return

    const measureGroups = groupNotesByMeasure(normalizedNotes)
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    const systemHeight = accompanimentVisible ? 212 : showRhythmStaff ? 154 : 132
    const rendererHeight = Math.max(760, 120 + Math.ceil(measureGroups.length / 3) * systemHeight)
    renderer.resize(1180, rendererHeight)
    const context = renderer.getContext()

    measureGroups.forEach((measureNotes, measureIndex) => {
      const systemIndex = Math.floor(measureIndex / 3)
      const measureInSystem = measureIndex % 3
      const denseRatio = getDenseRhythmRatio(measureNotes)
      const measureSlotWidth = denseRatio > 0.5 ? 392 : 372
      const y = 64 + systemIndex * systemHeight
      const x = 36 + measureInSystem * measureSlotWidth
      const staveWidth = showRhythmStaff ? 428 : denseRatio > 0.5 ? 392 : 372
      const melodyNotes = measureNotes.filter((note) => inferLane(note) === 'melody')
      const accompanimentNotes = measureNotes.filter((note) => inferLane(note) === 'accompaniment')
      const topStave = new Stave(x, y, staveWidth)

      if (showRhythmStaff) {
        topStave.setConfigForLines(Array.from({ length: rhythmStaffLineCount }, () => ({ visible: true })))
      }

      if (!showRhythmStaff && measureInSystem === 0) topStave.addClef('treble')
      if (measureIndex === 0) {
        topStave.addKeySignature(getVexKeySignature(keySignature))
        topStave.addTimeSignature(timeSignature)
      }

      topStave.setContext(context)
      topStave.draw()

      if (measureInSystem === 0 && accompanimentVisible) drawText(context, 'Melody up', x - 6, y + 28)
      if (showRhythmStaff && measureInSystem === 0) drawText(context, `RhythmLab · ${rhythmStaffLineCount} line${rhythmStaffLineCount > 1 ? 's' : ''} · E anchor`, x - 2, y - 12)

      drawVoiceLane(context, topStave, accompanimentVisible ? melodyNotes : measureNotes, timeSignature, staveWidth * rhythmMetadata.spacingMultiplier, 'melody')

      if (accompanimentVisible) {
        const lowerStave = new Stave(x, y + 82, staveWidth)
        if (measureInSystem === 0) lowerStave.addClef('bass')
        if (measureIndex === 0) {
          lowerStave.addKeySignature(getVexKeySignature(keySignature))
          lowerStave.addTimeSignature(timeSignature)
        }
        lowerStave.setContext(context)
        lowerStave.draw()
        if (measureInSystem === 0) drawText(context, 'Accomp. down', x - 6, y + 110)
        drawVoiceLane(context, lowerStave, accompanimentNotes, timeSignature, staveWidth, 'accompaniment')

        if (measureInSystem === 0) {
          const brace = new StaveConnector(topStave, lowerStave)
          brace.setType(StaveConnector.type.BRACE)
          brace.setContext(context).draw()
        }
        const singleLeft = new StaveConnector(topStave, lowerStave)
        singleLeft.setType(StaveConnector.type.SINGLE_LEFT)
        singleLeft.setContext(context).draw()
      }

      drawScoreCursor(context as any, x, y, staveWidth, cursorPosition, measureIndex, timeSignature, accompanimentVisible ? 174 : 92)
    })
  }, [normalizedNotes, timeSignature, keySignature, cursorPosition, accompanimentVisible, showRhythmStaff, rhythmStaffLineCount])

  return (
    <div style={{ marginTop: 16, width: '100%', border: '1px solid #d4d4d8', borderRadius: 14, background: '#f8fafc', overflow: 'hidden' }}>
      <div style={{ height: 38, borderBottom: '1px solid #d4d4d8', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
          {showRhythmStaff
            ? `RhythmLab · ${rhythmStaffLineCount} Line Educational Staff · E Progression`
            : `Score Timeline · ${accompanimentVisible ? 'Voice-Aware Grand Staff' : 'PulseGrid'} · ${keySignature}${showHarmonyOverlay ? ' · Harmony Overlay' : ''}`}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}>−</button>
          <span style={{ fontSize: 13 }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>+</button>
          <button type="button" onClick={() => setZoom(1)}>Fit</button>
        </div>
      </div>

      <div style={{ minHeight: 500, maxHeight: 900, overflow: 'auto', padding: 0, background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)' }}>
        <div style={{ width: 1180, minHeight: 760, background: 'transparent', boxShadow: 'none', transform: `scale(${zoom * rhythmMetadata.notationScale})`, transformOrigin: 'top left', padding: '6px 8px 24px' }}>
          {showHarmonyOverlay && harmonyLabels.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 372px)', rowGap: accompanimentVisible ? 182 : 102, padding: '12px 36px 0', fontSize: 18, fontWeight: 800, color: '#111827', pointerEvents: 'none' }}>
              {Array.from({ length: Math.max(1, ...normalizedNotes.map((note) => note.measure), harmonyLabels.length) }).map((_, index) => (
                <div key={`harmony-${index}`} style={{ paddingLeft: index % 3 === 0 ? 88 : 22 }}>
                  {harmonyLabels[index % harmonyLabels.length]}
                </div>
              ))}
            </div>
          ) : null}

          {normalizedNotes.length === 0 ? (
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
