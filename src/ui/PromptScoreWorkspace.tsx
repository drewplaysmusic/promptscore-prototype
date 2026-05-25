import React, { useState } from 'react'
import RhythmLabWorkbench from './RhythmLabWorkbench'
import TechniqueLabWorkbench from './TechniqueLabWorkbench'

export type WorkspaceTab =
  | 'compose'
  | 'rhythm'
  | 'technique'

function ComposeStudioPlaceholder() {
  return (
    <div style={{ padding: 32, display: 'grid', gap: 18 }}>
      <div style={{ border: '1px solid #d4d4d8', borderRadius: 18, background: '#ffffff', padding: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>
          Compose Studio
        </div>

        <div style={{ color: '#52525b', fontSize: 16, lineHeight: 1.7, maxWidth: 760 }}>
          AI-assisted composition workspace for melody generation, harmony, notation, playback,
          educational composition tools, and future orchestration workflows.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 20 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>AI Composition</div>
          <div style={{ color: '#52525b', lineHeight: 1.6 }}>
            Generate melodies, harmonies, accompaniment, rhythms, and future orchestration ideas.
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 20 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Notation + Playback</div>
          <div style={{ color: '#52525b', lineHeight: 1.6 }}>
            Integrated notation rendering, looping playback, transport controls, and educational overlays.
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 20 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Future Expansion</div>
          <div style={{ color: '#52525b', lineHeight: 1.6 }}>
            Orchestration, arranging, curriculum generation, assignment systems, and adaptive teaching tools.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PromptScoreWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('compose')

  const tabs: Array<{ id: WorkspaceTab; label: string; description: string }> = [
    {
      id: 'compose',
      label: 'Compose Studio',
      description: 'AI-assisted composition and notation.',
    },
    {
      id: 'rhythm',
      label: 'RhythmLab',
      description: 'Adaptive rhythm and literacy training.',
    },
    {
      id: 'technique',
      label: 'TechniqueLab',
      description: 'Instrument-specific technique development.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid #d4d4d8', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              PromptScore
            </div>

            <div style={{ color: '#52525b', fontSize: 14 }}>
              Adaptive musicianship development platform
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#ffffff', padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>
              Educational Workspace
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, padding: '0 24px 18px' }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: active ? '1px solid #111827' : '1px solid #d4d4d8',
                  background: active ? '#111827' : '#ffffff',
                  color: active ? '#ffffff' : '#111827',
                  borderRadius: 16,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'grid',
                  gap: 4,
                  textAlign: 'left',
                  minWidth: 220,
                }}
              >
                <span style={{ fontWeight: 800 }}>
                  {tab.label}
                </span>

                <span style={{ fontSize: 12, opacity: active ? 0.85 : 0.7 }}>
                  {tab.description}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <main>
        {activeTab === 'compose' && <ComposeStudioPlaceholder />}
        {activeTab === 'rhythm' && <RhythmLabWorkbench />}
        {activeTab === 'technique' && <TechniqueLabWorkbench />}
      </main>
    </div>
  )
}
