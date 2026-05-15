import { playScoreNotes } from './PlaybackEngine'
import { generatePromptIntentScore } from './PromptIntentComposer'
import PromptIntentDebugPanel from './PromptIntentDebugPanel'
import { parsePromptIntent } from './PromptIntentEngine'
import PitchEngineDebugPanel from './PitchEngineDebugPanel'
import ChordCursorDebugPanel from './ChordCursorDebugPanel'
import RhythmTreeDebugPanel from './RhythmTreeDebugPanel'
import React, { useRef, useState } from 'react'
import ScoreRenderer from './ScoreRenderer'
import { generateMusicBrainResult } from './musicBrain'

type WorkspaceMode = 'compose' | 'learn' | 'rhythm' | 'playback'
type DurationValue =
  | 'Whole'
  | 'DottedHalf'
  | 'Half'
  | 'DottedQuarter'
  | 'Quarter'
  | 'DottedEighth'
  | 'Eighth'
  | 'TripletEighth'
  | '16th'
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
  octave?: number
}

type PaletteItem = {
  label: string
  glyph?: string
}

type PaletteGroup = {
  title: string
  items: PaletteItem[]
}

const MODE_LABELS: Record<WorkspaceMode, string> = {
  compose: 'Compose',
  learn: 'Learn',
  rhythm: 'Rhythm',
  playback: 'Playback',
}

const TIME_SIGNATURES: TimeSignatureValue[] = ['4/4', '3/4', '2/4', '6/8']

const PALETTE_BY_MODE: Record<WorkspaceMode, PaletteGroup[]> = {
  compose: [
    {
      title: 'Rhythm',
      items: [
        { label: 'Whole', glyph: '𝅝' },
        { label: 'Half', glyph: '𝅗𝅥' },
        { label: 'Quarter', glyph: '♩' },
        { label: 'Eighth', glyph: '♪' },
        { label: '16th', glyph: '♬' },
        { label: 'Rest', glyph: '𝄽' },
      ],
    },
    {
      title: 'Notes',
      items: [
        { label: 'C', glyph: 'C' },
        { label: 'D', glyph: 'D' },
        { label: 'E', glyph: 'E' },
        { label: 'F', glyph: 'F' },
        { label: 'G', glyph: 'G' },
        { label: 'A', glyph: 'A' },
        { label: 'B', glyph: 'B' },
      ],
    },
    {
      title: 'Pitch',
      items: [
        { label: 'Sharp', glyph: '♯' },
        { label: 'Flat', glyph: '♭' },
        { label: 'Natural', glyph: '♮' },
      ],
    },
  ],
  learn: [
    {
      title: 'Lesson Tools',
      items: [
        { label: 'Quarter', glyph: '♩' },
        { label: 'Eighth', glyph: '♪' },
        { label: 'Rest', glyph: '𝄽' },
        { label: 'Hint', glyph: '?' },
      ],
    },
  ],
  rhythm: [
    {
      title: 'Rhythm Mode',
      items: [
        { label: 'Rhythm Prompt', glyph: '♩' },
        { label: 'Dotted Rhythm', glyph: '♩.' },
        { label: 'Triplets', glyph: '3' },
        { label: 'Snare / 1-Line', glyph: '—' },
      ],
    },
  ],
  playback: [
    {
      title: 'Playback',
      items: [
        { label: 'Play', glyph: '▶' },
        { label: 'Stop', glyph: '■' },
        { label: 'Loop', glyph: '↺' },
      ],
    },
  ],
}

const INSPECTOR_BY_MODE: Record<WorkspaceMode, string[]> = {
  compose: ['Selected note properties', 'Measure settings', 'Staff / instrument settings'],
  learn: ['Exercise instructions', 'Hints', 'Progress feedback'],
  rhythm: ['Rhythm prompt parsing', 'Dotted / triplet options', 'Future 1-line staff mode'],
  playback: ['Playback settings', 'Loop points', 'Tempo'],
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

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function isPitchValue(value: string): value is PitchValue {
  return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(value)
}

function placeEventAtCursor(
  event: Omit<NoteEvent, 'measure' | 'beat'>,
  cursor: { measure: number; beat: number },
  timeSignature: TimeSignatureValue,
): { note: NoteEvent; nextMeasure: number; nextBeat: number } {
  const measureBeats = getMeasureBeats(timeSignature)
  const durationBeats = getDurationBeats(event.duration)
  let measure = cursor.measure
  let beat = cursor.beat

  if (beat + durationBeats > measureBeats + 1) {
    measure += 1
    beat = 1
  }

  const note: NoteEvent = {
    ...event,
    measure,
    beat,
  }

  const nextBeat = beat + durationBeats

  if (nextBeat >= measureBeats + 1) {
    return { note, nextMeasure: measure + 1, nextBeat: 1 }
  }

  return { note, nextMeasure: measure, nextBeat }
}

function PanelCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 12, background: '#ffffff', padding: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#71717a',
          marginBottom: 10,
        }}
      >
        {props.title}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>{props.children}</div>
    </div>
  )
}

function PaletteButton(props: { item: PaletteItem; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        border: props.isActive ? '1px solid #111827' : '1px solid #d4d4d8',
        borderRadius: 10,
        background: props.isActive ? '#e5e7eb' : '#fafafa',
        color: '#111827',
        padding: '10px 12px',
        textAlign: 'left',
        fontSize: 14,
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '28px 1fr',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1, display: 'inline-flex', justifyContent: 'center' }}>
        {props.item.glyph || '•'}
      </span>
      <span>{props.item.label}</span>
    </button>
  )
}

export default function PromptScoreShell() {
  const [mode, setMode] = useState<WorkspaceMode>('compose')
  const [selectedDuration, setSelectedDuration] = useState<DurationValue>('Quarter')
  const [selectedAccidental, setSelectedAccidental] = useState<AccidentalValue>(null)
  const [restMode, setRestMode] = useState(false)
  const [selectedPitch, setSelectedPitch] = useState<PitchValue>('C')
  const [timeSignature, setTimeSignature] = useState<TimeSignatureValue>('4/4')
  const [keySignature, setKeySignature] = useState<KeySignatureValue>('C major')
  const [notes, setNotes] = useState<NoteEvent[]>([])
  const [currentBeat, setCurrentBeat] = useState(1)
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [promptText, setPromptText] = useState('')
  const [brainSummary, setBrainSummary] = useState('Music Brain ready.')
  const playbackHandleRef = useRef<ReturnType<typeof playScoreNotes> | null>(null)

function handlePlay() {
  playbackHandleRef.current?.stop()

  playbackHandleRef.current = playScoreNotes(notes as any, {
    tempo: 92,
    timeSignature,
    onCursorChange: (cursor) => {
      setCurrentMeasure(cursor.measure)
      setCurrentBeat(cursor.beat)
    },
    onComplete: () => {
      playbackHandleRef.current = null
      setCurrentMeasure(1)
      setCurrentBeat(1)
      setBrainSummary('Playback complete.')
    },
  })

  setBrainSummary('Playing score.')
}

function handleStop() {
  playbackHandleRef.current?.stop()
  playbackHandleRef.current = null
  setCurrentMeasure(1)
  setCurrentBeat(1)
  setBrainSummary('Playback stopped.')
}
  function handleComposePaletteClick(item: PaletteItem) {
    if (isPitchValue(item.label)) {
      setSelectedPitch(item.label)
      return
    }

    if (
      item.label === 'Whole' ||
      item.label === 'Half' ||
      item.label === 'Quarter' ||
      item.label === 'Eighth' ||
      item.label === '16th'
    ) {
      setSelectedDuration(item.label)
      setRestMode(false)
      return
    }

    if (item.label === 'Rest') {
      setRestMode((current) => !current)
      return
    }

    if (item.label === 'Sharp' || item.label === 'Flat' || item.label === 'Natural') {
      setSelectedAccidental((current) => (current === item.label ? null : item.label))
    }
  }

  function isComposeItemActive(item: PaletteItem): boolean {
    if (item.label === selectedPitch) return true
    if (item.label === selectedDuration) return true
    if (item.label === 'Rest' && restMode) return true
    if (selectedAccidental && item.label === selectedAccidental) return true
    return false
  }

  function handleCanvasClick() {
    const placed = placeEventAtCursor(
      {
        duration: selectedDuration,
        accidental: selectedAccidental,
        isRest: restMode,
        pitch: selectedPitch,
      },
      { measure: currentMeasure, beat: currentBeat },
      timeSignature,
    )

    setNotes((prev) => [...prev, placed.note])
    setCurrentMeasure(placed.nextMeasure)
    setCurrentBeat(placed.nextBeat)
  }

  function handlePromptGenerate() {
  const shouldUseIntentComposer =
    promptText.toLowerCase().includes('melody') ||
    promptText.toLowerCase().includes('mozart') ||
    promptText.toLowerCase().includes('style') ||
    promptText.toLowerCase().includes('measure') ||
    promptText.toLowerCase().includes('bar')

  if (shouldUseIntentComposer) {
    const result = generatePromptIntentScore(promptText, {
      duration: selectedDuration,
      accidental: selectedAccidental,
      timeSignature,
    })

    setNotes(result.notes as NoteEvent[])
    setTimeSignature(result.timeSignature)
    setKeySignature(result.keySignature as KeySignatureValue)
    setCurrentMeasure(1)
    setCurrentBeat(1)
    setPromptText('')
    setBrainSummary(result.summary)
    return
  }

  const result = generateMusicBrainResult(promptText, {
    duration: selectedDuration,
    accidental: selectedAccidental,
    timeSignature,
  })

  setNotes(result.notes)
  setTimeSignature(result.timeSignature)
  setKeySignature(result.keySignature)
  setCurrentMeasure(1)
  setCurrentBeat(1)
  setPromptText('')
  setBrainSummary(result.summary)
}

  function handleTimeSignatureChange(nextTimeSignature: TimeSignatureValue) {
    setTimeSignature(nextTimeSignature)
    setNotes([])
    setCurrentMeasure(1)
    setCurrentBeat(1)
    setBrainSummary(`Meter changed to ${nextTimeSignature}. Score cleared for clean measure logic.`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f4f5',
        color: '#111827',
        fontFamily: 'Inter, Arial, sans-serif',
        display: 'grid',
        gridTemplateRows: '64px 1fr 60px',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #e4e4e7',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>PromptScore</div>
          <nav style={{ display: 'flex', gap: 10, color: '#52525b', fontSize: 14 }}>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Export</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(Object.keys(MODE_LABELS) as WorkspaceMode[]).map((workspace) => {
            const isActive = workspace === mode
            return (
              <button
                key={workspace}
                type="button"
                onClick={() => setMode(workspace)}
                style={{
                  border: isActive ? '1px solid #111827' : '1px solid #d4d4d8',
                  background: isActive ? '#111827' : '#ffffff',
                  color: isActive ? '#ffffff' : '#111827',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {MODE_LABELS[workspace]}
              </button>
            )
          })}
        </div>
      </header>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '260px minmax(0, 1fr) 300px',
          gap: 16,
          padding: 16,
        }}
      >
        <aside style={{ display: 'grid', gap: 12 }}>
          {PALETTE_BY_MODE[mode].map((group) => (
            <PanelCard key={group.title} title={group.title}>
              {group.items.map((item) => (
                <PaletteButton
                  key={item.label}
                  item={item}
                  isActive={mode === 'compose' ? isComposeItemActive(item) : false}
                  onClick={mode === 'compose' ? () => handleComposePaletteClick(item) : undefined}
                />
              ))}
            </PanelCard>
          ))}
        </aside>

        <section
          style={{
            border: '1px solid #d4d4d8',
            borderRadius: 16,
            background: '#ffffff',
            padding: 18,
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: 16,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71717a',
                }}
              >
                Workspace
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{MODE_LABELS[mode]} Mode</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                placeholder="Try: generate a 4 measure melody in G major"
                style={{
                  border: '1px solid #d4d4d8',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 14,
                  minWidth: 320,
                }}
              />
              <button
                type="button"
                onClick={handlePromptGenerate}
                style={{
                  border: '1px solid #111827',
                  background: '#111827',
                  color: '#ffffff',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Generate
              </button>
            </div>
          </div>

          {mode === 'compose' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Duration: <strong>{selectedDuration}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Pitch: <strong>{selectedPitch}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Accidental: <strong>{selectedAccidental || 'None'}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: restMode ? '#111827' : '#fafafa', color: restMode ? '#ffffff' : '#111827', padding: '8px 12px', fontSize: 14 }}>
                Rest mode: <strong>{restMode ? 'On' : 'Off'}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Position: <strong>M{currentMeasure} B{currentBeat}</strong>
              </div>
              <label style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Meter:{' '}
                <select
                  value={timeSignature}
                  onChange={(event) => handleTimeSignatureChange(event.target.value as TimeSignatureValue)}
                  style={{ border: 0, background: 'transparent', fontWeight: 700 }}
                >
                  {TIME_SIGNATURES.map((meter) => (
                    <option key={meter} value={meter}>
                      {meter}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div
            onClick={mode === 'compose' ? handleCanvasClick : undefined}
            style={{
              border: '1px dashed #cbd5e1',
              borderRadius: 14,
              background: '#ffffff',
              minHeight: 420,
              height: '100%',
              cursor: mode === 'compose' ? 'pointer' : 'default',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <ScoreRenderer
  notes={notes}
  timeSignature={timeSignature}
  keySignature={keySignature}
  cursorPosition={{ measure: currentMeasure, beat: currentBeat }}
/>
    </div>

<ChordCursorDebugPanel
  onCursorChange={(cursor) => {
    setCurrentMeasure(cursor.measure)
    setCurrentBeat(cursor.beat)
  }}
  onSendToScore={(cursorEvents) => {
    setNotes(
      cursorEvents.map((event) => ({
  duration: event.duration,
  accidental: event.accidental,
  octave: event.octave,
  chordPitches: event.chordPitches,
  isRest: false,
  pitch: event.pitch,
  measure: event.measure,
  beat: event.beat,
}))
    )

    if (cursorEvents.length > 0) {
      const lastEvent = cursorEvents[cursorEvents.length - 1]
      setCurrentMeasure(lastEvent.measure)
      setCurrentBeat(lastEvent.beat)
    }

    setBrainSummary(`Sent ${cursorEvents.length} cursor event(s) to score.`)
  }}
/>

<PitchEngineDebugPanel />
<PromptIntentDebugPanel />
<RhythmTreeDebugPanel />
        </section>

        <aside style={{ display: 'grid', gap: 12 }}>
          <PanelCard title="Inspector">
            {INSPECTOR_BY_MODE[mode].map((item) => (
              <div
                key={item}
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: 10,
                  background: '#fafafa',
                  padding: 10,
                  fontSize: 14,
                }}
              >
                {item}
              </div>
            ))}
          </PanelCard>

          <PanelCard title="Quick Status">
            <div>Mode: {MODE_LABELS[mode]}</div>
            <div>Document: Untitled Score</div>
            <div>Meter: {timeSignature}</div>
            <div>Key: {keySignature}</div>
            {mode === 'compose' ? (
              <>
                <div>Selected Duration: {selectedDuration}</div>
                <div>Selected Pitch: {selectedPitch}</div>
                <div>Selected Accidental: {selectedAccidental || 'None'}</div>
                <div>Rest Mode: {restMode ? 'On' : 'Off'}</div>
                <div>Current Measure: {currentMeasure}</div>
                <div>Current Beat: {currentBeat}</div>
                <div>Events: {notes.length}</div>
              </>
            ) : null}
          </PanelCard>

          <PanelCard title={mode === 'rhythm' ? 'Rhythm Result' : 'Brain Result'}>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{brainSummary}</div>
          </PanelCard>
        </aside>
      </main>

      <footer
        style={{
          borderTop: '1px solid #e4e4e7',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handlePlay} style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>
  Play
</button>

<button type="button" onClick={handleStop} style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>
  Stop
</button>

<button type="button" style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14 }}>
  Tempo 92
</button>
        </div>

        <div style={{ color: '#71717a', fontSize: 13 }}>PromptScore workspace shell v1</div>
      </footer>
    </div>
  )
}