import React from 'react'
import type { EducationalOverlayState, EducationalOverlayType } from '../music/EducationalOverlayEngine'

const LAYERS: Array<{ key: EducationalOverlayType; label: string }> = [
  { key: 'countLabels', label: 'Count Labels' },
  { key: 'noteNames', label: 'Note Names' },
  { key: 'solfege', label: 'Solfege' },
  { key: 'intervalNames', label: 'Interval Names' },
  { key: 'colorNotes', label: 'Color Notes' },
  { key: 'sticking', label: 'Sticking' },
]

export default function LearningLayersPanel({ overlays, onToggle }: {
  overlays: EducationalOverlayState
  onToggle: (key: EducationalOverlayType) => void
}) {
  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 16, display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a' }}>
        Learning Layers
      </div>

      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          type="button"
          onClick={() => onToggle(layer.key)}
          style={{
            border: overlays[layer.key] ? '1px solid #111827' : '1px solid #d4d4d8',
            background: overlays[layer.key] ? '#111827' : '#fafafa',
            color: overlays[layer.key] ? '#ffffff' : '#111827',
            borderRadius: 12,
            padding: 12,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          <span>{layer.label}</span>
          <span style={{ fontSize: 12 }}>{overlays[layer.key] ? 'ON' : 'OFF'}</span>
        </button>
      ))}
    </div>
  )
}
