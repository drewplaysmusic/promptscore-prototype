import React, { useState } from 'react'

type WorkspaceMode = 'compose' | 'learn' | 'brain' | 'playback'
type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null

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
  brain: 'Brain',
  playback: 'Playback',
}

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
      title: 'Pitch',
      items: [
        { label: 'Sharp', glyph: '♯' },
        { label: 'Flat', glyph: '♭' },
        { label: 'Natural', glyph: '♮' },
        { label: 'Tie', glyph: '‿' },
        { label: 'Slur', glyph: '⌒' },
        { label: 'Dot', glyph: '•' },
      ],
    },
    {
      title: 'Expression',
      items: [
        { label: 'Piano', glyph: 'p' },
        { label: 'Mezzo Forte', glyph: 'mf' },
        { label: 'Forte', glyph: 'f' },
        { label: 'Accent', glyph: '>' },
        { label: 'Staccato', glyph: '•' },
        { label: 'Tenuto', glyph: '–' },
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
        { label: 'Clap', glyph: '✋' },
        { label: 'Count', glyph: '1&' },
        { label: 'Hint', glyph: '?' },
      ],
    },
    {
      title: 'Focus',
      items: [
        { label: 'Pitch', glyph: '♯' },
        { label: 'Rhythm', glyph: '♩' },
        { label: 'Meter', glyph: '4/4' },
        { label: 'Dynamics', glyph: 'mf' },
      ],
    },
  ],
  brain: [
    {
      title: 'Generate',
      items: [
        { label: 'Prompt', glyph: '✦' },
        { label: 'Regenerate', glyph: '↻' },
        { label: 'Compare', glyph: '⇄' },
        { label: 'References', glyph: '☰' },
      ],
    },
    {
      title: 'Brains',
      items: [
        { label: 'Pitch', glyph: '♯' },
        { label: 'Rhythm', glyph: '♩' },
        { label: 'Placement', glyph: '⌁' },
        { label: 'Style', glyph: '◌' },
        { label: 'Motif', glyph: '⟲' },
        { label: 'Eval', glyph: '✓' },
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
        { label: 'Tempo', glyph: '♩=92' },
        { label: 'Metro', glyph: '⏱' },
      ],
    },
    {
      title: 'Sound',
      items: [
        { label: 'Piano', glyph: '♬' },
        { label: 'Strings', glyph: '𝄞' },
        { label: 'Winds', glyph: '𝄢' },
        { label: 'Percussion', glyph: '◼' },
      ],
    },
  ],
}

const INSPECTOR_BY_MODE: Record<WorkspaceMode, string[]> = {
  compose: ['Selected note properties', 'Measure settings', 'Staff / instrument settings'],
  learn: ['Exercise instructions', 'Hints', 'Progress feedback'],
  brain: ['Style stack', 'Retrieval references', 'Brain snapshot', 'Evaluation breakdown'],
  playback: ['Playback settings', 'Loop points', 'Tempo', 'Instrument / timbre'],
}

function PanelCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 12, background: '#ffffff', padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 10 }}>
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
      <span style={{ fontSize: 20, lineHeight: 1, display: 'inline-flex', justifyContent: 'center' }}>{props.item.glyph || '•'}</span>
      <span>{props.item.label}</span>
    </button>
  )
}
function getDurationGlyph(duration: DurationValue): string {
  if (duration === 'Whole') return '𝅝'
  if (duration === 'Half') return '𝅗𝅥'
  if (duration === 'Quarter') return '♩'
  if (duration === 'Eighth') return '♪'
  return '♬'
}

function getDurationWidth(duration: DurationValue): number {
  if (duration === 'Whole') return 88
  if (duration === 'Half') return 72
  if (duration === 'Quarter') return 56
  if (duration === 'Eighth') return 46
  return 40
}
export default function PromptScoreShell() {
  const [mode, setMode] = useState<WorkspaceMode>('compose')
  const [selectedDuration, setSelectedDuration] = useState<DurationValue>('Quarter')
  const [selectedAccidental, setSelectedAccidental] = useState<AccidentalValue>(null)
  const [restMode, setRestMode] = useState(false)
type NoteEvent = {
  duration: DurationValue
  accidental: AccidentalValue
  isRest: boolean
}

const [notes, setNotes] = useState<NoteEvent[]>([])
  function handleComposePaletteClick(item: PaletteItem) {
    if (item.label === 'Whole' || item.label === 'Half' || item.label === 'Quarter' || item.label === 'Eighth' || item.label === '16th') {
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

  function handleCanvasClick() {
  const newNote: NoteEvent = {
    duration: selectedDuration,
    accidental: selectedAccidental,
    isRest: restMode,
  }

  setNotes((prev) => [...prev, newNote])
}

  return (
   <div
  onClick={mode === 'compose' ? handleCanvasClick : undefined}
  style={{
    border: '1px dashed #cbd5e1',
    borderRadius: 14,
    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    display: 'grid',
    placeItems: 'center',
    minHeight: 420,
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
          gridTemplateColumns: '260px 1fr 300px',
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
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a' }}>
                Workspace
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{MODE_LABELS[mode]} Mode</div>
            </div>
            <button
              type="button"
              style={{
                border: '1px solid #d4d4d8',
                background: '#fafafa',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Prompt / Generate
            </button>
          </div>

          {mode === 'compose' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Duration: <strong>{selectedDuration}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 14 }}>
                Accidental: <strong>{selectedAccidental || 'None'}</strong>
              </div>
              <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: restMode ? '#111827' : '#fafafa', color: restMode ? '#ffffff' : '#111827', padding: '8px 12px', fontSize: 14 }}>
                Rest mode: <strong>{restMode ? 'On' : 'Off'}</strong>
              </div>
            </div>
          ) : null}

         <div
  onClick={mode === 'compose' ? handleCanvasClick : undefined}
  style={{
    border: '1px dashed #cbd5e1',
    borderRadius: 14,
    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    display: 'grid',
    placeItems: 'center',
    minHeight: 420,
  }}
>
            <div style={{ textAlign: 'center', maxWidth: 520 }}>
  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Score Canvas</div>
  <div style={{ color: '#52525b', lineHeight: 1.5 }}>
    This central area becomes the notation surface, exercise view, Brain mode candidate area, or playback-follow score depending on the active workspace.
  </div>
  {mode === 'compose' ? (
    <div style={{ marginTop: 18, color: '#111827', fontSize: 14 }}>
      Current entry will place a <strong>{restMode ? 'rest' : selectedDuration.toLowerCase() + ' note'}</strong>
      {restMode ? '' : selectedAccidental ? ` with ${selectedAccidental.toLowerCase()}` : ''}.
    </div>
  ) : null}

  {notes.length > 0 && (
  <div
    style={{
      marginTop: 24,
      display: 'flex',
      alignItems: 'end',
      gap: 10,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}
  >
    {notes.map((note, i) => (
      <div
        key={i}
        style={{
          width: getDurationWidth(note.duration),
          minHeight: 72,
          border: '1px solid #d4d4d8',
          borderRadius: 12,
          background: note.isRest ? '#f3f4f6' : '#ffffff',
          display: 'grid',
          placeItems: 'center',
          padding: 8,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>
            {note.isRest ? '𝄽' : getDurationGlyph(note.duration)}
          </div>
          {!note.isRest && note.accidental ? (
            <div style={{ fontSize: 14, marginTop: 6 }}>
              {note.accidental === 'Sharp' ? '♯' : note.accidental === 'Flat' ? '♭' : '♮'}
            </div>
          ) : null}
        </div>
      </div>
    ))}
  </div>
)}
</div>
        <aside style={{ display: 'grid', gap: 12 }}>
          <PanelCard title="Inspector">
            {INSPECTOR_BY_MODE[mode].map((item) => (
              <div
                key={item}
                style={{ border: '1px solid #e4e4e7', borderRadius: 10, background: '#fafafa', padding: 10, fontSize: 14 }}
              >
                {item}
              </div>
            ))}
          </PanelCard>

          <PanelCard title="Quick Status">
            <div>Mode: {MODE_LABELS[mode]}</div>
            <div>Document: Untitled Score</div>
            <div>Meter: 4/4</div>
            <div>Key: C major</div>
            {mode === 'compose' ? (
              <>
                <div>Selected Duration: {selectedDuration}</div>
                <div>Selected Accidental: {selectedAccidental || 'None'}</div>
                <div>Rest Mode: {restMode ? 'On' : 'Off'}</div>
              </>
            ) : null}
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
          {['Play', 'Stop', 'Loop', 'Tempo 92', 'Metronome'].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                border: '1px solid #d4d4d8',
                background: '#fafafa',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={{ color: '#71717a', fontSize: 13 }}>PromptScore workspace shell v1</div>
      </footer>
    </div>
  )
}
