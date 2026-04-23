import React, { useState } from 'react'

type WorkspaceMode = 'compose' | 'learn' | 'brain' | 'playback'

type PaletteGroup = {
  title: string
  items: string[]
}

const MODE_LABELS: Record<WorkspaceMode, string> = {
  compose: 'Compose',
  learn: 'Learn',
  brain: 'Brain',
  playback: 'Playback',
}

const PALETTE_BY_MODE: Record<WorkspaceMode, PaletteGroup[]> = {
  compose: [
    { title: 'Rhythm', items: ['Whole', 'Half', 'Quarter', 'Eighth', '16th', 'Rest'] },
    { title: 'Pitch', items: ['Sharp', 'Flat', 'Natural', 'Tie', 'Slur', 'Dot'] },
    { title: 'Expression', items: ['p', 'mf', 'f', 'Accent', 'Staccato', 'Tenuto'] },
  ],
  learn: [
    { title: 'Lesson Tools', items: ['Quarter', 'Eighth', 'Rest', 'Clap', 'Count', 'Hint'] },
    { title: 'Focus', items: ['Pitch', 'Rhythm', 'Meter', 'Dynamics'] },
  ],
  brain: [
    { title: 'Generate', items: ['Prompt', 'Regenerate', 'Compare', 'References'] },
    { title: 'Brains', items: ['Pitch', 'Rhythm', 'Placement', 'Style', 'Motif', 'Eval'] },
  ],
  playback: [
    { title: 'Playback', items: ['Play', 'Stop', 'Loop', 'Tempo', 'Metro'] },
    { title: 'Sound', items: ['Piano', 'Strings', 'Winds', 'Percussion'] },
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

function PaletteButton(props: { label: string }) {
  return (
    <button
      type="button"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 10,
        background: '#fafafa',
        color: '#111827',
        padding: '10px 12px',
        textAlign: 'left',
        fontSize: 14,
        cursor: 'pointer',
      }}
    >
      {props.label}
    </button>
  )
}

export default function PromptScoreShell() {
  const [mode, setMode] = useState<WorkspaceMode>('compose')

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
          gridTemplateColumns: '260px 1fr 300px',
          gap: 16,
          padding: 16,
        }}
      >
        <aside style={{ display: 'grid', gap: 12 }}>
          {PALETTE_BY_MODE[mode].map((group) => (
            <PanelCard key={group.title} title={group.title}>
              {group.items.map((item) => (
                <PaletteButton key={item} label={item} />
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
            gridTemplateRows: 'auto 1fr',
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

          <div
            style={{
              border: '1px dashed #cbd5e1',
              borderRadius: 14,
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
              display: 'grid',
              placeItems: 'center',
              minHeight: 420,
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Score Canvas</div>
              <div style={{ color: '#52525b', lineHeight: 1.5 }}>
                This central area becomes the notation surface, exercise view, Brain mode candidate area, or playback-follow score depending on the active workspace.
              </div>
            </div>
          </div>
        </section>

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
