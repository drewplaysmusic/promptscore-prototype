import React, { useRef, useState } from 'react'
import { playScoreNotes } from './PlaybackEngine'
import { generatePromptIntentScore } from './PromptIntentComposer'
import ScoreRenderer from './ScoreRenderer'

type DurationValue = 'Whole' | 'DottedHalf' | 'Half' | 'DottedQuarter' | 'Quarter' | 'DottedEighth' | 'Eighth' | 'TripletEighth' | '16th'
type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
type KeySignatureValue = string

type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
  pitch: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
  measure: number
  beat: number
  octave?: number
}

function getMeasureCount(notes: NoteEvent[]): number {
  return Math.max(0, ...notes.map((note) => note.measure))
}

function PanelCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 10 }}>{props.title}</div>
      {props.children}
    </div>
  )
}

export default function PromptScoreHarmonyWorkbench() {
  const [promptText, setPromptText] = useState('8 measure melody in C major with I IV V I harmony')
  const [notes, setNotes] = useState<NoteEvent[]>([])
  const [timeSignature, setTimeSignature] = useState<TimeSignatureValue>('4/4')
  const [keySignature, setKeySignature] = useState<KeySignatureValue>('C major')
  const [harmonyProgression, setHarmonyProgression] = useState<string[]>([])
  const [brainSummary, setBrainSummary] = useState('Harmony workbench ready. Generate a prompt to create notes plus Roman numerals.')
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [currentBeat, setCurrentBeat] = useState(1)
  const playbackHandleRef = useRef<ReturnType<typeof playScoreNotes> | null>(null)

  function handleGenerate() {
    const prompt = promptText.trim() || '8 measure melody in C major with I IV V I harmony'
    const result = generatePromptIntentScore(prompt, {
      duration: 'Quarter',
      accidental: null,
      timeSignature,
    })

    const nextHarmony = result.harmony?.progression?.length ? result.harmony.progression : ['I', 'IV', 'V', 'I']

    setNotes(result.notes as NoteEvent[])
    setTimeSignature(result.timeSignature)
    setKeySignature(result.keySignature)
    setHarmonyProgression(nextHarmony)
    setCurrentMeasure(1)
    setCurrentBeat(1)
    setBrainSummary(`${result.summary} Visible harmony overlay: ${nextHarmony.join(' → ')}.`)
  }

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
      },
    })
  }

  function handleStop() {
    playbackHandleRef.current?.stop()
    playbackHandleRef.current = null
    setCurrentMeasure(1)
    setCurrentBeat(1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', color: '#111827', fontFamily: 'Inter, Arial, sans-serif', display: 'grid', gridTemplateRows: '64px 1fr 60px' }}>
      <header style={{ borderBottom: '1px solid #e4e4e7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>PromptScore</div>
        <div style={{ color: '#52525b', fontSize: 14 }}>Harmony Workbench</div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, padding: 16 }}>
        <section style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 18, display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 16, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              placeholder="Try: 8 measure melody in C major with I IV V I harmony"
              style={{ flex: 1, border: '1px solid #d4d4d8', borderRadius: 12, padding: '12px 14px', fontSize: 15 }}
            />
            <button type="button" onClick={handleGenerate} style={{ border: '1px solid #111827', background: '#111827', color: '#ffffff', borderRadius: 12, padding: '12px 16px', fontSize: 15, cursor: 'pointer' }}>
              Generate
            </button>
          </div>

          {harmonyProgression.length > 0 ? (
            <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#f8fafc', padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>Roman Numerals</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Array.from({ length: Math.max(getMeasureCount(notes), harmonyProgression.length) }).map((_, index) => (
                  <div key={`roman-${index}`} style={{ minWidth: 72, textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 999, background: '#ffffff', padding: '8px 10px', fontSize: 18, fontWeight: 900 }}>
                    {harmonyProgression[index % harmonyProgression.length]}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <ScoreRenderer
            notes={notes as any}
            timeSignature={timeSignature}
            keySignature={keySignature as any}
            harmonyProgression={harmonyProgression}
            showHarmonyOverlay={harmonyProgression.length > 0}
            cursorPosition={{ measure: currentMeasure, beat: currentBeat }}
          />
        </section>

        <aside style={{ display: 'grid', alignContent: 'start', gap: 12 }}>
          <PanelCard title="Quick Status">
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              <div>Mode: Harmony Workbench</div>
              <div>Meter: {timeSignature}</div>
              <div>Key: {keySignature}</div>
              <div>Measures: {getMeasureCount(notes)}</div>
              <div>Events: {notes.length}</div>
              <div>Cursor: M{currentMeasure} B{currentBeat}</div>
              <div><strong>Harmony:</strong> {harmonyProgression.length > 0 ? harmonyProgression.join(' → ') : 'None'}</div>
            </div>
          </PanelCard>

          <PanelCard title="Brain Result">
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{brainSummary}</div>
          </PanelCard>
        </aside>
      </main>

      <footer style={{ borderTop: '1px solid #e4e4e7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handlePlay} disabled={notes.length === 0} style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14, cursor: notes.length === 0 ? 'not-allowed' : 'pointer' }}>Play</button>
          <button type="button" onClick={handleStop} style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>Stop</button>
          <button type="button" style={{ border: '1px solid #d4d4d8', background: '#fafafa', borderRadius: 10, padding: '8px 12px', fontSize: 14 }}>Tempo 92</button>
        </div>
        <div style={{ color: '#71717a', fontSize: 13 }}>Harmony-first score generation</div>
      </footer>
    </div>
  )
}
