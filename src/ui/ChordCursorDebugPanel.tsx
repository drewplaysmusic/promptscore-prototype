import React, { useMemo, useState } from 'react'
import { createMusicCursor, describeCursor, getDurationTicks, placeDurationsFromCursor, type CursorDurationValue, type CursorTimeSignatureValue } from './MusicCursor'
import { getChord, type ChordQuality, type PitchValue as EnginePitchValue } from './PitchEngine'

type CursorPitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
type CursorAccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null

type CursorChordPitch = { pitch: CursorPitchValue; octave: number; accidental: CursorAccidentalValue }
type CursorScoreEvent = { duration: CursorDurationValue; pitch: CursorPitchValue; octave: number; accidental: CursorAccidentalValue; chordPitches?: CursorChordPitch[]; measure: number; beat: number }
type CursorEntry = { duration: CursorDurationValue; pitch: CursorPitchValue; octave: number; accidental: CursorAccidentalValue; chordPitches?: CursorChordPitch[] }
type CursorPositionEvent = { measure: number; beat: number }

const DURATIONS: CursorDurationValue[] = ['Whole', 'DottedHalf', 'Half', 'DottedQuarter', 'Quarter', 'DottedEighth', 'Eighth', 'TripletEighth', '16th']
const PITCHES: CursorPitchValue[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const OCTAVES = [2, 3, 4, 5, 6]
const CHORD_QUALITIES: ChordQuality[] = ['major', 'minor', 'diminished', 'augmented', 'dominant7', 'major7', 'minor7']

function accidentalLabel(accidental: CursorAccidentalValue): string {
  if (accidental === 'Sharp') return '#'
  if (accidental === 'Flat') return 'b'
  if (accidental === 'Natural') return 'n'
  return ''
}

function toCursorPitch(pitch: EnginePitchValue): CursorChordPitch {
  return { pitch: pitch.step as CursorPitchValue, octave: pitch.octave, accidental: pitch.accidental as CursorAccidentalValue }
}

function describePitch(pitch: CursorChordPitch): string {
  return `${pitch.pitch}${accidentalLabel(pitch.accidental)}${pitch.octave}`
}

export default function ChordCursorDebugPanel({ onSendToScore, onCursorChange }: { onSendToScore?: (events: CursorScoreEvent[]) => void; onCursorChange?: (cursor: CursorPositionEvent) => void }) {
  const [timeSignature, setTimeSignature] = useState<CursorTimeSignatureValue>('4/4')
  const [selectedDuration, setSelectedDuration] = useState<CursorDurationValue>('Quarter')
  const [selectedPitch, setSelectedPitch] = useState<CursorPitchValue>('C')
  const [selectedOctave, setSelectedOctave] = useState(4)
  const [selectedAccidental, setSelectedAccidental] = useState<CursorAccidentalValue>(null)
  const [chordModeEnabled, setChordModeEnabled] = useState(false)
  const [selectedChordQuality, setSelectedChordQuality] = useState<ChordQuality>('major')
  const [cursorEntries, setCursorEntries] = useState<CursorEntry[]>([])
  const [liveSendEnabled, setLiveSendEnabled] = useState(false)

  const cursor = useMemo(() => createMusicCursor({ timeSignature }), [timeSignature])
  const placed = useMemo(() => placeDurationsFromCursor(cursor, cursorEntries.map((entry) => entry.duration)), [cursor, cursorEntries])
  const activeCursor = placed.nextCursor
  const selectedTicks = getDurationTicks(selectedDuration, cursor.ticksPerQuarter)

  const selectedChordPitches = useMemo(() => {
    if (!chordModeEnabled) return undefined
    return getChord({ step: selectedPitch, octave: selectedOctave, accidental: selectedAccidental }, selectedChordQuality).pitches.map(toCursorPitch)
  }, [chordModeEnabled, selectedPitch, selectedOctave, selectedAccidental, selectedChordQuality])

  function getPlaced(nextEntries = cursorEntries) {
    return placeDurationsFromCursor(cursor, nextEntries.map((entry) => entry.duration))
  }

  function getScoreEvents(nextEntries = cursorEntries): CursorScoreEvent[] {
    return getPlaced(nextEntries).events.map((event, index) => ({
      duration: event.duration,
      pitch: nextEntries[index]?.pitch ?? selectedPitch,
      octave: nextEntries[index]?.octave ?? selectedOctave,
      accidental: nextEntries[index]?.accidental ?? selectedAccidental,
      chordPitches: nextEntries[index]?.chordPitches,
      measure: event.measure,
      beat: event.beat,
    }))
  }

  function notifyCursorChange(nextEntries = cursorEntries) {
    const nextCursor = getPlaced(nextEntries).nextCursor
    onCursorChange?.({ measure: nextCursor.measure, beat: nextCursor.beat })
  }

  function sendToScore(nextEntries = cursorEntries) {
    onSendToScore?.(getScoreEvents(nextEntries))
    notifyCursorChange(nextEntries)
  }

  function addDuration(duration = selectedDuration) {
    setCursorEntries((current) => {
      const nextEntries = [...current, { duration, pitch: selectedPitch, octave: selectedOctave, accidental: selectedAccidental, chordPitches: selectedChordPitches }]
      notifyCursorChange(nextEntries)
      if (liveSendEnabled) sendToScore(nextEntries)
      return nextEntries
    })
  }

  function undoLast() {
    setCursorEntries((current) => {
      const nextEntries = current.slice(0, -1)
      notifyCursorChange(nextEntries)
      if (liveSendEnabled) sendToScore(nextEntries)
      return nextEntries
    })
  }

  function clearAll() {
    setCursorEntries([])
    onCursorChange?.({ measure: 1, beat: 1 })
    if (liveSendEnabled) onSendToScore?.([])
  }

  return (
    <div style={{ marginTop: 16, border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 14, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Chord Cursor Debug</div>
          <div style={{ fontSize: 12, color: '#71717a' }}>{describeCursor(activeCursor)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={timeSignature} onChange={(event) => setTimeSignature(event.target.value as CursorTimeSignatureValue)}><option value="4/4">4/4</option><option value="3/4">3/4</option><option value="2/4">2/4</option><option value="6/8">6/8</option></select>
          <button type="button" onClick={undoLast}>Undo</button>
          <button type="button" onClick={clearAll}>Clear</button>
          <button type="button" onClick={() => sendToScore()}>Send To Score</button>
          <button type="button" onClick={() => setLiveSendEnabled((enabled) => { if (!enabled) sendToScore(); return !enabled })}>Live Send: {liveSendEnabled ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {DURATIONS.map((duration) => <button key={duration} type="button" onClick={() => setSelectedDuration(duration)} style={{ fontWeight: selectedDuration === duration ? 800 : 400 }}>{duration}</button>)}
        <button type="button" onClick={() => addDuration()}><strong>Add {selectedDuration}</strong></button>
        <span style={{ fontSize: 12 }}>{selectedTicks} ticks</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {PITCHES.map((pitch) => <button key={pitch} type="button" onClick={() => setSelectedPitch(pitch)} style={{ fontWeight: selectedPitch === pitch ? 800 : 400 }}>{pitch}</button>)}
        <select value={selectedOctave} onChange={(event) => setSelectedOctave(Number(event.target.value))}>{OCTAVES.map((octave) => <option key={octave} value={octave}>{octave}</option>)}</select>
        <select value={selectedAccidental ?? ''} onChange={(event) => setSelectedAccidental((event.target.value || null) as CursorAccidentalValue)}><option value="">None</option><option value="Sharp">Sharp</option><option value="Flat">Flat</option><option value="Natural">Natural</option></select>
        <button type="button" onClick={() => setChordModeEnabled((enabled) => !enabled)}>Chord Mode: {chordModeEnabled ? 'On' : 'Off'}</button>
        <select value={selectedChordQuality} onChange={(event) => setSelectedChordQuality(event.target.value as ChordQuality)}>{CHORD_QUALITIES.map((quality) => <option key={quality} value={quality}>{quality}</option>)}</select>
      </div>

      <div style={{ fontSize: 12, color: '#52525b' }}>
        Selected: {selectedChordPitches ? selectedChordPitches.map(describePitch).join(' · ') : `${selectedPitch}${accidentalLabel(selectedAccidental)}${selectedOctave}`} · Events: {placed.events.length} · Next: m{activeCursor.measure} beat {activeCursor.beat.toFixed(3)}
      </div>
    </div>
  )
}
